// src/components/ui/ThemeSelector/ThemePreview.tsx
// 🎨 Individual Theme Preview Component with Live Preview

import React, { useState } from 'react';
import { cn } from '@/utils/dom/classNames';
import type { ThemeConfig, ThemeName, ThemePreviewProps } from '@/types/theme';
import { useTheme } from '@/stores/ui/themeStore';

interface ExtendedThemePreviewProps extends ThemePreviewProps {
  onPreview?: (theme: ThemeName | null) => void;
  showLivePreview?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ThemePreview: React.FC<ExtendedThemePreviewProps> = ({
  theme,
  isSelected = false,
  showEffects = true,
  onClick,
  onPreview,
  showLivePreview = false,
  size = 'md',
  className,
}) => {
  const { currentTheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const isCurrentTheme = currentTheme === theme.name;

  const handleClick = () => {
    onClick?.(theme.name);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (showLivePreview) {
      onPreview?.(theme.name);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (showLivePreview) {
      onPreview?.(null);
    }
  };

  // Fixed: Proper object syntax with colons
  const sizeClasses = {
    'sm': 'w-24 h-16',
    'md': 'w-32 h-20',
    'lg': 'w-40 h-24',
  };

  const cardSizeClasses = {
    'sm': 'p-2',
    'md': 'p-3',
    'lg': 'p-4',
  };

  return (
    <div
      className={cn(
        'group relative cursor-pointer transition-all duration-300',
        'hover:scale-105 hover:z-10',
        className
      )}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Preview Container */}
      <div
        className={cn(
          'relative overflow-hidden rounded-lg border-2 transition-all duration-300',
          sizeClasses[size],
          isSelected || isCurrentTheme
            ? 'border-blue-500 ring-2 ring-blue-200'
            : 'border-gray-200 hover:border-gray-300',
          theme.isTextured && 'backdrop-blur-sm'
        )}
        style={{
          background: theme.isDark 
            ? theme.colors.background 
            : theme.preview.gradientFrom !== theme.preview.gradientTo
              ? `linear-gradient(135deg, ${theme.preview.gradientFrom}, ${theme.preview.gradientTo})`
              : theme.colors.background,
        }}
      >
        {/* Theme-specific Background Effects */}
        {theme.name === 'glassmorphism' && (
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-600/20" />
            <div className="absolute inset-0 backdrop-blur-sm" />
          </div>
        )}
        
        {theme.name === 'neumorphic' && (
          <div className="absolute inset-0">
            <div 
              className="w-full h-full"
              style={{
                background: '#f9fafb',
                backgroundImage: `
                  radial-gradient(circle at 25% 25%, #ffffff 1px, transparent 1px),
                  radial-gradient(circle at 75% 75%, #e5e7eb 0.5px, transparent 0.5px)
                `,
                backgroundSize: '12px 12px',
                backgroundPosition: '0 0, 6px 6px'
              }}
            />
          </div>
        )}

        {/* Preview Content */}
        <div className={cn('relative h-full flex flex-col', cardSizeClasses[size])}>
          {/* Header Bar */}
          <div className="flex items-center justify-between mb-auto">
            <div className="flex space-x-1">
              {/* Window Controls */}
              <div 
                className={cn(
                  'w-2 h-2 rounded-full',
                  size === 'sm' ? 'w-1.5 h-1.5' : size === 'lg' ? 'w-2.5 h-2.5' : 'w-2 h-2'
                )}
                style={{ backgroundColor: '#ef4444' }}
              />
              <div 
                className={cn(
                  'w-2 h-2 rounded-full',
                  size === 'sm' ? 'w-1.5 h-1.5' : size === 'lg' ? 'w-2.5 h-2.5' : 'w-2 h-2'
                )}
                style={{ backgroundColor: '#f59e0b' }}
              />
              <div 
                className={cn(
                  'w-2 h-2 rounded-full',
                  size === 'sm' ? 'w-1.5 h-1.5' : size === 'lg' ? 'w-2.5 h-2.5' : 'w-2 h-2'
                )}
                style={{ backgroundColor: '#22c55e' }}
              />
            </div>
            
            {/* Status Indicator */}
            {(isSelected || isCurrentTheme) && (
              <div className="flex items-center">
                <svg 
                  className={cn(
                    'text-blue-500',
                    size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
                  )} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col justify-center space-y-1">
            {/* Primary Color Bar */}
            <div 
              className={cn(
                'rounded transition-all duration-300',
                size === 'sm' ? 'h-1' : size === 'lg' ? 'h-2' : 'h-1.5',
                theme.name === 'neumorphic' ? 'shadow-inner' : '',
                theme.name === 'glassmorphism' ? 'backdrop-blur-sm border border-white/20' : ''
              )}
              style={{ 
                backgroundColor: theme.colors.primary,
                ...(theme.name === 'neumorphic' && {
                  boxShadow: 'inset 1px 1px 2px #d1d5db, inset -1px -1px 2px #ffffff'
                }),
                ...(theme.name === 'glassmorphism' && {
                  background: `rgba(${hexToRgb(theme.colors.primary)}, 0.7)`,
                  backdropFilter: 'blur(4px)'
                })
              }}
            />
            
            {/* Secondary Color Bar */}
            <div 
              className={cn(
                'rounded transition-all duration-300',
                size === 'sm' ? 'h-0.5 w-3/4' : size === 'lg' ? 'h-1.5 w-3/4' : 'h-1 w-3/4',
                theme.name === 'neumorphic' ? 'shadow-inner' : '',
                theme.name === 'glassmorphism' ? 'backdrop-blur-sm border border-white/10' : ''
              )}
              style={{ 
                backgroundColor: theme.colors.secondary,
                ...(theme.name === 'neumorphic' && {
                  boxShadow: 'inset 1px 1px 1px #d1d5db, inset -1px -1px 1px #ffffff'
                }),
                ...(theme.name === 'glassmorphism' && {
                  background: `rgba(${hexToRgb(theme.colors.secondary)}, 0.5)`,
                  backdropFilter: 'blur(4px)'
                })
              }}
            />
            
            {/* Accent Color Dot */}
            <div className="flex justify-end">
              <div 
                className={cn(
                  'rounded-full transition-all duration-300',
                  size === 'sm' ? 'w-1.5 h-1.5' : size === 'lg' ? 'w-3 h-3' : 'w-2 h-2',
                  theme.name === 'neumorphic' ? 'shadow-sm' : '',
                  theme.name === 'glassmorphism' ? 'backdrop-blur-sm border border-white/20' : ''
                )}
                style={{ 
                  backgroundColor: theme.colors.accent,
                  ...(theme.name === 'neumorphic' && {
                    boxShadow: '1px 1px 2px #d1d5db, -1px -1px 2px #ffffff'
                  }),
                  ...(theme.name === 'glassmorphism' && {
                    background: `rgba(${hexToRgb(theme.colors.accent)}, 0.8)`,
                    backdropFilter: 'blur(2px)'
                  })
                }}
              />
            </div>
          </div>
        </div>

        {/* Hover Overlay */}
        <div className={cn(
          'absolute inset-0 bg-black/10 opacity-0 transition-opacity duration-300',
          'group-hover:opacity-100',
          theme.isDark && 'bg-white/10'
        )} />

        {/* Effect Indicators */}
        {showEffects && theme.isTextured && (
          <div className="absolute top-1 right-1 flex space-x-1">
            {theme.name === 'glassmorphism' && (
              <div className="w-2 h-2 bg-white/30 backdrop-blur-sm rounded-full border border-white/20" />
            )}
            {theme.name === 'neumorphic' && (
              <div 
                className="w-2 h-2 rounded-full"
                style={{
                  background: 'linear-gradient(145deg, #f0f0f0, #cacaca)',
                  boxShadow: '1px 1px 2px #d1d5db, -1px -1px 2px #ffffff'
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Theme Info */}
      <div className="mt-2 text-center">
        <h3 className={cn(
          'font-medium transition-colors duration-200',
          size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs',
          isSelected || isCurrentTheme ? 'text-blue-600' : 'text-gray-700',
          'group-hover:text-gray-900'
        )}>
          {theme.displayName}
        </h3>
        
        {size !== 'sm' && (
          <p className={cn(
            'text-xs text-gray-500 mt-0.5 transition-colors duration-200',
            'group-hover:text-gray-600'
          )}>
            {theme.category}
          </p>
        )}
        
        {/* Theme Tags */}
        {size === 'lg' && (
          <div className="flex justify-center gap-1 mt-1">
            {theme.isDark && (
              <span className="px-1.5 py-0.5 text-xs bg-gray-800 text-white rounded">
                Dark
              </span>
            )}
            {theme.isTextured && (
              <span className="px-1.5 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">
                Effects
              </span>
            )}
          </div>
        )}
      </div>

      {/* Selection Ring Animation */}
      {(isSelected || isCurrentTheme) && (
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg opacity-20 animate-pulse" />
      )}

      {/* Hover Ring */}
      {isHovered && !isSelected && !isCurrentTheme && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-400 to-gray-600 rounded-lg opacity-20" />
      )}
    </div>
  );
};

// Helper function to convert hex to RGB
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';
  
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ].join(', ');
}

export default ThemePreview;