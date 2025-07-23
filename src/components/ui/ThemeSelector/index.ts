// src/components/ui/ThemeSelector/index.ts
// 🎨 Theme Selector Components Export Barrel

// Main components - both named and default exports
export { default as ThemeSelector, ThemeSelector as ThemeSelectorComponent } from './ThemeSelector';
export { ThemePreview, default as ThemePreviewComponent } from './ThemePreview';
export { QuickThemeSwitch } from './QuickThemeSwitch';

// Re-export types for convenience
export type {
  ThemeSelectorProps,
  ThemePreviewCardProps,
} from './ThemeSelector';

export type {
  ThemePreviewProps,
  QuickThemeSwitchProps,
} from '@/types/theme';

// Additional type exports if needed
export type {
  ThemeName,
  ThemeConfig,
  Theme
} from '@/config/themes';