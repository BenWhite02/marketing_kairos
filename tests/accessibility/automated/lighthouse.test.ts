// tests/accessibility/automated/lighthouse.test.ts
import puppeteer from 'puppeteer';
import lighthouse from 'lighthouse';
import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Lighthouse Accessibility Audits for WCAG 2.1 AA Compliance
 * Provides comprehensive accessibility scoring and performance analysis
 */

export interface LighthouseAccessibilityConfig {
  url: string;
  outputPath?: string;
  thresholds?: {
    accessibility: number;
    bestPractices: number;
    seo: number;
    performance: number;
  };
  viewport?: {
    width: number;
    height: number;
  };
  device?: 'desktop' | 'mobile';
  throttling?: 'fast3G' | 'slow3G' | 'none';
}

export interface AccessibilityAuditResult {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  violations: Array<{
    id: string;
    title: string;
    description: string;
    severity: 'error' | 'warning' | 'info';
    nodes: number;
  }>;
  passes: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  opportunities: Array<{
    id: string;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  metrics: {
    totalAuditTime: number;
    pageLoadTime: number;
    interactive: number;
  };
}

/**
 * Lighthouse Accessibility Auditor
 */
export class LighthouseAccessibilityAuditor {
  private browser: puppeteer.Browser | null = null;
  private defaultConfig: LighthouseAccessibilityConfig = {
    url: 'http://localhost:3000',
    thresholds: {
      accessibility: 95,
      bestPractices: 90,
      seo: 85,
      performance: 80
    },
    viewport: {
      width: 1200,
      height: 800
    },
    device: 'desktop',
    throttling: 'none'
  };

  constructor(config?: Partial<LighthouseAccessibilityConfig>) {
    this.defaultConfig = { ...this.defaultConfig, ...config };
  }

  /**
   * Initialize browser instance
   */
  async initialize(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
  }

  /**
   * Cleanup browser instance
   */
  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Run accessibility audit on a single page
   */
  async auditPage(
    url: string,
    config?: Partial<LighthouseAccessibilityConfig>
  ): Promise<AccessibilityAuditResult> {
    if (!this.browser) {
      await this.initialize();
    }

    const auditConfig = { ...this.defaultConfig, ...config, url };
    
    // Lighthouse configuration focused on accessibility
    const lighthouseConfig = {
      extends: 'lighthouse:default',
      settings: {
        onlyCategories: ['accessibility', 'best-practices', 'seo'],
        formFactor: auditConfig.device,
        screenEmulation: {
          width: auditConfig.viewport!.width,
          height: auditConfig.viewport!.height,
          deviceScaleFactor: 1,
          mobile: auditConfig.device === 'mobile'
        },
        throttling: this.getThrottlingConfig(auditConfig.throttling),
        auditMode: false,
        gatherMode: false
      }
    };

    const startTime = Date.now();
    
    try {
      const { lhr } = await lighthouse(
        url,
        {
          port: new URL(this.browser!.wsEndpoint()).port,
          logLevel: 'error'
        },
        lighthouseConfig
      );

      const endTime = Date.now();
      
      return this.processLighthouseResults(lhr, endTime - startTime);
    } catch (error) {
      throw new Error(`Lighthouse audit failed: ${error.message}`);
    }
  }

  /**
   * Run accessibility audit on multiple pages
   */
  async auditMultiplePages(
    pages: Array<{ name: string; url: string }>,
    config?: Partial<LighthouseAccessibilityConfig>
  ): Promise<{
    overall: {
      averageScore: number;
      totalViolations: number;
      totalPasses: number;
      grade: 'A' | 'B' | 'C' | 'D' | 'F';
    };
    pages: Array<{
      name: string;
      url: string;
      result: AccessibilityAuditResult;
    }>;
  }> {
    const results = [];
    let totalScore = 0;
    let totalViolations = 0;
    let totalPasses = 0;

    for (const page of pages) {
      try {
        const result = await this.auditPage(page.url, config);
        results.push({
          name: page.name,
          url: page.url,
          result
        });
        
        totalScore += result.score;
        totalViolations += result.violations.length;
        totalPasses += result.passes.length;
      } catch (error) {
        console.error(`Failed to audit ${page.name}: ${error.message}`);
      }
    }

    const averageScore = totalScore / results.length;
    const grade = this.calculateGrade(averageScore);

    return {
      overall: {
        averageScore,
        totalViolations,
        totalPasses,
        grade
      },
      pages: results
    };
  }

  /**
   * Compare accessibility scores between two audits
   */
  async compareAudits(
    baselineUrl: string,
    currentUrl: string,
    config?: Partial<LighthouseAccessibilityConfig>
  ): Promise<{
    baseline: AccessibilityAuditResult;
    current: AccessibilityAuditResult;
    comparison: {
      scoreChange: number;
      violationChange: number;
      isRegression: boolean;
      improvements: string[];
      regressions: string[];
    };
  }> {
    const [baseline, current] = await Promise.all([
      this.auditPage(baselineUrl, config),
      this.auditPage(currentUrl, config)
    ]);

    const scoreChange = current.score - baseline.score;
    const violationChange = current.violations.length - baseline.violations.length;
    
    const baselineViolationIds = new Set(baseline.violations.map(v => v.id));
    const currentViolationIds = new Set(current.violations.map(v => v.id));
    
    const improvements = baseline.violations
      .filter(v => !currentViolationIds.has(v.id))
      .map(v => v.title);
    
    const regressions = current.violations
      .filter(v => !baselineViolationIds.has(v.id))
      .map(v => v.title);

    return {
      baseline,
      current,
      comparison: {
        scoreChange,
        violationChange,
        isRegression: scoreChange < -5 || violationChange > 0,
        improvements,
        regressions
      }
    };
  }

  /**
   * Generate comprehensive accessibility report
   */
  async generateReport(
    pages: Array<{ name: string; url: string }>,
    outputPath?: string
  ): Promise<string> {
    const auditResults = await this.auditMultiplePages(pages);
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: auditResults.overall,
      pages: auditResults.pages.map(page => ({
        name: page.name,
        url: page.url,
        score: page.result.score,
        grade: page.result.grade,
        violations: page.result.violations.length,
        opportunities: page.result.opportunities.length,
        loadTime: page.result.metrics.pageLoadTime
      })),
      recommendations: this.generateRecommendations(auditResults),
      details: auditResults.pages
    };

    const reportJson = JSON.stringify(report, null, 2);
    
    if (outputPath) {
      writeFileSync(outputPath, reportJson);
    }

    return reportJson;
  }

  /**
   * Process Lighthouse results into our format
   */
  private processLighthouseResults(
    lhr: any,
    auditTime: number
  ): AccessibilityAuditResult {
    const accessibilityCategory = lhr.categories.accessibility;
    const score = Math.round(accessibilityCategory.score * 100);
    
    const violations = [];
    const passes = [];
    const opportunities = [];

    // Process accessibility audits
    for (const auditId of Object.keys(accessibilityCategory.auditRefs)) {
      const auditRef = accessibilityCategory.auditRefs[auditId];
      const audit = lhr.audits[auditRef.id];
      
      if (!audit) continue;

      const auditData = {
        id: audit.id,
        title: audit.title,
        description: audit.description
      };

      if (audit.score === null || audit.score < 1) {
        violations.push({
          ...auditData,
          severity: audit.score === null ? 'warning' : 'error',
          nodes: audit.details?.items?.length || 0
        });
      } else {
        passes.push(auditData);
      }

      // Check for opportunities
      if (audit.details?.opportunity) {
        opportunities.push({
          ...auditData,
          impact: this.determineImpact(audit.numericValue || 0)
        });
      }
    }

    return {
      score,
      grade: this.calculateGrade(score),
      violations,
      passes,
      opportunities,
      metrics: {
        totalAuditTime: auditTime,
        pageLoadTime: lhr.audits['speed-index']?.numericValue || 0,
        interactive: lhr.audits['interactive']?.numericValue || 0
      }
    };
  }

  /**
   * Calculate letter grade from score
   */
  private calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 95) return 'A';
    if (score >= 85) return 'B';
    if (score >= 75) return 'C';
    if (score >= 65) return 'D';
    return 'F';
  }

  /**
   * Determine impact level from numeric value
   */
  private determineImpact(value: number): 'high' | 'medium' | 'low' {
    if (value > 1000) return 'high';
    if (value > 500) return 'medium';
    return 'low';
  }

  /**
   * Get throttling configuration
   */
  private getThrottlingConfig(throttling?: string) {
    switch (throttling) {
      case 'fast3G':
        return {
          rttMs: 150,
          throughputKbps: 1600,
          cpuSlowdownMultiplier: 4
        };
      case 'slow3G':
        return {
          rttMs: 300,
          throughputKbps: 400,
          cpuSlowdownMultiplier: 4
        };
      default:
        return {
          rttMs: 0,
          throughputKbps: 0,
          cpuSlowdownMultiplier: 1
        };
    }
  }

  /**
   * Generate recommendations based on audit results
   */
  private generateRecommendations(auditResults: any): string[] {
    const recommendations = [];
    const { overall } = auditResults;

    if (overall.averageScore < 95) {
      recommendations.push('Improve overall accessibility score to 95+ for WCAG AA compliance');
    }

    if (overall.totalViolations > 0) {
      recommendations.push(`Fix ${overall.totalViolations} accessibility violations`);
    }

    // Analyze common violation patterns
    const violationCounts = new Map();
    auditResults.pages.forEach(page => {
      page.result.violations.forEach(violation => {
        violationCounts.set(violation.id, (violationCounts.get(violation.id) || 0) + 1);
      });
    });

    // Recommend fixes for most common violations
    const commonViolations = Array.from(violationCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    commonViolations.forEach(([violationId, count]) => {
      recommendations.push(`Address "${violationId}" violations (found on ${count} pages)`);
    });

    return recommendations;
  }
}

/**
 * Jest test integration
 */
export const createLighthouseAccessibilityTests = (
  pages: Array<{ name: string; url: string }>,
  config?: Partial<LighthouseAccessibilityConfig>
) => {
  const auditor = new LighthouseAccessibilityAuditor(config);

  beforeAll(async () => {
    await auditor.initialize();
  });

  afterAll(async () => {
    await auditor.cleanup();
  });

  describe('Lighthouse Accessibility Tests', () => {
    pages.forEach(page => {
      test(`${page.name} should meet accessibility standards`, async () => {
        const result = await auditor.auditPage(page.url);
        
        expect(result.score).toBeGreaterThanOrEqual(
          config?.thresholds?.accessibility || 95
        );
        expect(result.violations.filter(v => v.severity === 'error')).toHaveLength(0);
      }, 30000); // 30 second timeout for Lighthouse
    });

    test('Overall accessibility compliance', async () => {
      const results = await auditor.auditMultiplePages(pages);
      
      expect(results.overall.averageScore).toBeGreaterThanOrEqual(
        config?.thresholds?.accessibility || 95
      );
      expect(results.overall.grade).toMatch(/^[AB]$/); // A or B grade
    }, 60000);
  });
};

/**
 * CI/CD integration utilities
 */
export const runCIAccessibilityAudit = async (
  pages: Array<{ name: string; url: string }>,
  outputDir: string = './lighthouse-reports'
): Promise<{
  success: boolean;
  report: any;
  artifacts: string[];
}> => {
  const auditor = new LighthouseAccessibilityAuditor();
  
  try {
    await auditor.initialize();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = join(outputDir, `accessibility-report-${timestamp}.json`);
    
    const reportJson = await auditor.generateReport(pages, reportPath);
    const report = JSON.parse(reportJson);
    
    // Generate additional artifacts
    const htmlReportPath = join(outputDir, `accessibility-report-${timestamp}.html`);
    const htmlReport = generateHTMLReport(report);
    writeFileSync(htmlReportPath, htmlReport);
    
    const success = report.summary.grade === 'A' && report.summary.totalViolations === 0;
    
    return {
      success,
      report,
      artifacts: [reportPath, htmlReportPath]
    };
  } finally {
    await auditor.cleanup();
  }
};

/**
 * Generate HTML report for better readability
 */
const generateHTMLReport = (report: any): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kairos Accessibility Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .grade-A { color: #22c55e; }
        .grade-B { color: #3b82f6; }
        .grade-C { color: #f59e0b; }
        .grade-D { color: #ef4444; }
        .grade-F { color: #dc2626; }
        .violation { background: #fee2e2; padding: 10px; margin: 5px 0; border-radius: 4px; }
        .pass { background: #dcfce7; padding: 10px; margin: 5px 0; border-radius: 4px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Kairos Accessibility Report</h1>
    <p><strong>Generated:</strong> ${report.timestamp}</p>
    
    <h2>Overall Summary</h2>
    <p><strong>Average Score:</strong> <span class="grade-${report.summary.grade}">${report.summary.averageScore}% (Grade ${report.summary.grade})</span></p>
    <p><strong>Total Violations:</strong> ${report.summary.totalViolations}</p>
    <p><strong>Total Passes:</strong> ${report.summary.totalPasses}</p>
    
    <h2>Page Results</h2>
    <table>
        <thead>
            <tr>
                <th>Page</th>
                <th>Score</th>
                <th>Grade</th>
                <th>Violations</th>
                <th>Load Time</th>
            </tr>
        </thead>
        <tbody>
            ${report.pages.map(page => `
                <tr>
                    <td>${page.name}</td>
                    <td>${page.score}%</td>
                    <td class="grade-${page.grade}">${page.grade}</td>
                    <td>${page.violations}</td>
                    <td>${page.loadTime}ms</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <h2>Recommendations</h2>
    <ul>
        ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
    </ul>
</body>
</html>`;
};

export default {
  LighthouseAccessibilityAuditor,
  createLighthouseAccessibilityTests,
  runCIAccessibilityAudit,
  generateHTMLReport
};