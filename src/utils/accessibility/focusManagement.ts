// src/utils/accessibility/focusManagement.ts
import { RefObject, useEffect, useRef, useCallback } from 'react';

/**
 * Focus Management Utilities for WCAG 2.1 AA Compliance
 * Provides focus trapping, restoration, and keyboard navigation patterns
 */

export interface FocusableElement extends HTMLElement {
  focus(): void;
  blur(): void;
}

// Focusable element selectors according to WCAG guidelines
const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"]):not([disabled])',
  'details > summary',
  'audio[controls]',
  'video[controls]',
  'iframe',
  'object',
  'embed',
  '[contenteditable]:not([contenteditable="false"])',
].join(', ');

/**
 * Get all focusable elements within a container
 */
export const getFocusableElements = (container: HTMLElement): FocusableElement[] => {
  const elements = container.querySelectorAll(FOCUSABLE_SELECTORS) as NodeListOf<FocusableElement>;
  return Array.from(elements).filter(element => {
    // Additional checks for visibility and usability
    const style = window.getComputedStyle(element);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      !element.hasAttribute('aria-hidden') &&
      element.offsetWidth > 0 &&
      element.offsetHeight > 0
    );
  });
};

/**
 * Focus trap utility for modals and dialogs
 */
export class FocusTrap {
  private container: HTMLElement;
  private focusableElements: FocusableElement[];
  private firstElement: FocusableElement | null = null;
  private lastElement: FocusableElement | null = null;
  private previousActiveElement: Element | null = null;
  private isActive = false;

  constructor(container: HTMLElement) {
    this.container = container;
    this.focusableElements = [];
    this.updateFocusableElements();
  }

  private updateFocusableElements(): void {
    this.focusableElements = getFocusableElements(this.container);
    this.firstElement = this.focusableElements[0] || null;
    this.lastElement = this.focusableElements[this.focusableElements.length - 1] || null;
  }

  /**
   * Activate focus trap
   */
  activate(): void {
    if (this.isActive) return;

    this.previousActiveElement = document.activeElement;
    this.updateFocusableElements();
    this.container.addEventListener('keydown', this.handleKeyDown);
    
    // Focus first element or container itself
    if (this.firstElement) {
      this.firstElement.focus();
    } else {
      this.container.focus();
    }
    
    this.isActive = true;
  }

  /**
   * Deactivate focus trap and restore previous focus
   */
  deactivate(): void {
    if (!this.isActive) return;

    this.container.removeEventListener('keydown', this.handleKeyDown);
    
    // Restore previous focus
    if (this.previousActiveElement && 'focus' in this.previousActiveElement) {
      (this.previousActiveElement as FocusableElement).focus();
    }
    
    this.isActive = false;
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab') return;

    this.updateFocusableElements();

    if (this.focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    if (this.focusableElements.length === 1) {
      event.preventDefault();
      this.focusableElements[0].focus();
      return;
    }

    if (event.shiftKey) {
      // Shift + Tab - backward navigation
      if (document.activeElement === this.firstElement) {
        event.preventDefault();
        this.lastElement?.focus();
      }
    } else {
      // Tab - forward navigation
      if (document.activeElement === this.lastElement) {
        event.preventDefault();
        this.firstElement?.focus();
      }
    }
  };
}

/**
 * React hook for focus trap management
 */
export const useFocusTrap = (
  containerRef: RefObject<HTMLElement>,
  isActive: boolean = false
) => {
  const focusTrapRef = useRef<FocusTrap | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!focusTrapRef.current) {
      focusTrapRef.current = new FocusTrap(containerRef.current);
    }

    if (isActive) {
      focusTrapRef.current.activate();
    } else {
      focusTrapRef.current.deactivate();
    }

    return () => {
      focusTrapRef.current?.deactivate();
    };
  }, [containerRef, isActive]);

  return focusTrapRef.current;
};

/**
 * Focus restoration utility
 */
export class FocusRestoration {
  private previousActiveElement: Element | null = null;

  /**
   * Save current focus for later restoration
   */
  save(): void {
    this.previousActiveElement = document.activeElement;
  }

  /**
   * Restore previously saved focus
   */
  restore(): void {
    if (this.previousActiveElement && 'focus' in this.previousActiveElement) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        (this.previousActiveElement as FocusableElement).focus();
      }, 0);
    }
  }

  /**
   * Clear saved focus
   */
  clear(): void {
    this.previousActiveElement = null;
  }
}

/**
 * React hook for focus restoration
 */
export const useFocusRestoration = () => {
  const restorationRef = useRef(new FocusRestoration());

  const saveFocus = useCallback(() => {
    restorationRef.current.save();
  }, []);

  const restoreFocus = useCallback(() => {
    restorationRef.current.restore();
  }, []);

  const clearFocus = useCallback(() => {
    restorationRef.current.clear();
  }, []);

  return { saveFocus, restoreFocus, clearFocus };
};

/**
 * Focus visible polyfill for browsers that don't support :focus-visible
 */
export const initializeFocusVisible = (): void => {
  let hadKeyboardEvent = true;
  let keyboardThrottleTimeout: NodeJS.Timeout;

  const onPointerDown = () => {
    hadKeyboardEvent = false;
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.metaKey || e.altKey || e.ctrlKey) {
      return;
    }
    hadKeyboardEvent = true;
  };

  const onFocus = (e: FocusEvent) => {
    if (hadKeyboardEvent) {
      (e.target as HTMLElement).classList.add('focus-visible');
    }
  };

  const onBlur = (e: FocusEvent) => {
    (e.target as HTMLElement).classList.remove('focus-visible');
  };

  // Add event listeners
  document.addEventListener('keydown', onKeyDown, true);
  document.addEventListener('mousedown', onPointerDown, true);
  document.addEventListener('pointerdown', onPointerDown, true);
  document.addEventListener('touchstart', onPointerDown, true);
  document.addEventListener('focus', onFocus, true);
  document.addEventListener('blur', onBlur, true);
};

/**
 * Announce content to screen readers
 */
export const announceToScreenReader = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('class', 'sr-only');
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Check if element is focusable
 */
export const isFocusable = (element: Element): boolean => {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) {
    return false;
  }

  const htmlElement = element as HTMLElement;
  const style = window.getComputedStyle(htmlElement);

  // Check if element is visible
  if (
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    htmlElement.hasAttribute('aria-hidden') ||
    htmlElement.offsetWidth === 0 ||
    htmlElement.offsetHeight === 0
  ) {
    return false;
  }

  // Check if element matches focusable selectors
  return htmlElement.matches(FOCUSABLE_SELECTORS);
};

/**
 * Move focus to next/previous focusable element
 */
export const moveFocus = (
  direction: 'next' | 'previous',
  container: HTMLElement = document.body
): void => {
  const focusableElements = getFocusableElements(container);
  const currentIndex = focusableElements.indexOf(document.activeElement as FocusableElement);

  if (currentIndex === -1) {
    // No current focus, focus first element
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
    return;
  }

  let nextIndex: number;
  if (direction === 'next') {
    nextIndex = currentIndex + 1;
    if (nextIndex >= focusableElements.length) {
      nextIndex = 0; // Wrap to beginning
    }
  } else {
    nextIndex = currentIndex - 1;
    if (nextIndex < 0) {
      nextIndex = focusableElements.length - 1; // Wrap to end
    }
  }

  focusableElements[nextIndex]?.focus();
};

export default {
  FocusTrap,
  FocusRestoration,
  getFocusableElements,
  useFocusTrap,
  useFocusRestoration,
  initializeFocusVisible,
  announceToScreenReader,
  isFocusable,
  moveFocus,
};