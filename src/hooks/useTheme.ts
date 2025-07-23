// src/hooks/useTheme.ts
// 🎨 Enhanced Theme Management Hook

import { useEffect, useCallback } from 'react';
import { useThemeStore } from '@/stores/ui/themeStore';
import type { ThemeName, ThemeMode, ThemeConfig } from '@/types/theme';

/**
 * Enhanced hook for theme management with additional utilities
 * Provides easy access to theme state and actions
 */
export const useTheme = () => {
  const store = useThemeStore();

  // Get effective theme based on mode and system preferences
  const effectiveTheme = store.getCurrentThemeConfig();

  // Detect system dark mode preference
  const isSystemDark = store.systemTheme === 'dark';

  // CSS variables for the current theme
  const cssVariables = effectiveTheme.cssVariables;

  // Theme switching with validation
  const switchTheme = useCallback((themeName: ThemeName) => {
    if (store.validateTheme(themeName)) {
      store.setTheme(themeName);
    } else {
      console.warn(`Invalid theme: ${themeName}`);
    }
  }, [store]);

  // Cycle through themes
  const cycleTheme = useCallback(() => {
    const themes = store.availableThemes;
    const currentIndex = themes.findIndex(t => t.name === store.currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    
    if (nextTheme) {
      store.setTheme(nextTheme.name);
    }
  }, [store]);

  // Get themes by category
  const getThemesByCategory = useCallback((category: string) => {
    return store.getThemesByCategory(category as any);
  }, [store]);

  // Check if current theme matches a condition
  const isThemeType = useCallback((condition: (theme: ThemeConfig) => boolean) => {
    return condition(effectiveTheme);
  }, [effectiveTheme]);

  // Apply theme preview temporarily
  const previewTheme = useCallback((themeName: ThemeName | null) => {
    if (themeName && store.validateTheme(themeName)) {
      // Could implement temporary theme preview here
      // For now, we'll just log it
      console.log(`Previewing theme: ${themeName}`);
    }
  }, [store]);

  // Theme utilities
  const themeUtils = {
    isDark: effectiveTheme.isDark,
    isTextured: effectiveTheme.isTextured,
    isProfessional: effectiveTheme.category === 'professional',
    isCreative: effectiveTheme.category === 'creative',
    hasEffects: effectiveTheme.isTextured && store.isEffectsEnabled,
    primaryColor: effectiveTheme.colors.primary,
    backgroundStyle: effectiveTheme.name === 'glassmorphism' 
      ? { background: effectiveTheme.colors.background }
      : { backgroundColor: effectiveTheme.colors.background },
  };

  // Performance optimization - memoize theme colors
  const themeColors = {
    primary: effectiveTheme.colors.primary,
    secondary: effectiveTheme.colors.secondary,
    accent: effectiveTheme.colors.accent,
    success: effectiveTheme.colors.success,
    warning: effectiveTheme.colors.warning,
    error: effectiveTheme.colors.error,
    background: effectiveTheme.colors.background,
    surface: effectiveTheme.colors.surface,
    text: effectiveTheme.colors.text,
    border: effectiveTheme.colors.border,
  };

  // Auto-initialize theme on first use
  useEffect(() => {
    if (!store.isInitialized) {
      store.initializeTheme();
    }
  }, [store]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      store.applySystemTheme();
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [store]);

  return {
    // Core state
    currentTheme: store.currentTheme,
    mode: store.mode,
    isInitialized: store.isInitialized,
    availableThemes: store.availableThemes,
    
    // Computed values
    effectiveTheme,
    isSystemDark,
    cssVariables,
    themeColors,
    themeUtils,
    
    // Actions
    setTheme: store.setTheme,
    setMode: store.setMode,
    toggleMode: store.toggleMode,
    initializeTheme: store.initializeTheme,
    resetToDefault: store.resetToDefault,
    
    // Enhanced actions
    switchTheme,
    cycleTheme,
    previewTheme,
    
    // Preferences
    preferences: store.preferences,
    updatePreferences: store.updatePreferences,
    isEffectsEnabled: store.isEffectsEnabled,
    isAnimationsEnabled: store.isAnimationsEnabled,
    toggleEffects: store.toggleEffects,
    toggleAnimations: store.toggleAnimations,
    
    // Utilities
    getCurrentThemeConfig: store.getCurrentThemeConfig,
    getThemeByName: store.getThemeByName,
    getThemesByCategory,
    isCurrentTheme: store.isCurrentTheme,
    isThemeType,
    validateTheme: store.validateTheme,
    preloadTheme: store.preloadTheme,
  };
};

// Specialized hooks for common use cases
export const useCurrentTheme = () => {
  const { currentTheme, effectiveTheme } = useTheme();
  return { currentTheme, effectiveTheme };
};

export const useThemeColors = () => {
  const { themeColors } = useTheme();
  return themeColors;
};

export const useThemeUtils = () => {
  const { themeUtils } = useTheme();
  return themeUtils;
};

export const useThemeMode = () => {
  const { mode, toggleMode, setMode, isSystemDark } = useTheme();
  return { mode, toggleMode, setMode, isSystemDark };
};

export const useThemeEffects = () => {
  const { isEffectsEnabled, isAnimationsEnabled, toggleEffects, toggleAnimations } = useTheme();
  return { isEffectsEnabled, isAnimationsEnabled, toggleEffects, toggleAnimations };
};

// Hook for theme-aware styling
export const useThemeStyles = () => {
  const { effectiveTheme, cssVariables, themeUtils } = useTheme();
  
  const getThemeStyle = useCallback((variant: 'card' | 'button' | 'input' | 'surface') => {
    const baseClasses = {
      card: 'bg-theme-surface border-theme-border text-theme-text-primary',
      button: 'bg-theme-primary text-theme-text-inverse border-theme-primary',
      input: 'bg-theme-surface border-theme-border text-theme-text-primary',
      surface: 'bg-theme-surface text-theme-text-primary',
    };

    const themeSpecificClasses = {
      glassmorphism: {
        card: 'backdrop-blur-lg bg-opacity-70 border-white/20',
        button: 'backdrop-blur-md bg-opacity-80',
        input: 'backdrop-blur-md bg-opacity-70',
        surface: 'backdrop-blur-lg bg-opacity-70',
      },
      neumorphic: {
        card: 'shadow-neu-md',
        button: 'shadow-neu-sm',
        input: 'shadow-neu-inset',
        surface: 'shadow-neu-lg',
      },
    };

    const base = baseClasses[variant];
    const themeSpecific = themeSpecificClasses[effectiveTheme.name as keyof typeof themeSpecificClasses]?.[variant] || '';
    
    return `${base} ${themeSpecific}`.trim();
  }, [effectiveTheme]);

  return {
    effectiveTheme,
    cssVariables,
    themeUtils,
    getThemeStyle,
    
    // Common theme-aware classes
    cardClasses: getThemeStyle('card'),
    buttonClasses: getThemeStyle('button'),
    inputClasses: getThemeStyle('input'),
    surfaceClasses: getThemeStyle('surface'),
  };
};

export default useTheme;