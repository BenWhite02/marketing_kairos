// File Path: src/components/features/Collaboration/CollaborativeEditor.tsx

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useCollaborationStore } from '../../../stores/ui/collaborationStore';
import { useWebSocketSubscription, useWebSocketSender } from '../../../hooks/realtime/useWebSocket';
import { WebSocketEventType } from '../../../services/websocket/MessageTypes';
import { CollaborativeEdit, EditLock } from '../../../types/collaboration';
import { UserCursor } from './UserCursor';
import { ChangeTracker } from './ChangeTracker';

interface CollaborativeEditorProps {
  entityType: 'campaign' | 'moment' | 'experiment' | 'atom';
  entityId: string;
  field: string;
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  children: React.ReactElement;
  disabled?: boolean;
}

export const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  entityType,
  entityId,
  field,
  value,
  onChange,
  onBlur,
  children,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockOwner, setLockOwner] = useState<string>('');
  const [lastSyncedValue, setLastSyncedValue] = useState(value);
  const [pendingChanges, setPendingChanges] = useState<string[]>([]);

  const {
    acquireLock,
    releaseLock,
    isFieldLocked,
    addEdit,
    removeEdit,
    updateCursor,
  } = useCollaborationStore();

  const { sendMessage } = useWebSocketSender();

  // Subscribe to collaborative edits
  useWebSocketSubscription<CollaborativeEdit>(
    WebSocketEventType.EDIT_CHANGE,
    (edit) => {
      if (edit.entityType === entityType && 
          edit.entityId === entityId && 
          edit.field === field &&
          edit.userId !== 'current-user') {
        
        // Apply remote change
        onChange(edit.value);
        setLastSyncedValue(edit.value);
        
        // Track the change
        addEdit(edit);
        
        // Remove after animation
        setTimeout(() => removeEdit(edit.id), 3000);
      }
    },
    [entityType, entityId, field]
  );

  // Subscribe to edit locks
  useWebSocketSubscription<EditLock>(
    WebSocketEventType.EDIT_START,
    (lock) => {
      if (lock.entityType === entityType && 
          lock.entityId === entityId && 
          lock.field === field) {
        
        const locked = isFieldLocked(entityType, entityId, field, 'current-user');
        setIsLocked(locked);
        setLockOwner(lock.userName);
      }
    },
    [entityType, entityId, field]
  );

  // Subscribe to lock releases
  useWebSocketSubscription<string>(
    WebSocketEventType.EDIT_END,
    (lockId) => {
      // Check if this affects our field
      setIsLocked(isFieldLocked(entityType, entityId, field, 'current-user'));
    },
    [entityType, entityId, field]
  );

  // Handle focus - acquire lock
  const handleFocus = () => {
    if (disabled || isLocked) return;

    const lock: EditLock = {
      id: `lock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entityType,
      entityId,
      field,
      userId: 'current-user',
      userName: 'Current User', // This should come from auth context
      timestamp: Date.now(),
      expiresAt: Date.now() + 30000, // 30 seconds
    };

    acquireLock(lock);
    sendMessage(WebSocketEventType.EDIT_START, lock);
  };

  // Handle blur - release lock
  const handleBlur = () => {
    if (disabled) return;

    // Send final value if changed
    if (value !== lastSyncedValue) {
      const edit: CollaborativeEdit = {
        id: `edit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        entityType,
        entityId,
        field,
        value,
        previousValue: lastSyncedValue,
        userId: 'current-user',
        userName: 'Current User',
        timestamp: Date.now(),
        action: 'update',
      };

      sendMessage(WebSocketEventType.EDIT_CHANGE, edit);
      setLastSyncedValue(value);
    }

    // Release lock
    sendMessage(WebSocketEventType.EDIT_END, { field });
    onBlur?.();
  };

  // Handle value changes
  const handleChange = (newValue: any) => {
    if (disabled || isLocked) return;

    onChange(newValue);

    // Send temporary edit for real-time preview
    const edit: CollaborativeEdit = {
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entityType,
      entityId,
      field,
      value: newValue,
      previousValue: value,
      userId: 'current-user',
      userName: 'Current User',
      timestamp: Date.now(),
      action: 'update',
      isTemporary: true,
    };

    sendMessage(WebSocketEventType.EDIT_CHANGE, edit);
    
    // Track pending change
    setPendingChanges(prev => [...prev, edit.id]);
  };

  // Handle cursor movement
  const handleMouseMove = (e: React.MouseEvent) => {
    if (disabled) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const cursor = {
      userId: 'current-user',
      userName: 'Current User',
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      elementId: `${entityType}-${entityId}-${field}`,
      color: '#3B82F6',
      timestamp: Date.now(),
    };

    updateCursor(cursor);
    sendMessage(WebSocketEventType.EDIT_CURSOR, cursor);
  };

  // Clone children with collaborative props
  const enhancedChild = React.cloneElement(children, {
    onFocus: (e: any) => {
      children.props.onFocus?.(e);
      handleFocus();
    },
    onBlur: (e: any) => {
      children.props.onBlur?.(e);
      handleBlur();
    },
    onChange: (e: any) => {
      children.props.onChange?.(e);
      handleChange(e.target ? e.target.value : e);
    },
    disabled: disabled || isLocked,
    value,
  });

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseMove={handleMouseMove}
    >
      {/* Lock indicator */}
      {isLocked && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-8 left-0 z-10 rounded-md bg-yellow-100 px-2 py-1 text-xs text-yellow-800"
        >
          🔒 {lockOwner} is editing
        </motion.div>
      )}

      {/* Pending changes indicator */}
      {pendingChanges.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -top-2 -right-2 z-10"
        >
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
        </motion.div>
      )}

      {/* Enhanced input */}
      <div className="relative">
        {enhancedChild}
        
        {/* User cursors */}
        <UserCursor elementId={`${entityType}-${entityId}-${field}`} />
        
        {/* Change tracker */}
        <ChangeTracker 
          entityType={entityType}
          entityId={entityId}
          field={field}
        />
      </div>
    </div>
  );
};