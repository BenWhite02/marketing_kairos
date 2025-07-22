// File Path: src/stores/ui/collaborationStore.ts

import { create } from 'zustand';
import { UserPresence, CollaborativeEdit, EditLock, CollaborationSession, CursorPosition } from '../../types/collaboration';

interface CollaborationState {
  // State
  sessions: Record<string, CollaborationSession>;
  currentSession?: string;
  userPresence: Record<string, UserPresence>;
  activeCursors: Record<string, CursorPosition>;
  pendingEdits: CollaborativeEdit[];
  isCollaborating: boolean;
  
  // Actions
  joinSession: (sessionId: string, entityType: string, entityId: string) => void;
  leaveSession: (sessionId: string) => void;
  updateUserPresence: (presence: Partial<UserPresence>) => void;
  addEdit: (edit: CollaborativeEdit) => void;
  removeEdit: (editId: string) => void;
  updateCursor: (cursor: CursorPosition) => void;
  removeCursor: (userId: string) => void;
  acquireLock: (lock: EditLock) => void;
  releaseLock: (lockId: string) => void;
  clearExpiredLocks: () => void;
  
  // Getters
  getCurrentSession: () => CollaborationSession | undefined;
  getSessionParticipants: (sessionId: string) => UserPresence[];
  getActiveEditsForEntity: (entityType: string, entityId: string) => CollaborativeEdit[];
  getLocksForEntity: (entityType: string, entityId: string) => EditLock[];
  isFieldLocked: (entityType: string, entityId: string, field: string, userId: string) => boolean;
}

const userColors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
];

export const useCollaborationStore = create<CollaborationState>((set, get) => ({
  // Initial state
  sessions: {},
  userPresence: {},
  activeCursors: {},
  pendingEdits: [],
  isCollaborating: false,

  // Actions
  joinSession: (sessionId, entityType, entityId) => {
    set((state) => {
      const session: CollaborationSession = state.sessions[sessionId] || {
        id: sessionId,
        entityType,
        entityId,
        participants: [],
        activeEdits: [],
        locks: [],
        createdAt: Date.now(),
        lastActivity: Date.now(),
      };

      return {
        sessions: {
          ...state.sessions,
          [sessionId]: session,
        },
        currentSession: sessionId,
        isCollaborating: true,
      };
    });
  },

  leaveSession: (sessionId) => {
    set((state) => {
      const { [sessionId]: removedSession, ...remainingSessions } = state.sessions;
      
      return {
        sessions: remainingSessions,
        currentSession: state.currentSession === sessionId ? undefined : state.currentSession,
        isCollaborating: Object.keys(remainingSessions).length > 0,
      };
    });
  },

  updateUserPresence: (presenceUpdate) => {
    set((state) => {
      const userId = presenceUpdate.userId || 'current-user';
      const currentPresence = state.userPresence[userId];
      
      const updatedPresence: UserPresence = {
        ...currentPresence,
        ...presenceUpdate,
        userId,
        lastSeen: Date.now(),
      };

      return {
        userPresence: {
          ...state.userPresence,
          [userId]: updatedPresence,
        },
      };
    });
  },

  addEdit: (edit) => {
    set((state) => ({
      pendingEdits: [...state.pendingEdits.filter(e => e.id !== edit.id), edit],
    }));
  },

  removeEdit: (editId) => {
    set((state) => ({
      pendingEdits: state.pendingEdits.filter(e => e.id !== editId),
    }));
  },

  updateCursor: (cursor) => {
    set((state) => ({
      activeCursors: {
        ...state.activeCursors,
        [cursor.userId]: cursor,
      },
    }));
  },

  removeCursor: (userId) => {
    set((state) => {
      const { [userId]: removed, ...remaining } = state.activeCursors;
      return { activeCursors: remaining };
    });
  },

  acquireLock: (lock) => {
    set((state) => {
      const sessionId = state.currentSession;
      if (!sessionId) return state;

      const session = state.sessions[sessionId];
      if (!session) return state;

      return {
        sessions: {
          ...state.sessions,
          [sessionId]: {
            ...session,
            locks: [...session.locks.filter(l => l.id !== lock.id), lock],
          },
        },
      };
    });
  },

  releaseLock: (lockId) => {
    set((state) => {
      const sessionId = state.currentSession;
      if (!sessionId) return state;

      const session = state.sessions[sessionId];
      if (!session) return state;

      return {
        sessions: {
          ...state.sessions,
          [sessionId]: {
            ...session,
            locks: session.locks.filter(l => l.id !== lockId),
          },
        },
      };
    });
  },

  clearExpiredLocks: () => {
    const now = Date.now();
    set((state) => {
      const updatedSessions = Object.entries(state.sessions).reduce((acc, [id, session]) => {
        acc[id] = {
          ...session,
          locks: session.locks.filter(lock => lock.expiresAt > now),
        };
        return acc;
      }, {} as Record<string, CollaborationSession>);

      return { sessions: updatedSessions };
    });
  },

  // Getters
  getCurrentSession: () => {
    const state = get();
    return state.currentSession ? state.sessions[state.currentSession] : undefined;
  },

  getSessionParticipants: (sessionId) => {
    const state = get();
    const session = state.sessions[sessionId];
    return session ? session.participants : [];
  },

  getActiveEditsForEntity: (entityType, entityId) => {
    const state = get();
    return state.pendingEdits.filter(
      edit => edit.entityType === entityType && edit.entityId === entityId
    );
  },

  getLocksForEntity: (entityType, entityId) => {
    const state = get();
    const session = state.getCurrentSession();
    if (!session) return [];

    return session.locks.filter(
      lock => lock.entityType === entityType && lock.entityId === entityId
    );
  },

  isFieldLocked: (entityType, entityId, field, userId) => {
    const state = get();
    const locks = state.getLocksForEntity(entityType, entityId);
    const fieldLock = locks.find(lock => lock.field === field);
    
    return fieldLock ? fieldLock.userId !== userId : false;
  },
}));