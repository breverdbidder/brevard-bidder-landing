// lib/offline-sync.ts
// BidDeed.AI Offline Sync System
// IndexedDB caching + background sync for PWA

import { openDB, DBSchema, IDBPDatabase } from 'idb';

// ============================================================================
// DATABASE SCHEMA
// ============================================================================

interface BidDeedDB extends DBSchema {
  properties: {
    key: string; // case_number
    value: CachedProperty;
    indexes: {
      'by-auction-date': string;
      'by-decision': string;
      'by-cached-at': number;
    };
  };
  decisions: {
    key: number; // auto-increment
    value: PendingDecision;
    indexes: {
      'by-synced': number; // 0 = pending, 1 = synced
    };
  };
  auctions: {
    key: string; // auction_date
    value: CachedAuction;
  };
  sync_queue: {
    key: number;
    value: SyncItem;
  };
  app_state: {
    key: string;
    value: unknown;
  };
}

// ============================================================================
// TYPES
// ============================================================================

export interface CachedProperty {
  case_number: string;
  auction_date: string;
  data: Record<string, unknown>;
  cached_at: number;
  expires_at: number;
}

export interface PendingDecision {
  id?: number;
  case_number: string;
  auction_date: string;
  decision: 'BID' | 'SKIP' | 'REVIEW';
  notes?: string;
  created_at: number;
  synced: 0 | 1;
  sync_attempts: number;
  last_error?: string;
}

export interface CachedAuction {
  auction_date: string;
  properties: string[]; // case_numbers
  cached_at: number;
  total_properties: number;
  analyzed_count: number;
}

export interface SyncItem {
  id?: number;
  type: 'decision' | 'report' | 'preference';
  payload: unknown;
  created_at: number;
  retry_count: number;
}

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

const DB_NAME = 'biddeed-cache';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<BidDeedDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<BidDeedDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<BidDeedDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Properties store
      if (!db.objectStoreNames.contains('properties')) {
        const propertyStore = db.createObjectStore('properties', { keyPath: 'case_number' });
        propertyStore.createIndex('by-auction-date', 'auction_date');
        propertyStore.createIndex('by-decision', 'data.ml_decision');
        propertyStore.createIndex('by-cached-at', 'cached_at');
      }

      // Decisions store (pending sync)
      if (!db.objectStoreNames.contains('decisions')) {
        const decisionStore = db.createObjectStore('decisions', { keyPath: 'id', autoIncrement: true });
        decisionStore.createIndex('by-synced', 'synced');
      }

      // Auctions store
      if (!db.objectStoreNames.contains('auctions')) {
        db.createObjectStore('auctions', { keyPath: 'auction_date' });
      }

      // Sync queue
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
      }

      // App state (preferences, last sync, etc.)
      if (!db.objectStoreNames.contains('app_state')) {
        db.createObjectStore('app_state');
      }
    },
    blocked() {
      console.warn('[BidDeed] Database upgrade blocked by other tabs');
    },
    blocking() {
      console.warn('[BidDeed] This tab is blocking database upgrade');
    },
  });

  return dbInstance;
}

// ============================================================================
// PROPERTY CACHING
// ============================================================================

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function cacheProperty(
  caseNumber: string,
  auctionDate: string,
  data: Record<string, unknown>
): Promise<void> {
  const db = await getDB();
  
  const cachedProperty: CachedProperty = {
    case_number: caseNumber,
    auction_date: auctionDate,
    data,
    cached_at: Date.now(),
    expires_at: Date.now() + CACHE_TTL,
  };

  await db.put('properties', cachedProperty);
  console.log(`[BidDeed] Cached property: ${caseNumber}`);
}

export async function getCachedProperty(caseNumber: string): Promise<CachedProperty | undefined> {
  const db = await getDB();
  const property = await db.get('properties', caseNumber);
  
  // Check if expired
  if (property && property.expires_at < Date.now()) {
    await db.delete('properties', caseNumber);
    return undefined;
  }
  
  return property;
}

export async function getCachedPropertiesByAuction(auctionDate: string): Promise<CachedProperty[]> {
  const db = await getDB();
  return db.getAllFromIndex('properties', 'by-auction-date', auctionDate);
}

export async function clearExpiredCache(): Promise<number> {
  const db = await getDB();
  const tx = db.transaction('properties', 'readwrite');
  const store = tx.objectStore('properties');
  
  let deletedCount = 0;
  let cursor = await store.openCursor();
  
  while (cursor) {
    if (cursor.value.expires_at < Date.now()) {
      await cursor.delete();
      deletedCount++;
    }
    cursor = await cursor.continue();
  }
  
  await tx.done;
  console.log(`[BidDeed] Cleared ${deletedCount} expired cache entries`);
  return deletedCount;
}

// ============================================================================
// OFFLINE DECISIONS
// ============================================================================

export async function saveOfflineDecision(
  caseNumber: string,
  auctionDate: string,
  decision: 'BID' | 'SKIP' | 'REVIEW',
  notes?: string
): Promise<number> {
  const db = await getDB();
  
  const pendingDecision: PendingDecision = {
    case_number: caseNumber,
    auction_date: auctionDate,
    decision,
    notes,
    created_at: Date.now(),
    synced: 0,
    sync_attempts: 0,
  };

  const id = await db.add('decisions', pendingDecision);
  console.log(`[BidDeed] Saved offline decision: ${caseNumber} = ${decision}`);
  
  // Try to sync immediately if online
  if (navigator.onLine) {
    syncOfflineDecisions().catch(console.error);
  }
  
  return id as number;
}

export async function getPendingDecisions(): Promise<PendingDecision[]> {
  const db = await getDB();
  return db.getAllFromIndex('decisions', 'by-synced', 0);
}

export async function markDecisionSynced(id: number): Promise<void> {
  const db = await getDB();
  const decision = await db.get('decisions', id);
  
  if (decision) {
    decision.synced = 1;
    await db.put('decisions', decision);
  }
}

export async function syncOfflineDecisions(): Promise<{ synced: number; failed: number }> {
  const db = await getDB();
  const pending = await getPendingDecisions();
  
  let synced = 0;
  let failed = 0;
  
  for (const decision of pending) {
    try {
      const response = await fetch('/api/decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_number: decision.case_number,
          auction_date: decision.auction_date,
          decision: decision.decision,
          notes: decision.notes,
        }),
      });

      if (response.ok) {
        await markDecisionSynced(decision.id!);
        synced++;
        console.log(`[BidDeed] Synced decision: ${decision.case_number}`);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      failed++;
      
      // Update retry count
      decision.sync_attempts++;
      decision.last_error = (error as Error).message;
      await db.put('decisions', decision);
      
      console.error(`[BidDeed] Failed to sync decision: ${decision.case_number}`, error);
    }
  }

  return { synced, failed };
}

// ============================================================================
// AUCTION CACHING
// ============================================================================

export async function cacheAuction(
  auctionDate: string,
  properties: string[]
): Promise<void> {
  const db = await getDB();
  
  const cachedAuction: CachedAuction = {
    auction_date: auctionDate,
    properties,
    cached_at: Date.now(),
    total_properties: properties.length,
    analyzed_count: 0,
  };

  await db.put('auctions', cachedAuction);
  console.log(`[BidDeed] Cached auction: ${auctionDate} (${properties.length} properties)`);
}

export async function getCachedAuction(auctionDate: string): Promise<CachedAuction | undefined> {
  const db = await getDB();
  return db.get('auctions', auctionDate);
}

export async function updateAuctionProgress(
  auctionDate: string,
  analyzedCount: number
): Promise<void> {
  const db = await getDB();
  const auction = await db.get('auctions', auctionDate);
  
  if (auction) {
    auction.analyzed_count = analyzedCount;
    await db.put('auctions', auction);
  }
}

// ============================================================================
// APP STATE
// ============================================================================

export async function getAppState<T>(key: string): Promise<T | undefined> {
  const db = await getDB();
  return db.get('app_state', key) as Promise<T | undefined>;
}

export async function setAppState<T>(key: string, value: T): Promise<void> {
  const db = await getDB();
  await db.put('app_state', value, key);
}

// Specific state helpers
export async function getLastSyncTime(): Promise<number | undefined> {
  return getAppState<number>('last_sync');
}

export async function setLastSyncTime(time: number = Date.now()): Promise<void> {
  return setAppState('last_sync', time);
}

// ============================================================================
// BACKGROUND SYNC REGISTRATION
// ============================================================================

export async function registerBackgroundSync(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('sync' in (navigator as unknown as { sync?: unknown }).ServiceWorkerRegistration?.prototype || {})) {
    console.warn('[BidDeed] Background sync not supported');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await (registration as unknown as { sync: { register: (tag: string) => Promise<void> } }).sync.register('sync-decisions');
    console.log('[BidDeed] Background sync registered');
    return true;
  } catch (error) {
    console.error('[BidDeed] Failed to register background sync:', error);
    return false;
  }
}

// ============================================================================
// SYNC STATUS HOOK
// ============================================================================

export interface SyncStatus {
  pendingCount: number;
  lastSync: number | null;
  isOnline: boolean;
  isSyncing: boolean;
}

export function createSyncStatusStore() {
  let status: SyncStatus = {
    pendingCount: 0,
    lastSync: null,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
  };

  const listeners: Set<(status: SyncStatus) => void> = new Set();

  const notify = () => {
    listeners.forEach((listener) => listener(status));
  };

  const updateStatus = (updates: Partial<SyncStatus>) => {
    status = { ...status, ...updates };
    notify();
  };

  // Initialize
  const init = async () => {
    const pending = await getPendingDecisions();
    const lastSync = await getLastSyncTime();
    
    updateStatus({
      pendingCount: pending.length,
      lastSync: lastSync || null,
    });

    // Listen for online/offline events
    window.addEventListener('online', () => {
      updateStatus({ isOnline: true });
      // Auto-sync when coming back online
      syncAndUpdate();
    });

    window.addEventListener('offline', () => {
      updateStatus({ isOnline: false });
    });
  };

  const syncAndUpdate = async () => {
    if (!status.isOnline || status.isSyncing) return;

    updateStatus({ isSyncing: true });

    try {
      const result = await syncOfflineDecisions();
      await setLastSyncTime();
      const pending = await getPendingDecisions();
      
      updateStatus({
        pendingCount: pending.length,
        lastSync: Date.now(),
        isSyncing: false,
      });

      console.log(`[BidDeed] Sync complete: ${result.synced} synced, ${result.failed} failed`);
    } catch (error) {
      updateStatus({ isSyncing: false });
      console.error('[BidDeed] Sync failed:', error);
    }
  };

  return {
    subscribe: (listener: (status: SyncStatus) => void) => {
      listeners.add(listener);
      listener(status); // Initial call
      return () => listeners.delete(listener);
    },
    getStatus: () => status,
    init,
    sync: syncAndUpdate,
  };
}

// ============================================================================
// CLEAR ALL DATA
// ============================================================================

export async function clearAllOfflineData(): Promise<void> {
  const db = await getDB();
  
  await db.clear('properties');
  await db.clear('decisions');
  await db.clear('auctions');
  await db.clear('sync_queue');
  await db.clear('app_state');
  
  console.log('[BidDeed] Cleared all offline data');
}

// ============================================================================
// STORAGE STATS
// ============================================================================

export interface StorageStats {
  propertiesCount: number;
  decisionsCount: number;
  pendingDecisions: number;
  auctionsCount: number;
  estimatedSize: string;
}

export async function getStorageStats(): Promise<StorageStats> {
  const db = await getDB();
  
  const propertiesCount = await db.count('properties');
  const decisionsCount = await db.count('decisions');
  const pendingDecisions = (await getPendingDecisions()).length;
  const auctionsCount = await db.count('auctions');
  
  // Estimate storage size (rough calculation)
  let estimatedBytes = 0;
  
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    estimatedBytes = estimate.usage || 0;
  }
  
  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return {
    propertiesCount,
    decisionsCount,
    pendingDecisions,
    auctionsCount,
    estimatedSize: formatBytes(estimatedBytes),
  };
}
