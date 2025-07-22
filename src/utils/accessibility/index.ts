// src/utils/accessibility/index.ts
/**
 * Accessibility Utilities Index
 * Central export point for all accessibility utilities in Kairos
 */

// Focus Management
export {
  FocusTrap,
  FocusRestoration,
  getFocusableElements,
  useFocusTrap,
  useFocusRestoration,
  initializeFocusVisible,
  announceToScreenReader,
  isFocusable,
  moveFocus,
} from './focusManagement';

// Screen Reader Utilities
export {
  AriaLiveRegionManager,
  ScreenReaderAnnouncer,
  useScreenReaderAnnouncement,
  generateAriaLabels,
  semanticElements,
  detectScreenReader,
  useScreenReaderDetection,
} from './screenReaderUtils';

// Keyboard Navigation
export {
  KeyboardShortcutManager,
  ArrowKeyNavigator,
  useKeyboardShortcuts,
  useArrowKeyNavigation,
  keyboardPatterns,
  createSkipLinks,
  globalShortcutManager,
} from './keyboardNavigation';

// Color Contrast
export {
  ColorUtils,
  ContrastCalculator,
  ColorAccessibilityValidator,
  ThemeAccessibilityUtils,
  LiveContrastChecker,
  useColorContrastValidation,
  useLiveContrastChecker,
  getCSSCustomPropertyContrast,
} from './colorContrast';

// Semantic Markup
export {
  HeadingHierarchyManager,
  LandmarkManager,
  AccessibleTableBuilder,
  AccessibleListBuilder,
  AccessibleFormBuilder,
  useHeadingHierarchy,
  useLandmarkValidation,
} from './semanticMarkup';

// Type definitions
export type {
  FocusableElement,
  AriaLiveRegion,
  ScreenReaderAnnouncement,
  KeyboardShortcut,
  ArrowKeyNavigation,
  ColorRGB,
  ColorHSL,
  ContrastResult,
  ColorValidation,
  HeadingStructure,
  LandmarkRegion,
  TableStructure,
} from './focusManagement';

export type { ColorRGB, ColorHSL, ContrastResult, ColorValidation } from './colorContrast';

export type {
  HeadingStructure,
  LandmarkRegion,
  TableStructure,
} from './semanticMarkup';

/**
 * Initialize all accessibility utilities
 */
export const initializeAccessibility = (): void => {
  // Initialize focus visible polyfill
  initializeFocusVisible();
  
  // Initialize screen reader announcer
  ScreenReaderAnnouncer.initialize();
  
  // Create skip links
  const skipLinks = createSkipLinks([
    { href: '#main-content', text: 'Skip to main content' },
    { href: '#navigation', text: 'Skip to navigation' },
    { href: '#footer', text: 'Skip to footer' }
  ]);
  
  document.body.insertBefore(skipLinks, document.body.firstChild);
  
  // Add global accessibility styles
  const styles = document.createElement('style');
  styles.textContent = `
    /* Screen reader only content */
    .sr-only {
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    }
    
    /* Focus visible styles */
    .focus-visible {
      outline: 2px solid #4F46E5 !important;
      outline-offset: 2px !important;
    }
    
    /* Skip links styles */
    .skip-links a:focus {
      background: #000 !important;
      color: #fff !important;
      padding: 8px 16px !important;
      text-decoration: none !important;
      border-radius: 4px !important;
      font-weight: 600 !important;
      z-index: 1000 !important;
    }
    
    /* High contrast mode support */
    @media (prefers-contrast: high) {
      * {
        border-color: ButtonText !important;
      }
      
      button, input, select, textarea {
        border: 1px solid ButtonText !important;
      }
    }
    
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
    
    /* Color scheme support */
    @media (prefers-color-scheme: dark) {
      :root {
        color-scheme: dark;
      }
    }
    
    /* Force colors support */
    @media (forced-colors: active) {
      * {
        forced-color-adjust: none;
      }
    }
  `;
  
  document.head.appendChild(styles);
  
  console.log('🔧 Kairos accessibility utilities initialized');
};

/**
 * Comprehensive accessibility audit
 */
export const performAccessibilityAudit = (container: HTMLElement = document.body): {
  headingHierarchy: ReturnType<HeadingHierarchyManager['validateHierarchy']>;
  landmarks: ReturnType<LandmarkManager['validateLandmarks']>;
  summary: {
    totalErrors: number;
    totalWarnings: number;
    isCompliant: boolean;
  };
} => {
  const headingManager = new HeadingHierarchyManager(container);
  const landmarkManager = new LandmarkManager(container);
  
  const headingResult = headingManager.validateHierarchy();
  const landmarkResult = landmarkManager.validateLandmarks();
  
  const totalErrors = headingResult.errors.length + landmarkResult.errors.length;
  const totalWarnings = headingResult.warnings.length + landmarkResult.warnings.length;
  
  return {
    headingHierarchy: headingResult,
    landmarks: landmarkResult,
    summary: {
      totalErrors,
      totalWarnings,
      isCompliant: totalErrors === 0
    }
  };
};

/**
 * Generate accessibility report
 */
export const generateAccessibilityReport = (container: HTMLElement = document.body): string => {
  const audit = performAccessibilityAudit(container);
  
  let report = '# Accessibility Audit Report\n\n';
  
  // Summary
  report += `## Summary\n`;
  report += `- **Compliance Status**: ${audit.summary.isCompliant ? '✅ WCAG 2.1 AA Compliant' : '❌ Issues Found'}\n`;
  report += `- **Total Errors**: ${audit.summary.totalErrors}\n`;
  report += `- **Total Warnings**: ${audit.summary.totalWarnings}\n\n`;
  
  // Heading Hierarchy
  report += `## Heading Hierarchy\n`;
  if (audit.headingHierarchy.errors.length > 0) {
    report += `### Errors\n`;
    audit.headingHierarchy.errors.forEach(error => {
      report += `- ${error}\n`;
    });
    report += '\n';
  }
  
  if (audit.headingHierarchy.warnings.length > 0) {
    report += `### Warnings\n`;
    audit.headingHierarchy.warnings.forEach(warning => {
      report += `- ${warning}\n`;
    });
    report += '\n';
  }
  
  // Landmarks
  report += `## Landmark Regions\n`;
  if (audit.landmarks.errors.length > 0) {
    report += `### Errors\n`;
    audit.landmarks.errors.forEach(error => {
      report += `- ${error}\n`;
    });
    report += '\n';
  }
  
  if (audit.landmarks.warnings.length > 0) {
    report += `### Warnings\n`;
    audit.landmarks.warnings.forEach(warning => {
      report += `- ${warning}\n`;
    });
    report += '\n';
  }
  
  // Recommendations
  if (!audit.summary.isCompliant) {
    report += `## Recommendations\n`;
    report += `1. Fix all errors listed above to achieve WCAG 2.1 AA compliance\n`;
    report += `2. Address warnings to improve user experience\n`;
    report += `3. Test with screen readers (NVDA, JAWS, VoiceOver)\n`;
    report += `4. Validate keyboard navigation functionality\n`;
    report += `5. Check color contrast ratios for all text\n\n`;
  }
  
  report += `---\n`;
  report += `Report generated on ${new Date().toISOString()}\n`;
  report += `By Kairos Accessibility Utils v1.0\n`;
  
  return report;
};

/**
 * Default export with all utilities
 */
const AccessibilityUtils = {
  // Initialization
  initializeAccessibility,
  performAccessibilityAudit,
  generateAccessibilityReport,
  
  // Focus Management
  FocusTrap,
  FocusRestoration,
  getFocusableElements,
  useFocusTrap,
  useFocusRestoration,
  initializeFocusVisible,
  announceToScreenReader,
  isFocusable,
  moveFocus,
  
  // Screen Reader
  AriaLiveRegionManager,
  ScreenReaderAnnouncer,
  useScreenReaderAnnouncement,
  generateAriaLabels,
  semanticElements,
  detectScreenReader,
  useScreenReaderDetection,
  
  // Keyboard Navigation
  KeyboardShortcutManager,
  ArrowKeyNavigator,
  useKeyboardShortcuts,
  useArrowKeyNavigation,
  keyboardPatterns,
  createSkipLinks,
  globalShortcutManager,
  
  // Color Contrast
  ColorUtils,
  ContrastCalculator,
  ColorAccessibilityValidator,
  ThemeAccessibilityUtils,
  LiveContrastChecker,
  useColorContrastValidation,
  useLiveContrastChecker,
  getCSSCustomPropertyContrast,
  
  // Semantic Markup
  HeadingHierarchyManager,
  LandmarkManager,
  AccessibleTableBuilder,
  AccessibleListBuilder,
  AccessibleFormBuilder,
  useHeadingHierarchy,
  useLandmarkValidation,
};

export default AccessibilityUtils;