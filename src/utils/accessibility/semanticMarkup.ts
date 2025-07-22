// src/utils/accessibility/semanticMarkup.ts
import { useEffect, useRef } from 'react';

/**
 * Semantic Markup Utilities for WCAG 2.1 AA Compliance
 * Provides semantic HTML structure helpers and ARIA utilities
 */

export interface HeadingStructure {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  id?: string;
  element?: HTMLElement;
}

export interface LandmarkRegion {
  role: 'banner' | 'navigation' | 'main' | 'complementary' | 'contentinfo' | 'search' | 'form';
  label?: string;
  element?: HTMLElement;
}

export interface TableStructure {
  caption?: string;
  headers: string[];
  rows: string[][];
  scope?: 'col' | 'row' | 'colgroup' | 'rowgroup';
}

/**
 * Heading hierarchy validator and manager
 */
export class HeadingHierarchyManager {
  private headings: HeadingStructure[] = [];
  private container: HTMLElement;

  constructor(container: HTMLElement = document.body) {
    this.container = container;
    this.scanHeadings();
  }

  /**
   * Scan for existing headings in the DOM
   */
  scanHeadings(): void {
    const headingElements = this.container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    this.headings = Array.from(headingElements).map(element => ({
      level: parseInt(element.tagName.charAt(1)) as HeadingStructure['level'],
      text: element.textContent || '',
      id: element.id,
      element: element as HTMLElement
    }));
  }

  /**
   * Validate heading hierarchy
   */
  validateHierarchy(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for h1 element
    const h1Count = this.headings.filter(h => h.level === 1).length;
    if (h1Count === 0) {
      errors.push('Missing h1 element - every page should have exactly one h1');
    } else if (h1Count > 1) {
      warnings.push(`Multiple h1 elements found (${h1Count}) - consider using only one per page`);
    }

    // Check for skipped heading levels
    for (let i = 1; i < this.headings.length; i++) {
      const current = this.headings[i];
      const previous = this.headings[i - 1];
      
      if (current.level > previous.level + 1) {
        errors.push(
          `Heading level skipped: h${previous.level} followed by h${current.level} ("${current.text}")`
        );
      }
    }

    // Check for empty headings
    this.headings.forEach((heading, index) => {
      if (!heading.text.trim()) {
        errors.push(`Empty heading found at position ${index + 1}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Generate heading outline
   */
  generateOutline(): { level: number; text: string; id?: string }[] {
    return this.headings.map(heading => ({
      level: heading.level,
      text: heading.text,
      id: heading.id
    }));
  }

  /**
   * Auto-fix heading hierarchy
   */
  autoFixHierarchy(): void {
    let currentLevel = 1;

    this.headings.forEach(heading => {
      if (heading.element) {
        const correctTagName = `h${currentLevel}`;
        if (heading.element.tagName.toLowerCase() !== correctTagName) {
          // Replace element with correct heading level
          const newElement = document.createElement(correctTagName);
          newElement.textContent = heading.element.textContent;
          newElement.id = heading.element.id;
          newElement.className = heading.element.className;
          
          heading.element.parentNode?.replaceChild(newElement, heading.element);
          heading.element = newElement;
          heading.level = currentLevel as HeadingStructure['level'];
        }
        
        // Increment level for next heading, but don't exceed 6
        if (currentLevel < 6) {
          currentLevel++;
        }
      }
    });
  }
}

/**
 * Landmark region manager
 */
export class LandmarkManager {
  private landmarks: LandmarkRegion[] = [];
  private container: HTMLElement;

  constructor(container: HTMLElement = document.body) {
    this.container = container;
    this.scanLandmarks();
  }

  /**
   * Scan for existing landmark regions
   */
  scanLandmarks(): void {
    const landmarkSelectors = [
      'header:not([role])',
      '[role="banner"]',
      'nav:not([role])',
      '[role="navigation"]',
      'main:not([role])',
      '[role="main"]',
      'aside:not([role])',
      '[role="complementary"]',
      'footer:not([role])',
      '[role="contentinfo"]',
      '[role="search"]',
      '[role="form"]'
    ];

    this.landmarks = [];

    landmarkSelectors.forEach(selector => {
      const elements = this.container.querySelectorAll(selector);
      elements.forEach(element => {
        const htmlElement = element as HTMLElement;
        let role: LandmarkRegion['role'];

        // Determine role based on element or explicit role attribute
        if (htmlElement.hasAttribute('role')) {
          role = htmlElement.getAttribute('role') as LandmarkRegion['role'];
        } else {
          switch (htmlElement.tagName.toLowerCase()) {
            case 'header':
              role = 'banner';
              break;
            case 'nav':
              role = 'navigation';
              break;
            case 'main':
              role = 'main';
              break;
            case 'aside':
              role = 'complementary';
              break;
            case 'footer':
              role = 'contentinfo';
              break;
            default:
              return; // Skip unknown elements
          }
        }

        this.landmarks.push({
          role,
          label: htmlElement.getAttribute('aria-label') || undefined,
          element: htmlElement
        });
      });
    });
  }

  /**
   * Validate landmark structure
   */
  validateLandmarks(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for required landmarks
    const roles = this.landmarks.map(l => l.role);
    
    if (!roles.includes('main')) {
      errors.push('Missing main landmark - every page should have a main content area');
    }

    // Check for multiple main landmarks
    const mainCount = roles.filter(role => role === 'main').length;
    if (mainCount > 1) {
      errors.push(`Multiple main landmarks found (${mainCount}) - only one main landmark per page`);
    }

    // Check for unlabeled navigation landmarks
    const navLandmarks = this.landmarks.filter(l => l.role === 'navigation');
    if (navLandmarks.length > 1) {
      const unlabeledNav = navLandmarks.filter(l => !l.label);
      if (unlabeledNav.length > 0) {
        warnings.push('Multiple navigation landmarks without unique labels - add aria-label to distinguish them');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Generate landmark outline
   */
  generateOutline(): { role: string; label?: string }[] {
    return this.landmarks.map(landmark => ({
      role: landmark.role,
      label: landmark.label
    }));
  }
}

/**
 * Accessible table utilities
 */
export class AccessibleTableBuilder {
  /**
   * Create accessible table structure
   */
  static createTable(structure: TableStructure): HTMLTableElement {
    const table = document.createElement('table');
    
    // Add caption if provided
    if (structure.caption) {
      const caption = document.createElement('caption');
      caption.textContent = structure.caption;
      table.appendChild(caption);
    }

    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    structure.headers.forEach(headerText => {
      const th = document.createElement('th');
      th.textContent = headerText;
      th.setAttribute('scope', structure.scope || 'col');
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create body
    const tbody = document.createElement('tbody');
    
    structure.rows.forEach(rowData => {
      const tr = document.createElement('tr');
      
      rowData.forEach((cellData, index) => {
        const td = document.createElement('td');
        td.textContent = cellData;
        
        // Add headers association
        if (structure.headers[index]) {
          td.setAttribute('headers', `header-${index}`);
        }
        
        tr.appendChild(td);
      });
      
      tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);

    // Add ARIA attributes
    table.setAttribute('role', 'table');
    table.setAttribute('aria-rowcount', (structure.rows.length + 1).toString());
    table.setAttribute('aria-colcount', structure.headers.length.toString());

    return table;
  }

  /**
   * Enhance existing table for accessibility
   */
  static enhanceTable(table: HTMLTableElement): void {
    // Add role if not present
    if (!table.hasAttribute('role')) {
      table.setAttribute('role', 'table');
    }

    // Enhance headers
    const headers = table.querySelectorAll('th');
    headers.forEach((header, index) => {
      if (!header.hasAttribute('scope')) {
        // Determine scope based on position
        const row = header.closest('tr');
        const isInThead = !!header.closest('thead');
        const isFirstCell = row?.children[0] === header;
        
        if (isInThead) {
          header.setAttribute('scope', 'col');
        } else if (isFirstCell) {
          header.setAttribute('scope', 'row');
        }
      }
      
      // Add unique ID for association
      if (!header.id) {
        header.id = `header-${index}`;
      }
    });

    // Add row and column counts
    const rows = table.querySelectorAll('tr');
    const cols = rows[0]?.children.length || 0;
    
    table.setAttribute('aria-rowcount', rows.length.toString());
    table.setAttribute('aria-colcount', cols.toString());

    // Add row indices
    rows.forEach((row, index) => {
      row.setAttribute('aria-rowindex', (index + 1).toString());
    });
  }
}

/**
 * List accessibility utilities
 */
export class AccessibleListBuilder {
  /**
   * Create accessible list with proper semantics
   */
  static createList(
    items: string[],
    type: 'ordered' | 'unordered' | 'description' = 'unordered',
    options: {
      className?: string;
      ariaLabel?: string;
      itemAttributes?: { [key: string]: string }[];
    } = {}
  ): HTMLElement {
    let list: HTMLElement;

    switch (type) {
      case 'ordered':
        list = document.createElement('ol');
        break;
      case 'description':
        list = document.createElement('dl');
        break;
      default:
        list = document.createElement('ul');
    }

    // Add attributes
    if (options.className) {
      list.className = options.className;
    }
    
    if (options.ariaLabel) {
      list.setAttribute('aria-label', options.ariaLabel);
    }

    // Add items
    items.forEach((itemText, index) => {
      if (type === 'description') {
        // Description list uses dt/dd pairs
        const dt = document.createElement('dt');
        const dd = document.createElement('dd');
        dt.textContent = itemText;
        dd.textContent = items[index + 1] || '';
        list.appendChild(dt);
        list.appendChild(dd);
      } else {
        // Regular list item
        const li = document.createElement('li');
        li.textContent = itemText;
        
        // Add custom attributes if provided
        if (options.itemAttributes && options.itemAttributes[index]) {
          Object.entries(options.itemAttributes[index]).forEach(([key, value]) => {
            li.setAttribute(key, value);
          });
        }
        
        list.appendChild(li);
      }
    });

    return list;
  }

  /**
   * Enhance existing list for accessibility
   */
  static enhanceList(list: HTMLElement): void {
    const tagName = list.tagName.toLowerCase();
    
    if (['ul', 'ol', 'dl'].includes(tagName)) {
      // Add role if needed
      if (!list.hasAttribute('role')) {
        list.setAttribute('role', 'list');
      }

      // Count items for aria-label
      const itemCount = list.children.length;
      if (!list.hasAttribute('aria-label') && itemCount > 0) {
        list.setAttribute('aria-label', `List with ${itemCount} items`);
      }

      // Enhance list items
      const items = list.querySelectorAll('li');
      items.forEach((item, index) => {
        if (!item.hasAttribute('role')) {
          item.setAttribute('role', 'listitem');
        }
        
        // Add position information for screen readers
        item.setAttribute('aria-setsize', items.length.toString());
        item.setAttribute('aria-posinset', (index + 1).toString());
      });
    }
  }
}

/**
 * Form accessibility utilities
 */
export class AccessibleFormBuilder {
  /**
   * Create accessible form field with proper labeling
   */
  static createFormField(config: {
    type: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search' | 'textarea' | 'select';
    id: string;
    label: string;
    required?: boolean;
    description?: string;
    error?: string;
    options?: string[]; // For select fields
    placeholder?: string;
  }): HTMLElement {
    const container = document.createElement('div');
    container.className = 'form-field';

    // Create label
    const label = document.createElement('label');
    label.setAttribute('for', config.id);
    label.textContent = config.label;
    if (config.required) {
      label.textContent += ' *';
    }
    container.appendChild(label);

    // Create input element
    let input: HTMLElement;
    
    if (config.type === 'textarea') {
      input = document.createElement('textarea');
    } else if (config.type === 'select') {
      input = document.createElement('select');
      
      // Add options
      config.options?.forEach(optionText => {
        const option = document.createElement('option');
        option.value = optionText;
        option.textContent = optionText;
        input.appendChild(option);
      });
    } else {
      input = document.createElement('input');
      (input as HTMLInputElement).type = config.type;
    }

    // Set common attributes
    input.id = config.id;
    if (config.placeholder) {
      input.setAttribute('placeholder', config.placeholder);
    }
    if (config.required) {
      input.setAttribute('required', 'true');
      input.setAttribute('aria-required', 'true');
    }

    // Handle descriptions and errors
    const describedBy: string[] = [];
    
    if (config.description) {
      const description = document.createElement('div');
      description.id = `${config.id}-description`;
      description.className = 'field-description';
      description.textContent = config.description;
      container.appendChild(description);
      describedBy.push(description.id);
    }
    
    if (config.error) {
      const error = document.createElement('div');
      error.id = `${config.id}-error`;
      error.className = 'field-error';
      error.textContent = config.error;
      error.setAttribute('role', 'alert');
      container.appendChild(error);
      describedBy.push(error.id);
      
      input.setAttribute('aria-invalid', 'true');
    }

    if (describedBy.length > 0) {
      input.setAttribute('aria-describedby', describedBy.join(' '));
    }

    container.appendChild(input);
    return container;
  }
}

/**
 * React hooks for semantic markup
 */
export const useHeadingHierarchy = (containerRef: React.RefObject<HTMLElement>) => {
  const managerRef = useRef<HeadingHierarchyManager | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      managerRef.current = new HeadingHierarchyManager(containerRef.current);
    }
  }, [containerRef]);

  const validateHierarchy = () => {
    return managerRef.current?.validateHierarchy() || { isValid: false, errors: [], warnings: [] };
  };

  const generateOutline = () => {
    return managerRef.current?.generateOutline() || [];
  };

  return { validateHierarchy, generateOutline };
};

export const useLandmarkValidation = (containerRef: React.RefObject<HTMLElement>) => {
  const managerRef = useRef<LandmarkManager | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      managerRef.current = new LandmarkManager(containerRef.current);
    }
  }, [containerRef]);

  const validateLandmarks = () => {
    return managerRef.current?.validateLandmarks() || { isValid: false, errors: [], warnings: [] };
  };

  const generateOutline = () => {
    return managerRef.current?.generateOutline() || [];
  };

  return { validateLandmarks, generateOutline };
};

export default {
  HeadingHierarchyManager,
  LandmarkManager,
  AccessibleTableBuilder,
  AccessibleListBuilder,
  AccessibleFormBuilder,
  useHeadingHierarchy,
  useLandmarkValidation,
};