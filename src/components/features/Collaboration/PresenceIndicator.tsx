// File Path: src/components/features/Collaboration/PresenceIndicator.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPresence } from '../../../types/collaboration';
import { formatDistanceToNow } from 'date-fns';

interface PresenceIndicatorProps {
  users: UserPresence[];
  maxVisible?: number;
  showNames?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  users,
  maxVisible = 5,
  showNames = false,
  size = 'md',
}) => {
  const activeUsers = users.filter(user => user.status === 'active');
  const visibleUsers = activeUsers.slice(0, maxVisible);
  const remainingCount = Math.max(0, activeUsers.length - maxVisible);

  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base',
  };

  const getStatusColor = (status: UserPresence['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'idle':
        return 'bg-yellow-500';
      case 'away':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserColor = (userId: string) => {
    const colors = [
      'bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  if (activeUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      {/* User Avatars */}
      <div className="flex -space-x-2">
        <AnimatePresence>
          {visibleUsers.map((user) => (
            <motion.div
              key={user.userId}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="relative"
              title={`${user.userName} - ${user.status}`}
            >
              <div
                className={`
                  ${sizeClasses[size]} rounded-full border-2 border-white shadow-sm
                  flex items-center justify-center font-medium text-white
                  ${getUserColor(user.userId)}
                `}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.userName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  getUserInitials(user.userName)
                )}
              </div>
              
              {/* Status indicator */}
              <div
                className={`
                  absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white
                  ${getStatusColor(user.status)}
                `}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Remaining count */}
        {remainingCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`
              ${sizeClasses[size]} rounded-full border-2 border-white bg-gray-500
              flex items-center justify-center font-medium text-white shadow-sm
            `}
            title={`${remainingCount} more user${remainingCount > 1 ? 's' : ''}`}
          >
            +{remainingCount}
          </motion.div>
        )}
      </div>

      {/* Names (if enabled) */}
      {showNames && (
        <div className="text-sm text-gray-600">
          {visibleUsers.length === 1 ? (
            <span>{visibleUsers[0].userName} is here</span>
          ) : visibleUsers.length === 2 ? (
            <span>{visibleUsers[0].userName} and {visibleUsers[1].userName} are here</span>
          ) : (
            <span>
              {visibleUsers[0].userName} and {activeUsers.length - 1} others are here
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// Individual User Presence Component
interface UserPresenceProps {
  user: UserPresence;
  onClick?: () => void;
}

export const UserPresenceCard: React.FC<UserPresenceProps> = ({
  user,
  onClick,
}) => {
  const getStatusText = (status: UserPresence['status']) => {
    switch (status) {
      case 'active':
        return 'Active now';
      case 'idle':
        return 'Idle';
      case 'away':
        return `Away • ${formatDistanceToNow(new Date(user.lastSeen), { addSuffix: true })}`;
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: UserPresence['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'idle':
        return 'text-yellow-600';
      case 'away':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div
      className={`
        flex items-center space-x-3 rounded-lg p-3 
        ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''}
      `}
      onClick={onClick}
    >
      <div className="relative">
        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.userName}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            user.userName.charAt(0).toUpperCase()
          )}
        </div>
        <div
          className={`
            absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white
            ${user.status === 'active' ? 'bg-green-500' : 
              user.status === 'idle' ? 'bg-yellow-500' : 'bg-gray-500'}
          `}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {user.userName}
        </p>
        <p className={`text-xs ${getStatusColor(user.status)}`}>
          {getStatusText(user.status)}
        </p>
        {user.currentEntity && (
          <p className="text-xs text-gray-500 truncate">
            Editing {user.currentEntity.type}: {user.currentEntity.name}
          </p>
        )}
      </div>
    </div>
  );
};