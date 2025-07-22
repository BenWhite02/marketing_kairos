// File Path: src/components/features/Collaboration/UserCursor.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCollaborationStore } from '../../../stores/ui/collaborationStore';

interface UserCursorProps {
  elementId: string;
}

export const UserCursor: React.FC<UserCursorProps> = ({ elementId }) => {
  const { activeCursors } = useCollaborationStore();

  const cursorsForElement = Object.values(activeCursors).filter(
    cursor => cursor.elementId === elementId && cursor.userId !== 'current-user'
  );

  return (
    <AnimatePresence>
      {cursorsForElement.map((cursor) => (
        <motion.div
          key={cursor.userId}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          style={{
            position: 'absolute',
            left: cursor.x,
            top: cursor.y,
            pointerEvents: 'none',
            zIndex: 1000,
          }}
          className="flex items-center space-x-1"
        >
          {/* Cursor pointer */}
          <svg
            width="16"
            height="20"
            viewBox="0 0 16 20"
            fill="none"
            className="drop-shadow-sm"
          >
            <path
              d="M0 0L0 16L4.5 12L7 16.5L9 15.5L6.5 11L11 11L0 0Z"
              fill={cursor.color}
              stroke="white"
              strokeWidth="1"
            />
          </svg>

          {/* User name label */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            style={{ backgroundColor: cursor.color }}
            className="px-2 py-1 rounded text-xs text-white font-medium shadow-sm whitespace-nowrap"
          >
            {cursor.userName}
          </motion.div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
};