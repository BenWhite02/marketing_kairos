// src/stores/ui/themeStore.ts
// 🎨 Complete Theme Store with 7-Theme Support

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ThemeStore, ThemeName, ThemeMode, ThemeConfig, UserThemePreferences } from '@/types/theme';
import { THEMES, DEFAULT_THEME, getThemeConfig, THEME_LIST, THEMES_BY_CATEGORY } from '@/config/themes';

interface ThemeStoreState extends ThemeStore {
  // Additional state
  preferences: UserThemePreferences;
  systemTheme: ThemeMode;
  isEffectsEnabled: boolean;
  isAnimationsEnabled: boolean;
  
  // Advanced actions
  updatePreferences: (preferences: Partial<UserThemePreferences>) => void;
  toggleEffects: () => void;
  toggleAnimations: () => void;
  applySystemTheme: () => void;
  
  // Theme management
  preloadTheme: (theme: ThemeName) => Promise<void>;
  validateTheme: (theme: ThemeName) => boolean;
}

// System theme detection
const getSystemTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// CSS variables application
const applyCSSVariables = (theme: ThemeConfig) => {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  // Apply base theme variables
  Object.entries(theme.cssVariables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  
  // Apply theme class
  root.setAttribute('data-theme', theme.name);
  
  // Apply mode class for dark/light
  root.classList.toggle('dark', theme.isDark);
  root.classList.toggle('light', !theme.isDark);
  
  // Apply textured class for special effects
  root.classList.toggle('textured', theme.isTextured);
  
  // Apply theme-specific classes
  root.classList.remove(
    'theme-deep-tech', 'theme-nordic-frost', 'theme-midnight-elegance',
    'theme-earth-tech', 'theme-violet-future', 'theme-glassmorphism', 'theme-neumorphic'
  );
  root.classList.add(`theme-${theme.name}`);
};

// Initialize default preferences
const getDefaultPreferences = (): UserThemePreferences => ({
  preferredTheme: DEFAULT_THEME,
  preferredMode: 'system',
  enableEffects: true,
  enableAnimations: true,
  highContrast: false,
  reducedMotion: false,
  lastUpdated: new Date().toISOString(),
});

export const useThemeStore = create<ThemeStoreState>()(
  persist(
    (set, get) => ({
      // Core state
      currentTheme: DEFAULT_THEME,
      mode: 'system',
      availableThemes: THEME_LIST,
      isInitialized: false,
      systemTheme: getSystemTheme(),
      isEffectsEnabled: true,
      isAnimationsEnabled: true,
      preferences: getDefaultPreferences(),

      // Core actions
      setTheme: (theme: ThemeName) => {
        const themeConfig = getThemeConfig(theme);
        if (!themeConfig) {
          console.warn(`Theme "${theme}" not found, using default theme`);
          return;
        }

        set((state) => ({
          currentTheme: theme,
          preferences: {
            ...state.preferences,
            preferredTheme: theme,
            lastUpdated: new Date().toISOString(),
          },
        }));

        applyCSSVariables(themeConfig);
        
        // Dispatch theme change event
        window.dispatchEvent(
          new CustomEvent('theme-changed', {
            detail: { theme, previous: get().currentTheme },
          })
        );
      },

      setMode: (mode: ThemeMode) => {
        set((state) => ({
          mode,
          preferences: {
            ...state.preferences,
            preferredMode: mode,
            lastUpdated: new Date().toISOString(),
          },
        }));

        // Apply the effective theme based on mode
        const { currentTheme } = get();
        const effectiveTheme = get().getCurrentThemeConfig();
        applyCSSVariables(effectiveTheme);

        // Dispatch mode change event
        window.dispatchEvent(
          new CustomEvent('mode-changed', {
            detail: { mode, previous: get().mode },
          })
        );
      },

      toggleMode: () => {
        const { mode } = get();
        const nextMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';
        get().setMode(nextMode);
      },

      initializeTheme: () => {
        const { preferences, currentTheme } = get();
        
        // Apply system theme detection
        get().applySystemTheme();
        
        // Apply the current theme
        const themeConfig = getThemeConfig(currentTheme);
        applyCSSVariables(themeConfig);
        
        // Set up system theme listener
        if (typeof window !== 'undefined') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          mediaQuery.addEventListener('change', get().applySystemTheme);
        }

        set({ isInitialized: true });
      },

      resetToDefault: () => {
        set({
          currentTheme: DEFAULT_THEME,
          mode: 'system',
          preferences: getDefaultPreferences(),
          isEffectsEnabled: true,
          isAnimationsEnabled: true,
        });

        const defaultThemeConfig = getThemeConfig(DEFAULT_THEME);
        applyCSSVariables(defaultThemeConfig);
      },

      // Getters
      getCurrentThemeConfig: () => {
        const { currentTheme, mode, systemTheme } = get();
        const baseConfig = getThemeConfig(currentTheme);
        
        // For system mode, use system preference
        if (mode === 'system') {
          // If current theme doesn't match system preference, find appropriate alternative
          if (systemTheme === 'dark' && !baseConfig.isDark) {
            // Switch to midnight elegance for dark system preference
            return getThemeConfig('midnight-elegance');
          }
          if (systemTheme === 'light' && baseConfig.isDark) {
            // Switch to deep tech for light system preference
            return getThemeConfig('deep-tech');
          }
        }
        
        return baseConfig;
      },

      getThemeByName: (name: ThemeName) => {
        return THEMES[name];
      },

      getThemesByCategory: (category) => {
        return THEMES_BY_CATEGORY[category];
      },

      isCurrentTheme: (name: ThemeName) => {
        return get().currentTheme === name;
      },

      // Advanced actions
      updatePreferences: (newPreferences) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...newPreferences,
            lastUpdated: new Date().toISOString(),
          },
        }));
      },

      toggleEffects: () => {
        set((state) => {
          const newEffectsEnabled = !state.isEffectsEnabled;
          
          // Apply effects toggle to DOM
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('effects-disabled', !newEffectsEnabled);
          }

          return {
            isEffectsEnabled: newEffectsEnabled,
            preferences: {
              ...state.preferences,
              enableEffects: newEffectsEnabled,
              lastUpdated: new Date().toISOString(),
            },
          };
        });
      },

      toggleAnimations: () => {
        set((state) => {
          const newAnimationsEnabled = !state.isAnimationsEnabled;
          
          // Apply animations toggle to DOM
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('animations-disabled', !newAnimationsEnabled);
          }

          return {
            isAnimationsEnabled: newAnimationsEnabled,
            preferences: {
              ...state.preferences,
              enableAnimations: newAnimationsEnabled,
              lastUpdated: new Date().toISOString(),
            },
          };
        });
      },

      applySystemTheme: () => {
        const systemTheme = getSystemTheme();
        set({ systemTheme });

        // If mode is system, re-apply theme
        const { mode } = get();
        if (mode === 'system') {
          const effectiveTheme = get().getCurrentThemeConfig();
          applyCSSVariables(effectiveTheme);
        }
      },

      preloadTheme: async (theme: ThemeName) => {
        // Preload theme assets if needed
        const themeConfig = getThemeConfig(theme);
        if (!themeConfig) return;

        // For textured themes, preload additional assets
        if (themeConfig.isTextured) {
          // Preload any CSS files or assets specific to textured themes
          if (theme === 'glassmorphism') {
            // Preload glassmorphism specific assets
          } else if (theme === 'neumorphic') {
            // Preload neumorphic specific assets
          }
        }
      },

      validateTheme: (theme: ThemeName) => {
        return THEMES.hasOwnProperty(theme);
      },
    }),
    {
      name: 'kairos-theme-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentTheme: state.currentTheme,
        mode: state.mode,
        preferences: state.preferences,
        isEffectsEnabled: state.isEffectsEnabled,
        isAnimationsEnabled: state.isAnimationsEnabled,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Initialize theme on rehydration
          setTimeout(() => {
            state.initializeTheme();
          }, 0);
        }
      },
    }
  )
);

// Hook for easy access to theme context
export const useTheme = () => {
  const store = useThemeStore();
  
  return {
    ...store,
    effectiveTheme: store.getCurrentThemeConfig(),
    isSystemDark: store.systemTheme === 'dark',
    cssVariables: store.getCurrentThemeConfig().cssVariables,
  };
};

// Selectors for performance optimization
export const useCurrentTheme = () => useThemeStore((state) => state.currentTheme);
export const useCurrentThemeConfig = () => useThemeStore((state) => state.getCurrentThemeConfig());
export const useThemeMode = () => useThemeStore((state) => state.mode);
export const useThemePreferences = () => useThemeStore((state) => state.preferences);
export const useIsEffectsEnabled = () => useThemeStore((state) => state.isEffectsEnabled);
export const useIsAnimationsEnabled = () => useThemeStore((state) => state.isAnimationsEnabled);

export default useThemeStore;