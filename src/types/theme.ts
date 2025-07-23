// src/types/theme.ts
// 🎨 Kairos Theme System - Complete Type Definitions for 7 Themes

export type ThemeMode = 'light' | 'dark' | 'system';

export type ThemeName = 
  | 'deep-tech'           // Theme 1: Modern Professional
  | 'nordic-frost'        // Theme 2: Clean & Modern  
  | 'midnight-elegance'   // Theme 3: Premium Dark
  | 'earth-tech'          // Theme 4: Warm Professional
  | 'violet-future'       // Theme 5: Creative Innovation
  | 'glassmorphism'       // Theme 6: Modern Texturized
  | 'neumorphic';         // Theme 7: Soft Tactile

export type ThemeCategory = 'professional' | 'creative' | 'textured';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  border: {
    default: string;
    muted: string;
    strong: string;
  };
}

export interface ThemeEffects {
  // Glassmorphism effects
  glass?: {
    background: string;
    backdropBlur: string;
    border: string;
    shadow: string;
  };
  // Neumorphic effects
  neumorphic?: {
    lightShadow: string;
    darkShadow: string;
    insetShadow: string;
    convexGradient: string;
    concaveGradient: string;
  };
  // Standard effects
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  gradients?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface ThemeConfig {
  name: ThemeName;
  displayName: string;
  description: string;
  category: ThemeCategory;
  mode: ThemeMode;
  colors: ThemeColors;
  effects: ThemeEffects;
  cssVariables: Record<string, string>;
  isTextured: boolean;
  isDark: boolean;
  preview: {
    primaryColor: string;
    gradientFrom: string;
    gradientTo: string;
  };
}

export interface ThemeStore {
  currentTheme: ThemeName;
  mode: ThemeMode;
  availableThemes: ThemeConfig[];
  isInitialized: boolean;
  
  // Actions
  setTheme: (theme: ThemeName) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  initializeTheme: () => void;
  resetToDefault: () => void;
  
  // Getters
  getCurrentThemeConfig: () => ThemeConfig;
  getThemeByName: (name: ThemeName) => ThemeConfig | undefined;
  getThemesByCategory: (category: ThemeCategory) => ThemeConfig[];
  isCurrentTheme: (name: ThemeName) => boolean;
}

export interface ThemeContextValue extends ThemeStore {
  isSystemDark: boolean;
  effectiveTheme: ThemeConfig;
  cssVariables: Record<string, string>;
}

// Theme selector component props
export interface ThemeSelectorProps {
  isOpen?: boolean;
  onClose?: () => void;
  showCategories?: boolean;
  showPreview?: boolean;
  className?: string;
}

export interface ThemePreviewProps {
  theme: ThemeConfig;
  isSelected?: boolean;
  showEffects?: boolean;
  onClick?: (theme: ThemeName) => void;
  className?: string;
}

export interface QuickThemeSwitchProps {
  themes?: ThemeName[];
  showCurrentTheme?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

// Theme validation
export interface ThemeValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  accessibility: {
    contrastRatio: number;
    wcagLevel: 'AA' | 'AAA' | 'FAIL';
  };
}

// User preferences
export interface UserThemePreferences {
  preferredTheme: ThemeName;
  preferredMode: ThemeMode;
  enableEffects: boolean;
  enableAnimations: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  lastUpdated: string;
}

// Theme event types
export type ThemeEvent = 
  | { type: 'THEME_CHANGED'; payload: { theme: ThemeName; previous: ThemeName } }
  | { type: 'MODE_CHANGED'; payload: { mode: ThemeMode; previous: ThemeMode } }
  | { type: 'EFFECTS_TOGGLED'; payload: { enabled: boolean } }
  | { type: 'THEME_RESET'; payload: { theme: ThemeName } };

export default ThemeConfig;