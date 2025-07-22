// File Path: src/types/collaboration.ts

export interface UserPresence {
  userId: string;
  userName: string;
  userEmail: string;
  avatar?: string;
  status: 'active' | 'idle' | 'away';
  currentPage?: string;
  currentEntity?: {
    type: 'campaign' | 'moment' | 'experiment' | 'atom';
    id: string;
    name: string;
  };
  cursorPosition?: {
    x: number;
    y: number;
    elementId?: string;
  };
  lastSeen: number;
  joinedAt: number;
}

export interface CollaborativeEdit {
  id: string;
  entityType: 'campaign' | 'moment' | 'experiment' | 'atom';
  entityId: string;
  field: string;
  value: any;
  previousValue?: any;
  userId: string;
  userName: string;
  timestamp: number;
  action: 'create' | 'update' | 'delete';
  isTemporary?: boolean; // For real-time preview
}

export interface EditLock {
  id: string;
  entityType: string;
  entityId: string;
  field?: string;
  userId: string;
  userName: string;
  timestamp: number;
  expiresAt: number;
}

export interface CollaborationSession {
  id: string;
  entityType: string;
  entityId: string;
  participants: UserPresence[];
  activeEdits: CollaborativeEdit[];
  locks: EditLock[];
  createdAt: number;
  lastActivity: number;
}

export interface CursorPosition {
  userId: string;
  userName: string;
  x: number;
  y: number;
  elementId?: string;
  color: string;
  timestamp: number;
}

export interface CollaborationState {
  sessions: Record<string, CollaborationSession>;
  currentSession?: string;
  userPresence: Record<string, UserPresence>;
  activeCursors: Record<string, CursorPosition>;
  pendingEdits: CollaborativeEdit[];
  isCollaborating: boolean;
}