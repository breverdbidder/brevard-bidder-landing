// components/collaboration/ActiveUsers.tsx
// BidDeed.AI Real-Time Collaboration - Active Users Display
// Shows who's currently analyzing the same auction

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Eye, 
  Lock, 
  Unlock, 
  Circle,
  ChevronDown,
  Crown,
  UserCheck,
  UserX
} from 'lucide-react';
import { CollaborationUser, PropertyLock } from '@/lib/realtime-collaboration';

// ============================================================================
// TYPES
// ============================================================================

interface ActiveUsersProps {
  users: CollaborationUser[];
  currentUserId: string;
  propertyLocks?: Record<string, PropertyLock>;
  onViewProfile?: (userId: string) => void;
  compact?: boolean;
  maxVisible?: number;
}

interface UserAvatarProps {
  user: CollaborationUser;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  showRole?: boolean;
  onClick?: () => void;
}

interface UserListProps {
  users: CollaborationUser[];
  currentUserId: string;
  propertyLocks?: Record<string, PropertyLock>;
  onViewProfile?: (userId: string) => void;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function getRoleColor(role: CollaborationUser['role']): string {
  switch (role) {
    case 'owner': return 'text-yellow-400';
    case 'analyst': return 'text-blue-400';
    case 'viewer': return 'text-gray-400';
    default: return 'text-gray-400';
  }
}

function getRoleBadge(role: CollaborationUser['role']): React.ReactNode {
  switch (role) {
    case 'owner':
      return <Crown className="w-3 h-3 text-yellow-400" />;
    case 'analyst':
      return <UserCheck className="w-3 h-3 text-blue-400" />;
    case 'viewer':
      return <Eye className="w-3 h-3 text-gray-400" />;
    default:
      return null;
  }
}

// ============================================================================
// USER AVATAR COMPONENT
// ============================================================================

export function UserAvatar({ 
  user, 
  size = 'md', 
  showStatus = true,
  showRole = false,
  onClick 
}: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const statusSizeClasses = {
    sm: 'w-2 h-2 -bottom-0.5 -right-0.5',
    md: 'w-2.5 h-2.5 -bottom-0.5 -right-0.5',
    lg: 'w-3 h-3 -bottom-1 -right-1',
  };

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      className="relative cursor-pointer"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className={`${sizeClasses[size]} rounded-full border-2 border-slate-700 object-cover`}
          title={user.name}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full border-2 border-slate-700 
                      bg-gradient-to-br from-indigo-500 to-purple-600
                      flex items-center justify-center font-semibold text-white`}
          title={user.name}
        >
          {initials}
        </div>
      )}

      {/* Online status indicator */}
      {showStatus && (
        <span
          className={`absolute ${statusSizeClasses[size]} rounded-full border-2 border-slate-900
                      ${getTimeAgo(user.online_at).includes('just') || getTimeAgo(user.online_at).includes('1m')
                        ? 'bg-green-500 animate-pulse'
                        : 'bg-green-400'
                      }`}
        />
      )}

      {/* Role badge */}
      {showRole && (
        <span className="absolute -top-1 -left-1">
          {getRoleBadge(user.role)}
        </span>
      )}
    </motion.div>
  );
}

// ============================================================================
// USER LIST COMPONENT (Expanded View)
// ============================================================================

function UserList({ users, currentUserId, propertyLocks, onViewProfile }: UserListProps) {
  return (
    <div className="space-y-2 py-2">
      {users.map((user) => {
        const isCurrentUser = user.user_id === currentUserId;
        const hasLock = Object.values(propertyLocks || {}).some(
          (lock) => lock.locked_by === user.user_id
        );

        return (
          <motion.div
            key={user.user_id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center gap-3 p-2 rounded-lg transition-colors
                        ${isCurrentUser ? 'bg-indigo-500/10 border border-indigo-500/30' : 'hover:bg-slate-800/50'}`}
            onClick={() => onViewProfile?.(user.user_id)}
          >
            <UserAvatar user={user} size="md" showRole />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`font-medium truncate ${isCurrentUser ? 'text-indigo-300' : 'text-white'}`}>
                  {user.name}
                  {isCurrentUser && <span className="text-xs text-indigo-400 ml-1">(you)</span>}
                </span>
                <span className={`text-xs capitalize ${getRoleColor(user.role)}`}>
                  {user.role}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                <span>{getTimeAgo(user.online_at)}</span>
                
                {user.viewing_property && (
                  <>
                    <span className="text-gray-600">•</span>
                    <Eye className="w-3 h-3" />
                    <span className="text-gray-400 truncate max-w-[100px]">
                      {user.viewing_property}
                    </span>
                  </>
                )}

                {hasLock && (
                  <>
                    <span className="text-gray-600">•</span>
                    <Lock className="w-3 h-3 text-yellow-500" />
                  </>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ============================================================================
// MAIN ACTIVE USERS COMPONENT
// ============================================================================

export function ActiveUsers({
  users,
  currentUserId,
  propertyLocks = {},
  onViewProfile,
  compact = false,
  maxVisible = 5,
}: ActiveUsersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const sortedUsers = [...users].sort((a, b) => {
    // Current user first, then by online time
    if (a.user_id === currentUserId) return -1;
    if (b.user_id === currentUserId) return 1;
    return new Date(b.online_at).getTime() - new Date(a.online_at).getTime();
  });

  const visibleUsers = sortedUsers.slice(0, maxVisible);
  const remainingCount = Math.max(0, users.length - maxVisible);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {/* Stacked avatars */}
        <div className="flex -space-x-2">
          {visibleUsers.map((user, index) => (
            <motion.div
              key={user.user_id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              style={{ zIndex: visibleUsers.length - index }}
            >
              <UserAvatar user={user} size="sm" />
            </motion.div>
          ))}
        </div>

        {/* Overflow count */}
        {remainingCount > 0 && (
          <span className="text-xs text-gray-400 bg-slate-800 px-2 py-0.5 rounded-full">
            +{remainingCount}
          </span>
        )}

        {/* Live indicator */}
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-400">{users.length} online</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-slate-800/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          
          <div className="text-left">
            <div className="text-sm font-medium text-white">Active Users</div>
            <div className="text-xs text-gray-400">{users.length} analyzing this auction</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Stacked avatars preview */}
          <div className="flex -space-x-2">
            {visibleUsers.slice(0, 3).map((user, index) => (
              <div key={user.user_id} style={{ zIndex: 3 - index }}>
                <UserAvatar user={user} size="sm" showStatus={false} />
              </div>
            ))}
            {users.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-900
                            flex items-center justify-center text-xs text-gray-400"
                   style={{ zIndex: 0 }}>
                +{users.length - 3}
              </div>
            )}
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>

          {/* Expand chevron */}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </motion.div>
        </div>
      </button>

      {/* Expanded user list */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-slate-700/50"
          >
            <div className="px-3 max-h-64 overflow-y-auto">
              <UserList
                users={sortedUsers}
                currentUserId={currentUserId}
                propertyLocks={propertyLocks}
                onViewProfile={onViewProfile}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// PROPERTY LOCK INDICATOR
// ============================================================================

interface PropertyLockIndicatorProps {
  lock: PropertyLock | null;
  currentUserId: string;
  onUnlock?: () => void;
  userName?: string;
}

export function PropertyLockIndicator({
  lock,
  currentUserId,
  onUnlock,
  userName,
}: PropertyLockIndicatorProps) {
  if (!lock) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Unlock className="w-3 h-3" />
        <span>Available for editing</span>
      </div>
    );
  }

  const isOwnLock = lock.locked_by === currentUserId;
  const expiresIn = Math.max(0, Math.floor((new Date(lock.expires_at).getTime() - Date.now()) / 1000));
  const minutes = Math.floor(expiresIn / 60);
  const seconds = expiresIn % 60;

  return (
    <div className={`flex items-center gap-2 text-xs rounded-lg px-2 py-1
                    ${isOwnLock ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'}`}>
      <Lock className="w-3 h-3" />
      <span>
        {isOwnLock 
          ? `You're editing (${minutes}:${seconds.toString().padStart(2, '0')} left)`
          : `Locked by ${userName || lock.locked_by}`
        }
      </span>
      {isOwnLock && onUnlock && (
        <button
          onClick={onUnlock}
          className="ml-2 hover:text-yellow-300 transition-colors"
        >
          <Unlock className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

// ============================================================================
// VIEWING INDICATOR (Shows who's viewing same property)
// ============================================================================

interface ViewingIndicatorProps {
  viewers: CollaborationUser[];
  caseNumber: string;
}

export function ViewingIndicator({ viewers, caseNumber }: ViewingIndicatorProps) {
  const viewingThis = viewers.filter((v) => v.viewing_property === caseNumber);

  if (viewingThis.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 text-xs bg-blue-500/10 text-blue-400 rounded-lg px-2 py-1"
    >
      <Eye className="w-3 h-3" />
      <div className="flex -space-x-1">
        {viewingThis.slice(0, 3).map((user) => (
          <UserAvatar key={user.user_id} user={user} size="sm" showStatus={false} />
        ))}
      </div>
      <span>
        {viewingThis.length === 1
          ? `${viewingThis[0].name} is viewing`
          : `${viewingThis.length} people viewing`
        }
      </span>
    </motion.div>
  );
}

// ============================================================================
// EXPORTS & MOCK DATA
// ============================================================================

export const mockUsers: CollaborationUser[] = [
  {
    user_id: 'user_1',
    name: 'Ariel Shapira',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AS&backgroundColor=6366f1',
    online_at: new Date().toISOString(),
    viewing_property: '2024-CA-012345',
    role: 'owner',
  },
  {
    user_id: 'user_2',
    name: 'Mike Analyst',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=MA&backgroundColor=3b82f6',
    online_at: new Date(Date.now() - 120000).toISOString(),
    viewing_property: '2024-CA-012346',
    role: 'analyst',
  },
  {
    user_id: 'user_3',
    name: 'Sarah Investor',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SI&backgroundColor=8b5cf6',
    online_at: new Date(Date.now() - 300000).toISOString(),
    role: 'viewer',
  },
  {
    user_id: 'user_4',
    name: 'John Partner',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=JP&backgroundColor=ec4899',
    online_at: new Date(Date.now() - 600000).toISOString(),
    viewing_property: '2024-CA-012345',
    role: 'analyst',
  },
];

export default ActiveUsers;
