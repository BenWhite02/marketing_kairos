// File Path: src/stores/ui/notificationStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Notification, NotificationPreferences, NotificationFilters } from '../../types/notifications';

interface NotificationState {
  // State
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  filters: NotificationFilters;
  isVisible: boolean;
  toastQueue: Notification[];
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAll: () => void;
  clearExpired: () => void;
  setPreferences: (preferences: Partial<NotificationPreferences>) => void;
  setFilters: (filters: Partial<NotificationFilters>) => void;
  toggleVisibility: () => void;
  showNotificationCenter: () => void;
  hideNotificationCenter: () => void;
  
  // Computed
  getFilteredNotifications: () => Notification[];
  getUnreadNotifications: () => Notification[];
  getNotificationsByCategory: (category: string) => Notification[];
}

const defaultPreferences: NotificationPreferences = {
  email: true,
  push: true,
  inApp: true,
  categories: {
    system: true,
    campaign: true,
    experiment: true,
    moment: true,
    analytics: true,
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
  priority: {
    low: true,
    medium: true,
    high: true,
    critical: true,
  },
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      // Initial state
      notifications: [],
      unreadCount: 0,
      preferences: defaultPreferences,
      filters: {},
      isVisible: false,
      toastQueue: [],

      // Actions
      addNotification: (notificationData) => {
        const notification: Notification = {
          ...notificationData,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          read: false,
        };

        set((state) => {
          const notifications = [notification, ...state.notifications];
          const unreadCount = notifications.filter(n => !n.read).length;
          
          // Add to toast queue if high priority or critical
          const toastQueue = ['high', 'critical'].includes(notification.priority)
            ? [...state.toastQueue, notification]
            : state.toastQueue;

          return {
            notifications,
            unreadCount,
            toastQueue,
          };
        });
      },

      markAsRead: (notificationId) => {
        set((state) => {
          const notifications = state.notifications.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
          );
          const unreadCount = notifications.filter(n => !n.read).length;

          return { notifications, unreadCount };
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      removeNotification: (notificationId) => {
        set((state) => {
          const notifications = state.notifications.filter(n => n.id !== notificationId);
          const unreadCount = notifications.filter(n => !n.read).length;
          const toastQueue = state.toastQueue.filter(n => n.id !== notificationId);

          return { notifications, unreadCount, toastQueue };
        });
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0, toastQueue: [] });
      },

      clearExpired: () => {
        const now = Date.now();
        set((state) => {
          const notifications = state.notifications.filter(n => 
            !n.expiresAt || n.expiresAt > now
          );
          const unreadCount = notifications.filter(n => !n.read).length;

          return { notifications, unreadCount };
        });
      },

      setPreferences: (newPreferences) => {
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences },
        }));
      },

      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
      },

      toggleVisibility: () => {
        set((state) => ({ isVisible: !state.isVisible }));
      },

      showNotificationCenter: () => {
        set({ isVisible: true });
      },

      hideNotificationCenter: () => {
        set({ isVisible: false });
      },

      // Computed getters
      getFilteredNotifications: () => {
        const { notifications, filters } = get();
        let filtered = [...notifications];

        if (filters.category) {
          filtered = filtered.filter(n => n.category === filters.category);
        }

        if (filters.type) {
          filtered = filtered.filter(n => n.type === filters.type);
        }

        if (filters.priority) {
          filtered = filtered.filter(n => n.priority === filters.priority);
        }

        if (filters.read !== undefined) {
          filtered = filtered.filter(n => n.read === filters.read);
        }

        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filtered = filtered.filter(n => 
            n.title.toLowerCase().includes(searchTerm) ||
            n.message.toLowerCase().includes(searchTerm)
          );
        }

        if (filters.dateRange) {
          filtered = filtered.filter(n => {
            const notifDate = new Date(n.timestamp);
            return notifDate >= filters.dateRange!.start && 
                   notifDate <= filters.dateRange!.end;
          });
        }

        return filtered.sort((a, b) => b.timestamp - a.timestamp);
      },

      getUnreadNotifications: () => {
        return get().notifications.filter(n => !n.read);
      },

      getNotificationsByCategory: (category) => {
        return get().notifications.filter(n => n.category === category);
      },
    }),
    {
      name: 'kairos-notifications',
      partialize: (state) => ({
        notifications: state.notifications,
        preferences: state.preferences,
      }),
    }
  )
);