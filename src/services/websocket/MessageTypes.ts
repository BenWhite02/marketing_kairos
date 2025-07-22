// File Path: src/services/websocket/MessageTypes.ts

export enum WebSocketEventType {
  // Connection events
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  RECONNECT = 'reconnect',
  ERROR = 'error',
  
  // User presence events
  USER_JOIN = 'user:join',
  USER_LEAVE = 'user:leave',
  USER_TYPING = 'user:typing',
  USER_IDLE = 'user:idle',
  USER_ACTIVE = 'user:active',
  
  // Real-time data updates
  CAMPAIGN_UPDATE = 'campaign:update',
  MOMENT_UPDATE = 'moment:update',
  EXPERIMENT_UPDATE = 'experiment:update',
  ANALYTICS_UPDATE = 'analytics:update',
  ATOM_UPDATE = 'atom:update',
  
  // Notifications
  NOTIFICATION_NEW = 'notification:new',
  NOTIFICATION_READ = 'notification:read',
  NOTIFICATION_CLEAR = 'notification:clear',
  
  // Collaborative editing
  EDIT_START = 'edit:start',
  EDIT_CHANGE = 'edit:change',
  EDIT_END = 'edit:end',
  EDIT_CURSOR = 'edit:cursor',
  
  // System events
  SYSTEM_STATUS = 'system:status',
  SYSTEM_ALERT = 'system:alert',
  SYSTEM_MAINTENANCE = 'system:maintenance',
}

export interface WebSocketMessage<T = any> {
  id: string;
  type: WebSocketEventType;
  timestamp: number;
  userId?: string;
  data: T;
  metadata?: Record<string, any>;
}

export interface UserPresence {
  userId: string;
  userName: string;
  avatar?: string;
  status: 'active' | 'idle' | 'away';
  currentPage?: string;
  cursorPosition?: { x: number; y: number };
  lastSeen: number;
}

export interface NotificationMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  expiresAt?: number;
  metadata?: Record<string, any>;
}

export interface AnalyticsUpdate {
  campaignId?: string;
  momentId?: string;
  experimentId?: string;
  metrics: {
    impressions?: number;
    clicks?: number;
    conversions?: number;
    revenue?: number;
    roas?: number;
    ctr?: number;
    cvr?: number;
  };
  timestamp: number;
}

export interface CollaborativeEdit {
  entityType: 'campaign' | 'moment' | 'experiment' | 'atom';
  entityId: string;
  field: string;
  value: any;
  userId: string;
  userName: string;
  timestamp: number;
}

export interface SystemStatus {
  status: 'healthy' | 'degraded' | 'down';
  services: {
    api: 'up' | 'down' | 'degraded';
    database: 'up' | 'down' | 'degraded';
    cache: 'up' | 'down' | 'degraded';
    analytics: 'up' | 'down' | 'degraded';
  };
  metrics: {
    responseTime: number;
    uptime: number;
    activeUsers: number;
    errorRate: number;
  };
  timestamp: number;
}