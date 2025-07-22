// src/components/accessibility/ScreenReaderOnly.tsx
import React from 'react';
import { clsx } from 'clsx';

/**
 * Screen Reader Only Component for WCAG 2.1 AA Compliance
 * Provides content that is only visible to screen readers
 */

export interface ScreenReaderOnlyProps {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  focusable?: boolean;
  role?: string;
  'aria-live'?: 'off' | 'polite' | 'assertive';
  'aria-atomic'?: boolean;
  id?: string;
}

export const ScreenReaderOnly: React.FC<ScreenReaderOnlyProps> = ({
  children,
  as: Component = 'span',
  className,
  focusable = false,
  role,
  'aria-live': ariaLive,
  'aria-atomic': ariaAtomic,
  id,
  ...props
}) => {
  return React.createElement(
    Component,
    {
      className: clsx(
        // Screen reader only styles - visually hidden but accessible to screen readers
        'absolute !w-px !h-px !p-0 !m-[-1px] !overflow-hidden !whitespace-nowrap !border-0',
        // If focusable, show on focus
        focusable && [
          'focus:!relative focus:!w-auto focus:!h-auto focus:!p-2 focus:!m-0',
          'focus:!overflow-visible focus:!whitespace-normal',
          'focus:bg-blue-600 focus:text-white focus:rounded focus:shadow-lg',
          'focus:z-50'
        ],
        className
      ),
      role,
      'aria-live': ariaLive,
      'aria-atomic': ariaAtomic,
      id,
      // Make focusable if requested
      tabIndex: focusable ? 0 : undefined,
      ...props
    },
    children
  );
};

/**
 * Screen Reader Announcement Component
 * For dynamic announcements to screen readers
 */
export interface ScreenReaderAnnouncementProps {
  message: string;
  priority?: 'polite' | 'assertive';
  atomic?: boolean;
  delay?: number;
  id?: string;
  onAnnounced?: () => void;
}

export const ScreenReaderAnnouncement: React.FC<ScreenReaderAnnouncementProps> = ({
  message,
  priority = 'polite',
  atomic = true,
  delay = 0,
  id,
  onAnnounced
}) => {
  const [currentMessage, setCurrentMessage] = React.useState('');
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    if (message) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Announce with delay if specified
      timeoutRef.current = setTimeout(() => {
        setCurrentMessage(message);
        onAnnounced?.();

        // Clear message after announcement to allow repeated announcements
        setTimeout(() => {
          setCurrentMessage('');
        }, 1000);
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message, delay, onAnnounced]);

  if (!currentMessage) {
    return null;
  }

  return (
    <ScreenReaderOnly
      role="status"
      aria-live={priority}
      aria-atomic={atomic}
      id={id}
    >
      {currentMessage}
    </ScreenReaderOnly>
  );
};

/**
 * Screen Reader Description Component
 * Provides additional context for screen reader users
 */
export interface ScreenReaderDescriptionProps {
  children: React.ReactNode;
  for?: string; // ID of the element this describes
  className?: string;
}

export const ScreenReaderDescription: React.FC<ScreenReaderDescriptionProps> = ({
  children,
  for: htmlFor,
  className
}) => {
  const id = React.useId();
  
  return (
    <ScreenReaderOnly
      id={id}
      className={className}
      role="note"
    >
      {children}
    </ScreenReaderOnly>
  );
};

/**
 * Screen Reader Navigation Helper
 * Provides navigation context for screen reader users
 */
export interface ScreenReaderNavHelperProps {
  totalItems: number;
  currentIndex: number;
  itemType?: string;
  includePosition?: boolean;
  includeTotal?: boolean;
}

export const ScreenReaderNavHelper: React.FC<ScreenReaderNavHelperProps> = ({
  totalItems,
  currentIndex,
  itemType = 'item',
  includePosition = true,
  includeTotal = true
}) => {
  const announcement = React.useMemo(() => {
    const parts: string[] = [];
    
    if (includePosition) {
      parts.push(`${itemType} ${currentIndex + 1}`);
    }
    
    if (includeTotal) {
      parts.push(`of ${totalItems}`);
    }
    
    return parts.join(' ');
  }, [totalItems, currentIndex, itemType, includePosition, includeTotal]);

  return (
    <ScreenReaderOnly role="status" aria-live="polite">
      {announcement}
    </ScreenReaderOnly>
  );
};

/**
 * Screen Reader Loading Indicator
 * Announces loading states to screen reader users
 */
export interface ScreenReaderLoadingProps {
  isLoading: boolean;
  loadingText?: string;
  completedText?: string;
  errorText?: string;
  error?: boolean;
}

export const ScreenReaderLoading: React.FC<ScreenReaderLoadingProps> = ({
  isLoading,
  loadingText = 'Loading content',
  completedText = 'Content loaded',
  errorText = 'Error loading content',
  error = false
}) => {
  const [previousLoading, setPreviousLoading] = React.useState(isLoading);
  const [announcement, setAnnouncement] = React.useState('');

  React.useEffect(() => {
    if (isLoading && !previousLoading) {
      // Started loading
      setAnnouncement(loadingText);
    } else if (!isLoading && previousLoading) {
      // Finished loading
      setAnnouncement(error ? errorText : completedText);
    }
    
    setPreviousLoading(isLoading);
  }, [isLoading, previousLoading, loadingText, completedText, errorText, error]);

  if (!announcement) {
    return null;
  }

  return (
    <ScreenReaderAnnouncement
      message={announcement}
      priority={error ? 'assertive' : 'polite'}
      onAnnounced={() => setAnnouncement('')}
    />
  );
};

/**
 * Screen Reader Form Validation
 * Announces form validation messages
 */
export interface ScreenReaderFormValidationProps {
  errors: string[];
  fieldName?: string;
  isVisible?: boolean;
}

export const ScreenReaderFormValidation: React.FC<ScreenReaderFormValidationProps> = ({
  errors,
  fieldName,
  isVisible = true
}) => {
  const errorMessage = React.useMemo(() => {
    if (errors.length === 0) return '';
    
    const prefix = fieldName ? `${fieldName}: ` : '';
    const errorText = errors.length === 1 
      ? errors[0] 
      : `${errors.length} errors: ${errors.join(', ')}`;
    
    return `${prefix}${errorText}`;
  }, [errors, fieldName]);

  if (!isVisible || !errorMessage) {
    return null;
  }

  return (
    <ScreenReaderOnly
      role="alert"
      aria-live="assertive"
      aria-atomic={true}
    >
      {errorMessage}
    </ScreenReaderOnly>
  );
};

/**
 * Screen Reader Progress Indicator
 * Announces progress updates
 */
export interface ScreenReaderProgressProps {
  current: number;
  total: number;
  label?: string;
  unit?: string;
  announceInterval?: number; // Announce every N percent
}

export const ScreenReaderProgress: React.FC<ScreenReaderProgressProps> = ({
  current,
  total,
  label = 'Progress',
  unit = '',
  announceInterval = 10
}) => {
  const [lastAnnouncedPercent, setLastAnnouncedPercent] = React.useState(0);
  const [announcement, setAnnouncement] = React.useState('');

  React.useEffect(() => {
    const percent = Math.round((current / total) * 100);
    
    // Announce at intervals or when complete
    if (
      percent >= lastAnnouncedPercent + announceInterval ||
      percent === 100 ||
      (percent === 0 && lastAnnouncedPercent > 0)
    ) {
      const message = `${label}: ${current}${unit ? ` ${unit}` : ''} of ${total}${unit ? ` ${unit}` : ''} (${percent}%)`;
      setAnnouncement(message);
      setLastAnnouncedPercent(percent);
    }
  }, [current, total, label, unit, announceInterval, lastAnnouncedPercent]);

  return (
    <ScreenReaderAnnouncement
      message={announcement}
      priority="polite"
      onAnnounced={() => setAnnouncement('')}
    />
  );
};

/**
 * Screen Reader Table Navigation Helper
 * Provides table navigation context
 */
export interface ScreenReaderTableNavProps {
  rowIndex: number;
  columnIndex: number;
  totalRows: number;
  totalColumns: number;
  columnHeader?: string;
  rowHeader?: string;
}

export const ScreenReaderTableNav: React.FC<ScreenReaderTableNavProps> = ({
  rowIndex,
  columnIndex,
  totalRows,
  totalColumns,
  columnHeader,
  rowHeader
}) => {
  const announcement = React.useMemo(() => {
    const parts = [`Row ${rowIndex + 1} of ${totalRows}, Column ${columnIndex + 1} of ${totalColumns}`];
    
    if (columnHeader) {
      parts.push(`Column: ${columnHeader}`);
    }
    
    if (rowHeader) {
      parts.push(`Row: ${rowHeader}`);
    }
    
    return parts.join(', ');
  }, [rowIndex, columnIndex, totalRows, totalColumns, columnHeader, rowHeader]);

  return (
    <ScreenReaderOnly role="status" aria-live="polite">
      {announcement}
    </ScreenReaderOnly>
  );
};

/**
 * Hook for managing screen reader announcements
 */
export const useScreenReaderAnnouncement = () => {
  const [announcement, setAnnouncement] = React.useState('');
  const [priority, setPriority] = React.useState<'polite' | 'assertive'>('polite');

  const announce = React.useCallback((
    message: string,
    urgency: 'polite' | 'assertive' = 'polite'
  ) => {
    setAnnouncement(message);
    setPriority(urgency);
  }, []);

  const clear = React.useCallback(() => {
    setAnnouncement('');
  }, []);

  return {
    announce,
    clear,
    announcement,
    priority,
    AnnouncementComponent: () => (
      <ScreenReaderAnnouncement
        message={announcement}
        priority={priority}
        onAnnounced={clear}
      />
    )
  };
};

export default {
  ScreenReaderOnly,
  ScreenReaderAnnouncement,
  ScreenReaderDescription,
  ScreenReaderNavHelper,
  ScreenReaderLoading,
  ScreenReaderFormValidation,
  ScreenReaderProgress,
  ScreenReaderTableNav,
  useScreenReaderAnnouncement,
};