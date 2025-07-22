// File Path: src/hooks/realtime/useCollaboration.ts

import { useEffect, useRef } from 'react';
import { useCollaborationStore } from '../../stores/ui/collaborationStore';
import { useWebSocketSubscription, useWebSocketSender } from './useWebSocket';
import { WebSocketEventType } from '../../services/websocket/MessageTypes';
import { UserPresence, CollaborativeEdit, EditLock } from '../../types/collaboration';

export interface UseCollaborationOptions {
  entityType: 'campaign' | 'moment' | 'experiment' | 'atom';
  entityId: string;
  entityName: string;
  userId: string;
  userName: string;
}

export const useCollaboration = (options: UseCollaborationOptions) => {
  const {
    joinSession,
    leaveSession,
    updateUserPresence,
    addEdit,
    acquireLock,
    releaseLock,
    getCurrentSession,
    getSessionParticipants,
  } = useCollaborationStore();

  const { sendMessage } = useWebSocketSender();
  const sessionIdRef = useRef<string>();

  // Generate session ID
  const sessionId = `${options.entityType}-${options.entityId}`;

  // Subscribe to user presence updates
  useWebSocketSubscription<UserPresence>(
    WebSocketEventType.USER_JOIN,
    (presence) => {
      if (presence.currentEntity?.id === options.entityId) {
        updateUserPresence(presence);
      }
    },
    [options.entityId]
  );

  useWebSocketSubscription<UserPresence>(
    WebSocketEventType.USER_LEAVE,
    (presence) => {
      updateUserPresence({ ...presence, status: 'away' });
    },
    [options.entityId]
  );

  // Subscribe to collaborative edits
  useWebSocketSubscription<CollaborativeEdit>(
    WebSocketEventType.EDIT_CHANGE,
    (edit) => {
      if (edit.entityType === options.entityType && edit.entityId === options.entityId) {
        addEdit(edit);
      }
    },
    [options.entityType, options.entityId]
  );

  // Subscribe to edit locks
  useWebSocketSubscription<EditLock>(
    WebSocketEventType.EDIT_START,
    (lock) => {
      if (lock.entityType === options.entityType && lock.entityId === options.entityId) {
        acquireLock(lock);
      }
    },
    [options.entityType, options.entityId]
  );

  useWebSocketSubscription<{ lockId: string }>(
    WebSocketEventType.EDIT_END,
    ({ lockId }) => {
      releaseLock(lockId);
    },
    []
  );

  // Join session on mount
  useEffect(() => {
    sessionIdRef.current = sessionId;
    joinSession(sessionId, options.entityType, options.entityId);

    // Announce presence
    const presence: UserPresence = {
      userId: options.userId,
      userName: options.userName,
      userEmail: '', // This should come from auth context
      status: 'active',
      currentEntity: {
        type: options.entityType,
        id: options.entityId,
        name: options.entityName,
      },
      lastSeen: Date.now(),
      joinedAt: Date.now(),
    };

    updateUserPresence(presence);
    sendMessage(WebSocketEventType.USER_JOIN, presence);

    return () => {
      // Announce leaving
      sendMessage(WebSocketEventType.USER_LEAVE, { userId: options.userId });
      
      if (sessionIdRef.current) {
        leaveSession(sessionIdRef.current);
      }
    };
  }, [sessionId, options.entityType, options.entityId, options.userId, options.userName]);

  // Update presence on activity
  const updateActivity = () => {
    updateUserPresence({
      userId: options.userId,
      status: 'active',
      lastSeen: Date.now(),
    });
  };

  // Idle detection
  useEffect(() => {
    const handleActivity = () => {
      updateActivity();
    };

    const handleIdle = () => {
      updateUserPresence({
        userId: options.userId,
        status: 'idle',
        lastSeen: Date.now(),
      });
    };

    // Set up activity listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Set up idle timer
    let idleTimer: NodeJS.Timeout;
    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(handleIdle, 5 * 60 * 1000); // 5 minutes
    };

    events.forEach(event => {
      document.addEventListener(event, resetIdleTimer, true);
    });

    resetIdleTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
        document.removeEventListener(event, resetIdleTimer, true);
      });
      clearTimeout(idleTimer);
    };
  }, [options.userId]);

  return {
    session: getCurrentSession(),
    participants: getSessionParticipants(sessionId),
    updateActivity,
  };
};