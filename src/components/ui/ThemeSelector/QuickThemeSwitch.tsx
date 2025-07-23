// src/components/ui/ThemeSelector/QuickThemeSwitch.tsx
// 🎨 Quick Theme Switch Dropdown for Header

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, PaletteIcon, CheckIcon, SparklesIcon } from 'lucide-react';
import { cn } from '@/utils/dom/classNames';
import { useTheme } from '@/stores/ui/themeStore';
import { THEMES, getThemesByCategory } from '@/config/themes';
import type { ThemeName, QuickThemeSwitchProps } from '@/types/theme';

export const QuickThemeSwitch: React.FC<QuickThemeSwitchProps> = ({
  themes,
  showCurrentTheme = true,
  position = 'bottom',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<ThemeName | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const { 
    currentTheme, 
    setTheme, 
    getCurrentThemeConfig, 
    isEffectsEnabled, 
    toggleEffects,
    mode,
    toggleMode 
  } = useTheme();

  const currentThemeConfig = getCurrentThemeConfig();
  
  // Use provided themes or default popular themes
  const displayThemes = themes || ['deep-tech', 'nordic-frost', 'midnight-elegance', 'glassmorphism'];
  
  // Get theme configs for display
  const themeConfigs = displayThemes.map(name => THEMES[name]).filter(Boolean);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setPreviewTheme(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (event.key === 'Escape') {
        setIsOpen(false);
        setPreviewTheme(null);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleThemeSelect = (themeName: ThemeName) => {
    setTheme(themeName);
    setIsOpen(false);
    setPreviewTheme(null);
  };

  const handleThemePreview = (themeName: ThemeName | null) => {
    setPreviewTheme(themeName);
    // Optional: Apply temporary preview (commented out to avoid flickering)
    // if (themeName && themeName !== currentTheme) {
    //   // Temporarily apply theme for preview
    // }
  };

  const dropdownPositionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2 top-0',
    right: 'left-full ml-2 top-0',
  };

  return (
    <div className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200',
          'bg-theme-surface hover:bg-theme-surface-hover',
          'border border-theme-border hover:border-theme-border-strong',
          'text-theme-text-secondary hover:text-theme-text-primary',
          'focus:outline-none focus:ring-2 focus:ring-theme-primary focus:ring-opacity-20',
          isOpen && 'bg-theme-surface-hover border-theme-primary'
        )}
        aria-label="Switch theme"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <PaletteIcon className="w-4 h-4" />
        
        {showCurrentTheme && (
          <span className="text-sm font-medium hidden sm:inline">
            {currentThemeConfig.displayName}
          </span>
        )}
        
        {/* Current theme indicator */}
        <div 
          className="w-3 h-3 rounded-full border border-white/20 shadow-sm"
          style={{ backgroundColor: currentThemeConfig.colors.primary }}
        />
        
        <ChevronDownIcon 
          className={cn(
            'w-4 h-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={cn(
            'absolute z-50 min-w-64 bg-theme-surface border border-theme-border rounded-xl shadow-xl',
            'backdrop-blur-xl bg-opacity-95',
            dropdownPositionClasses[position],
            'animate-fadeInUp'
          )}
          role="menu"
          aria-orientation="vertical"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-theme-border">
            <h3 className="text-sm font-semibold text-theme-text-primary flex items-center gap-2">
              <PaletteIcon className="w-4 h-4" />
              Choose Theme
            </h3>
          </div>

          {/* Theme Options */}
          <div className="py-2">
            {themeConfigs.map((theme) => (
              <button
                key={theme.name}
                onClick={() => handleThemeSelect(theme.name)}
                onMouseEnter={() => handleThemePreview(theme.name)}
                onMouseLeave={() => handleThemePreview(null)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200',
                  'hover:bg-theme-surface-hover focus:bg-theme-surface-hover',
                  'focus:outline-none focus:ring-2 focus:ring-theme-primary focus:ring-opacity-20 focus:ring-inset',
                  currentTheme === theme.name && 'bg-theme-surface-hover'
                )}
                role="menuitem"
              >
                {/* Theme Preview Circle */}
                <div className="relative flex-shrink-0">
                  <div 
                    className={cn(
                      'w-6 h-6 rounded-full border-2 transition-all duration-200',
                      currentTheme === theme.name 
                        ? 'border-theme-primary' 
                        : 'border-theme-border',
                      theme.isTextured && 'backdrop-blur-sm'
                    )}
                    style={{ 
                      background: theme.isDark 
                        ? theme.colors.background 
                        : theme.preview.gradientFrom !== theme.preview.gradientTo
                          ? `linear-gradient(135deg, ${theme.preview.gradientFrom}, ${theme.preview.gradientTo})`
                          : theme.colors.primary
                    }}
                  />
                  
                  {/* Selected indicator */}
                  {currentTheme === theme.name && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CheckIcon className="w-3 h-3 text-white drop-shadow-sm" />
                    </div>
                  )}
                  
                  {/* Effects indicator */}
                  {theme.isTextured && (
                    <div className="absolute -top-1 -right-1">
                      <SparklesIcon className="w-3 h-3 text-theme-accent" />
                    </div>
                  )}
                </div>

                {/* Theme Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-sm font-medium truncate',
                      currentTheme === theme.name 
                        ? 'text-theme-primary' 
                        : 'text-theme-text-primary'
                    )}>
                      {theme.displayName}
                    </span>
                    
                    {/* Theme tags */}
                    <div className="flex gap-1">
                      {theme.isDark && (
                        <span className="px-1.5 py-0.5 text-xs bg-gray-800 text-white rounded">
                          Dark
                        </span>
                      )}
                      {theme.isTextured && (
                        <span className="px-1.5 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">
                          FX
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs text-theme-text-muted truncate">
                    {theme.description}
                  </p>
                </div>

                {/* Preview indicator */}
                {previewTheme === theme.name && (
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-theme-accent rounded-full animate-pulse" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Footer Controls */}
          <div className="px-4 py-3 border-t border-theme-border space-y-2">
            {/* Effects Toggle */}
            <button
              onClick={toggleEffects}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200',
                'hover:bg-theme-surface-hover focus:bg-theme-surface-hover',
                'focus:outline-none focus:ring-2 focus:ring-theme-primary focus:ring-opacity-20'
              )}
            >
              <span className="text-sm text-theme-text-secondary flex items-center gap-2">
                <SparklesIcon className="w-4 h-4" />
                Visual Effects
              </span>
              <div className={cn(
                'w-10 h-5 rounded-full transition-all duration-200',
                isEffectsEnabled ? 'bg-theme-primary' : 'bg-theme-border'
              )}>
                <div className={cn(
                  'w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200',
                  'mt-0.5',
                  isEffectsEnabled ? 'translate-x-5' : 'translate-x-0.5'
                )} />
              </div>
            </button>

            {/* Mode Toggle */}
            <button
              onClick={toggleMode}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200',
                'hover:bg-theme-surface-hover focus:bg-theme-surface-hover',
                'focus:outline-none focus:ring-2 focus:ring-theme-primary focus:ring-opacity-20'
              )}
            >
              <span className="text-sm text-theme-text-secondary flex items-center gap-2">
                {mode === 'dark' ? '🌙' : mode === 'light' ? '☀️' : '🌓'}
                Mode: {mode}
              </span>
              <ChevronDownIcon className="w-4 h-4 text-theme-text-muted" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickThemeSwitch;