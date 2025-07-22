// src/components/accessibility/index.ts
/**
 * Accessibility Components Index
 * Central export point for all accessibility components in Kairos
 */

// Skip Links
export {
  SkipLinks,
  SkipLinksProvider,
  SkipTarget,
  useSkipLinks,
  useSkipTarget,
  createPageSkipLinks,
} from './SkipLinks';

// Screen Reader Only Components
export {
  ScreenReaderOnly,
  ScreenReaderAnnouncement,
  ScreenReaderDescription,
  ScreenReaderNavHelper,
  ScreenReaderLoading,
  ScreenReaderFormValidation,
  ScreenReaderProgress,
  ScreenReaderTableNav,
  useScreenReaderAnnouncement,
} from './ScreenReaderOnly';

// Focus Ring Components
export {
  FocusRing,
  AnimatedFocusRing,
  ButtonFocusRing,
  InputFocusRing,
  CardFocusRing,
  FocusRingProvider,
  useFocusRing,
  useFocusVisible,
  focusRingUtils,
} from './FocusRing';

// Live Region Components
export {
  LiveRegion,
  StatusRegion,
  AlertRegion,
  ProgressRegion,
  LoadingRegion,
  LiveRegionProvider,
  useLiveRegionManager,
  useLiveRegions,
  announceToLiveRegion,
} from './LiveRegion';

// Accessibility Announcer
export {
  AccessibilityAnnouncer,
  AnnouncerProvider,
  useAnnouncer,
  useFormAnnouncements,
  useNavigationAnnouncements,
  useDataAnnouncements,
  useProgressAnnouncements,
  AutoAnnouncer,
} from './AccessibilityAnnouncer';

// Type definitions
export type {
  SkipLink,
  SkipLinksProps,
  SkipTargetProps,
} from './SkipLinks';

export type {
  ScreenReaderOnlyProps,
  ScreenReaderAnnouncementProps,
  ScreenReaderDescriptionProps,
  ScreenReaderNavHelperProps,
  ScreenReaderLoadingProps,
  ScreenReaderFormValidationProps,
  ScreenReaderProgressProps,
  ScreenReaderTableNavProps,
} from './ScreenReaderOnly';

export type {
  FocusRingProps,
  AnimatedFocusRingProps,
} from './FocusRing';

export type {
  LiveRegionProps,
  StatusRegionProps,
  AlertRegionProps,
  ProgressRegionProps,
  LoadingRegionProps,
  LiveRegionManager,
} from './LiveRegion';

export type {
  AnnouncementOptions,
  Announcement,
  AccessibilityAnnouncerProps,
  AccessibilityAnnouncerRef,
  AutoAnnouncerProps,
} from './AccessibilityAnnouncer';

/**
 * Complete Accessibility Provider
 * Combines all accessibility providers for easy setup
 */
export interface AccessibilityProviderProps {
  children: React.ReactNode;
  skipLinks?: {
    enabled?: boolean;
    defaultLinks?: SkipLink[];
  };
  focusRing?: {
    enabled?: boolean;
    defaultColor?: FocusRingProps['color'];
    defaultThickness?: FocusRingProps['thickness'];
  };
  liveRegions?: {
    enabled?: boolean;
  };
  announcer?: {
    enabled?: boolean;
    maxAnnouncements?: number;
    defaultClearDelay?: number;
  };
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({
  children,
  skipLinks = { enabled: true },
  focusRing = { enabled: true },
  liveRegions = { enabled: true },
  announcer = { enabled: true }
}) => {
  let content = children;

  // Wrap with announcer provider
  if (announcer.enabled) {
    content = (
      <AnnouncerProvider
        maxAnnouncements={announcer.maxAnnouncements}
        defaultClearDelay={announcer.defaultClearDelay}
      >
        {content}
      </AnnouncerProvider>
    );
  }

  // Wrap with live regions provider
  if (liveRegions.enabled) {
    content = (
      <LiveRegionProvider enabled={liveRegions.enabled}>
        {content}
      </LiveRegionProvider>
    );
  }

  // Wrap with focus ring provider
  if (focusRing.enabled) {
    content = (
      <FocusRingProvider
        defaultColor={focusRing.defaultColor}
        defaultThickness={focusRing.defaultThickness}
      >
        {content}
      </FocusRingProvider>
    );
  }

  // Wrap with skip links provider
  if (skipLinks.enabled) {
    content = (
      <SkipLinksProvider defaultLinks={skipLinks.defaultLinks}>
        {content}
      </SkipLinksProvider>
    );
  }

  return <>{content}</>;
};

/**
 * Hook to use all accessibility features
 */
export const useAccessibility = () => {
  // Skip Links
  let skipLinksApi;
  try {
    skipLinksApi = useSkipLinks();
  } catch (e) {
    skipLinksApi = null;
  }

  // Focus Ring
  let focusRingApi;
  try {
    focusRingApi = useFocusRing();
  } catch (e) {
    focusRingApi = null;
  }

  // Live Regions
  let liveRegionsApi;
  try {
    liveRegionsApi = useLiveRegions();
  } catch (e) {
    liveRegionsApi = null;
  }

  // Announcer
  let announcerApi;
  try {
    announcerApi = useAnnouncer();
  } catch (e) {
    announcerApi = null;
  }

  // Screen Reader Announcement
  const screenReaderApi = useScreenReaderAnnouncement();

  return {
    skipLinks: skipLinksApi,
    focusRing: focusRingApi,
    liveRegions: liveRegionsApi,
    announcer: announcerApi,
    screenReader: screenReaderApi,
    
    // Convenience methods
    announce: (message: string, priority: 'low' | 'medium' | 'high' = 'medium') => {
      if (announcerApi) {
        announcerApi.announce(message, { priority });
      } else {
        screenReaderApi.announce(message, priority === 'high' ? 'assertive' : 'polite');
      }
    },
    
    announceNavigation: (pageName: string) => {
      const message = `Navigated to ${pageName}`;
      if (announcerApi) {
        announcerApi.announce(message, { priority: 'medium', delay: 100 });
      } else {
        screenReaderApi.announce(message, 'polite');
      }
    },
    
    announceError: (error: string) => {
      if (announcerApi) {
        announcerApi.announce(error, { priority: 'high', interrupt: true });
      } else {
        screenReaderApi.announce(error, 'assertive');
      }
    },
    
    announceSuccess: (message: string) => {
      if (announcerApi) {
        announcerApi.announce(message, { priority: 'medium' });
      } else {
        screenReaderApi.announce(message, 'polite');
      }
    }
  };
};

/**
 * Accessibility testing utilities
 */
export const accessibilityTestUtils = {
  /**
   * Check if element is focusable
   */
  isFocusable: (element: HTMLElement): boolean => {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"]):not([disabled])'
    ];
    
    return focusableSelectors.some(selector => element.matches(selector)) &&
           element.offsetWidth > 0 &&
           element.offsetHeight > 0 &&
           !element.hasAttribute('aria-hidden');
  },

  /**
   * Get all focusable elements in container
   */
  getFocusableElements: (container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"]):not([disabled])'
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors))
      .filter(el => accessibilityTestUtils.isFocusable(el as HTMLElement)) as HTMLElement[];
  },

  /**
   * Check for accessibility violations
   */
  checkViolations: (container: HTMLElement = document.body): string[] => {
    const violations: string[] = [];

    // Check for missing alt text on images
    const images = container.querySelectorAll('img:not([alt])');
    if (images.length > 0) {
      violations.push(`${images.length} images without alt text`);
    }

    // Check for missing form labels
    const inputs = container.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    const unlabeledInputs = Array.from(inputs).filter(input => {
      const id = input.getAttribute('id');
      return !id || !container.querySelector(`label[for="${id}"]`);
    });
    if (unlabeledInputs.length > 0) {
      violations.push(`${unlabeledInputs.length} form inputs without labels`);
    }

    // Check for missing headings
    const h1s = container.querySelectorAll('h1');
    if (h1s.length === 0) {
      violations.push('No h1 heading found');
    } else if (h1s.length > 1) {
      violations.push(`${h1s.length} h1 headings found (should be 1)`);
    }

    // Check for missing landmarks
    const main = container.querySelector('main, [role="main"]');
    if (!main) {
      violations.push('No main landmark found');
    }

    return violations;
  },

  /**
   * Simulate keyboard navigation
   */
  simulateKeyboardNavigation: (container: HTMLElement, direction: 'forward' | 'backward' = 'forward'): HTMLElement[] => {
    const focusableElements = accessibilityTestUtils.getFocusableElements(container);
    const path: HTMLElement[] = [];

    if (direction === 'forward') {
      focusableElements.forEach(el => {
        el.focus();
        path.push(el);
      });
    } else {
      focusableElements.reverse().forEach(el => {
        el.focus();
        path.push(el);
      });
    }

    return path;
  }
};

/**
 * Default export with all accessibility components and utilities
 */
const AccessibilityComponents = {
  // Providers
  AccessibilityProvider,
  SkipLinksProvider,
  FocusRingProvider,
  LiveRegionProvider,
  AnnouncerProvider,

  // Components
  SkipLinks,
  SkipTarget,
  ScreenReaderOnly,
  ScreenReaderAnnouncement,
  ScreenReaderDescription,
  ScreenReaderNavHelper,
  ScreenReaderLoading,
  ScreenReaderFormValidation,
  ScreenReaderProgress,
  ScreenReaderTableNav,
  FocusRing,
  AnimatedFocusRing,
  ButtonFocusRing,
  InputFocusRing,
  CardFocusRing,
  LiveRegion,
  StatusRegion,
  AlertRegion,
  ProgressRegion,
  LoadingRegion,
  AccessibilityAnnouncer,
  AutoAnnouncer,

  // Hooks
  useAccessibility,
  useSkipLinks,
  useSkipTarget,
  useScreenReaderAnnouncement,
  useFocusRing,
  useFocusVisible,
  useLiveRegionManager,
  useLiveRegions,
  useAnnouncer,
  useFormAnnouncements,
  useNavigationAnnouncements,
  useDataAnnouncements,
  useProgressAnnouncements,

  // Utilities
  createPageSkipLinks,
  focusRingUtils,
  announceToLiveRegion,
  accessibilityTestUtils,
};

export default AccessibilityComponents;