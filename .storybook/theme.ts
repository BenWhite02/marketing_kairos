// .storybook/theme.ts
import { create } from '@storybook/theming/create';
import logo from '../public/images/kairos-logo.svg';

export const kairosTheme = create({
  base: 'light',
  brandTitle: 'Kairos Design System',
  brandUrl: 'https://kairos.marketing',
  brandImage: logo,
  brandTarget: '_self',

  // Typography
  fontBase: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontCode: '"Fira Code", "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',

  // Colors
  colorPrimary: '#3b82f6',
  colorSecondary: '#6366f1',

  // UI Colors
  appBg: '#ffffff',
  appContentBg: '#f8fafc',
  appBorderColor: '#e2e8f0',
  appBorderRadius: 8,

  // Text Colors
  textColor: '#111827',
  textInverseColor: '#ffffff',
  textMutedColor: '#6b7280',

  // Toolbar
  barTextColor: '#4b5563',
  barSelectedColor: '#3b82f6',
  barBg: '#ffffff',

  // Form
  inputBg: '#ffffff',
  inputBorder: '#d1d5db',
  inputTextColor: '#111827',
  inputBorderRadius: 6,

  // Button
  buttonBg: '#3b82f6',
  buttonBorder: '#3b82f6',

  // Boolean
  booleanBg: '#f3f4f6',
  booleanSelectedBg: '#3b82f6'
});

export const kairosDarkTheme = create({
  base: 'dark',
  brandTitle: 'Kairos Design System',
  brandUrl: 'https://kairos.marketing',
  brandImage: logo,
  brandTarget: '_self',

  // Typography
  fontBase: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontCode: '"Fira Code", "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',

  // Colors
  colorPrimary: '#60a5fa',
  colorSecondary: '#818cf8',

  // UI Colors
  appBg: '#111827',
  appContentBg: '#1f2937',
  appBorderColor: '#374151',
  appBorderRadius: 8,

  // Text Colors
  textColor: '#f9fafb',
  textInverseColor: '#111827',
  textMutedColor: '#9ca3af',

  // Toolbar
  barTextColor: '#d1d5db',
  barSelectedColor: '#60a5fa',
  barBg: '#1f2937',

  // Form
  inputBg: '#374151',
  inputBorder: '#4b5563',
  inputTextColor: '#f9fafb',
  inputBorderRadius: 6,

  // Button
  buttonBg: '#3b82f6',
  buttonBorder: '#3b82f6',

  // Boolean
  booleanBg: '#374151',
  booleanSelectedBg: '#3b82f6'
});