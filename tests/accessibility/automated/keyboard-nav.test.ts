// tests/accessibility/automated/keyboard-nav.test.ts
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

/**
 * Keyboard Navigation Testing for WCAG 2.1 AA Compliance
 * Provides comprehensive keyboard accessibility validation
 */

export interface KeyboardTestConfig {
  skipElements?: string[]; // CSS selectors to skip
  customKeys?: { [key: string]: string }; // Custom key mappings
  timeout?: number;
  expectedFocusOrder?: string[]; // Expected focus order by data-testid
}

export interface KeyboardNavigationResult {
  success: boolean;
  focusOrder: string[];
  violations: Array<{
    element: string;
    issue: string;
    severity: 'error' | 'warning';
  }>;
  trapTests: {
    canEscape: boolean;
    maintainsFocus: boolean;
  };
  skipLinkTests: {
    present: boolean;
    functional: boolean;
  };
}

/**
 * Keyboard Navigation Tester
 */
export class KeyboardNavigationTester {
  private container: HTMLElement;
  private config: KeyboardTestConfig;
  private user: ReturnType<typeof userEvent.setup>;

  constructor(container: HTMLElement, config: KeyboardTestConfig = {}) {
    this.container = container;
    this.config = {
      timeout: 1000,
      ...config
    };
    this.user = userEvent.setup();
  }

  /**
   * Test complete keyboard navigation flow
   */
  async testKeyboardNavigation(): Promise<KeyboardNavigationResult> {
    const focusOrder = await this.testTabNavigation();
    const violations = await this.checkAccessibilityViolations();
    const trapTests = await this.testFocusTraps();
    const skipLinkTests = await this.testSkipLinks();

    return {
      success: violations.filter(v => v.severity === 'error').length === 0,
      focusOrder,
      violations,
      trapTests,
      skipLinkTests
    };
  }

  /**
   * Test Tab navigation through all focusable elements
   */
  async testTabNavigation(): Promise<string[]> {
    const focusOrder: string[] = [];
    const focusableElements = this.getFocusableElements();

    // Start from beginning
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    for (let i = 0; i < focusableElements.length; i++) {
      const currentElement = document.activeElement as HTMLElement;
      
      if (currentElement) {
        const identifier = this.getElementIdentifier(currentElement);
        focusOrder.push(identifier);
        
        // Move to next element with Tab
        await this.user.keyboard('{Tab}');
        
        // Wait for focus to settle
        await this.waitForFocus();
      }
    }

    return focusOrder;
  }

  /**
   * Test Shift+Tab (reverse) navigation
   */
  async testReverseTabNavigation(): Promise<string[]> {
    const focusOrder: string[] = [];
    const focusableElements = this.getFocusableElements();

    // Start from the last element
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
    }

    for (let i = focusableElements.length - 1; i >= 0; i--) {
      const currentElement = document.activeElement as HTMLElement;
      
      if (currentElement) {
        const identifier = this.getElementIdentifier(currentElement);
        focusOrder.push(identifier);
        
        // Move to previous element with Shift+Tab
        await this.user.keyboard('{Shift>}{Tab}{/Shift}');
        
        // Wait for focus to settle
        await this.waitForFocus();
      }
    }

    return focusOrder.reverse();
  }

  /**
   * Test arrow key navigation for specific components
   */
  async testArrowKeyNavigation(
    containerSelector: string,
    orientation: 'horizontal' | 'vertical' | 'grid' = 'horizontal'
  ): Promise<{
    success: boolean;
    navigatedElements: string[];
    violations: string[];
  }> {
    const container = this.container.querySelector(containerSelector) as HTMLElement;
    if (!container) {
      return {
        success: false,
        navigatedElements: [],
        violations: [`Container ${containerSelector} not found`]
      };
    }

    const items = this.getFocusableElements(container);
    const navigatedElements: string[] = [];
    const violations: string[] = [];

    if (items.length === 0) {
      violations.push('No focusable items found in container');
      return { success: false, navigatedElements, violations };
    }

    // Focus first item
    items[0].focus();
    navigatedElements.push(this.getElementIdentifier(items[0]));

    // Test forward navigation
    const forwardKey = orientation === 'vertical' ? '{ArrowDown}' : '{ArrowRight}';
    for (let i = 1; i < items.length; i++) {
      await this.user.keyboard(forwardKey);
      await this.waitForFocus();
      
      const currentElement = document.activeElement as HTMLElement;
      if (currentElement === items[i]) {
        navigatedElements.push(this.getElementIdentifier(currentElement));
      } else {
        violations.push(`Arrow key navigation failed at item ${i}`);
      }
    }

    // Test backward navigation
    const backwardKey = orientation === 'vertical' ? '{ArrowUp}' : '{ArrowLeft}';
    for (let i = items.length - 2; i >= 0; i--) {
      await this.user.keyboard(backwardKey);
      await this.waitForFocus();
      
      const currentElement = document.activeElement as HTMLElement;
      if (currentElement !== items[i]) {
        violations.push(`Reverse arrow key navigation failed at item ${i}`);
      }
    }

    return {
      success: violations.length === 0,
      navigatedElements,
      violations
    };
  }

  /**
   * Test keyboard shortcuts
   */
  async testKeyboardShortcuts(shortcuts: Array<{
    keys: string;
    expectedAction: () => boolean;
    description: string;
  }>): Promise<Array<{
    description: string;
    success: boolean;
    error?: string;
  }>> {
    const results = [];

    for (const shortcut of shortcuts) {
      try {
        await this.user.keyboard(shortcut.keys);
        await this.waitForAction();
        
        const success = shortcut.expectedAction();
        results.push({
          description: shortcut.description,
          success
        });
      } catch (error) {
        results.push({
          description: shortcut.description,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Test focus traps (for modals, dropdowns, etc.)
   */
  async testFocusTraps(): Promise<{
    canEscape: boolean;
    maintainsFocus: boolean;
  }> {
    const focusTraps = this.container.querySelectorAll('[data-focus-trap]');
    let canEscape = true;
    let maintainsFocus = true;

    for (const trap of focusTraps) {
      const trapElement = trap as HTMLElement;
      const focusableInTrap = this.getFocusableElements(trapElement);
      
      if (focusableInTrap.length === 0) {
        maintainsFocus = false;
        continue;
      }

      // Focus first element in trap
      focusableInTrap[0].focus();
      
      // Try to tab out of the trap
      const lastElement = focusableInTrap[focusableInTrap.length - 1];
      lastElement.focus();
      await this.user.keyboard('{Tab}');
      
      // Check if focus stayed within trap
      const currentFocus = document.activeElement;
      if (!trapElement.contains(currentFocus)) {
        maintainsFocus = false;
      }

      // Test escape key
      await this.user.keyboard('{Escape}');
      const focusAfterEscape = document.activeElement;
      if (trapElement.contains(focusAfterEscape)) {
        canEscape = false;
      }
    }

    return { canEscape, maintainsFocus };
  }

  /**
   * Test skip links functionality
   */
  async testSkipLinks(): Promise<{
    present: boolean;
    functional: boolean;
  }> {
    const skipLinks = this.container.querySelectorAll('a[href^="#"]');
    let present = skipLinks.length > 0;
    let functional = true;

    for (const link of skipLinks) {
      const href = link.getAttribute('href');
      if (!href) continue;

      const target = this.container.querySelector(href);
      if (!target) {
        functional = false;
        continue;
      }

      // Test skip link functionality
      try {
        link.focus();
        await this.user.keyboard('{Enter}');
        await this.waitForFocus();
        
        // Check if target is focused or focusable
        if (document.activeElement !== target && !target.hasAttribute('tabindex')) {
          functional = false;
        }
      } catch (error) {
        functional = false;
      }
    }

    return { present, functional };
  }

  /**
   * Check for accessibility violations in keyboard navigation
   */
  private async checkAccessibilityViolations(): Promise<Array<{
    element: string;
    issue: string;
    severity: 'error' | 'warning';
  }>> {
    const violations = [];
    const focusableElements = this.getFocusableElements();

    for (const element of focusableElements) {
      // Check for missing focus indicators
      if (!this.hasFocusIndicator(element)) {
        violations.push({
          element: this.getElementIdentifier(element),
          issue: 'Missing focus indicator',
          severity: 'error' as const
        });
      }

      // Check for missing accessible names
      if (!this.hasAccessibleName(element)) {
        violations.push({
          element: this.getElementIdentifier(element),
          issue: 'Missing accessible name',
          severity: 'error' as const
        });
      }

      // Check for disabled elements in tab order
      if (element.hasAttribute('disabled') && element.tabIndex >= 0) {
        violations.push({
          element: this.getElementIdentifier(element),
          issue: 'Disabled element in tab order',
          severity: 'error' as const
        });
      }

      // Check for hidden elements in tab order
      if (this.isHidden(element) && element.tabIndex >= 0) {
        violations.push({
          element: this.getElementIdentifier(element),
          issue: 'Hidden element in tab order',
          severity: 'error' as const
        });
      }
    }

    return violations;
  }

  /**
   * Get all focusable elements in container
   */
  private getFocusableElements(container: HTMLElement = this.container): HTMLElement[] {
    const selectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"]):not([disabled])',
      'details > summary',
      'audio[controls]',
      'video[controls]'
    ];

    const elements = container.querySelectorAll(selectors.join(', ')) as NodeListOf<HTMLElement>;
    
    return Array.from(elements).filter(element => {
      // Skip elements that should be excluded
      if (this.config.skipElements?.some(selector => element.matches(selector))) {
        return false;
      }

      // Check if element is visible and not hidden
      return this.isVisible(element) && !this.isHidden(element);
    });
  }

  /**
   * Get unique identifier for element
   */
  private getElementIdentifier(element: HTMLElement): string {
    // Try data-testid first
    if (element.hasAttribute('data-testid')) {
      return `[data-testid="${element.getAttribute('data-testid')}"]`;
    }

    // Try id
    if (element.id) {
      return `#${element.id}`;
    }

    // Try aria-label
    if (element.hasAttribute('aria-label')) {
      return `[aria-label="${element.getAttribute('aria-label')}"]`;
    }

    // Try text content
    if (element.textContent?.trim()) {
      return `${element.tagName.toLowerCase()}:"${element.textContent.trim().substring(0, 20)}"`;
    }

    // Fallback to tag name and position
    const siblings = Array.from(element.parentElement?.children || []);
    const index = siblings.indexOf(element);
    return `${element.tagName.toLowerCase()}:nth-child(${index + 1})`;
  }

  /**
   * Check if element has visible focus indicator
   */
  private hasFocusIndicator(element: HTMLElement): boolean {
    element.focus();
    const styles = window.getComputedStyle(element);
    
    // Check for outline
    if (styles.outline !== 'none' && styles.outline !== '0px') {
      return true;
    }

    // Check for box-shadow (focus ring)
    if (styles.boxShadow !== 'none') {
      return true;
    }

    // Check for border changes
    const originalBorder = styles.border;
    element.blur();
    const blurredBorder = window.getComputedStyle(element).border;
    
    return originalBorder !== blurredBorder;
  }

  /**
   * Check if element has accessible name
   */
  private hasAccessibleName(element: HTMLElement): boolean {
    // Check aria-label
    if (element.hasAttribute('aria-label') && element.getAttribute('aria-label')?.trim()) {
      return true;
    }

    // Check aria-labelledby
    if (element.hasAttribute('aria-labelledby')) {
      const labelIds = element.getAttribute('aria-labelledby')?.split(' ') || [];
      return labelIds.some(id => {
        const label = document.getElementById(id);
        return label && label.textContent?.trim();
      });
    }

    // Check for associated label
    if (element.id) {
      const label = this.container.querySelector(`label[for="${element.id}"]`);
      if (label && label.textContent?.trim()) {
        return true;
      }
    }

    // Check if element is wrapped in label
    const parentLabel = element.closest('label');
    if (parentLabel && parentLabel.textContent?.trim()) {
      return true;
    }

    // Check text content for buttons and links
    if (['BUTTON', 'A'].includes(element.tagName) && element.textContent?.trim()) {
      return true;
    }

    // Check alt text for images
    if (element.tagName === 'IMG' && element.hasAttribute('alt')) {
      return true;
    }

    return false;
  }

  /**
   * Check if element is visible
   */
  private isVisible(element: HTMLElement): boolean {
    const styles = window.getComputedStyle(element);
    return (
      styles.display !== 'none' &&
      styles.visibility !== 'hidden' &&
      element.offsetWidth > 0 &&
      element.offsetHeight > 0
    );
  }

  /**
   * Check if element is hidden from screen readers
   */
  private isHidden(element: HTMLElement): boolean {
    return (
      element.hasAttribute('aria-hidden') ||
      element.hasAttribute('hidden') ||
      element.closest('[aria-hidden="true"]') !== null
    );
  }

  /**
   * Wait for focus to settle
   */
  private async waitForFocus(timeout: number = 100): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, timeout));
  }

  /**
   * Wait for action to complete
   */
  private async waitForAction(timeout: number = 200): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, timeout));
  }
}

/**
 * Jest testing utilities
 */
export const testKeyboardAccessibility = async (
  component: React.ReactElement,
  config?: KeyboardTestConfig
): Promise<KeyboardNavigationResult> => {
  const { container } = render(component);
  const tester = new KeyboardNavigationTester(container, config);
  return await tester.testKeyboardNavigation();
};

export const expectKeyboardAccessible = async (
  component: React.ReactElement,
  config?: KeyboardTestConfig
): Promise<void> => {
  const result = await testKeyboardAccessibility(component, config);
  
  expect(result.success).toBe(true);
  expect(result.violations.filter(v => v.severity === 'error')).toHaveLength(0);
  
  if (config?.expectedFocusOrder) {
    expect(result.focusOrder).toEqual(config.expectedFocusOrder);
  }
};

/**
 * Create keyboard navigation test suite
 */
export const createKeyboardTestSuite = (
  ComponentToTest: React.ComponentType<any>,
  testCases: Array<{
    name: string;
    props?: any;
    config?: KeyboardTestConfig;
    expectations?: {
      focusOrder?: string[];
      canNavigateWithTab?: boolean;
      canNavigateWithArrows?: boolean;
      hasSkipLinks?: boolean;
    };
  }>
) => {
  describe(`${ComponentToTest.name} Keyboard Navigation`, () => {
    testCases.forEach(({ name, props = {}, config, expectations = {} }) => {
      test(`${name} - should be keyboard accessible`, async () => {
        const component = React.createElement(ComponentToTest, props);
        const result = await testKeyboardAccessibility(component, config);
        
        // Basic accessibility check
        expect(result.success).toBe(true);
        
        // Check expected focus order
        if (expectations.focusOrder) {
          expect(result.focusOrder).toEqual(expectations.focusOrder);
        }

        // Check skip links
        if (expectations.hasSkipLinks) {
          expect(result.skipLinkTests.present).toBe(true);
          expect(result.skipLinkTests.functional).toBe(true);
        }

        // Check focus traps
        if (expectations.canNavigateWithTab !== false) {
          expect(result.trapTests.maintainsFocus).toBe(true);
        }
      }, 10000); // 10 second timeout for keyboard tests
    });
  });
};

export default {
  KeyboardNavigationTester,
  testKeyboardAccessibility,
  expectKeyboardAccessible,
  createKeyboardTestSuite
};