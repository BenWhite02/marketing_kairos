// tests/accessibility/index.ts
/**
 * Accessibility Testing Framework Index
 * Central export point for all accessibility testing utilities
 */

// Automated Testing
export {
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
  axeConfig,
} from './automated/axe-core.test';

export {
  LighthouseAccessibilityAuditor,
  createLighthouseAccessibilityTests,
  runCIAccessibilityAudit,
  generateHTMLReport,
} from './automated/lighthouse.test';

export {
  KeyboardNavigationTester,
  testKeyboardAccessibility,
  expectKeyboardAccessible,
  createKeyboardTestSuite,
} from './automated/keyboard-nav.test';

export {
  ColorContrastTester,
  testColorContrast,
  expectContrastCompliance,
  createContrastTestSuite,
  testThemeAccessibility,
  createContrastMonitor,
} from './automated/color-contrast.test';

// Type definitions
export type {
  ContrastTestConfig,
  ContrastTestResult,
  KeyboardTestConfig,
  KeyboardNavigationResult,
  LighthouseAccessibilityConfig,
  AccessibilityAuditResult,
} from './automated/axe-core.test';

/**
 * Comprehensive accessibility test suite generator
 */
export const createCompleteAccessibilityTestSuite = (
  ComponentToTest: React.ComponentType<any>,
  config: {
    name: string;
    variants: Array<{
      name: string;
      props: any;
      skipTests?: ('axe' | 'keyboard' | 'contrast' | 'lighthouse')[];
    }>;
    lighthouse?: {
      url: string;
      pages?: Array<{ name: string; url: string }>;
    };
    keyboard?: {
      expectedFocusOrder?: string[];
      shortcuts?: Array<{
        keys: string;
        expectedAction: () => boolean;
        description: string;
      }>;
    };
    contrast?: {
      theme?: any;
      strictMode?: boolean;
    };
  }
) => {
  const { name, variants, lighthouse, keyboard, contrast } = config;

  describe(`${name} - Complete Accessibility Test Suite`, () => {
    // Axe-core automated tests
    describe('Automated Accessibility (axe-core)', () => {
      variants.forEach(variant => {
        if (!variant.skipTests?.includes('axe')) {
          test(`${variant.name} - should meet WCAG 2.1 AA standards`, async () => {
            const component = React.createElement(ComponentToTest, variant.props);
            await expectNoA11yViolations(component);
          });
        }
      });
    });

    // Keyboard navigation tests
    describe('Keyboard Navigation', () => {
      variants.forEach(variant => {
        if (!variant.skipTests?.includes('keyboard')) {
          test(`${variant.name} - should be keyboard accessible`, async () => {
            const component = React.createElement(ComponentToTest, variant.props);
            await expectKeyboardAccessible(component, {
              expectedFocusOrder: keyboard?.expectedFocusOrder
            });
          });

          if (keyboard?.shortcuts) {
            test(`${variant.name} - should handle keyboard shortcuts`, async () => {
              const component = React.createElement(ComponentToTest, variant.props);
              const { container } = render(component);
              const tester = new KeyboardNavigationTester(container);
              
              const results = await tester.testKeyboardShortcuts(keyboard.shortcuts);
              results.forEach(result => {
                expect(result.success).toBe(true);
              });
            });
          }
        }
      });
    });

    // Color contrast tests
    describe('Color Contrast', () => {
      variants.forEach(variant => {
        if (!variant.skipTests?.includes('contrast')) {
          test(`${variant.name} - should meet contrast standards`, async () => {
            const component = React.createElement(ComponentToTest, variant.props);
            await expectContrastCompliance(component, {
              strictMode: contrast?.strictMode
            });
          });
        }
      });

      if (contrast?.theme) {
        test('Theme should meet accessibility standards', () => {
          const result = testThemeAccessibility(contrast.theme);
          expect(result.passed).toBe(true);
        });
      }
    });

    // Lighthouse tests (if URL provided)
    if (lighthouse?.url) {
      describe('Lighthouse Accessibility Audit', () => {
        const auditor = new LighthouseAccessibilityAuditor();
        
        beforeAll(async () => {
          await auditor.initialize();
        });

        afterAll(async () => {
          await auditor.cleanup();
        });

        test('Should meet Lighthouse accessibility standards', async () => {
          const result = await auditor.auditPage(lighthouse.url);
          expect(result.score).toBeGreaterThanOrEqual(95);
          expect(result.violations.filter(v => v.severity === 'error')).toHaveLength(0);
        }, 30000);

        if (lighthouse.pages) {
          test('All pages should meet accessibility standards', async () => {
            const results = await auditor.auditMultiplePages(lighthouse.pages);
            expect(results.overall.averageScore).toBeGreaterThanOrEqual(95);
            expect(results.overall.grade).toMatch(/^[AB]$/);
          }, 60000);
        }
      });
    }
  });
};

/**
 * CI/CD integration utilities
 */
export const runFullAccessibilityAudit = async (
  components: Array<{
    name: string;
    component: React.ReactElement;
  }>,
  pages?: Array<{ name: string; url: string }>,
  outputDir: string = './accessibility-reports'
): Promise<{
  success: boolean;
  report: {
    components: any;
    pages?: any;
    lighthouse?: any;
  };
  artifacts: string[];
}> => {
  const artifacts: string[] = [];
  const report: any = {};

  // Test components with axe-core
  console.log('Running component accessibility tests...');
  const componentReport = await generateAccessibilityReport(components);
  report.components = componentReport;

  // Test pages with Lighthouse (if provided)
  if (pages && pages.length > 0) {
    console.log('Running Lighthouse accessibility audits...');
    try {
      const lighthouseResult = await runCIAccessibilityAudit(pages, outputDir);
      report.lighthouse = lighthouseResult.report;
      artifacts.push(...lighthouseResult.artifacts);
    } catch (error) {
      console.error('Lighthouse audit failed:', error);
      report.lighthouse = { error: error.message };
    }
  }

  // Generate combined report
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = `${outputDir}/complete-accessibility-report-${timestamp}.json`;
  
  try {
    const fs = await import('fs');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    artifacts.push(reportPath);
  } catch (error) {
    console.error('Failed to write report:', error);
  }

  // Determine overall success
  const componentSuccess = report.components.overall.grade === 'A' && 
                          report.components.overall.totalViolations === 0;
  const lighthouseSuccess = !report.lighthouse || 
                           (report.lighthouse.summary?.grade === 'A' && 
                            report.lighthouse.summary?.totalViolations === 0);

  return {
    success: componentSuccess && lighthouseSuccess,
    report,
    artifacts
  };
};

/**
 * Accessibility testing configuration for different environments
 */
export const getAccessibilityConfig = (environment: 'development' | 'staging' | 'production') => {
  const baseConfig = {
    axe: {
      rules: {
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'focus-management': { enabled: true },
        'aria-usage': { enabled: true },
        'semantic-markup': { enabled: true }
      },
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
    },
    keyboard: {
      timeout: 1000,
      skipElements: ['.sr-only', '[aria-hidden="true"]']
    },
    contrast: {
      minimumRatio: 4.5,
      largeTextRatio: 3.0,
      strictMode: false
    },
    lighthouse: {
      thresholds: {
        accessibility: 95,
        bestPractices: 90,
        seo: 85
      }
    }
  };

  switch (environment) {
    case 'production':
      return {
        ...baseConfig,
        contrast: {
          ...baseConfig.contrast,
          strictMode: true // Require AAA standards in production
        },
        lighthouse: {
          ...baseConfig.lighthouse,
          thresholds: {
            accessibility: 98,
            bestPractices: 95,
            seo: 90
          }
        }
      };
    
    case 'staging':
      return {
        ...baseConfig,
        lighthouse: {
          ...baseConfig.lighthouse,
          thresholds: {
            accessibility: 96,
            bestPractices: 92,
            seo: 87
          }
        }
      };
    
    default: // development
      return baseConfig;
  }
};

/**
 * Accessibility testing utilities for Jest setup
 */
export const setupAccessibilityTesting = () => {
  // Extend Jest matchers
  expect.extend({
    toBeAccessible: async (component: React.ReactElement) => {
      try {
        await expectNoA11yViolations(component);
        return {
          message: () => 'Component is accessible',
          pass: true
        };
      } catch (error) {
        return {
          message: () => `Component has accessibility violations: ${error.message}`,
          pass: false
        };
      }
    },

    toHaveGoodContrast: async (component: React.ReactElement) => {
      try {
        await expectContrastCompliance(component);
        return {
          message: () => 'Component has good color contrast',
          pass: true
        };
      } catch (error) {
        return {
          message: () => `Component has contrast issues: ${error.message}`,
          pass: false
        };
      }
    },

    toBeKeyboardAccessible: async (component: React.ReactElement) => {
      try {
        await expectKeyboardAccessible(component);
        return {
          message: () => 'Component is keyboard accessible',
          pass: true
        };
      } catch (error) {
        return {
          message: () => `Component has keyboard accessibility issues: ${error.message}`,
          pass: false
        };
      }
    }
  });

  // Global test setup
  beforeEach(() => {
    // Reset focus before each test
    if (document.activeElement) {
      (document.activeElement as HTMLElement).blur();
    }

    // Clear any existing announcements
    const announcements = document.querySelectorAll('[aria-live]');
    announcements.forEach(el => {
      el.textContent = '';
    });
  });

  afterEach(() => {
    // Clean up any test artifacts
    document.querySelectorAll('[data-test-artifact]').forEach(el => {
      el.remove();
    });
  });
};

/**
 * Performance benchmarking for accessibility tests
 */
export const benchmarkAccessibilityTests = async (
  components: Array<{
    name: string;
    component: React.ReactElement;
  }>
): Promise<{
  results: Array<{
    name: string;
    axeTime: number;
    keyboardTime: number;
    contrastTime: number;
    totalTime: number;
  }>;
  summary: {
    totalTime: number;
    averageTime: number;
    slowestTest: string;
    fastestTest: string;
  };
}> => {
  const results = [];
  let totalTime = 0;

  for (const { name, component } of components) {
    const startTime = performance.now();
    
    // Benchmark axe-core
    const axeStart = performance.now();
    await testAccessibility(component);
    const axeTime = performance.now() - axeStart;

    // Benchmark keyboard testing
    const keyboardStart = performance.now();
    await testKeyboardAccessibility(component);
    const keyboardTime = performance.now() - keyboardStart;

    // Benchmark contrast testing
    const contrastStart = performance.now();
    await testColorContrast(component);
    const contrastTime = performance.now() - contrastStart;

    const componentTime = performance.now() - startTime;
    totalTime += componentTime;

    results.push({
      name,
      axeTime,
      keyboardTime,
      contrastTime,
      totalTime: componentTime
    });
  }

  const averageTime = totalTime / components.length;
  const slowestTest = results.reduce((prev, current) => 
    (prev.totalTime > current.totalTime) ? prev : current
  );
  const fastestTest = results.reduce((prev, current) => 
    (prev.totalTime < current.totalTime) ? prev : current
  );

  return {
    results,
    summary: {
      totalTime,
      averageTime,
      slowestTest: slowestTest.name,
      fastestTest: fastestTest.name
    }
  };
};

export default {
  // Main testing functions
  createCompleteAccessibilityTestSuite,
  runFullAccessibilityAudit,
  setupAccessibilityTesting,
  benchmarkAccessibilityTests,
  
  // Configuration
  getAccessibilityConfig,
  
  // Individual test utilities
  testAccessibility,
  testKeyboardAccessibility,
  testColorContrast,
  expectNoA11yViolations,
  expectKeyboardAccessible,
  expectContrastCompliance,
  
  // Specialized testers
  AccessibilityRegressionTester,
  LighthouseAccessibilityAuditor,
  KeyboardNavigationTester,
  ColorContrastTester,
  
  // Utilities
  createAccessibilityTestSuite,
  createKeyboardTestSuite,
  createContrastTestSuite,
  testThemeAccessibility,
  generateAccessibilityReport
};