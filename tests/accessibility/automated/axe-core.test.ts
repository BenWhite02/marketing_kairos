// tests/accessibility/automated/axe-core.test.ts
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

/**
 * Automated Accessibility Testing with axe-core
 * Provides comprehensive WCAG 2.1 AA compliance testing
 */

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Configure axe for WCAG 2.1 AA compliance
const axeConfig = {
  rules: {
    // WCAG 2.1 AA rules
    'color-contrast': { enabled: true },
    'keyboard-navigation': { enabled: true },
    'focus-management': { enabled: true },
    'aria-usage': { enabled: true },
    'semantic-markup': { enabled: true },
    
    // Disable rules that might conflict with our custom implementation
    'skip-link': { enabled: false }, // We have custom skip links
    'landmark-unique': { enabled: true },
    'region': { enabled: true },
    
    // Form accessibility
    'label': { enabled: true },
    'form-field-multiple-labels': { enabled: true },
    'duplicate-id-aria': { enabled: true },
    
    // Image accessibility
    'image-alt': { enabled: true },
    'image-redundant-alt': { enabled: true },
    
    // Interactive elements
    'button-name': { enabled: true },
    'link-name': { enabled: true },
    'interactive-supports-focus': { enabled: true },
    
    // ARIA
    'aria-allowed-attr': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-valid-attr': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    'aria-roles': { enabled: true }
  },
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
  level: 'AA'
};

/**
 * Test utility to check component accessibility
 */
export const testAccessibility = async (
  component: React.ReactElement,
  customConfig?: any
) => {
  const { container } = render(component);
  const results = await axe(container, { ...axeConfig, ...customConfig });
  return results;
};

/**
 * Test utility with automatic violation detection
 */
export const expectNoA11yViolations = async (
  component: React.ReactElement,
  customConfig?: any
) => {
  const results = await testAccessibility(component, customConfig);
  expect(results).toHaveNoViolations();
  return results;
};

/**
 * Comprehensive accessibility test suite generator
 */
export const createAccessibilityTestSuite = (
  ComponentToTest: React.ComponentType<any>,
  testCases: Array<{
    name: string;
    props?: any;
    customConfig?: any;
    expectedViolations?: number;
  }>
) => {
  describe(`${ComponentToTest.name} Accessibility`, () => {
    testCases.forEach(({ name, props = {}, customConfig, expectedViolations = 0 }) => {
      test(`${name} - should meet WCAG 2.1 AA standards`, async () => {
        const component = React.createElement(ComponentToTest, props);
        const results = await testAccessibility(component, customConfig);
        
        if (expectedViolations === 0) {
          expect(results).toHaveNoViolations();
        } else {
          expect(results.violations).toHaveLength(expectedViolations);
        }
      });
    });

    // Standard accessibility tests for all components
    test('should be keyboard navigable', async () => {
      const component = React.createElement(ComponentToTest, {});
      const { container } = render(component);
      
      const focusableElements = container.querySelectorAll(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      // Test that focusable elements exist and are properly configured
      focusableElements.forEach(element => {
        expect(element).not.toHaveAttribute('tabindex', '-1');
        expect(element).not.toHaveAttribute('aria-hidden', 'true');
      });
    });

    test('should have proper ARIA attributes', async () => {
      const component = React.createElement(ComponentToTest, {});
      const results = await testAccessibility(component, {
        rules: {
          'aria-allowed-attr': { enabled: true },
          'aria-required-attr': { enabled: true },
          'aria-valid-attr': { enabled: true },
          'aria-valid-attr-value': { enabled: true }
        }
      });
      
      expect(results).toHaveNoViolations();
    });

    test('should have sufficient color contrast', async () => {
      const component = React.createElement(ComponentToTest, {});
      const results = await testAccessibility(component, {
        rules: {
          'color-contrast': { enabled: true }
        }
      });
      
      expect(results).toHaveNoViolations();
    });
  });
};

/**
 * Page-level accessibility testing
 */
export const testPageAccessibility = async (
  PageComponent: React.ComponentType<any>,
  props: any = {}
) => {
  const { container } = render(React.createElement(PageComponent, props));
  
  // Test overall page structure
  const results = await axe(container, {
    ...axeConfig,
    rules: {
      ...axeConfig.rules,
      'page-has-heading-one': { enabled: true },
      'bypass': { enabled: true },
      'landmark-one-main': { enabled: true },
      'region': { enabled: true }
    }
  });

  return results;
};

/**
 * Form accessibility testing
 */
export const testFormAccessibility = async (
  FormComponent: React.ComponentType<any>,
  props: any = {}
) => {
  const { container } = render(React.createElement(FormComponent, props));
  
  const results = await axe(container, {
    ...axeConfig,
    rules: {
      ...axeConfig.rules,
      'label': { enabled: true },
      'form-field-multiple-labels': { enabled: true },
      'duplicate-id-aria': { enabled: true },
      'aria-required-attr': { enabled: true },
      'aria-invalid-attr': { enabled: true }
    }
  });

  return results;
};

/**
 * Navigation accessibility testing
 */
export const testNavigationAccessibility = async (
  NavComponent: React.ComponentType<any>,
  props: any = {}
) => {
  const { container } = render(React.createElement(NavComponent, props));
  
  const results = await axe(container, {
    ...axeConfig,
    rules: {
      ...axeConfig.rules,
      'link-name': { enabled: true },
      'button-name': { enabled: true },
      'bypass': { enabled: true },
      'focus-order-semantics': { enabled: true }
    }
  });

  return results;
};

/**
 * Interactive element accessibility testing
 */
export const testInteractiveElementAccessibility = async (
  component: React.ReactElement
) => {
  const { container } = render(component);
  
  const results = await axe(container, {
    rules: {
      'interactive-supports-focus': { enabled: true },
      'focus-order-semantics': { enabled: true },
      'keyboard-navigation': { enabled: true },
      'button-name': { enabled: true },
      'link-name': { enabled: true }
    }
  });

  return results;
};

/**
 * Accessibility regression testing
 */
export class AccessibilityRegressionTester {
  private baseline: Map<string, any> = new Map();

  async recordBaseline(
    componentName: string,
    component: React.ReactElement
  ): Promise<void> {
    const results = await testAccessibility(component);
    this.baseline.set(componentName, {
      violations: results.violations.length,
      passes: results.passes.length,
      incomplete: results.incomplete.length,
      timestamp: Date.now()
    });
  }

  async testRegression(
    componentName: string,
    component: React.ReactElement
  ): Promise<{
    hasRegression: boolean;
    changes: {
      violations: number;
      passes: number;
      incomplete: number;
    };
    results: any;
  }> {
    const baseline = this.baseline.get(componentName);
    if (!baseline) {
      throw new Error(`No baseline recorded for ${componentName}`);
    }

    const results = await testAccessibility(component);
    const current = {
      violations: results.violations.length,
      passes: results.passes.length,
      incomplete: results.incomplete.length
    };

    const changes = {
      violations: current.violations - baseline.violations,
      passes: current.passes - baseline.passes,
      incomplete: current.incomplete - baseline.incomplete
    };

    return {
      hasRegression: changes.violations > 0,
      changes,
      results
    };
  }

  getBaseline(componentName: string): any {
    return this.baseline.get(componentName);
  }

  clearBaseline(componentName?: string): void {
    if (componentName) {
      this.baseline.delete(componentName);
    } else {
      this.baseline.clear();
    }
  }
}

/**
 * Accessibility performance testing
 */
export const testAccessibilityPerformance = async (
  component: React.ReactElement
): Promise<{
  executionTime: number;
  results: any;
  performanceGrade: 'A' | 'B' | 'C' | 'D' | 'F';
}> => {
  const startTime = performance.now();
  const results = await testAccessibility(component);
  const endTime = performance.now();
  
  const executionTime = endTime - startTime;
  
  // Grade based on execution time and violation count
  let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'A';
  
  if (results.violations.length > 0) {
    grade = 'F';
  } else if (executionTime > 1000) {
    grade = 'D';
  } else if (executionTime > 500) {
    grade = 'C';
  } else if (executionTime > 200) {
    grade = 'B';
  }

  return {
    executionTime,
    results,
    performanceGrade: grade
  };
};

/**
 * Accessibility report generator
 */
export const generateAccessibilityReport = async (
  components: Array<{
    name: string;
    component: React.ReactElement;
  }>
): Promise<{
  overall: {
    totalViolations: number;
    totalPasses: number;
    compliance: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
  };
  components: Array<{
    name: string;
    violations: number;
    passes: number;
    compliance: number;
    executionTime: number;
  }>;
  recommendations: string[];
}> => {
  const componentResults = [];
  let totalViolations = 0;
  let totalPasses = 0;

  for (const { name, component } of components) {
    const { results, executionTime } = await testAccessibilityPerformance(component);
    
    const violations = results.violations.length;
    const passes = results.passes.length;
    const compliance = passes / (violations + passes) * 100;
    
    totalViolations += violations;
    totalPasses += passes;
    
    componentResults.push({
      name,
      violations,
      passes,
      compliance,
      executionTime
    });
  }

  const overallCompliance = totalPasses / (totalViolations + totalPasses) * 100;
  const overallGrade = overallCompliance >= 95 ? 'A' :
                      overallCompliance >= 85 ? 'B' :
                      overallCompliance >= 75 ? 'C' :
                      overallCompliance >= 65 ? 'D' : 'F';

  const recommendations = [];
  
  if (totalViolations > 0) {
    recommendations.push('Fix all accessibility violations before deployment');
  }
  
  if (overallCompliance < 100) {
    recommendations.push('Review and improve components with low compliance scores');
  }
  
  const slowComponents = componentResults.filter(c => c.executionTime > 500);
  if (slowComponents.length > 0) {
    recommendations.push(`Optimize performance for: ${slowComponents.map(c => c.name).join(', ')}`);
  }

  return {
    overall: {
      totalViolations,
      totalPasses,
      compliance: overallCompliance,
      grade: overallGrade
    },
    components: componentResults,
    recommendations
  };
};

// Export default test utilities
export default {
  testAccessibility,
  expectNoA11yViolations,
  createAccessibilityTestSuite,
  testPageAccessibility,
  testFormAccessibility,
  testNavigationAccessibility,
  testInteractiveElementAccessibility,
  AccessibilityRegressionTester,
  testAccessibilityPerformance,
  generateAccessibilityReport,
  axeConfig
};