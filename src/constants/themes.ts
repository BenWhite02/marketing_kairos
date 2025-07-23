// src/constants/themes.ts
export const THEME_COLORS = {
  'deep-tech': {
    primary: '#1e40af',
    secondary: '#475569',
    accent: '#f59e0b',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#1e293b'
  },
  'nordic-frost': {
    primary: '#0ea5e9',
    secondary: '#64748b',
    accent: '#06b6d4',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a'
  },
  'midnight-elegance': {
    primary: '#3b82f6',
    secondary: '#1e293b',
    accent: '#f97316',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f8fafc'
  },
  'glassmorphism': {
    primary: '#3b82f6',
    secondary: '#1e293b',
    accent: '#06b6d4',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    surface: 'rgba(255, 255, 255, 0.1)',
    text: '#1e293b'
  },
  'neumorphic': {
    primary: '#6366f1',
    secondary: '#e5e7eb',
    accent: '#f59e0b',
    background: '#f9fafb',
    surface: '#f3f4f6',
    text: '#111827'
  }
} as const;

export type ThemeName = keyof typeof THEME_COLORS;