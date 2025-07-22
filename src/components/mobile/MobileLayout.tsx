// src/components/mobile/MobileLayout.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bars3Icon, 
  XMarkIcon,
  BellIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { usePWA } from '../../providers/PWAProvider';
import { TouchButton } from './TouchButton';
import { BottomSheet } from './BottomSheet';

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  headerActions?: React.ReactNode;
  bottomNavigation?: React.ReactNode;
  className?: string;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  title = 'Kairos',
  showBackButton = false,
  onBackClick,
  headerActions,
  bottomNavigation,
  className
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(64);
  const { isInstalled } = usePWA();

  // Adjust for device safe areas
  useEffect(() => {
    const updateSafeAreas = () => {
      const safeAreaTop = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0'
      );
      setHeaderHeight(64 + safeAreaTop);
    };

    updateSafeAreas();
    window.addEventListener('resize', updateSafeAreas);
    return () => window.removeEventListener('resize', updateSafeAreas);
  }, []);

  return (
    <div className={`flex flex-col h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      {/* Mobile Header */}
      <motion.header
        className="relative z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 safe-area-top"
        style={{ height: headerHeight }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center justify-between h-16 px-4">
          {/* Left Section */}
          <div className="flex items-center space-x-3">
            {showBackButton ? (
              <TouchButton
                onClick={onBackClick}
                variant="ghost"
                size="sm"
                icon={XMarkIcon}
                className="text-gray-600 dark:text-gray-300"
              />
            ) : (
              <TouchButton
                onClick={() => setShowMenu(true)}
                variant="ghost"
                size="sm"
                icon={Bars3Icon}
                className="text-gray-600 dark:text-gray-300"
              />
            )}
          </div>

          {/* Center - Title */}
          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {title}
            </h1>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {headerActions}
            <TouchButton
              variant="ghost"
              size="sm"
              icon={BellIcon}
              className="text-gray-600 dark:text-gray-300"
            />
            <TouchButton
              variant="ghost"
              size="sm"
              icon={UserCircleIcon}
              className="text-gray-600 dark:text-gray-300"
            />
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      {bottomNavigation && (
        <div className="safe-area-bottom bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          {bottomNavigation}
        </div>
      )}

      {/* Mobile Menu */}
      <BottomSheet
        isOpen={showMenu}
        onClose={() => setShowMenu(false)}
        title="Menu"
        snapPoints={[0.4, 0.7]}
        initialSnap={0}
      >
        <MobileMenu onClose={() => setShowMenu(false)} />
      </BottomSheet>
    </div>
  );
};

// Mobile Menu Component
const MobileMenu: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const menuItems = [
    { label: 'Dashboard', href: '/', icon: '📊' },
    { label: 'Campaigns', href: '/campaigns', icon: '🚀' },
    { label: 'Moments', href: '/moments', icon: '⏰' },
    { label: 'Atoms', href: '/atoms', icon: '⚛️' },
    { label: 'Analytics', href: '/analytics', icon: '📈' },
    { label: 'Testing', href: '/testing', icon: '🧪' },
    { label: 'Settings', href: '/settings', icon: '⚙️' }
  ];

  return (
    <div className="space-y-4">
      {menuItems.map((item, index) => (
        <motion.a
          key={item.href}
          href={item.href}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          onClick={onClose}
        >
          <span className="text-2xl">{item.icon}</span>
          <span className="text-lg font-medium text-gray-900 dark:text-white">
            {item.label}
          </span>
        </motion.a>
      ))}
    </div>
  );
};

// Safe Area Component
export const SafeArea: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={`safe-area-inset ${className}`}>
    {children}
  </div>
);

// Mobile-optimized Input Component
export const MobileInput: React.FC<{
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'password' | 'search';
  autoFocus?: boolean;
  className?: string;
  error?: string;
}> = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  autoFocus = false,
  className,
  error
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`
          w-full px-4 py-4 text-lg border rounded-xl
          bg-white dark:bg-gray-800
          border-gray-300 dark:border-gray-600
          text-gray-900 dark:text-white
          placeholder-gray-500 dark:placeholder-gray-400
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          touch-manipulation
        `}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

// Mobile-optimized List Component
export const MobileList: React.FC<{
  items: Array<{
    id: string;
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    badge?: string | number;
    action?: React.ReactNode;
    href?: string;
    onClick?: () => void;
  }>;
  className?: string;
}> = ({ items, className }) => {
  return (
    <div className={`divide-y divide-gray-200 dark:divide-gray-700 ${className}`}>
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={`
            flex items-center space-x-4 p-4 
            ${item.onClick || item.href ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''}
            transition-colors
          `}
          onClick={item.onClick}
        >
          {/* Icon */}
          {item.icon && (
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
              {item.icon}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-base font-medium text-gray-900 dark:text-white truncate">
                {item.title}
              </p>
              {item.badge && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {item.badge}
                </span>
              )}
            </div>
            {item.subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {item.subtitle}
              </p>
            )}
          </div>

          {/* Action */}
          {item.action && (
            <div className="flex-shrink-0">
              {item.action}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

// Mobile Performance Monitor
export const MobilePerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<{
    memory?: number;
    connection?: string;
    battery?: number;
    devicePixelRatio?: number;
  }>({});

  useEffect(() => {
    const updateMetrics = () => {
      const newMetrics: typeof metrics = {
        devicePixelRatio: window.devicePixelRatio
      };

      // Memory usage (Chrome only)
      if ('memory' in performance) {
        newMetrics.memory = Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024);
      }

      // Network connection
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        newMetrics.connection = connection.effectiveType;
      }

      setMetrics(newMetrics);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white text-xs p-2 rounded font-mono z-50">
      <div>DPR: {metrics.devicePixelRatio}</div>
      {metrics.memory && <div>Mem: {metrics.memory}MB</div>}
      {metrics.connection && <div>Net: {metrics.connection}</div>}
    </div>
  );
};

// Touch-optimized Modal
export const MobileModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg', 
    xl: 'max-w-xl'
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className={`
            w-full ${sizeClasses[size]} bg-white dark:bg-gray-900 
            rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden
            ${className}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag Handle (mobile only) */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>

          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
              <TouchButton
                onClick={onClose}
                variant="ghost"
                size="sm"
                icon={XMarkIcon}
                className="text-gray-500"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};