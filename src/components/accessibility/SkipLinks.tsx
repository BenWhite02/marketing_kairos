// src/components/accessibility/SkipLinks.tsx
import React from 'react';
import { clsx } from 'clsx';

/**
 * Skip Links Component for WCAG 2.1 AA Compliance
 * Provides keyboard users quick navigation to main content areas
 */

export interface SkipLink {
  href: string;
  text: string;
  id?: string;
}

export interface SkipLinksProps {
  links?: SkipLink[];
  className?: string;
  position?: 'top-left' | 'top-center' | 'top-right';
  theme?: 'light' | 'dark' | 'auto';
}

const defaultLinks: SkipLink[] = [
  { href: '#main-content', text: 'Skip to main content', id: 'skip-main' },
  { href: '#primary-navigation', text: 'Skip to navigation', id: 'skip-nav' },
  { href: '#page-footer', text: 'Skip to footer', id: 'skip-footer' }
];

export const SkipLinks: React.FC<SkipLinksProps> = ({
  links = defaultLinks,
  className,
  position = 'top-left',
  theme = 'auto'
}) => {
  const positionClasses = {
    'top-left': 'left-4',
    'top-center': 'left-1/2 -translate-x-1/2',
    'top-right': 'right-4'
  };

  const themeClasses = {
    light: 'bg-white text-gray-900 border-gray-300',
    dark: 'bg-gray-900 text-white border-gray-600',
    auto: 'bg-white text-gray-900 border-gray-300 dark:bg-gray-900 dark:text-white dark:border-gray-600'
  };

  return (
    <div
      className={clsx(
        // Base positioning
        'fixed top-0 z-[9999]',
        positionClasses[position],
        // Custom classes
        className
      )}
      role="navigation"
      aria-label="Skip navigation links"
    >
      <ul className="flex flex-col gap-1 p-1">
        {links.map((link, index) => (
          <li key={link.id || index}>
            <a
              href={link.href}
              id={link.id}
              className={clsx(
                // Base styles - hidden by default
                'absolute left-[-10000px] top-auto w-[1px] h-[1px] overflow-hidden',
                // Focus styles - visible when focused
                'focus:relative focus:left-auto focus:top-auto focus:w-auto focus:h-auto focus:overflow-visible',
                // Visual styles when visible
                'focus:inline-block focus:px-4 focus:py-2 focus:text-sm focus:font-medium',
                'focus:rounded-md focus:border focus:shadow-lg',
                'focus:transition-all focus:duration-150',
                // Theme styles
                themeClasses[theme],
                // Hover effects
                'focus:hover:shadow-xl focus:hover:scale-105',
                // Accessibility
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              )}
              onClick={(e) => {
                // Ensure target element exists and focus it
                const target = document.querySelector(link.href);
                if (target) {
                  e.preventDefault();
                  
                  // Make target focusable if it isn't already
                  const targetElement = target as HTMLElement;
                  if (!targetElement.hasAttribute('tabindex')) {
                    targetElement.setAttribute('tabindex', '-1');
                  }
                  
                  // Focus the target with a small delay to ensure smooth transition
                  setTimeout(() => {
                    targetElement.focus();
                    
                    // Announce to screen readers
                    const announcement = `Skipped to ${link.text.toLowerCase()}`;
                    const ariaLive = document.createElement('div');
                    ariaLive.setAttribute('aria-live', 'polite');
                    ariaLive.setAttribute('aria-atomic', 'true');
                    ariaLive.className = 'sr-only';
                    ariaLive.textContent = announcement;
                    
                    document.body.appendChild(ariaLive);
                    setTimeout(() => document.body.removeChild(ariaLive), 1000);
                  }, 100);
                }
              }}
              onKeyDown={(e) => {
                // Handle Enter and Space keys
                if (e.key === 'Enter' || e.key === ' ') {
                  e.currentTarget.click();
                }
              }}
            >
              {link.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * Skip Links Provider Component
 * Provides skip links context throughout the application
 */
export interface SkipLinksContextValue {
  registerTarget: (id: string, label: string) => void;
  unregisterTarget: (id: string) => void;
  getTargets: () => SkipLink[];
}

const SkipLinksContext = React.createContext<SkipLinksContextValue | null>(null);

export interface SkipLinksProviderProps {
  children: React.ReactNode;
  defaultLinks?: SkipLink[];
}

export const SkipLinksProvider: React.FC<SkipLinksProviderProps> = ({
  children,
  defaultLinks = defaultLinks
}) => {
  const [dynamicTargets, setDynamicTargets] = React.useState<Map<string, SkipLink>>(new Map());

  const registerTarget = React.useCallback((id: string, label: string) => {
    setDynamicTargets(prev => new Map(prev).set(id, {
      href: `#${id}`,
      text: `Skip to ${label}`,
      id: `skip-${id}`
    }));
  }, []);

  const unregisterTarget = React.useCallback((id: string) => {
    setDynamicTargets(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  const getTargets = React.useCallback((): SkipLink[] => {
    return [...defaultLinks, ...Array.from(dynamicTargets.values())];
  }, [defaultLinks, dynamicTargets]);

  const contextValue: SkipLinksContextValue = React.useMemo(() => ({
    registerTarget,
    unregisterTarget,
    getTargets
  }), [registerTarget, unregisterTarget, getTargets]);

  return (
    <SkipLinksContext.Provider value={contextValue}>
      <SkipLinks links={getTargets()} />
      {children}
    </SkipLinksContext.Provider>
  );
};

/**
 * Hook to use skip links context
 */
export const useSkipLinks = (): SkipLinksContextValue => {
  const context = React.useContext(SkipLinksContext);
  if (!context) {
    throw new Error('useSkipLinks must be used within a SkipLinksProvider');
  }
  return context;
};

/**
 * Hook to register a skip target
 */
export const useSkipTarget = (id: string, label: string, condition: boolean = true) => {
  const { registerTarget, unregisterTarget } = useSkipLinks();

  React.useEffect(() => {
    if (condition) {
      registerTarget(id, label);
    } else {
      unregisterTarget(id);
    }

    return () => {
      unregisterTarget(id);
    };
  }, [id, label, condition, registerTarget, unregisterTarget]);
};

/**
 * Skip Target Component
 * Marks an element as a skip target
 */
export interface SkipTargetProps {
  id: string;
  label?: string;
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  autoRegister?: boolean;
}

export const SkipTarget: React.FC<SkipTargetProps> = ({
  id,
  label,
  children,
  as: Component = 'div',
  className,
  autoRegister = true,
  ...props
}) => {
  const elementRef = React.useRef<HTMLElement>(null);
  
  // Auto-register with skip links provider if available
  React.useEffect(() => {
    if (autoRegister && label) {
      try {
        const { registerTarget, unregisterTarget } = useSkipLinks();
        registerTarget(id, label);
        return () => unregisterTarget(id);
      } catch (e) {
        // SkipLinksProvider not available, continue without registration
      }
    }
  }, [id, label, autoRegister]);

  // Ensure element is focusable for skip navigation
  React.useEffect(() => {
    const element = elementRef.current;
    if (element && !element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '-1');
    }
  }, []);

  return React.createElement(
    Component,
    {
      ref: elementRef,
      id,
      className: clsx(
        // Ensure proper focus styling
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        className
      ),
      'aria-label': label ? `${label} section` : undefined,
      ...props
    },
    children
  );
};

/**
 * Utility function to create skip links for common page sections
 */
export const createPageSkipLinks = (options: {
  includeNavigation?: boolean;
  includeMain?: boolean;
  includeFooter?: boolean;
  includeSidebar?: boolean;
  includeSearch?: boolean;
  customLinks?: SkipLink[];
} = {}): SkipLink[] => {
  const {
    includeNavigation = true,
    includeMain = true,
    includeFooter = true,
    includeSidebar = false,
    includeSearch = false,
    customLinks = []
  } = options;

  const links: SkipLink[] = [];

  if (includeMain) {
    links.push({ href: '#main-content', text: 'Skip to main content', id: 'skip-main' });
  }

  if (includeNavigation) {
    links.push({ href: '#primary-navigation', text: 'Skip to navigation', id: 'skip-nav' });
  }

  if (includeSearch) {
    links.push({ href: '#search', text: 'Skip to search', id: 'skip-search' });
  }

  if (includeSidebar) {
    links.push({ href: '#sidebar', text: 'Skip to sidebar', id: 'skip-sidebar' });
  }

  if (includeFooter) {
    links.push({ href: '#page-footer', text: 'Skip to footer', id: 'skip-footer' });
  }

  return [...links, ...customLinks];
};

export default SkipLinks;