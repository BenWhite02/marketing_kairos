// src/utils/cn.ts
// CSS Class Name Utility Function
// File path: src/utils/cn.ts

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes with proper handling of conflicts
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 * 
 * @param inputs - Class names, objects, arrays, or conditional expressions
 * @returns Merged and deduplicated class string
 * 
 * @example
 * ```tsx
 * cn('px-4 py-2', 'bg-blue-500', { 'text-white': isActive })
 * // Returns: "px-4 py-2 bg-blue-500 text-white"
 * 
 * cn('px-4 py-2', 'px-6') // Tailwind conflict resolution
 * // Returns: "py-2 px-6" (px-6 overrides px-4)
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Export as default for convenient importing
export default cn;