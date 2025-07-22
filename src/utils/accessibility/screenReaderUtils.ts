// src/utils/accessibility/screenReaderUtils.ts
import { useEffect, useRef, useCallback } from 'react';

/**
 * Screen Reader Utilities for WCAG 2.1 AA Compliance
 * Provides ARIA utilities, screen reader announcements, and semantic markup helpers
 */

export interface AriaLiveRegion {
  id: string;
  politeness: 'polite' | 'assertive' | 'off';
  atomic: boolean;
  relevant: string;
}

export interface ScreenReaderAnnouncement {
  message: string;
  priority: 'polite' | 'assertive';
  atomic?: boolean;
  delay?: number;
}

/**
 * ARIA Live Region Manager
 */
export class AriaLiveRegionManager {
  private regions: Map<string, HTMLElement> = new Map();
  private static instance: AriaLiveRegionManager;

  static getInstance(): AriaLiveRegionManager {
    if (!AriaLiveRegionManager.instance) {
      AriaLiveRegionManager.instance = new AriaLiveRegionManager();
    }
    return AriaLiveRegionManager.instance;
  }

  /**
   * Create or get an ARIA live region
   */
  createRegion(config: AriaLiveRegion): HTMLElement {
    if (this.regions.has(config.id)) {
      return this.regions.get(config.id)!;
    }

    const region = document.createElement('div');
    region.id = config.id;
    region.setAttribute('aria-live', config.politeness);
    region.setAttribute('aria-atomic', config.atomic.toString());
    region.setAttribute('aria-relevant', config.relevant);
    region.className = 'sr-only';
    region.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;

    document.body.appendChild(region);
    this.regions.set(config.id, region);

    return region;
  }

  /**
   * Announce message to specific region
   */
  announce(regionId: string, message: string, delay: number = 0): void {
    const region = this.regions.get(regionId);
    if (!region) {
      console.warn(`ARIA live region '${regionId}' not found`);
      return;
    }

    if (delay > 0) {
      setTimeout(() => {
        region.textContent = message;
      }, delay);
    } else {
      region.textContent = message;
    }

    // Clear message after announcement to allow repeated announcements
    setTimeout(() => {
      if (region.textContent === message) {
        region.textContent = '';
      }
    }, 1000);
  }

  /**
   * Remove a live region
   */
  removeRegion(regionId: string): void {
    const region = this.regions.get(regionId);
    if (region) {
      document.body.removeChild(region);
      this.regions.delete(regionId);
    }
  }

  /**
   * Clear all regions
   */
  clearAll(): void {
    this.regions.forEach((region, id) => {
      this.removeRegion(id);
    });
  }
}

/**
 * Global announcer for quick screen reader announcements
 */
export class ScreenReaderAnnouncer {
  private static politeRegion: HTMLElement | null = null;
  private static assertiveRegion: HTMLElement | null = null;

  /**
   * Initialize default announcement regions
   */
  static initialize(): void {
    const manager = AriaLiveRegionManager.getInstance();

    // Create polite region for non-urgent announcements
    this.politeRegion = manager.createRegion({
      id: 'kairos-polite-announcer',
      politeness: 'polite',
      atomic: true,
      relevant: 'additions text'
    });

    // Create assertive region for urgent announcements
    this.assertiveRegion = manager.createRegion({
      id: 'kairos-assertive-announcer',
      politeness: 'assertive',
      atomic: true,
      relevant: 'additions text'
    });
  }

  /**
   * Announce message with specified priority
   */
  static announce(config: ScreenReaderAnnouncement): void {
    if (!this.politeRegion || !this.assertiveRegion) {
      this.initialize();
    }

    const region = config.priority === 'assertive' ? this.assertiveRegion! : this.politeRegion!;
    const delay = config.delay || 0;

    if (delay > 0) {
      setTimeout(() => {
        region.textContent = config.message;
      }, delay);
    } else {
      region.textContent = config.message;
    }

    // Clear message after announcement
    setTimeout(() => {
      if (region.textContent === config.message) {
        region.textContent = '';
      }
    }, 1000);
  }
}

/**
 * React hook for screen reader announcements
 */
export const useScreenReaderAnnouncement = () => {
  useEffect(() => {
    ScreenReaderAnnouncer.initialize();
  }, []);

  const announce = useCallback((
    message: string,
    priority: 'polite' | 'assertive' = 'polite',
    delay: number = 0
  ) => {
    ScreenReaderAnnouncer.announce({ message, priority, delay });
  }, []);

  return { announce };
};

/**
 * ARIA label utilities
 */
export const generateAriaLabels = {
  /**
   * Generate button label with state information
   */
  button: (
    baseLabel: string,
    options: {
      pressed?: boolean;
      expanded?: boolean;
      disabled?: boolean;
      hasPopup?: boolean;
      controls?: string;
    } = {}
  ): { [key: string]: string } => {
    const attributes: { [key: string]: string } = {
      'aria-label': baseLabel
    };

    if (options.pressed !== undefined) {
      attributes['aria-pressed'] = options.pressed.toString();
    }

    if (options.expanded !== undefined) {
      attributes['aria-expanded'] = options.expanded.toString();
    }

    if (options.disabled !== undefined) {
      attributes['aria-disabled'] = options.disabled.toString();
    }

    if (options.hasPopup) {
      attributes['aria-haspopup'] = 'true';
    }

    if (options.controls) {
      attributes['aria-controls'] = options.controls;
    }

    return attributes;
  },

  /**
   * Generate form field labels and descriptions
   */
  formField: (
    label: string,
    options: {
      required?: boolean;
      invalid?: boolean;
      describedBy?: string[];
      errorMessage?: string;
    } = {}
  ) => {
    const labelText = options.required ? `${label} (required)` : label;
    const describedByIds: string[] = options.describedBy || [];

    if (options.invalid && options.errorMessage) {
      describedByIds.push('error-message');
    }

    return {
      label: labelText,
      'aria-required': options.required ? 'true' : undefined,
      'aria-invalid': options.invalid ? 'true' : undefined,
      'aria-describedby': describedByIds.length > 0 ? describedByIds.join(' ') : undefined
    };
  },

  /**
   * Generate navigation landmark labels
   */
  navigation: (
    label: string,
    options: {
      current?: boolean | string;
      level?: number;
    } = {}
  ) => {
    const attributes: { [key: string]: string } = {
      'aria-label': label
    };

    if (options.current !== undefined) {
      if (typeof options.current === 'boolean') {
        attributes['aria-current'] = options.current ? 'page' : 'false';
      } else {
        attributes['aria-current'] = options.current;
      }
    }

    if (options.level !== undefined) {
      attributes['aria-level'] = options.level.toString();
    }

    return attributes;
  },

  /**
   * Generate table accessibility attributes
   */
  table: (
    caption: string,
    options: {
      sortColumn?: number;
      sortDirection?: 'ascending' | 'descending';
      rowCount?: number;
      columnCount?: number;
    } = {}
  ) => {
    const attributes: { [key: string]: string } = {};

    if (caption) {
      attributes['aria-label'] = caption;
    }

    if (options.sortColumn !== undefined && options.sortDirection) {
      attributes['aria-sort'] = options.sortDirection;
    }

    if (options.rowCount !== undefined) {
      attributes['aria-rowcount'] = options.rowCount.toString();
    }

    if (options.columnCount !== undefined) {
      attributes['aria-colcount'] = options.columnCount.toString();
    }

    return attributes;
  }
};

/**
 * Semantic HTML utilities
 */
export const semanticElements = {
  /**
   * Create semantic heading hierarchy
   */
  heading: (
    level: 1 | 2 | 3 | 4 | 5 | 6,
    text: string,
    options: {
      id?: string;
      className?: string;
      tabIndex?: number;
    } = {}
  ) => ({
    level,
    text,
    id: options.id,
    className: options.className,
    tabIndex: options.tabIndex,
    role: 'heading',
    'aria-level': level.toString()
  }),

  /**
   * Create landmark regions
   */
  landmark: (
    role: 'banner' | 'navigation' | 'main' | 'complementary' | 'contentinfo' | 'search' | 'form',
    label?: string
  ) => ({
    role,
    'aria-label': label
  }),

  /**
   * Create list semantics
   */
  list: (
    type: 'ordered' | 'unordered' | 'description',
    itemCount?: number
  ) => {
    const role = type === 'description' ? 'list' : undefined;
    return {
      role,
      'aria-label': itemCount ? `List with ${itemCount} items` : undefined
    };
  }
};

/**
 * Screen reader detection utility
 */
export const detectScreenReader = (): {
  isScreenReaderActive: boolean;
  screenReaderType: string | null;
} => {
  // Check for common screen reader indicators
  const userAgent = navigator.userAgent.toLowerCase();
  let screenReaderType: string | null = null;
  let isScreenReaderActive = false;

  // Check for NVDA
  if (userAgent.includes('nvda') || window.navigator.userAgent.includes('NVDA')) {
    screenReaderType = 'NVDA';
    isScreenReaderActive = true;
  }
  // Check for JAWS
  else if (userAgent.includes('jaws') || window.navigator.userAgent.includes('JAWS')) {
    screenReaderType = 'JAWS';
    isScreenReaderActive = true;
  }
  // Check for VoiceOver (macOS/iOS)
  else if (userAgent.includes('voiceover') || /mac|iphone|ipad/.test(userAgent)) {
    // VoiceOver detection is difficult, assume possible on Apple devices
    screenReaderType = 'VoiceOver';
    isScreenReaderActive = false; // Cannot reliably detect VoiceOver activation
  }
  // Check for other indicators
  else if (
    'speechSynthesis' in window ||
    'webkitSpeechSynthesis' in window ||
    navigator.maxTouchPoints > 0
  ) {
    isScreenReaderActive = false; // These features don't guarantee screen reader usage
  }

  // Additional check: reduced motion preference might indicate assistive technology
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    isScreenReaderActive = true; // Assume assistive technology usage
  }

  return {
    isScreenReaderActive,
    screenReaderType
  };
};

/**
 * React hook for screen reader detection
 */
export const useScreenReaderDetection = () => {
  const [detection, setDetection] = useState(detectScreenReader());

  useEffect(() => {
    // Update detection when media queries change
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => {
      setDetection(detectScreenReader());
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return detection;
};

// Initialize screen reader announcer on module load
if (typeof window !== 'undefined') {
  ScreenReaderAnnouncer.initialize();
}

export default {
  AriaLiveRegionManager,
  ScreenReaderAnnouncer,
  useScreenReaderAnnouncement,
  generateAriaLabels,
  semanticElements,
  detectScreenReader,
  useScreenReaderDetection,
};