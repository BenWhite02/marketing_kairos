// src/utils/dom/classNames.ts

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names using clsx and merges Tailwind classes using twMerge
 * This prevents Tailwind class conflicts and provides clean class composition
 */
export function classNames(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Alias for classNames - commonly used as 'cn' for brevity
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Default export for backward compatibility
 */
export default classNames;