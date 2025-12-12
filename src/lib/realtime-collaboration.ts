// lib/realtime-collaboration.ts
// BidDeed.AI Real-Time Collaboration System
// Enables multiple investors to analyze same auction simultaneously

import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { useEffect, useState, useCallback } from 'react';

// Types
export interface CollaborationUser {
  user_id: string;
  name: string;
  avatar?: string;
  online_at: string;
  viewing_property?: string;
  role: 'owner' | 'analyst' | 'viewer';
}

export interface PropertyLock {
  case_number: string;
  locked_by: string;
  locked_at: string;
  expires_at: string;
}

export interface PropertyUpdate {
  case_number: string;
  field: string;
  old_value: unknown;
  new_value: unknown;
  updated_by: string;
  updated_at: string;
}

export interface CollaborationState {
  activeUsers: CollaborationUser[];
  propertyLocks: Record<string, PropertyLock>;
  recentUpdates: PropertyUpdate[];
  isConnected: boolean;
  connectionError: string | null;
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Get current user (integrate with your auth system)
export function getCurrentUser(): CollaborationUser {
  // In production, get from Clerk/Supabase Auth
  return {
    user_id: typeof window !== 'undefined' 
      ? localStorage.getItem('biddeed_user_id') || `user_${Date.now()}`
      : `user_${Date.now()}`,
    name: typeof window !== 'undefined'
      ? localStorage.getItem('biddeed_user_name') || 'Anonymous'
      : 'Anonymous',
    avatar: undefined,
    online_at: new Date().toISOString(),
    role: 'analyst',
  };
}

/**
 * Main collaboration hook for real-time multi-user auction analysis
 */
export function useRealtimeCollaboration(auctionDate: string) {
  const [state, setState] = useState<CollaborationState>({
    activeUsers: [],
    propertyLocks: {},
    recentUpdates: [],
    isConnected: false,
    connectionError: null,
  });

  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!auctionDate) return;

    const currentUser = getCurrentUser();
    const channelName = `auction:${auctionDate.replace(/-/g, '')}`;

    // Create realtime channel
    const realtimeChannel = supabase.channel(channelName, {
      config: {
        presence: {
          key: currentUser.user_id,
        },
      },
    });

    // Handle presence sync (active users)
    realtimeChannel.on('presence', { event: 'sync' }, () => {
      const presenceState = realtimeChannel.presenceState();
      const users: CollaborationUser[] = [];
      
      Object.values(presenceState).forEach((presences) => {
        (presences as CollaborationUser[]).forEach((presence) => {
          users.push(presence);
        });
      });

      setState((prev) => ({
        ...prev,
        activeUsers: users,
      }));
    });

    // Handle user join
    realtimeChannel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log(`[BidDeed] User joined: ${key}`, newPresences);
    });

    // Handle user leave
    realtimeChannel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log(`[BidDeed] User left: ${key}`, leftPresences);
      
      // Release any locks held by leaving user
      setState((prev) => {
        const updatedLocks = { ...prev.propertyLocks };
        Object.entries(updatedLocks).forEach(([caseNum, lock]) => {
          if (lock.locked_by === key) {
            delete updatedLocks[caseNum];
          }
        });
        return { ...prev, propertyLocks: updatedLocks };
      });
    });

    // Handle database changes (auction_results table)
    realtimeChannel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'auction_results',
        filter: `auction_date=eq.${auctionDate}`,
      },
      (payload) => {
        handlePropertyUpdate(payload);
      }
    );

    // Handle broadcast messages (locks, cursor positions, etc.)
    realtimeChannel.on('broadcast', { event: 'property_lock' }, ({ payload }) => {
      const lock = payload as PropertyLock;
      setState((prev) => ({
        ...prev,
        propertyLocks: {
          ...prev.propertyLocks,
          [lock.case_number]: lock,
        },
      }));
    });

    realtimeChannel.on('broadcast', { event: 'property_unlock' }, ({ payload }) => {
      const { case_number } = payload as { case_number: string };
      setState((prev) => {
        const updatedLocks = { ...prev.propertyLocks };
        delete updatedLocks[case_number];
        return { ...prev, propertyLocks: updatedLocks };
      });
    });

    realtimeChannel.on('broadcast', { event: 'viewing_property' }, ({ payload }) => {
      const { user_id, case_number } = payload as { user_id: string; case_number: string };
      setState((prev) => ({
        ...prev,
        activeUsers: prev.activeUsers.map((user) =>
          user.user_id === user_id ? { ...user, viewing_property: case_number } : user
        ),
      }));
    });

    // Subscribe to channel
    realtimeChannel
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track presence
          await realtimeChannel.track({
            ...currentUser,
            online_at: new Date().toISOString(),
          });

          setState((prev) => ({
            ...prev,
            isConnected: true,
            connectionError: null,
          }));

          console.log(`[BidDeed] Connected to auction: ${auctionDate}`);
        } else if (status === 'CHANNEL_ERROR') {
          setState((prev) => ({
            ...prev,
            isConnected: false,
            connectionError: 'Failed to connect to collaboration channel',
          }));
        }
      });

    setChannel(realtimeChannel);

    // Cleanup on unmount
    return () => {
      realtimeChannel.unsubscribe();
      supabase.removeChannel(realtimeChannel);
    };
  }, [auctionDate]);

  // Handle property updates from database
  const handlePropertyUpdate = useCallback((payload: unknown) => {
    const update: PropertyUpdate = {
      case_number: (payload as { new?: { case_number?: string } }).new?.case_number || 'unknown',
      field: 'record',
      old_value: (payload as { old?: unknown }).old,
      new_value: (payload as { new?: unknown }).new,
      updated_by: 'system',
      updated_at: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      recentUpdates: [update, ...prev.recentUpdates.slice(0, 49)], // Keep last 50
    }));
  }, []);

  // Lock a property for editing
  const lockProperty = useCallback(
    async (caseNumber: string) => {
      if (!channel) return false;

      const currentUser = getCurrentUser();
      const existingLock = state.propertyLocks[caseNumber];

      // Check if already locked by someone else
      if (existingLock && existingLock.locked_by !== currentUser.user_id) {
        const lockExpired = new Date(existingLock.expires_at) < new Date();
        if (!lockExpired) {
          return false; // Cannot acquire lock
        }
      }

      const lock: PropertyLock = {
        case_number: caseNumber,
        locked_by: currentUser.user_id,
        locked_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 min expiry
      };

      await channel.send({
        type: 'broadcast',
        event: 'property_lock',
        payload: lock,
      });

      return true;
    },
    [channel, state.propertyLocks]
  );

  // Unlock a property
  const unlockProperty = useCallback(
    async (caseNumber: string) => {
      if (!channel) return;

      const currentUser = getCurrentUser();
      const lock = state.propertyLocks[caseNumber];

      // Only the lock owner can unlock
      if (lock && lock.locked_by === currentUser.user_id) {
        await channel.send({
          type: 'broadcast',
          event: 'property_unlock',
          payload: { case_number: caseNumber },
        });
      }
    },
    [channel, state.propertyLocks]
  );

  // Broadcast which property user is viewing
  const broadcastViewing = useCallback(
    async (caseNumber: string) => {
      if (!channel) return;

      const currentUser = getCurrentUser();
      await channel.send({
        type: 'broadcast',
        event: 'viewing_property',
        payload: {
          user_id: currentUser.user_id,
          case_number: caseNumber,
        },
      });
    },
    [channel]
  );

  return {
    ...state,
    lockProperty,
    unlockProperty,
    broadcastViewing,
    currentUser: getCurrentUser(),
  };
}

/**
 * Hook for property-level collaboration
 */
export function usePropertyCollaboration(caseNumber: string) {
  const [viewers, setViewers] = useState<CollaborationUser[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [lockedBy, setLockedBy] = useState<string | null>(null);

  useEffect(() => {
    if (!caseNumber) return;

    const channel = supabase.channel(`property:${caseNumber}`);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const currentViewers: CollaborationUser[] = [];
        Object.values(state).forEach((presences) => {
          (presences as CollaborationUser[]).forEach((p) => currentViewers.push(p));
        });
        setViewers(currentViewers);
      })
      .on('broadcast', { event: 'lock' }, ({ payload }) => {
        setIsLocked(true);
        setLockedBy((payload as { user_id: string }).user_id);
      })
      .on('broadcast', { event: 'unlock' }, () => {
        setIsLocked(false);
        setLockedBy(null);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const currentUser = getCurrentUser();
          await channel.track(currentUser);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [caseNumber]);

  return { viewers, isLocked, lockedBy };
}

// Export mock data for testing
export const mockCollaborationData: CollaborationState = {
  activeUsers: [
    {
      user_id: 'user_1',
      name: 'Ariel Shapira',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AS',
      online_at: new Date().toISOString(),
      viewing_property: '2024-CA-012345',
      role: 'owner',
    },
    {
      user_id: 'user_2',
      name: 'Mike Analyst',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=MA',
      online_at: new Date(Date.now() - 300000).toISOString(),
      viewing_property: '2024-CA-012346',
      role: 'analyst',
    },
    {
      user_id: 'user_3',
      name: 'Sarah Investor',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SI',
      online_at: new Date(Date.now() - 600000).toISOString(),
      role: 'viewer',
    },
  ],
  propertyLocks: {
    '2024-CA-012345': {
      case_number: '2024-CA-012345',
      locked_by: 'user_1',
      locked_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 300000).toISOString(),
    },
  },
  recentUpdates: [],
  isConnected: true,
  connectionError: null,
};
