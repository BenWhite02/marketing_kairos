// src/components/accessibility/LiveRegion.tsx
import React from 'react';
import { clsx } from 'clsx';
import { createPortal } from 'react-dom';

/**
 * Live Region Component for WCAG 2.1 AA Compliance
 * Provides ARIA live regions for dynamic content announcements
 */

export interface LiveRegionProps {
  children?: React.ReactNode;
  politeness?: 'off' | 'polite' | 'assertive';
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all' | string;
  busy?: boolean;
  className?: string;
  id?: string;
  as?: keyof JSX.IntrinsicElements;
  portal?: boolean; // Render in portal for global announcements
  clearOnUpdate?: boolean; // Clear content before setting new content
  clearDelay?: number; // Delay before clearing (ms)
}

export const LiveRegion: React.FC<LiveRegionProps> = ({
  children,
  politeness = 'polite',
  atomic = false,
  relevant = 'additions text',
  busy = false,
  className,
  id,
  as: Component = 'div',
  portal = false,
  clearOnUpdate = false,
  clearDelay = 0,
  ...props
}) => {
  const [content, setContent] = React.useState(children);
  const [isCleared, setIsCleared] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  // Handle content updates with optional clearing
  React.useEffect(() => {
    if (clearOnUpdate && children && children !== content) {
      // Clear content first
      setContent(null);
      setIsCleared(true);

      // Set new content after delay
      timeoutRef.current = setTimeout(() => {
        setContent(children);
        setIsCleared(false);
      }, clearDelay);
    } else {
      setContent(children);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [children, clearOnUpdate, clearDelay, content]);

  const liveRegionElement = React.createElement(
    Component,
    {
      'aria-live': politeness,
      'aria-atomic': atomic,
      'aria-relevant': relevant,
      'aria-busy': busy,
      className: clsx(
        // Visually hidden but available to screen readers
        'sr-only',
        className
      ),
      id,
      ...props
    },
    isCleared ? null : content
  );

  if (portal) {
    return createPortal(liveRegionElement, document.body);
  }

  return liveRegionElement;
};

/**
 * Status Live Region - for status updates (polite)
 */
export interface StatusRegionProps extends Omit<LiveRegionProps, 'politeness'> {
  status: string;
  showStatus?: boolean;
}

export const StatusRegion: React.FC<StatusRegionProps> = ({
  status,
  showStatus = true,
  ...props
}) => {
  return (
    <LiveRegion
      politeness="polite"
      atomic={true}
      portal={true}
      clearOnUpdate={true}
      clearDelay={100}
      {...props}
    >
      {showStatus ? status : null}
    </LiveRegion>
  );
};

/**
 * Alert Live Region - for urgent announcements (assertive)
 */
export interface AlertRegionProps extends Omit<LiveRegionProps, 'politeness'> {
  alert: string;
  showAlert?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export const AlertRegion: React.FC<AlertRegionProps> = ({
  alert,
  showAlert = true,
  autoHide = true,
  autoHideDelay = 5000,
  ...props
}) => {
  const [isVisible, setIsVisible] = React.useState(showAlert);

  React.useEffect(() => {
    setIsVisible(showAlert);

    if (showAlert && autoHide) {
      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, autoHideDelay);

      return () => clearTimeout(timeout);
    }
  }, [showAlert, autoHide, autoHideDelay]);

  return (
    <LiveRegion
      politeness="assertive"
      atomic={true}
      portal={true}
      clearOnUpdate={true}
      clearDelay={100}
      {...props}
    >
      {isVisible ? alert : null}
    </LiveRegion>
  );
};

/**
 * Progress Live Region - for progress updates
 */
export interface ProgressRegionProps extends Omit<LiveRegionProps, 'politeness'> {
  current: number;
  total: number;
  label?: string;
  unit?: string;
  announceInterval?: number; // Announce every N percent
  announceThreshold?: number; // Don't announce below this threshold
}

export const ProgressRegion: React.FC<ProgressRegionProps> = ({
  current,
  total,
  label = 'Progress',
  unit = '',
  announceInterval = 10,
  announceThreshold = 5,
  ...props
}) => {
  const [lastAnnounced, setLastAnnounced] = React.useState(0);
  const [announcement, setAnnouncement] = React.useState('');

  React.useEffect(() => {
    const percent = Math.round((current / total) * 100);
    
    // Check if we should announce
    const shouldAnnounce = 
      percent >= announceThreshold &&
      (percent >= lastAnnounced + announceInterval || percent === 100 || percent === 0);

    if (shouldAnnounce) {
      const message = `${label}: ${current}${unit ? ` ${unit}` : ''} of ${total}${unit ? ` ${unit}` : ''} (${percent}% complete)`;
      setAnnouncement(message);
      setLastAnnounced(percent);

      // Clear announcement after a delay to allow for repeated announcements
      const timeout = setTimeout(() => {
        setAnnouncement('');
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [current, total, label, unit, announceInterval, announceThreshold, lastAnnounced]);

  return (
    <LiveRegion
      politeness="polite"
      atomic={true}
      portal={true}
      {...props}
    >
      {announcement}
    </LiveRegion>
  );
};

/**
 * Loading Live Region - for loading state announcements
 */
export interface LoadingRegionProps extends Omit<LiveRegionProps, 'politeness'> {
  isLoading: boolean;
  loadingText?: string;
  completedText?: string;
  errorText?: string;
  hasError?: boolean;
}

export const LoadingRegion: React.FC<LoadingRegionProps> = ({
  isLoading,
  loadingText = 'Loading',
  completedText = 'Loading complete',
  errorText = 'Loading failed',
  hasError = false,
  ...props
}) => {
  const [announcement, setAnnouncement] = React.useState('');
  const [previousLoading, setPreviousLoading] = React.useState(isLoading);

  React.useEffect(() => {
    if (isLoading && !previousLoading) {
      // Started loading
      setAnnouncement(loadingText);
    } else if (!isLoading && previousLoading) {
      // Finished loading
      setAnnouncement(hasError ? errorText : completedText);
    }

    setPreviousLoading(isLoading);

    // Clear announcement after delay
    if (announcement) {
      const timeout = setTimeout(() => {
        setAnnouncement('');
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [isLoading, previousLoading, loadingText, completedText, errorText, hasError, announcement]);

  return (
    <LiveRegion
      politeness={hasError ? 'assertive' : 'polite'}
      atomic={true}
      portal={true}
      {...props}
    >
      {announcement}
    </LiveRegion>
  );
};

/**
 * Live Region Manager Hook
 */
export interface LiveRegionManager {
  announceStatus: (message: string, delay?: number) => void;
  announceAlert: (message: string, delay?: number) => void;
  announceProgress: (current: number, total: number, label?: string) => void;
  clearAll: () => void;
}

export const useLiveRegionManager = (): LiveRegionManager => {
  const [statusMessage, setStatusMessage] = React.useState('');
  const [alertMessage, setAlertMessage] = React.useState('');
  const [progressData, setProgressData] = React.useState<{
    current: number;
    total: number;
    label: string;
  } | null>(null);

  const announceStatus = React.useCallback((message: string, delay: number = 0) => {
    if (delay > 0) {
      setTimeout(() => setStatusMessage(message), delay);
    } else {
      setStatusMessage(message);
    }

    // Clear after announcement
    setTimeout(() => setStatusMessage(''), 1000);
  }, []);

  const announceAlert = React.useCallback((message: string, delay: number = 0) => {
    if (delay > 0) {
      setTimeout(() => setAlertMessage(message), delay);
    } else {
      setAlertMessage(message);
    }

    // Clear after announcement
    setTimeout(() => setAlertMessage(''), 1000);
  }, []);

  const announceProgress = React.useCallback((
    current: number,
    total: number,
    label: string = 'Progress'
  ) => {
    setProgressData({ current, total, label });

    // Clear after announcement
    setTimeout(() => setProgressData(null), 1000);
  }, []);

  const clearAll = React.useCallback(() => {
    setStatusMessage('');
    setAlertMessage('');
    setProgressData(null);
  }, []);

  // Render live regions
  React.useEffect(() => {
    const container = document.getElementById('live-regions-container') || (() => {
      const div = document.createElement('div');
      div.id = 'live-regions-container';
      div.className = 'sr-only';
      document.body.appendChild(div);
      return div;
    })();

    return () => {
      // Cleanup if needed
    };
  }, []);

  return {
    announceStatus,
    announceAlert,
    announceProgress,
    clearAll
  };
};

/**
 * Global Live Region Provider
 */
interface LiveRegionContextValue extends LiveRegionManager {
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

const LiveRegionContext = React.createContext<LiveRegionContextValue | null>(null);

export interface LiveRegionProviderProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export const LiveRegionProvider: React.FC<LiveRegionProviderProps> = ({
  children,
  enabled = true
}) => {
  const [isEnabled, setEnabled] = React.useState(enabled);
  const manager = useLiveRegionManager();

  const contextValue: LiveRegionContextValue = React.useMemo(() => ({
    ...manager,
    isEnabled,
    setEnabled
  }), [manager, isEnabled]);

  return (
    <LiveRegionContext.Provider value={contextValue}>
      {children}
      {/* Global live regions */}
      <div id="global-live-regions" className="sr-only">
        <div
          id="global-status-region"
          aria-live="polite"
          aria-atomic="true"
          aria-relevant="additions text"
        />
        <div
          id="global-alert-region"
          aria-live="assertive"
          aria-atomic="true"
          aria-relevant="additions text"
        />
      </div>
    </LiveRegionContext.Provider>
  );
};

/**
 * Hook to use live region context
 */
export const useLiveRegions = (): LiveRegionContextValue => {
  const context = React.useContext(LiveRegionContext);
  if (!context) {
    throw new Error('useLiveRegions must be used within a LiveRegionProvider');
  }
  return context;
};

/**
 * Utility function to announce to global live regions
 */
export const announceToLiveRegion = (
  message: string,
  type: 'status' | 'alert' = 'status',
  delay: number = 0
): void => {
  const regionId = type === 'status' ? 'global-status-region' : 'global-alert-region';
  const region = document.getElementById(regionId);

  if (region) {
    const announce = () => {
      region.textContent = message;
      setTimeout(() => {
        region.textContent = '';
      }, 1000);
    };

    if (delay > 0) {
      setTimeout(announce, delay);
    } else {
      announce();
    }
  }
};

export default {
  LiveRegion,
  StatusRegion,
  AlertRegion,
  ProgressRegion,
  LoadingRegion,
  LiveRegionProvider,
  useLiveRegionManager,
  useLiveRegions,
  announceToLiveRegion,
};