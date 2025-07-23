// src/components/ui/ThemeSelector/ThemeSelector.tsx
// Complete Theme Selection Interface with Live Preview
// Author: Sankhadeep Banerjee

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PaintBrushIcon, 
  SwatchIcon, 
  EyeIcon,
  HeartIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  CheckIcon,
  StarIcon,
  BeakerIcon,
  BuildingOfficeIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useTheme } from '@/hooks/useTheme';
import { THEME_CATEGORIES, type ThemeName, type Theme } from '@/config/themes';
import { cn } from '@/utils/dom/classNames';

interface ThemeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface ThemePreviewCardProps {
  theme: Theme;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  onPreview: () => void;
}

// Category icons mapping
const categoryIcons = {
  professional: BuildingOfficeIcon,
  creative: SparklesIcon,
  textured: BeakerIcon,
};

// Theme preview card component
const ThemePreviewCard: React.FC<ThemePreviewCardProps> = ({
  theme,
  isSelected,
  isFavorite,
  onSelect,
  onToggleFavorite,
  onPreview,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={cn(
        'relative bg-white rounded-xl border-2 cursor-pointer transition-all duration-300 overflow-hidden group',
        isSelected 
          ? 'border-blue-500 shadow-lg shadow-blue-100' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      {/* Theme preview gradient */}
      <div 
        className="h-24 w-full relative overflow-hidden"
        style={{ background: theme.preview.gradient }}
      >
        {/* Pattern overlay for textured themes */}
        {theme.category === 'textured' && (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/20" />
            <div 
              className="absolute inset-0 mix-blend-overlay"
              style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 2px, transparent 2px),
                                 radial-gradient(circle at 75% 75%, rgba(255,255,255,0.2) 2px, transparent 2px)`,
                backgroundSize: '20px 20px',
              }}
            />
          </div>
        )}

        {/* Selection indicator */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
            >
              <CheckIcon className="w-4 h-4 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview button */}
        <AnimatePresence>
          {isHovered && !isSelected && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                onPreview();
              }}
              className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
            >
              <EyeIcon className="w-4 h-4 text-gray-700" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="absolute top-2 left-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
        >
          {isFavorite ? (
            <HeartSolidIcon className="w-4 h-4 text-red-500" />
          ) : (
            <HeartIcon className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {/* Theme badges */}
        <div className="absolute bottom-2 left-2 flex space-x-1">
          {theme.isNew && (
            <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
              New
            </span>
          )}
          {theme.isBeta && (
            <span className="px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
              Beta
            </span>
          )}
          {theme.isEnterprise && (
            <span className="px-2 py-1 bg-purple-500 text-white text-xs font-medium rounded-full">
              Enterprise
            </span>
          )}
        </div>
      </div>

      {/* Theme info */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              {theme.name}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {theme.description}
            </p>
          </div>
          
          {/* Category indicator */}
          <div className="ml-2 flex-shrink-0">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: theme.preview.accent }}
            />
          </div>
        </div>

        {/* Effects indicators */}
        {theme.effects && (
          <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-100">
            {theme.effects.glassmorphism && (
              <div className="flex items-center space-x-1 text-xs text-blue-600">
                <div className="w-2 h-2 bg-blue-500/30 backdrop-blur-sm border border-blue-300 rounded" />
                <span>Glass</span>
              </div>
            )}
            {theme.effects.neumorphic && (
              <div className="flex items-center space-x-1 text-xs text-gray-600">
                <div className="w-2 h-2 bg-gray-200 rounded shadow-inner" />
                <span>Soft</span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Main theme selector component
export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  isOpen,
  onClose,
  className,
}) => {
  const {
    currentTheme,
    allThemes,
    setTheme,
    addFavorite,
    removeFavorite,
    isFavorite,
    enableGlassmorphism,
    enableNeumorphic,
    enableAnimations,
    toggleGlassmorphism,
    toggleNeumorphic,
    toggleAnimations,
    devicePerformance,
    supportsAdvancedEffects,
  } = useTheme();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewTheme, setPreviewTheme] = useState<ThemeName | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Filter themes by category
  const filteredThemes = useMemo(() => {
    if (selectedCategory === 'all') return allThemes;
    if (selectedCategory === 'favorites') {
      return allThemes.filter(theme => isFavorite(theme.id as ThemeName));
    }
    return allThemes.filter(theme => theme.category === selectedCategory);
  }, [allThemes, selectedCategory, isFavorite]);

  // Handle theme selection
  const handleThemeSelect = (themeName: ThemeName) => {
    setTheme(themeName);
    setPreviewTheme(null);
  };

  // Handle theme preview
  const handleThemePreview = (themeName: ThemeName) => {
    setPreviewTheme(themeName);
    // Apply preview temporarily
    setTimeout(() => setPreviewTheme(null), 3000);
  };

  // Handle favorite toggle
  const handleToggleFavorite = (themeName: ThemeName) => {
    if (isFavorite(themeName)) {
      removeFavorite(themeName);
    } else {
      addFavorite(themeName);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className={cn(
          'absolute right-0 top-0 h-full w-full max-w-4xl bg-white shadow-2xl',
          className
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <PaintBrushIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Choose Your Theme
                </h2>
                <p className="text-sm text-gray-600">
                  Customize your Kairos experience
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Performance warning */}
          {(devicePerformance === 'low' || !supportsAdvancedEffects) && (
            <div className="mx-6 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 text-amber-600 mt-0.5">⚠️</div>
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Performance Notice</p>
                  <p>
                    {devicePerformance === 'low' 
                      ? 'Advanced effects may impact performance on this device.'
                      : 'Your browser has limited support for advanced effects.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Category tabs */}
          <div className="px-6 pt-6">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={cn(
                  'flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  selectedCategory === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                All Themes
              </button>
              
              {THEME_CATEGORIES.map((category) => {
                const Icon = categoryIcons[category.id];
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      'flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center space-x-2',
                      selectedCategory === category.id
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{category.name}</span>
                  </button>
                );
              })}
              
              <button
                onClick={() => setSelectedCategory('favorites')}
                className={cn(
                  'flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center space-x-2',
                  selectedCategory === 'favorites'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <StarIcon className="w-4 h-4" />
                <span>Favorites</span>
              </button>
            </div>
          </div>

          {/* Theme grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredThemes.length === 0 ? (
              <div className="text-center py-12">
                <SwatchIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No themes found
                </h3>
                <p className="text-gray-600">
                  {selectedCategory === 'favorites' 
                    ? 'You haven\'t favorited any themes yet.'
                    : 'Try a different category.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredThemes.map((theme) => (
                  <ThemePreviewCard
                    key={theme.id}
                    theme={theme}
                    isSelected={currentTheme === theme.id}
                    isFavorite={isFavorite(theme.id as ThemeName)}
                    onSelect={() => handleThemeSelect(theme.id as ThemeName)}
                    onToggleFavorite={() => handleToggleFavorite(theme.id as ThemeName)}
                    onPreview={() => handleThemePreview(theme.id as ThemeName)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Advanced settings */}
          <div className="border-t border-gray-200 p-6">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
              <span>Advanced Settings</span>
              <motion.div
                animate={{ rotate: showAdvanced ? 180 : 0 }}
                className="w-4 h-4"
              >
                ↓
              </motion.div>
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-4"
                >
                  {/* Glassmorphism toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">
                        Glassmorphism Effects
                      </label>
                      <p className="text-xs text-gray-600">
                        Frosted glass transparency effects
                      </p>
                    </div>
                    <button
                      onClick={toggleGlassmorphism}
                      disabled={!supportsAdvancedEffects}
                      className={cn(
                        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                        enableGlassmorphism 
                          ? 'bg-blue-600' 
                          : 'bg-gray-200',
                        !supportsAdvancedEffects && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                          enableGlassmorphism ? 'translate-x-6' : 'translate-x-1'
                        )}
                      />
                    </button>
                  </div>

                  {/* Neumorphic toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">
                        Neumorphic Effects
                      </label>
                      <p className="text-xs text-gray-600">
                        Soft, tactile depth effects
                      </p>
                    </div>
                    <button
                      onClick={toggleNeumorphic}
                      className={cn(
                        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                        enableNeumorphic ? 'bg-blue-600' : 'bg-gray-200'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                          enableNeumorphic ? 'translate-x-6' : 'translate-x-1'
                        )}
                      />
                    </button>
                  </div>

                  {/* Animations toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">
                        Animations
                      </label>
                      <p className="text-xs text-gray-600">
                        Smooth transitions and micro-interactions
                      </p>
                    </div>
                    <button
                      onClick={toggleAnimations}
                      className={cn(
                        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                        enableAnimations ? 'bg-blue-600' : 'bg-gray-200'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                          enableAnimations ? 'translate-x-6' : 'translate-x-1'
                        )}
                      />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Export types for convenience
export type { ThemeSelectorProps, ThemePreviewCardProps };

// Default export for the main component
export default ThemeSelector;