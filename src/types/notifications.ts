// File Path: src/types/notifications.ts

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'system' | 'campaign' | 'experiment' | 'moment' | 'analytics';
  actionUrl?: string;
  actionText?: string;
  expiresAt?: number;
  metadata?: Record<string, any>;
  entityId?: string;
  entityType?: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  categories: Record<string, boolean>;
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
  priority: {
    low: boolean;
    medium: boolean;
    high: boolean;
    critical: boolean;
  };
}

export interface NotificationFilters {
  category?: string;
  type?: string;
  priority?: string;
  read?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
}