// src/config/themes.ts
// 🎨 Complete 7-Theme Configuration for Kairos

import type { ThemeConfig, ThemeName, ThemeCategory } from '@/types/theme';

// Theme constants
export const THEME_NAMES = {
  DEEP_TECH: 'deep-tech',
  NORDIC_FROST: 'nordic-frost',
  MIDNIGHT_ELEGANCE: 'midnight-elegance',
  EARTH_TECH: 'earth-tech',
  VIOLET_FUTURE: 'violet-future',
  GLASSMORPHISM: 'glassmorphism',
  NEUMORPHIC: 'neumorphic',
} as const;

export const THEME_CATEGORIES = {
  PROFESSIONAL: 'professional',
  CREATIVE: 'creative',
  TEXTURED: 'textured',
} as const;

export const DEFAULT_THEME: ThemeName = 'deep-tech';

// THEME 1: "DEEP TECH" - Modern Professional ⭐ MOST RECOMMENDED
const deepTechTheme: ThemeConfig = {
  name: 'deep-tech',
  displayName: 'Deep Tech',
  description: 'Modern professional with enterprise focus',
  category: 'professional',
  mode: 'light',
  isDark: false,
  isTextured: false,
  colors: {
    primary: '#1e40af',     // Deep Blue
    secondary: '#475569',    // Slate
    accent: '#f59e0b',      // Amber
    success: '#059669',     // Emerald
    warning: '#f59e0b',     // Amber
    error: '#dc2626',       // Red
    background: '#f8fafc',  // Cool Gray
    surface: '#ffffff',     // White
    text: {
      primary: '#1e293b',
      secondary: '#475569',
      muted: '#64748b',
      inverse: '#ffffff',
    },
    border: {
      default: '#e2e8f0',
      muted: '#f1f5f9',
      strong: '#cbd5e1',
    },
  },
  effects: {
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
      secondary: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
      accent: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    },
  },
  cssVariables: {
    '--theme-primary': '#1e40af',
    '--theme-secondary': '#475569',
    '--theme-accent': '#f59e0b',
    '--theme-success': '#059669',
    '--theme-background': '#f8fafc',
    '--theme-surface': '#ffffff',
    '--theme-text-primary': '#1e293b',
    '--theme-border': '#e2e8f0',
  },
  preview: {
    primaryColor: '#1e40af',
    gradientFrom: '#1e40af',
    gradientTo: '#3b82f6',
  },
};

// THEME 2: "NORDIC FROST" - Clean & Modern
const nordicFrostTheme: ThemeConfig = {
  name: 'nordic-frost',
  displayName: 'Nordic Frost',
  description: 'Scandinavian minimalism, data-friendly',
  category: 'professional',
  mode: 'light',
  isDark: false,
  isTextured: false,
  colors: {
    primary: '#0ea5e9',     // Sky Blue
    secondary: '#64748b',   // Cool Gray
    accent: '#06b6d4',      // Cyan
    success: '#10b981',     // Emerald
    warning: '#f59e0b',     // Amber
    error: '#ef4444',       // Red
    background: '#ffffff',  // Pure White
    surface: '#f8fafc',     // Light Gray
    text: {
      primary: '#0f172a',
      secondary: '#334155',
      muted: '#64748b',
      inverse: '#ffffff',
    },
    border: {
      default: '#e2e8f0',
      muted: '#f1f5f9',
      strong: '#cbd5e1',
    },
  },
  effects: {
    shadows: {
      sm: '0 1px 2px 0 rgb(15 23 42 / 0.05)',
      md: '0 4px 6px -1px rgb(15 23 42 / 0.1), 0 2px 4px -2px rgb(15 23 42 / 0.1)',
      lg: '0 10px 15px -3px rgb(15 23 42 / 0.1), 0 4px 6px -4px rgb(15 23 42 / 0.1)',
      xl: '0 20px 25px -5px rgb(15 23 42 / 0.1), 0 8px 10px -6px rgb(15 23 42 / 0.1)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
      secondary: 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)',
      accent: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
    },
  },
  cssVariables: {
    '--theme-primary': '#0ea5e9',
    '--theme-secondary': '#64748b',
    '--theme-accent': '#06b6d4',
    '--theme-success': '#10b981',
    '--theme-background': '#ffffff',
    '--theme-surface': '#f8fafc',
    '--theme-text-primary': '#0f172a',
    '--theme-border': '#e2e8f0',
  },
  preview: {
    primaryColor: '#0ea5e9',
    gradientFrom: '#0ea5e9',
    gradientTo: '#38bdf8',
  },
};

// THEME 3: "MIDNIGHT ELEGANCE" - Premium Dark
const midnightEleganceTheme: ThemeConfig = {
  name: 'midnight-elegance',
  displayName: 'Midnight Elegance',
  description: 'Premium dark mode with reduced eye strain',
  category: 'professional',
  mode: 'dark',
  isDark: true,
  isTextured: false,
  colors: {
    primary: '#3b82f6',     // Bright Blue
    secondary: '#1e293b',   // Dark Slate
    accent: '#f97316',      // Orange
    success: '#22c55e',     // Green
    warning: '#fbbf24',     // Yellow
    error: '#ef4444',       // Red
    background: '#0f172a',  // Dark Navy
    surface: '#1e293b',     // Dark Slate
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      muted: '#94a3b8',
      inverse: '#0f172a',
    },
    border: {
      default: '#334155',
      muted: '#1e293b',
      strong: '#475569',
    },
  },
  effects: {
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.5)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.6), 0 8px 10px -6px rgb(0 0 0 / 0.6)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
      secondary: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      accent: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
    },
  },
  cssVariables: {
    '--theme-primary': '#3b82f6',
    '--theme-secondary': '#1e293b',
    '--theme-accent': '#f97316',
    '--theme-success': '#22c55e',
    '--theme-background': '#0f172a',
    '--theme-surface': '#1e293b',
    '--theme-text-primary': '#f8fafc',
    '--theme-border': '#334155',
  },
  preview: {
    primaryColor: '#3b82f6',
    gradientFrom: '#0f172a',
    gradientTo: '#1e293b',
  },
};

// THEME 4: "EARTH TECH" - Warm Professional
const earthTechTheme: ThemeConfig = {
  name: 'earth-tech',
  displayName: 'Earth Tech',
  description: 'Natural, trustworthy, growth-oriented',
  category: 'creative',
  mode: 'light',
  isDark: false,
  isTextured: false,
  colors: {
    primary: '#059669',     // Emerald
    secondary: '#78716c',   // Warm Gray
    accent: '#ea580c',      // Orange
    success: '#16a34a',     // Green
    warning: '#f59e0b',     // Amber
    error: '#dc2626',       // Red
    background: '#fefdf8',  // Warm White
    surface: '#ffffff',     // White
    text: {
      primary: '#1c1917',
      secondary: '#44403c',
      muted: '#78716c',
      inverse: '#ffffff',
    },
    border: {
      default: '#e7e5e4',
      muted: '#f5f5f4',
      strong: '#d6d3d1',
    },
  },
  effects: {
    shadows: {
      sm: '0 1px 2px 0 rgb(28 25 23 / 0.05)',
      md: '0 4px 6px -1px rgb(28 25 23 / 0.1), 0 2px 4px -2px rgb(28 25 23 / 0.1)',
      lg: '0 10px 15px -3px rgb(28 25 23 / 0.1), 0 4px 6px -4px rgb(28 25 23 / 0.1)',
      xl: '0 20px 25px -5px rgb(28 25 23 / 0.1), 0 8px 10px -6px rgb(28 25 23 / 0.1)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      secondary: 'linear-gradient(135deg, #78716c 0%, #a8a29e 100%)',
      accent: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
    },
  },
  cssVariables: {
    '--theme-primary': '#059669',
    '--theme-secondary': '#78716c',
    '--theme-accent': '#ea580c',
    '--theme-success': '#16a34a',
    '--theme-background': '#fefdf8',
    '--theme-surface': '#ffffff',
    '--theme-text-primary': '#1c1917',
    '--theme-border': '#e7e5e4',
  },
  preview: {
    primaryColor: '#059669',
    gradientFrom: '#059669',
    gradientTo: '#10b981',
  },
};

// THEME 5: "VIOLET FUTURE" - Creative Innovation
const violetFutureTheme: ThemeConfig = {
  name: 'violet-future',
  displayName: 'Violet Future',
  description: 'Innovation-focused with creative energy',
  category: 'creative',
  mode: 'light',
  isDark: false,
  isTextured: false,
  colors: {
    primary: '#8b5cf6',     // Purple
    secondary: '#64748b',   // Cool Gray
    accent: '#f59e0b',      // Amber
    success: '#10b981',     // Emerald
    warning: '#f59e0b',     // Amber
    error: '#ef4444',       // Red
    background: '#fafaf9',  // Neutral
    surface: '#ffffff',     // White
    text: {
      primary: '#18181b',
      secondary: '#3f3f46',
      muted: '#71717a',
      inverse: '#ffffff',
    },
    border: {
      default: '#e4e4e7',
      muted: '#f4f4f5',
      strong: '#d4d4d8',
    },
  },
  effects: {
    shadows: {
      sm: '0 1px 2px 0 rgb(139 92 246 / 0.05)',
      md: '0 4px 6px -1px rgb(139 92 246 / 0.1), 0 2px 4px -2px rgb(139 92 246 / 0.1)',
      lg: '0 10px 15px -3px rgb(139 92 246 / 0.1), 0 4px 6px -4px rgb(139 92 246 / 0.1)',
      xl: '0 20px 25px -5px rgb(139 92 246 / 0.1), 0 8px 10px -6px rgb(139 92 246 / 0.1)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
      secondary: 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)',
      accent: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    },
  },
  cssVariables: {
    '--theme-primary': '#8b5cf6',
    '--theme-secondary': '#64748b',
    '--theme-accent': '#f59e0b',
    '--theme-success': '#10b981',
    '--theme-background': '#fafaf9',
    '--theme-surface': '#ffffff',
    '--theme-text-primary': '#18181b',
    '--theme-border': '#e4e4e7',
  },
  preview: {
    primaryColor: '#8b5cf6',
    gradientFrom: '#8b5cf6',
    gradientTo: '#a78bfa',
  },
};

// THEME 6: "GLASSMORPHISM DYNAMIC" - Modern Texturized ✨
const glassmorphismTheme: ThemeConfig = {
  name: 'glassmorphism',
  displayName: 'Glassmorphism Dynamic',
  description: 'Frosted glass with transparency and depth',
  category: 'textured',
  mode: 'light',
  isDark: false,
  isTextured: true,
  colors: {
    primary: '#3b82f6',     // Electric Blue
    secondary: '#1e293b',   // Glass Dark
    accent: '#06b6d4',      // Neon Cyan
    success: '#22c55e',     // Emerald
    warning: '#fbbf24',     // Yellow
    error: '#ef4444',       // Red
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    surface: 'rgba(255, 255, 255, 0.1)',
    text: {
      primary: '#1e293b',
      secondary: '#475569',
      muted: '#64748b',
      inverse: '#ffffff',
    },
    border: {
      default: 'rgba(255, 255, 255, 0.2)',
      muted: 'rgba(255, 255, 255, 0.1)',
      strong: 'rgba(255, 255, 255, 0.3)',
    },
  },
  effects: {
    glass: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropBlur: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    },
    shadows: {
      sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
      md: '0 8px 16px rgba(0, 0, 0, 0.15)',
      lg: '0 16px 32px rgba(0, 0, 0, 0.2)',
      xl: '0 24px 48px rgba(0, 0, 0, 0.25)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
      secondary: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(71, 85, 105, 0.8) 100%)',
      accent: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
    },
  },
  cssVariables: {
    '--theme-primary': '#3b82f6',
    '--theme-secondary': '#1e293b',
    '--theme-accent': '#06b6d4',
    '--theme-success': '#22c55e',
    '--theme-background': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    '--theme-surface': 'rgba(255, 255, 255, 0.1)',
    '--theme-text-primary': '#1e293b',
    '--theme-border': 'rgba(255, 255, 255, 0.2)',
    '--glass-bg': 'rgba(255, 255, 255, 0.1)',
    '--glass-border': 'rgba(255, 255, 255, 0.2)',
    '--glass-blur': 'blur(10px)',
  },
  preview: {
    primaryColor: '#3b82f6',
    gradientFrom: '#667eea',
    gradientTo: '#764ba2',
  },
};

// THEME 7: "NEUMORPHIC TEXTURE" - Soft Tactile ✨
const neumorphicTheme: ThemeConfig = {
  name: 'neumorphic',
  displayName: 'Neumorphic Texture',
  description: 'Soft shadows with embossed tactile feel',
  category: 'textured',
  mode: 'light',
  isDark: false,
  isTextured: true,
  colors: {
    primary: '#6366f1',     // Soft Indigo
    secondary: '#e5e7eb',   // Soft Gray
    accent: '#f59e0b',      // Warm Amber
    success: '#10b981',     // Soft Green
    warning: '#f59e0b',     // Amber
    error: '#ef4444',       // Red
    background: '#f9fafb',  // Textured White
    surface: '#f3f4f6',     // Soft Surface
    text: {
      primary: '#111827',
      secondary: '#374151',
      muted: '#6b7280',
      inverse: '#ffffff',
    },
    border: {
      default: '#d1d5db',
      muted: '#e5e7eb',
      strong: '#9ca3af',
    },
  },
  effects: {
    neumorphic: {
      lightShadow: '#ffffff',
      darkShadow: '#d1d5db',
      insetShadow: 'inset 2px 2px 4px #d1d5db, inset -2px -2px 4px #ffffff',
      convexGradient: 'linear-gradient(145deg, #f0f0f0, #cacaca)',
      concaveGradient: 'linear-gradient(145deg, #cacaca, #f0f0f0)',
    },
    shadows: {
      sm: '2px 2px 4px #d1d5db, -2px -2px 4px #ffffff',
      md: '4px 4px 8px #d1d5db, -4px -4px 8px #ffffff',
      lg: '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff',
      xl: '12px 12px 24px #d1d5db, -12px -12px 24px #ffffff',
    },
    gradients: {
      primary: 'linear-gradient(145deg, #6366f1, #4338ca)',
      secondary: 'linear-gradient(145deg, #e5e7eb, #d1d5db)',
      accent: 'linear-gradient(145deg, #f59e0b, #d97706)',
    },
  },
  cssVariables: {
    '--theme-primary': '#6366f1',
    '--theme-secondary': '#e5e7eb',
    '--theme-accent': '#f59e0b',
    '--theme-success': '#10b981',
    '--theme-background': '#f9fafb',
    '--theme-surface': '#f3f4f6',
    '--theme-text-primary': '#111827',
    '--theme-border': '#d1d5db',
    '--neu-light-shadow': '#ffffff',
    '--neu-dark-shadow': '#d1d5db',
    '--neu-convex': 'linear-gradient(145deg, #f0f0f0, #cacaca)',
    '--neu-concave': 'linear-gradient(145deg, #cacaca, #f0f0f0)',
  },
  preview: {
    primaryColor: '#6366f1',
    gradientFrom: '#f9fafb',
    gradientTo: '#f3f4f6',
  },
};

// All themes configuration
export const THEMES: Record<ThemeName, ThemeConfig> = {
  'deep-tech': deepTechTheme,
  'nordic-frost': nordicFrostTheme,
  'midnight-elegance': midnightEleganceTheme,
  'earth-tech': earthTechTheme,
  'violet-future': violetFutureTheme,
  'glassmorphism': glassmorphismTheme,
  'neumorphic': neumorphicTheme,
};

export const THEMES_BY_CATEGORY: Record<ThemeCategory, ThemeConfig[]> = {
  professional: [
    THEMES['deep-tech'],
    THEMES['nordic-frost'],
    THEMES['midnight-elegance'],
  ],
  creative: [
    THEMES['earth-tech'],
    THEMES['violet-future'],
  ],
  textured: [
    THEMES['glassmorphism'],
    THEMES['neumorphic'],
  ],
};

export const THEME_LIST = Object.values(THEMES);

// Helper functions
export const getThemeConfig = (name: ThemeName): ThemeConfig => {
  return THEMES[name];
};

export const getThemesByCategory = (category: ThemeCategory): ThemeConfig[] => {
  return THEMES_BY_CATEGORY[category];
};

export const isValidTheme = (name: string): name is ThemeName => {
  return Object.keys(THEMES).includes(name);
};

export const getThemePreviewData = (name: ThemeName) => {
  const theme = THEMES[name];
  return {
    name: theme.displayName,
    description: theme.description,
    category: theme.category,
    preview: theme.preview,
    isTextured: theme.isTextured,
    isDark: theme.isDark,
  };
};