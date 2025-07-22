// src/utils/accessibility/keyboardNavigation.ts
import { useEffect, useCallback, useRef } from 'react';
import { getFocusableElements, moveFocus } from './focusManagement';

/**
 * Keyboard Navigation Utilities for WCAG 2.1 AA Compliance
 * Provides comprehensive keyboard navigation patterns and utilities
 */

export interface KeyboardShortcut {
  key: string;
  modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[];
  description: string;
  action: () => void;
  preventDefault?: boolean;
  global?: boolean;
}

export interface ArrowKeyNavigation {
  orientation: 'horizontal' | 'vertical' | 'grid';
  wrap?: boolean;
  itemSelector?: string;
  onNavigate?: (index: number, element: HTMLElement) => void;
}

/**
 * Keyboard Shortcut Manager
 */
export class KeyboardShortcutManager {
  private shortcuts = new Map<string, KeyboardShortcut>();
  private isActive = true;

  /**
   * Register a keyboard shortcut
   */
  register(shortcut: KeyboardShortcut): () => void {
    const key = this.generateShortcutKey(shortcut);
    this.shortcuts.set(key, shortcut);

    // Return unregister function
    return () => this.unregister(shortcut);
  }

  /**
   * Unregister a keyboard shortcut
   */
  unregister(shortcut: KeyboardShortcut): void {
    const key = this.generateShortcutKey(shortcut);
    this.shortcuts.delete(key);
  }

  /**
   * Handle keyboard events
   */
  handleKeyDown = (event: KeyboardEvent): void => {
    if (!this.isActive) return;

    const key = this.generateEventKey(event);
    const shortcut = this.shortcuts.get(key);

    if (shortcut) {
      if (shortcut.preventDefault !== false) {
        event.preventDefault();
      }
      shortcut.action();
    }
  };

  /**
   * Activate/deactivate shortcut manager
   */
  setActive(active: boolean): void {
    this.isActive = active;
  }

  /**
   * Get all registered shortcuts
   */
  getShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Generate unique key for shortcut
   */
  private generateShortcutKey(shortcut: KeyboardShortcut): string {
    const modifiers = (shortcut.modifiers || []).sort().join('+');
    return modifiers ? `${modifiers}+${shortcut.key.toLowerCase()}` : shortcut.key.toLowerCase();
  }

  /**
   * Generate key from keyboard event
   */
  private generateEventKey(event: KeyboardEvent): string {
    const modifiers: string[] = [];
    if (event.ctrlKey) modifiers.push('ctrl');
    if (event.altKey) modifiers.push('alt');
    if (event.shiftKey) modifiers.push('shift');
    if (event.metaKey) modifiers.push('meta');

    const key = event.key.toLowerCase();
    return modifiers.length > 0 ? `${modifiers.join('+')}+${key}` : key;
  }
}

/**
 * Global keyboard shortcut manager instance
 */
const globalShortcutManager = new KeyboardShortcutManager();

// Set up global event listener
if (typeof window !== 'undefined') {
  document.addEventListener('keydown', globalShortcutManager.handleKeyDown);
}

/**
 * React hook for keyboard shortcuts
 */
export const useKeyboardShortcuts = (
  shortcuts: KeyboardShortcut[],
  deps: React.DependencyList = []
) => {
  const shortcutManagerRef = useRef<KeyboardShortcutManager>(
    new KeyboardShortcutManager()
  );

  useEffect(() => {
    const manager = shortcutManagerRef.current;
    const unregisterFunctions: (() => void)[] = [];

    // Register shortcuts
    shortcuts.forEach(shortcut => {
      if (shortcut.global) {
        // Use global manager for global shortcuts
        unregisterFunctions.push(globalShortcutManager.register(shortcut));
      } else {
        // Use local manager for component-specific shortcuts
        unregisterFunctions.push(manager.register(shortcut));
      }
    });

    // Set up local event listener for non-global shortcuts
    const handleKeyDown = (event: KeyboardEvent) => {
      manager.handleKeyDown(event);
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      // Unregister all shortcuts
      unregisterFunctions.forEach(unregister => unregister());
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, deps);

  return shortcutManagerRef.current;
};

/**
 * Arrow key navigation for lists and grids
 */
export class ArrowKeyNavigator {
  private container: HTMLElement;
  private config: ArrowKeyNavigation;
  private currentIndex = 0;
  private items: HTMLElement[] = [];

  constructor(container: HTMLElement, config: ArrowKeyNavigation) {
    this.container = container;
    this.config = config;
    this.updateItems();
    this.bindEvents();
  }

  private updateItems(): void {
    if (this.config.itemSelector) {
      this.items = Array.from(
        this.container.querySelectorAll(this.config.itemSelector)
      ) as HTMLElement[];
    } else {
      this.items = getFocusableElements(this.container);
    }
  }

  private bindEvents(): void {
    this.container.addEventListener('keydown', this.handleKeyDown);
    this.container.addEventListener('focus', this.handleFocus, true);
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      return;
    }

    event.preventDefault();
    this.updateItems();

    if (this.items.length === 0) return;

    let newIndex = this.currentIndex;

    switch (event.key) {
      case 'ArrowUp':
        if (this.config.orientation === 'vertical' || this.config.orientation === 'grid') {
          newIndex = this.getPreviousIndex();
        }
        break;

      case 'ArrowDown':
        if (this.config.orientation === 'vertical' || this.config.orientation === 'grid') {
          newIndex = this.getNextIndex();
        }
        break;

      case 'ArrowLeft':
        if (this.config.orientation === 'horizontal' || this.config.orientation === 'grid') {
          newIndex = this.getPreviousIndex();
        }
        break;

      case 'ArrowRight':
        if (this.config.orientation === 'horizontal' || this.config.orientation === 'grid') {
          newIndex = this.getNextIndex();
        }
        break;

      case 'Home':
        newIndex = 0;
        break;

      case 'End':
        newIndex = this.items.length - 1;
        break;
    }

    this.navigateToIndex(newIndex);
  };

  private handleFocus = (event: FocusEvent): void => {
    const target = event.target as HTMLElement;
    const index = this.items.indexOf(target);
    if (index !== -1) {
      this.currentIndex = index;
    }
  };

  private getPreviousIndex(): number {
    let newIndex = this.currentIndex - 1;
    if (newIndex < 0) {
      newIndex = this.config.wrap ? this.items.length - 1 : 0;
    }
    return newIndex;
  }

  private getNextIndex(): number {
    let newIndex = this.currentIndex + 1;
    if (newIndex >= this.items.length) {
      newIndex = this.config.wrap ? 0 : this.items.length - 1;
    }
    return newIndex;
  }

  private navigateToIndex(index: number): void {
    if (index >= 0 && index < this.items.length) {
      this.currentIndex = index;
      const element = this.items[index];
      element.focus();

      if (this.config.onNavigate) {
        this.config.onNavigate(index, element);
      }
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ArrowKeyNavigation>): void {
    this.config = { ...this.config, ...config };
    this.updateItems();
  }

  /**
   * Destroy navigator
   */
  destroy(): void {
    this.container.removeEventListener('keydown', this.handleKeyDown);
    this.container.removeEventListener('focus', this.handleFocus, true);
  }
}

/**
 * React hook for arrow key navigation
 */
export const useArrowKeyNavigation = (
  containerRef: React.RefObject<HTMLElement>,
  config: ArrowKeyNavigation,
  deps: React.DependencyList = []
) => {
  const navigatorRef = useRef<ArrowKeyNavigator | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    navigatorRef.current = new ArrowKeyNavigator(containerRef.current, config);

    return () => {
      navigatorRef.current?.destroy();
    };
  }, [containerRef, ...deps]);

  const updateConfig = useCallback((newConfig: Partial<ArrowKeyNavigation>) => {
    navigatorRef.current?.updateConfig(newConfig);
  }, []);

  return { updateConfig };
};

/**
 * Common keyboard patterns
 */
export const keyboardPatterns = {
  /**
   * Tab panel navigation (ARIA tabs pattern)
   */
  tabPanel: (tabsContainer: HTMLElement) => {
    const tabs = Array.from(
      tabsContainer.querySelectorAll('[role="tab"]')
    ) as HTMLElement[];

    const handleKeyDown = (event: KeyboardEvent) => {
      const currentTab = event.target as HTMLElement;
      const currentIndex = tabs.indexOf(currentTab);

      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
          tabs[prevIndex].focus();
          tabs[prevIndex].click();
          break;

        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
          tabs[nextIndex].focus();
          tabs[nextIndex].click();
          break;

        case 'Home':
          event.preventDefault();
          tabs[0].focus();
          tabs[0].click();
          break;

        case 'End':
          event.preventDefault();
          tabs[tabs.length - 1].focus();
          tabs[tabs.length - 1].click();
          break;
      }
    };

    tabsContainer.addEventListener('keydown', handleKeyDown);

    return () => {
      tabsContainer.removeEventListener('keydown', handleKeyDown);
    };
  },

  /**
   * Menu navigation (ARIA menu pattern)
   */
  menu: (menuContainer: HTMLElement) => {
    const menuItems = Array.from(
      menuContainer.querySelectorAll('[role="menuitem"]')
    ) as HTMLElement[];

    let currentIndex = -1;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          currentIndex = Math.min(currentIndex + 1, menuItems.length - 1);
          menuItems[currentIndex].focus();
          break;

        case 'ArrowUp':
          event.preventDefault();
          currentIndex = Math.max(currentIndex - 1, 0);
          menuItems[currentIndex].focus();
          break;

        case 'Home':
          event.preventDefault();
          currentIndex = 0;
          menuItems[currentIndex].focus();
          break;

        case 'End':
          event.preventDefault();
          currentIndex = menuItems.length - 1;
          menuItems[currentIndex].focus();
          break;

        case 'Escape':
          event.preventDefault();
          // Close menu and return focus to trigger
          const trigger = document.querySelector('[aria-expanded="true"]') as HTMLElement;
          if (trigger) {
            trigger.focus();
            trigger.setAttribute('aria-expanded', 'false');
          }
          break;

        case 'Enter':
        case ' ':
          event.preventDefault();
          if (currentIndex >= 0) {
            menuItems[currentIndex].click();
          }
          break;
      }
    };

    const handleFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      const index = menuItems.indexOf(target);
      if (index !== -1) {
        currentIndex = index;
      }
    };

    menuContainer.addEventListener('keydown', handleKeyDown);
    menuContainer.addEventListener('focus', handleFocus, true);

    return () => {
      menuContainer.removeEventListener('keydown', handleKeyDown);
      menuContainer.removeEventListener('focus', handleFocus, true);
    };
  },

  /**
   * Data table navigation
   */
  dataTable: (tableContainer: HTMLElement) => {
    const getCellPosition = (cell: HTMLElement) => {
      const row = cell.closest('tr');
      const table = cell.closest('table');
      if (!row || !table) return null;

      const rowIndex = Array.from(table.querySelectorAll('tr')).indexOf(row);
      const cellIndex = Array.from(row.querySelectorAll('td, th')).indexOf(cell);

      return { rowIndex, cellIndex };
    };

    const navigateToCell = (rowIndex: number, cellIndex: number) => {
      const table = tableContainer.querySelector('table');
      if (!table) return;

      const rows = table.querySelectorAll('tr');
      if (rowIndex >= 0 && rowIndex < rows.length) {
        const cells = rows[rowIndex].querySelectorAll('td, th');
        if (cellIndex >= 0 && cellIndex < cells.length) {
          (cells[cellIndex] as HTMLElement).focus();
        }
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (!target.matches('td, th')) return;

      const position = getCellPosition(target);
      if (!position) return;

      const { rowIndex, cellIndex } = position;
      const table = tableContainer.querySelector('table');
      if (!table) return;

      const rows = table.querySelectorAll('tr');
      const currentRow = rows[rowIndex];
      const cells = currentRow.querySelectorAll('td, th');

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          if (cellIndex > 0) {
            navigateToCell(rowIndex, cellIndex - 1);
          }
          break;

        case 'ArrowRight':
          event.preventDefault();
          if (cellIndex < cells.length - 1) {
            navigateToCell(rowIndex, cellIndex + 1);
          }
          break;

        case 'ArrowUp':
          event.preventDefault();
          if (rowIndex > 0) {
            navigateToCell(rowIndex - 1, cellIndex);
          }
          break;

        case 'ArrowDown':
          event.preventDefault();
          if (rowIndex < rows.length - 1) {
            navigateToCell(rowIndex + 1, cellIndex);
          }
          break;

        case 'Home':
          event.preventDefault();
          if (event.ctrlKey) {
            navigateToCell(0, 0);
          } else {
            navigateToCell(rowIndex, 0);
          }
          break;

        case 'End':
          event.preventDefault();
          if (event.ctrlKey) {
            navigateToCell(rows.length - 1, cells.length - 1);
          } else {
            navigateToCell(rowIndex, cells.length - 1);
          }
          break;
      }
    };

    tableContainer.addEventListener('keydown', handleKeyDown);

    return () => {
      tableContainer.removeEventListener('keydown', handleKeyDown);
    };
  }
};

/**
 * Skip links for main content navigation
 */
export const createSkipLinks = (links: Array<{ href: string; text: string }>) => {
  const skipContainer = document.createElement('div');
  skipContainer.className = 'skip-links';
  skipContainer.style.cssText = `
    position: absolute;
    top: -40px;
    left: 6px;
    z-index: 1000;
  `;

  links.forEach(({ href, text }) => {
    const link = document.createElement('a');
    link.href = href;
    link.textContent = text;
    link.className = 'skip-link';
    link.style.cssText = `
      position: absolute;
      left: -10000px;
      top: auto;
      width: 1px;
      height: 1px;
      overflow: hidden;
      background: #000;
      color: #fff;
      padding: 8px 16px;
      text-decoration: none;
      z-index: 1001;
    `;

    // Show skip link on focus
    link.addEventListener('focus', () => {
      link.style.cssText += `
        left: 6px;
        top: 7px;
        width: auto;
        height: auto;
        overflow: visible;
      `;
    });

    link.addEventListener('blur', () => {
      link.style.cssText = link.style.cssText.replace(
        /left: 6px; top: 7px; width: auto; height: auto; overflow: visible;/,
        ''
      );
    });

    skipContainer.appendChild(link);
  });

  return skipContainer;
};

export default {
  KeyboardShortcutManager,
  ArrowKeyNavigator,
  useKeyboardShortcuts,
  useArrowKeyNavigation,
  keyboardPatterns,
  createSkipLinks,
  globalShortcutManager,
};