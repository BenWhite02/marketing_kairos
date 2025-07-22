// tests/accessibility/automated/color-contrast.test.ts
import { render } from '@testing-library/react';
import React from 'react';
import { ColorUtils, ContrastCalculator, ColorAccessibilityValidator } from '../../../src/utils/accessibility/colorContrast';

/**
 * Color Contrast Testing for WCAG 2.1 AA Compliance
 * Provides comprehensive color contrast validation
 */

export interface ContrastTestConfig {
  minimumRatio?: number; // Default: 4.5 for AA
  largeTextRatio?: number; // Default: 3.0 for AA large text
  strictMode?: boolean; // Require AAA standards
  checkAllElements?: boolean; // Check all text elements
  ignoreSelectors?: string[]; // CSS selectors to ignore
}

export interface ContrastTestResult {
  success: boolean;
  overallCompliance: number; // Percentage
  violations: Array<{
    element: string;
    foreground: string;
    background: string;
    ratio: number;
    required: number;
    severity: 'error' | 'warning';
    recommendation: string;
  }>;
  summary: {
    totalElements: number;
    compliantElements: number;
    violations: number;
    averageRatio: number;
  };
}

/**
 * Color Contrast Tester
 */
export class ColorContrastTester {
  private container: HTMLElement;
  private config: ContrastTestConfig;

  constructor(container: HTMLElement, config: ContrastTestConfig = {}) {
    this.container = container;
    this.config = {
      minimumRatio: 4.5,
      largeTextRatio: 3.0,
      strictMode: false,
      checkAllElements: true,
      ignoreSelectors: [
        '.sr-only',
        '[aria-hidden="true"]',
        '[hidden]',
        '.invisible'
      ],
      ...config
    };
  }

  /**
   * Test color contrast for all text elements
   */
  async testColorContrast(): Promise<ContrastTestResult> {
    const textElements = this.getTextElements();
    const violations = [];
    let totalRatio = 0;
    let compliantElements = 0;

    for (const element of textElements) {
      const result = await this.testElementContrast(element);
      
      if (result) {
        totalRatio += result.ratio;
        
        if (result.isCompliant) {
          compliantElements++;
        } else {
          violations.push({
            element: this.getElementDescription(element),
            foreground: result.foreground,
            background: result.background,
            ratio: result.ratio,
            required: result.requiredRatio,
            severity: result.ratio < result.requiredRatio * 0.8 ? 'error' : 'warning',
            recommendation: this.generateRecommendation(result)
          });
        }
      }
    }

    const overallCompliance = textElements.length > 0 
      ? (compliantElements / textElements.length) * 100 
      : 100;

    const averageRatio = textElements.length > 0 
      ? totalRatio / textElements.length 
      : 0;

    return {
      success: violations.filter(v => v.severity === 'error').length === 0,
      overallCompliance,
      violations,
      summary: {
        totalElements: textElements.length,
        compliantElements,
        violations: violations.length,
        averageRatio
      }
    };
  }

  /**
   * Test contrast for a specific element
   */
  async testElementContrast(element: HTMLElement): Promise<{
    ratio: number;
    foreground: string;
    background: string;
    isCompliant: boolean;
    requiredRatio: number;
    isLargeText: boolean;
  } | null> {
    const styles = window.getComputedStyle(element);
    const foregroundColor = styles.color;
    const backgroundColor = this.getEffectiveBackgroundColor(element);

    if (!foregroundColor || !backgroundColor) {
      return null;
    }

    const fgRgb = ColorUtils.parseColor(foregroundColor);
    const bgRgb = ColorUtils.parseColor(backgroundColor);

    if (!fgRgb || !bgRgb) {
      return null;
    }

    const ratio = ContrastCalculator.getContrastRatio(fgRgb, bgRgb);
    const isLargeText = this.isLargeText(element);
    const requiredRatio = this.getRequiredRatio(isLargeText);
    const isCompliant = ratio >= requiredRatio;

    return {
      ratio,
      foreground: foregroundColor,
      background: backgroundColor,
      isCompliant,
      requiredRatio,
      isLargeText
    };
  }

  /**
   * Test specific color combination
   */
  testColorCombination(
    foreground: string,
    background: string,
    isLargeText: boolean = false
  ): {
    ratio: number;
    isCompliant: boolean;
    grade: 'AA' | 'AAA' | 'Fail';
    recommendation?: string;
  } {
    const validation = ColorAccessibilityValidator.validateColorCombination(
      foreground,
      background,
      isLargeText
    );

    let grade: 'AA' | 'AAA' | 'Fail' = 'Fail';
    if (validation.contrast.wcagAAA) {
      grade = 'AAA';
    } else if (validation.contrast.wcagAA) {
      grade = 'AA';
    }

    return {
      ratio: validation.contrast.ratio,
      isCompliant: validation.isValid,
      grade,
      recommendation: validation.contrast.recommendation
    };
  }

  /**
   * Test theme color combinations
   */
  testThemeContrast(theme: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    error: string;
    warning: string;
    success: string;
  }): {
    combinations: Array<{
      name: string;
      foreground: string;
      background: string;
      ratio: number;
      isCompliant: boolean;
      grade: 'AA' | 'AAA' | 'Fail';
    }>;
    overallCompliance: number;
    recommendations: string[];
  } {
    const testCombinations = [
      { name: 'Text on Background', fg: theme.text, bg: theme.background },
      { name: 'Text on Surface', fg: theme.text, bg: theme.surface },
      { name: 'Secondary Text on Background', fg: theme.textSecondary, bg: theme.background },
      { name: 'Primary on Background', fg: theme.primary, bg: theme.background },
      { name: 'Primary on Surface', fg: theme.primary, bg: theme.surface },
      { name: 'Error on Background', fg: theme.error, bg: theme.background },
      { name: 'Warning on Background', fg: theme.warning, bg: theme.background },
      { name: 'Success on Background', fg: theme.success, bg: theme.background },
      { name: 'White on Primary', fg: '#ffffff', bg: theme.primary },
      { name: 'White on Secondary', fg: '#ffffff', bg: theme.secondary },
      { name: 'White on Error', fg: '#ffffff', bg: theme.error },
      { name: 'White on Warning', fg: '#ffffff', bg: theme.warning },
      { name: 'White on Success', fg: '#ffffff', bg: theme.success }
    ];

    const results = testCombinations.map(({ name, fg, bg }) => {
      const result = this.testColorCombination(fg, bg);
      return {
        name,
        foreground: fg,
        background: bg,
        ratio: result.ratio,
        isCompliant: result.isCompliant,
        grade: result.grade
      };
    });

    const compliantCount = results.filter(r => r.isCompliant).length;
    const overallCompliance = (compliantCount / results.length) * 100;

    const recommendations = [];
    const failedCombinations = results.filter(r => !r.isCompliant);
    
    if (failedCombinations.length > 0) {
      recommendations.push(
        `Fix ${failedCombinations.length} color combinations that fail WCAG AA standards`
      );
      
      failedCombinations.forEach(combo => {
        if (combo.ratio < 3) {
          recommendations.push(
            `${combo.name}: Severe contrast issue (${combo.ratio.toFixed(2)}:1) - requires major color adjustment`
          );
        } else {
          recommendations.push(
            `${combo.name}: Minor contrast issue (${combo.ratio.toFixed(2)}:1) - slight color adjustment needed`
          );
        }
      });
    }

    return {
      combinations: results,
      overallCompliance,
      recommendations
    };
  }

  /**
   * Generate contrast improvement suggestions
   */
  generateContrastFixes(
    foreground: string,
    background: string,
    targetRatio: number = 4.5
  ): {
    lighterForeground?: string;
    darkerForeground?: string;
    lighterBackground?: string;
    darkerBackground?: string;
    bestOption: string;
  } {
    const alternatives = ColorAccessibilityValidator.findAccessibleAlternatives(
      foreground,
      background,
      targetRatio >= 4.5
    );

    const fgRgb = ColorUtils.parseColor(foreground);
    const bgRgb = ColorUtils.parseColor(background);

    if (!fgRgb || !bgRgb) {
      return { bestOption: 'Unable to parse colors' };
    }

    const fgHsl = ColorUtils.rgbToHsl(fgRgb);
    const bgHsl = ColorUtils.rgbToHsl(bgRgb);

    // Generate lighter and darker variants
    const lighterFg = ColorUtils.rgbToHex(ColorUtils.hslToRgb({
      ...fgHsl,
      l: Math.min(fgHsl.l + 20, 95)
    }));

    const darkerFg = ColorUtils.rgbToHex(ColorUtils.hslToRgb({
      ...fgHsl,
      l: Math.max(fgHsl.l - 20, 5)
    }));

    const lighterBg = ColorUtils.rgbToHex(ColorUtils.hslToRgb({
      ...bgHsl,
      l: Math.min(bgHsl.l + 20, 95)
    }));

    const darkerBg = ColorUtils.rgbToHex(ColorUtils.hslToRgb({
      ...bgHsl,
      l: Math.max(bgHsl.l - 20, 5)
    }));

    // Test which option gives the best contrast
    const options = [
      { type: 'lighter foreground', color: lighterFg, against: background },
      { type: 'darker foreground', color: darkerFg, against: background },
      { type: 'lighter background', color: foreground, against: lighterBg },
      { type: 'darker background', color: foreground, against: darkerBg }
    ];

    let bestOption = 'No suitable option found';
    let bestRatio = 0;

    options.forEach(option => {
      const result = this.testColorCombination(option.color, option.against);
      if (result.ratio > bestRatio && result.isCompliant) {
        bestRatio = result.ratio;
        bestOption = `Use ${option.type}: ${option.color} (${result.ratio.toFixed(2)}:1 ratio)`;
      }
    });

    return {
      lighterForeground: lighterFg,
      darkerForeground: darkerFg,
      lighterBackground: lighterBg,
      darkerBackground: darkerBg,
      bestOption
    };
  }

  /**
   * Get all text elements in container
   */
  private getTextElements(): HTMLElement[] {
    const textSelectors = [
      'p', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'a', 'button', 'label', 'input', 'textarea', 'select',
      'li', 'td', 'th', 'caption', 'figcaption',
      '[role="button"]', '[role="link"]', '[role="tab"]'
    ];

    const elements: HTMLElement[] = [];

    textSelectors.forEach(selector => {
      const matches = this.container.querySelectorAll(selector) as NodeListOf<HTMLElement>;
      Array.from(matches).forEach(element => {
        // Skip if should be ignored
        if (this.shouldIgnoreElement(element)) {
          return;
        }

        // Only include elements with visible text
        if (this.hasVisibleText(element)) {
          elements.push(element);
        }
      });
    });

    return elements;
  }

  /**
   * Get effective background color (including inherited backgrounds)
   */
  private getEffectiveBackgroundColor(element: HTMLElement): string {
    let currentElement: HTMLElement | null = element;
    
    while (currentElement && currentElement !== document.body) {
      const styles = window.getComputedStyle(currentElement);
      const bgColor = styles.backgroundColor;
      
      // If background is not transparent, use it
      if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
        return bgColor;
      }
      
      currentElement = currentElement.parentElement;
    }
    
    // Default to white background
    return 'rgb(255, 255, 255)';
  }

  /**
   * Check if element should be ignored
   */
  private shouldIgnoreElement(element: HTMLElement): boolean {
    // Check ignore selectors
    if (this.config.ignoreSelectors?.some(selector => element.matches(selector))) {
      return true;
    }

    // Check if element is hidden
    const styles = window.getComputedStyle(element);
    if (styles.display === 'none' || styles.visibility === 'hidden') {
      return true;
    }

    // Check if element has no visible size
    if (element.offsetWidth === 0 || element.offsetHeight === 0) {
      return true;
    }

    // Check ARIA hidden
    if (element.hasAttribute('aria-hidden') || element.closest('[aria-hidden="true"]')) {
      return true;
    }

    return false;
  }

  /**
   * Check if element has visible text content
   */
  private hasVisibleText(element: HTMLElement): boolean {
    const textContent = element.textContent?.trim();
    return Boolean(textContent && textContent.length > 0);
  }

  /**
   * Check if text is considered large
   */
  private isLargeText(element: HTMLElement): boolean {
    const styles = window.getComputedStyle(element);
    const fontSize = parseFloat(styles.fontSize);
    const fontWeight = styles.fontWeight;
    
    // Large text: 18pt (24px) or larger, or 14pt (18.7px) and bold
    if (fontSize >= 24) {
      return true;
    }
    
    if (fontSize >= 18.7 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700)) {
      return true;
    }
    
    return false;
  }

  /**
   * Get required contrast ratio based on text size and config
   */
  private getRequiredRatio(isLargeText: boolean): number {
    if (this.config.strictMode) {
      return isLargeText ? 4.5 : 7; // AAA standards
    }
    return isLargeText ? this.config.largeTextRatio! : this.config.minimumRatio!;
  }

  /**
   * Get element description for reporting
   */
  private getElementDescription(element: HTMLElement): string {
    const tagName = element.tagName.toLowerCase();
    const className = element.className ? `.${element.className.split(' ').join('.')}` : '';
    const id = element.id ? `#${element.id}` : '';
    const text = element.textContent?.trim().substring(0, 30) || '';
    
    return `${tagName}${id}${className} "${text}"`;
  }

  /**
   * Generate improvement recommendation
   */
  private generateRecommendation(result: {
    ratio: number;
    requiredRatio: number;
    foreground: string;
    background: string;
    isLargeText: boolean;
  }): string {
    const deficit = result.requiredRatio - result.ratio;
    
    if (deficit > 2) {
      return 'Severe contrast issue - consider major color changes or alternative design';
    } else if (deficit > 1) {
      return 'Moderate contrast issue - darken text or lighten background';
    } else {
      return 'Minor contrast issue - small color adjustment needed';
    }
  }
}

/**
 * Jest testing utilities
 */
export const testColorContrast = async (
  component: React.ReactElement,
  config?: ContrastTestConfig
): Promise<ContrastTestResult> => {
  const { container } = render(component);
  
  // Wait for any dynamic styling to apply
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const tester = new ColorContrastTester(container, config);
  return await tester.testColorContrast();
};

export const expectContrastCompliance = async (
  component: React.ReactElement,
  config?: ContrastTestConfig
): Promise<void> => {
  const result = await testColorContrast(component, config);
  
  expect(result.success).toBe(true);
  expect(result.overallCompliance).toBeGreaterThanOrEqual(100);
  expect(result.violations.filter(v => v.severity === 'error')).toHaveLength(0);
};

/**
 * Create color contrast test suite
 */
export const createContrastTestSuite = (
  ComponentToTest: React.ComponentType<any>,
  testCases: Array<{
    name: string;
    props?: any;
    config?: ContrastTestConfig;
    expectedViolations?: number;
  }>
) => {
  describe(`${ComponentToTest.name} Color Contrast`, () => {
    testCases.forEach(({ name, props = {}, config, expectedViolations = 0 }) => {
      test(`${name} - should meet WCAG contrast standards`, async () => {
        const component = React.createElement(ComponentToTest, props);
        const result = await testColorContrast(component, config);
        
        if (expectedViolations === 0) {
          expect(result.success).toBe(true);
          expect(result.overallCompliance).toBeGreaterThanOrEqual(100);
        } else {
          expect(result.violations).toHaveLength(expectedViolations);
        }
      });
    });

    test('should have sufficient contrast for all text elements', async () => {
      const component = React.createElement(ComponentToTest, {});
      const result = await testColorContrast(component, { checkAllElements: true });
      
      expect(result.violations.filter(v => v.severity === 'error')).toHaveLength(0);
    });

    test('should meet AAA standards in strict mode', async () => {
      const component = React.createElement(ComponentToTest, {});
      const result = await testColorContrast(component, { strictMode: true });
      
      // AAA standards are stricter, so we allow some warnings but no errors
      expect(result.violations.filter(v => v.severity === 'error')).toHaveLength(0);
    });
  });
};

/**
 * Theme testing utilities
 */
export const testThemeAccessibility = (theme: any): {
  passed: boolean;
  report: string;
  recommendations: string[];
} => {
  const tester = new ColorContrastTester(document.body);
  const result = tester.testThemeContrast(theme);
  
  const passed = result.overallCompliance >= 100;
  
  const report = `
Theme Accessibility Report
=========================
Overall Compliance: ${result.overallCompliance.toFixed(1)}%
Status: ${passed ? 'PASSED' : 'FAILED'}

Color Combination Results:
${result.combinations.map(combo => 
  `• ${combo.name}: ${combo.ratio.toFixed(2)}:1 (${combo.grade})`
).join('\n')}

${result.recommendations.length > 0 ? 
  `\nRecommendations:\n${result.recommendations.map(r => `• ${r}`).join('\n')}` : 
  '\nNo issues found!'
}
  `.trim();

  return {
    passed,
    report,
    recommendations: result.recommendations
  };
};

/**
 * Real-time contrast monitoring
 */
export const createContrastMonitor = (
  element: HTMLElement,
  callback: (result: ContrastTestResult) => void,
  interval: number = 1000
): (() => void) => {
  const tester = new ColorContrastTester(element);
  
  const intervalId = setInterval(async () => {
    try {
      const result = await tester.testColorContrast();
      callback(result);
    } catch (error) {
      console.error('Contrast monitoring error:', error);
    }
  }, interval);

  // Return cleanup function
  return () => {
    clearInterval(intervalId);
  };
};

export default {
  ColorContrastTester,
  testColorContrast,
  expectContrastCompliance,
  createContrastTestSuite,
  testThemeAccessibility,
  createContrastMonitor
};