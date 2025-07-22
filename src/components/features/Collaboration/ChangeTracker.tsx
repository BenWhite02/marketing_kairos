// File Path: src/components/features/Collaboration/ChangeTracker.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useCollaborationStore } from '../../../stores/ui/collaborationStore';
import { CollaborativeEdit } from '../../../types/collaboration';

interface ChangeTrackerProps {
  entityType: string;
  entityId: string;
  field?: string;
}

export const ChangeTracker: React.FC<ChangeTrackerProps> = ({
  entityType,
  entityId,
  field,
}) => {
  const { getActiveEditsForEntity } = useCollaborationStore();
  
  const edits = getActiveEditsForEntity(entityType, entityId).filter(
    edit => !field || edit.field === field
  );

  const getActionIcon = (action: CollaborativeEdit['action']) => {
    switch (action) {
      case 'create':
        return '➕';
      case 'update':
        return '✏️';
      case 'delete':
        return '🗑️';
      default:
        return '📝';
    }
  };

  const getActionColor = (action: CollaborativeEdit['action']) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'update':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delete':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (edits.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-0 right-0 z-20 max-w-xs">
      <AnimatePresence>
        {edits.slice(0, 3).map((edit) => (
          <motion.div
            key={edit.id}
            initial={{ opacity: 0, x: 50, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`
              mb-2 rounded-lg border p-2 shadow-sm
              ${getActionColor(edit.action)}
              ${edit.isTemporary ? 'animate-pulse' : ''}
            `}
          >
            <div className="flex items-start space-x-2">
              <span className="text-sm">{getActionIcon(edit.action)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">
                  {edit.userName} {edit.action}d {edit.field}
                </p>
                <p className="text-xs opacity-75">
                  {formatDistanceToNow(new Date(edit.timestamp), { addSuffix: true })}
                </p>
                {!edit.isTemporary && edit.previousValue !== undefined && (
                  <div className="mt-1 text-xs">
                    <div className="truncate">
                      <span className="opacity-60">From:</span> {String(edit.previousValue)}
                    </div>
                    <div className="truncate">
                      <span className="opacity-60">To:</span> {String(edit.value)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {edits.length > 3 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-gray-500 text-center py-1"
        >
          +{edits.length - 3} more changes
        </motion.div>
      )}
    </div>
  );
};