// src/components/ui/Header.tsx
// 🎨 Enhanced Header with Theme Selector Integration

import React from 'react';
import { MenuIcon, UserIcon, LogOutIcon } from 'lucide-react';
import { cn } from '@/utils/dom/classNames';
import { useTheme } from '@/hooks/useTheme';
import { QuickThemeSwitch } from '@/components/ui/ThemeSelector';

interface HeaderProps {
  onSidebarToggle: () => void;
  sidebarOpen: boolean;
  user: any; // Replace with your User type
  onLogout: () => void;
}

/**
 * Enhanced Header component with theme integration
 * Provides theme selector, user menu, and responsive navigation
 */
const Header: React.FC<HeaderProps> = ({
  onSidebarToggle,
  sidebarOpen,
  user,
  onLogout
}) => {
  const { effectiveTheme, themeUtils } = useTheme();

  return (
    <header className={cn(
      'sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8',
      'transition-all duration-300',
      // Theme-aware styling
      'bg-theme-surface border-b border-theme-border',
      // Glass theme specific
      effectiveTheme.name === 'glassmorphism' && [
        'backdrop-blur-xl bg-opacity-90',
        'border-b border-white/20'
      ],
      // Neumorphic theme specific  
      effectiveTheme.name === 'neumorphic' && [
        'shadow-neu-sm'
      ],
      // Dark theme specific
      themeUtils.isDark && [
        'shadow-lg'
      ]
    )}>
      {/* Mobile menu button */}
      <button
        type="button"
        className={cn(
          '-m-2.5 p-2.5 lg:hidden',
          'text-theme-text-secondary hover:text-theme-text-primary',
          'rounded-md transition-colors duration-200',
          'hover:bg-theme-surface-hover focus:outline-none focus:ring-2 focus:ring-theme-primary focus:ring-opacity-20'
        )}
        onClick={onSidebarToggle}
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        <MenuIcon className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-theme-border lg:hidden" />

      {/* Header content */}
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        {/* Left side - Logo/Brand (when sidebar is closed) */}
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {!sidebarOpen && (
            <div className="hidden lg:flex lg:items-center">
              <div className={cn(
                'text-xl font-bold transition-colors duration-200',
                'text-theme-primary'
              )}>
                Kairos
              </div>
            </div>
          )}
        </div>

        {/* Right side - Theme selector and user menu */}
        <div className="ml-auto flex items-center gap-x-4 lg:gap-x-6">
          {/* Theme Selector */}
          <QuickThemeSwitch 
            showCurrentTheme={true}
            position="bottom"
            className="hidden sm:block"
          />

          {/* User menu separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-theme-border" />

          {/* User menu */}
          <div className="relative">
            <div className="flex items-center gap-x-3">
              {/* User info */}
              {user && (
                <div className="hidden sm:flex sm:flex-col sm:items-end">
                  <div className={cn(
                    'text-sm font-semibold leading-6',
                    'text-theme-text-primary'
                  )}>
                    {user.name || user.email}
                  </div>
                  <div className={cn(
                    'text-xs leading-5',
                    'text-theme-text-muted'
                  )}>
                    {user.role || 'User'}
                  </div>
                </div>
              )}

              {/* User avatar */}
              <button
                type="button"
                className={cn(
                  'flex items-center justify-center h-8 w-8 rounded-full transition-all duration-200',
                  'bg-theme-surface-hover hover:bg-theme-surface-active',
                  'border-2 border-theme-border hover:border-theme-primary',
                  'focus:outline-none focus:ring-2 focus:ring-theme-primary focus:ring-opacity-20',
                  // Glass theme specific
                  effectiveTheme.name === 'glassmorphism' && [
                    'backdrop-blur-md bg-white/10 border-white/20',
                    'hover:bg-white/20 hover:border-white/40'
                  ],
                  // Neumorphic theme specific
                  effectiveTheme.name === 'neumorphic' && [
                    'shadow-neu-sm hover:shadow-neu-md'
                  ]
                )}
                aria-label="User menu"
              >
                {user?.avatar ? (
                  <img
                    className="h-6 w-6 rounded-full object-cover"
                    src={user.avatar}
                    alt={user.name || 'User avatar'}
                  />
                ) : (
                  <UserIcon className={cn(
                    'h-4 w-4',
                    'text-theme-text-secondary'
                  )} />
                )}
              </button>

              {/* Logout button */}
              <button
                type="button"
                onClick={onLogout}
                className={cn(
                  'flex items-center justify-center h-8 w-8 rounded-md transition-all duration-200',
                  'text-theme-text-secondary hover:text-theme-error',
                  'hover:bg-theme-surface-hover focus:outline-none focus:ring-2 focus:ring-theme-error focus:ring-opacity-20',
                  // Glass theme specific
                  effectiveTheme.name === 'glassmorphism' && [
                    'hover:backdrop-blur-md hover:bg-red-500/10'
                  ],
                  // Neumorphic theme specific
                  effectiveTheme.name === 'neumorphic' && [
                    'hover:shadow-neu-sm'
                  ]
                )}
                aria-label="Logout"
                title="Logout"
              >
                <LogOutIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Theme indicator for mobile */}
      <div className="sm:hidden">
        <QuickThemeSwitch 
          showCurrentTheme={false}
          position="bottom"
        />
      </div>
    </header>
  );
};

export default Header;