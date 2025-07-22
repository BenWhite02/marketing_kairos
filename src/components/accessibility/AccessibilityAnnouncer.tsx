// src/components/accessibility/AccessibilityAnnouncer.tsx
import React from 'react';
import { clsx } from 'clsx';
import { createPortal } from 'react-dom';

/**
 * Accessibility Announcer Component for WCAG 2.1 AA Compliance
 * Provides comprehensive announcement system for dynamic content changes
 */

export interface AnnouncementOptions {
  priority?: 'low' | 'medium' | 'high';
  delay?: number;
  clearAfter?: number;
  atomic?: boolean;
  relevant?: string;
  interrupt?: boolean; // Clear previous announcements
}

export interface Announcement {
  id: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: number;
  options: AnnouncementOptions;
}

export interface AccessibilityAnnouncerProps {
  className?: string;
  maxAnnouncements?: number;
  defaultClearDelay?: number;
}

/**
 * Main Accessibility Announcer Component
 */
export const AccessibilityAnnouncer: React.FC<AccessibilityAnnouncerProps> = ({
  className,
  maxAnnouncements = 10,
  defaultClearDelay = 5000
}) => {
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const timeoutRefs = React.useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Function to add new announcement
  const announce = React.useCallback((
    message: string,
    options: AnnouncementOptions = {}
  ) => {
    const {
      priority = 'medium',
      delay = 0,
      clearAfter = defaultClearDelay,
      atomic = true,
      relevant = 'additions text',
      interrupt = false
    } = options;

    const id = `announcement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newAnnouncement: Announcement = {
      id,
      message,
      priority,
      timestamp: Date.now(),
      options: { priority, delay, clearAfter, atomic, relevant, interrupt }
    };

    const addAnnouncement = () => {
      setAnnouncements(prev => {
        let updated = interrupt ? [] : prev;
        
        // Add new announcement
        updated = [...updated, newAnnouncement];
        
        // Limit number of announcements
        if (updated.length > maxAnnouncements) {
          updated = updated.slice(-maxAnnouncements);
        }
        
        return updated;
      });

      // Set timeout to clear announcement
      if (clearAfter > 0) {
        const timeout = setTimeout(() => {
          setAnnouncements(prev => prev.filter(a => a.id !== id));
          timeoutRefs.current.delete(id);
        }, clearAfter);
        
        timeoutRefs.current.set(id, timeout);
      }
    };

    if (delay > 0) {
      setTimeout(addAnnouncement, delay);
    } else {
      addAnnouncement();
    }

    return id;
  }, [maxAnnouncements, defaultClearDelay]);

  // Function to clear specific announcement
  const clearAnnouncement = React.useCallback((id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    
    const timeout = timeoutRefs.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutRefs.current.delete(id);
    }
  }, []);

  // Function to clear all announcements
  const clearAll = React.useCallback(() => {
    setAnnouncements([]);
    
    // Clear all timeouts
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current.clear();
  }, []);

  // Cleanup timeouts on unmount
  React.useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      timeoutRefs.current.clear();
    };
  }, []);

  // Expose functions via ref
  React.useImperativeHandle(
    React.useRef<AccessibilityAnnouncerRef>(null),
    () => ({
      announce,
      clearAnnouncement,
      clearAll,
      getAnnouncements: () => announcements
    }),
    [announce, clearAnnouncement, clearAll, announcements]
  );

  // Group announcements by priority for different live regions
  const groupedAnnouncements = React.useMemo(() => {
    const groups = {
      low: announcements.filter(a => a.priority === 'low'),
      medium: announcements.filter(a => a.priority === 'medium'),
      high: announcements.filter(a => a.priority === 'high')
    };

    return groups;
  }, [announcements]);

  return (
    <div className={clsx('accessibility-announcer', className)}>
      {/* Low priority - polite announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        aria-relevant="additions text"
        className="sr-only"
        data-testid="announcer-polite"
      >
        {groupedAnnouncements.low.map(announcement => (
          <div key={announcement.id}>
            {announcement.message}
          </div>
        ))}
        {groupedAnnouncements.medium.map(announcement => (
          <div key={announcement.id}>
            {announcement.message}
          </div>
        ))}
      </div>

      {/* High priority - assertive announcements */}
      <div
        aria-live="assertive"
        aria-atomic="true"
        aria-relevant="additions text"
        className="sr-only"
        data-testid="announcer-assertive"
      >
        {groupedAnnouncements.high.map(announcement => (
          <div key={announcement.id}>
            {announcement.message}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Announcer ref interface for imperative API
 */
export interface AccessibilityAnnouncerRef {
  announce: (message: string, options?: AnnouncementOptions) => string;
  clearAnnouncement: (id: string) => void;
  clearAll: () => void;
  getAnnouncements: () => Announcement[];
}

/**
 * Context for global announcer
 */
interface AnnouncerContextValue {
  announce: (message: string, options?: AnnouncementOptions) => string;
  clearAnnouncement: (id: string) => void;
  clearAll: () => void;
  getAnnouncements: () => Announcement[];
}

const AnnouncerContext = React.createContext<AnnouncerContextValue | null>(null);

export interface AnnouncerProviderProps {
  children: React.ReactNode;
  maxAnnouncements?: number;
  defaultClearDelay?: number;
}

export const AnnouncerProvider: React.FC<AnnouncerProviderProps> = ({
  children,
  maxAnnouncements = 10,
  defaultClearDelay = 5000
}) => {
  const announcerRef = React.useRef<AccessibilityAnnouncerRef>(null);

  const contextValue: AnnouncerContextValue = React.useMemo(() => ({
    announce: (message: string, options?: AnnouncementOptions) => {
      return announcerRef.current?.announce(message, options) || '';
    },
    clearAnnouncement: (id: string) => {
      announcerRef.current?.clearAnnouncement(id);
    },
    clearAll: () => {
      announcerRef.current?.clearAll();
    },
    getAnnouncements: () => {
      return announcerRef.current?.getAnnouncements() || [];
    }
  }), []);

  return (
    <AnnouncerContext.Provider value={contextValue}>
      {children}
      {createPortal(
        <AccessibilityAnnouncer
          ref={announcerRef}
          maxAnnouncements={maxAnnouncements}
          defaultClearDelay={defaultClearDelay}
        />,
        document.body
      )}
    </AnnouncerContext.Provider>
  );
};

/**
 * Hook to use announcer context
 */
export const useAnnouncer = (): AnnouncerContextValue => {
  const context = React.useContext(AnnouncerContext);
  if (!context) {
    throw new Error('useAnnouncer must be used within an AnnouncerProvider');
  }
  return context;
};

/**
 * Specialized announcement hooks
 */

// Form validation announcements
export const useFormAnnouncements = () => {
  const { announce } = useAnnouncer();

  const announceValidationError = React.useCallback((
    fieldName: string,
    errors: string[]
  ) => {
    const message = errors.length === 1
      ? `${fieldName}: ${errors[0]}`
      : `${fieldName} has ${errors.length} errors: ${errors.join(', ')}`;
    
    announce(message, { priority: 'high', interrupt: true });
  }, [announce]);

  const announceFormSubmitted = React.useCallback((success: boolean) => {
    const message = success 
      ? 'Form submitted successfully'
      : 'Form submission failed';
    
    announce(message, { priority: success ? 'medium' : 'high' });
  }, [announce]);

  const announceFormSaved = React.useCallback(() => {
    announce('Form saved', { priority: 'medium' });
  }, [announce]);

  return {
    announceValidationError,
    announceFormSubmitted,
    announceFormSaved
  };
};

// Navigation announcements
export const useNavigationAnnouncements = () => {
  const { announce } = useAnnouncer();

  const announcePageChange = React.useCallback((pageName: string) => {
    announce(`Navigated to ${pageName}`, { priority: 'medium', delay: 100 });
  }, [announce]);

  const announceModalOpen = React.useCallback((modalTitle: string) => {
    announce(`${modalTitle} dialog opened`, { priority: 'medium' });
  }, [announce]);

  const announceModalClose = React.useCallback((modalTitle: string) => {
    announce(`${modalTitle} dialog closed`, { priority: 'medium' });
  }, [announce]);

  const announceMenuOpen = React.useCallback((menuName: string) => {
    announce(`${menuName} menu opened`, { priority: 'low' });
  }, [announce]);

  const announceMenuClose = React.useCallback((menuName: string) => {
    announce(`${menuName} menu closed`, { priority: 'low' });
  }, [announce]);

  return {
    announcePageChange,
    announceModalOpen,
    announceModalClose,
    announceMenuOpen,
    announceMenuClose
  };
};

// Data operation announcements
export const useDataAnnouncements = () => {
  const { announce } = useAnnouncer();

  const announceDataLoaded = React.useCallback((dataType: string, count?: number) => {
    const message = count !== undefined
      ? `${count} ${dataType} loaded`
      : `${dataType} loaded`;
    
    announce(message, { priority: 'low' });
  }, [announce]);

  const announceDataError = React.useCallback((operation: string, error?: string) => {
    const message = error
      ? `Error ${operation}: ${error}`
      : `Error ${operation}`;
    
    announce(message, { priority: 'high' });
  }, [announce]);

  const announceDataSaved = React.useCallback((dataType: string) => {
    announce(`${dataType} saved successfully`, { priority: 'medium' });
  }, [announce]);

  const announceDataDeleted = React.useCallback((dataType: string) => {
    announce(`${dataType} deleted`, { priority: 'medium' });
  }, [announce]);

  const announceSearchResults = React.useCallback((count: number, query?: string) => {
    const message = query
      ? `Found ${count} results for "${query}"`
      : `Found ${count} results`;
    
    announce(message, { priority: 'medium' });
  }, [announce]);

  return {
    announceDataLoaded,
    announceDataError,
    announceDataSaved,
    announceDataDeleted,
    announceSearchResults
  };
};

// Progress announcements
export const useProgressAnnouncements = () => {
  const { announce } = useAnnouncer();

  const announceProgress = React.useCallback((
    current: number,
    total: number,
    operation: string = 'Progress'
  ) => {
    const percent = Math.round((current / total) * 100);
    const message = `${operation}: ${current} of ${total} (${percent}%)`;
    
    announce(message, { priority: 'low', clearAfter: 2000 });
  }, [announce]);

  const announceCompletion = React.useCallback((operation: string = 'Operation') => {
    announce(`${operation} completed`, { priority: 'medium' });
  }, [announce]);

  const announceStart = React.useCallback((operation: string = 'Operation') => {
    announce(`${operation} started`, { priority: 'low' });
  }, [announce]);

  return {
    announceProgress,
    announceCompletion,
    announceStart
  };
};

/**
 * Component for automatic announcements
 */
export interface AutoAnnouncerProps {
  trigger: any; // Value that triggers announcement
  message: string | ((value: any) => string);
  options?: AnnouncementOptions;
  condition?: (value: any) => boolean;
}

export const AutoAnnouncer: React.FC<AutoAnnouncerProps> = ({
  trigger,
  message,
  options,
  condition = () => true
}) => {
  const { announce } = useAnnouncer();
  const previousTrigger = React.useRef(trigger);

  React.useEffect(() => {
    if (trigger !== previousTrigger.current && condition(trigger)) {
      const messageText = typeof message === 'function' ? message(trigger) : message;
      announce(messageText, options);
    }
    previousTrigger.current = trigger;
  }, [trigger, message, options, condition, announce]);

  return null;
};

export default {
  AccessibilityAnnouncer,
  AnnouncerProvider,
  useAnnouncer,
  useFormAnnouncements,
  useNavigationAnnouncements,
  useDataAnnouncements,
  useProgressAnnouncements,
  AutoAnnouncer,
};