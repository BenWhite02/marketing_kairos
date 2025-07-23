// src/components/ui/Sidebar.tsx
// File path: src/components/ui/Sidebar.tsx
// Enhanced Sidebar Navigation Component for Kairos - Complete Navigation Structure
// Updated with all planned routes from Strategic Implementation Roadmap

import React, { useState, useMemo } from 'react';
import { Link, useLocation, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/Badge';
import { NAVIGATION, type NavigationItem } from '@/constants/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { cn } from '@/utils/dom/classNames';

/**
 * KAIROS - Enhanced Sidebar Navigation
 * Complete navigation structure with all planned features from roadmap
 * Supports nested navigation, badges, permissions, and responsive design
 * Features: collapsible sections, active states, smooth animations, role-based visibility
 */

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onToggle?: () => void; // For mobile compatibility
}

interface NavItemProps {
  item: NavigationItem;
  level: number;
  isCollapsed: boolean;
  pathname: string;
}

// Icon placeholder component (replace with actual icon library)
const IconPlaceholder: React.FC<{ name: string; className?: string }> = ({ name, className = "h-5 w-5" }) => {
  const iconMap: Record<string, string> = {
    home: '🏠',
    brain: '🧠',
    atom: '⚛️',
    clock: '⏰',
    megaphone: '📢',
    users: '👥',
    'chart-bar': '📊',
    beaker: '🧪',
    plug: '🔌',
    monitor: '🖥️',
    'office-building': '🏢',
    cog: '⚙️',
    robot: '🤖',
    zap: '⚡',
    database: '🗄️',
    layers: '📚',
    lightbulb: '💡',
    'flow-chart': '📊',
    library: '📚',
    'plus-circle': '➕',
    'puzzle-piece': '🧩',
    'bar-chart': '📊',
    flask: '🧪',
    collection: '📁',
    wrench: '🔧',
    template: '📋',
    calendar: '📅',
    'chart-pie': '🥧',
    list: '📝',
    edit: '✏️',
    route: '🛣️',
    'calendar-check': '✅',
    link: '🔗',
    'chart-area': '📈',
    user: '👤',
    filter: '🔍',
    path: '🛤️',
    upload: '📤',
    'chart-line': '📈',
    'document-report': '📄',
    'document-add': '📄➕',
    pulse: '💓',
    'crystal-ball': '🔮',
    shuffle: '🔀',
    'test-tube': '🧪',
    'chart-square-bar': '📊',
    calculator: '🧮',
    trophy: '🏆',
    grid: '▦',
    'shopping-bag': '🛍️',
    mail: '📧',
    server: '🖥️',
    'switch-horizontal': '🔄',
    refresh: '🔄',
    'desktop-computer': '🖥️',
    'status-online': '🟢',
    exclamation: '❗',
    speedometer: '🏁',
    'view-grid': '▦',
    'user-group': '👥',
    'color-swatch': '🎨',
    'shield-check': '🛡️',
    key: '🔑',
    'clipboard-check': '📋✅',
    adjustments: '⚙️',
    'user-circle': '👤',
    identification: '🆔',
    bell: '🔔',
    'credit-card': '💳'
  };

  return (
    <span className={cn("inline-flex items-center justify-center", className)}>
      {iconMap[name] || '📄'}
    </span>
  );
};

// Navigation item component
const NavItem: React.FC<NavItemProps> = ({ item, level, isCollapsed, pathname }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.path === pathname;
  const isParentActive = item.children?.some(child => 
    child.path === pathname || child.children?.some(grandchild => grandchild.path === pathname)
  );

  // Auto-expand if this section contains active item
  React.useEffect(() => {
    if (isParentActive && !isCollapsed) {
      setIsExpanded(true);
    }
  }, [isParentActive, isCollapsed]);

  // Toggle expansion
  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasChildren && !isCollapsed) {
      setIsExpanded(!isExpanded);
    }
  };

  // Render icon
  const renderIcon = () => (
    <IconPlaceholder 
      name={item.icon} 
      className={cn(
        'h-5 w-5 transition-colors duration-200',
        isActive || isParentActive ? 'text-primary-600' : 'text-gray-500 group-hover:text-gray-700'
      )}
    />
  );

  // Render badge
  const renderBadge = () => {
    if (!item.badge && !item.isNew && !item.isBeta && !item.isEnterprise) return null;

    if (item.isNew) {
      return <Badge variant="success" size="sm">New</Badge>;
    }
    if (item.isBeta) {
      return <Badge variant="warning" size="sm">Beta</Badge>;
    }
    if (item.isEnterprise) {
      return <Badge variant="primary" size="sm">Enterprise</Badge>;
    }
    if (item.badge) {
      return <Badge variant="secondary" size="sm">{item.badge}</Badge>;
    }
    return null;
  };

  // Main item content
  const ItemContent = (
    <div
      className={cn(
        'group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer',
        level > 0 && 'ml-6 text-xs',
        isActive
          ? 'bg-primary-50 text-primary-700 shadow-sm'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
        isCollapsed && 'px-2 justify-center'
      )}
      onClick={hasChildren ? handleToggle : undefined}
    >
      <div className="flex items-center min-w-0 flex-1">
        {renderIcon()}
        {!isCollapsed && (
          <span className="ml-3 truncate">{item.label}</span>
        )}
      </div>

      {!isCollapsed && (
        <div className="flex items-center space-x-2">
          {renderBadge()}
          {hasChildren && (
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="p-1"
            >
              <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            </motion.div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <li>
      {item.path ? (
        <NavLink
          to={item.path}
          className={({ isActive: isLinkActive }) => {
            const active = isLinkActive || isActive;
            return cn(
              'block',
              active && 'border-r-2 border-primary-600'
            );
          }}
        >
          {ItemContent}
        </NavLink>
      ) : (
        <div>{ItemContent}</div>
      )}

      {/* Children */}
      {hasChildren && !isCollapsed && (
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <ul className="mt-1 space-y-1">
                {item.children?.map((child) => (
                  <NavItem
                    key={child.id}
                    item={child}
                    level={level + 1}
                    isCollapsed={isCollapsed}
                    pathname={pathname}
                  />
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </li>
  );
};

// Main Sidebar component
export const Sidebar: React.FC<SidebarProps> = ({ 
  isCollapsed = false, 
  onToggleCollapse,
  onToggle 
}) => {
  const { pathname } = useLocation();
  const { user } = useAuth();

  // Filter navigation based on user permissions
  const filteredNavigation = useMemo(() => {
    // For now, return all navigation items
    // TODO: Implement permission-based filtering based on user roles
    return NAVIGATION;
  }, [user]);

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-white border-r border-gray-200 shadow-sm transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className={cn(
        'flex items-center justify-between h-16 px-6 border-b border-gray-200',
        isCollapsed && 'px-2 justify-center'
      )}>
        <motion.div
          className="flex items-center space-x-3"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {isCollapsed ? (
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">K</span>
            </div>
          ) : (
            <>
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                  Kairos
                </h1>
                <p className="text-xs text-gray-500 -mt-1">Perfect Moments</p>
              </div>
            </>
          )}
        </motion.div>

        {/* Close button for mobile */}
        <button
          onClick={onToggle}
          className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        {filteredNavigation.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <NavItem
              item={item}
              level={0}
              isCollapsed={isCollapsed}
              pathname={pathname}
            />
          </motion.div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className={cn(
        'border-t border-gray-200 p-4',
        isCollapsed && 'p-2'
      )}>
        <button
          onClick={onToggleCollapse}
          className={cn(
            'w-full flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200',
            isCollapsed && 'px-2'
          )}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-5 w-5" />
          ) : (
            <>
              <ChevronDownIcon className="h-5 w-5 mr-2 rotate-90" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* User Section */}
      {!isCollapsed && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <motion.div
            className="flex items-center space-x-3 p-3 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white font-semibold text-sm">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.name || 'John Doe'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.role || 'Administrator'}
              </p>
            </div>
            <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
              <IconPlaceholder name="cog" className="h-4 w-4" />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;