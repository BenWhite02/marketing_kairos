// File: src/components/ui/Sidebar.tsx
// Enhanced Sidebar Navigation Component for Kairos - Professional Style
// Author: Sankhadeep Banerjee

import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  BeakerIcon,
  ClockIcon,
  MegaphoneIcon,
  ChartBarIcon,
  CogIcon,
  ChevronRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  badge?: string;
  children?: NavigationItem[];
}

interface SidebarProps {
  onToggle?: () => void;
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { 
    name: 'Atoms', 
    href: '/atoms', 
    icon: BeakerIcon,
    badge: '156',
    children: [
      { name: 'Library', href: '/atoms/library', icon: BeakerIcon },
      { name: 'Builder', href: '/atoms/builder', icon: BeakerIcon },
      { name: 'Analytics', href: '/atoms/analytics', icon: BeakerIcon },
    ]
  },
  { 
    name: 'Moments', 
    href: '/moments', 
    icon: ClockIcon,
    badge: '89',
    children: [
      { name: 'Active', href: '/moments/active', icon: ClockIcon },
      { name: 'Templates', href: '/moments/templates', icon: ClockIcon },
      { name: 'Performance', href: '/moments/performance', icon: ClockIcon },
    ]
  },
  { 
    name: 'Campaigns', 
    href: '/campaigns', 
    icon: MegaphoneIcon,
    badge: '23',
    children: [
      { name: 'Running', href: '/campaigns/running', icon: MegaphoneIcon },
      { name: 'Scheduled', href: '/campaigns/scheduled', icon: MegaphoneIcon },
      { name: 'Completed', href: '/campaigns/completed', icon: MegaphoneIcon },
    ]
  },
  { 
    name: 'Analytics', 
    href: '/analytics', 
    icon: ChartBarIcon,
    children: [
      { name: 'Overview', href: '/analytics/overview', icon: ChartBarIcon },
      { name: 'Performance', href: '/analytics/performance', icon: ChartBarIcon },
      { name: 'Reports', href: '/analytics/reports', icon: ChartBarIcon },
    ]
  },
];

const secondaryNavigation: NavigationItem[] = [
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

/**
 * Enhanced sidebar navigation component with professional design
 * Features collapsible sections, active states, and smooth animations
 */
const Sidebar: React.FC<SidebarProps> = ({ onToggle }) => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<string[]>(['Atoms']);

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionName) 
        ? prev.filter(name => name !== sectionName)
        : [...prev, sectionName]
    );
  };

  const isActiveItem = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const isActivePage = (item: NavigationItem) => {
    if (isActiveItem(item.href)) return true;
    if (item.children) {
      return item.children.some(child => isActiveItem(child.href));
    }
    return false;
  };

  const renderNavigationItem = (item: NavigationItem, isChild = false) => {
    const isActive = isActivePage(item);
    const isExpanded = expandedSections.includes(item.name);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.name}>
        <div className="flex items-center">
          <NavLink
            to={item.href}
            className={({ isActive: isLinkActive }) => {
              const active = isLinkActive || isActive;
              return `group flex items-center flex-1 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                active
                  ? 'bg-primary-50 text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              } ${isChild ? 'ml-6 text-xs' : ''}`;
            }}
          >
            <item.icon
              className={`flex-shrink-0 transition-colors ${
                isChild ? 'h-4 w-4 mr-2' : 'h-5 w-5 mr-3'
              } ${
                isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
              }`}
            />
            <span className="flex-1">{item.name}</span>
            {item.badge && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                isActive 
                  ? 'bg-primary-100 text-primary-600' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {item.badge}
              </span>
            )}
          </NavLink>

          {hasChildren && (
            <button
              onClick={() => toggleSection(item.name)}
              className={`p-1 ml-1 rounded transition-colors ${
                isActive ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </motion.div>
            </button>
          )}
        </div>

        {/* Submenu */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="mt-1 space-y-1">
                {item.children?.map(child => renderNavigationItem(child, true))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <motion.div
          className="flex items-center space-x-3"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">K</span>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              Kairos
            </h1>
            <p className="text-xs text-gray-500 -mt-1">Perfect Moments</p>
          </div>
        </motion.div>

        {/* Close button for mobile */}
        <button
          onClick={onToggle}
          className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            {renderNavigationItem(item)}
          </motion.div>
        ))}

        {/* Divider */}
        <div className="my-6 border-t border-gray-200" />

        {/* Secondary navigation */}
        {secondaryNavigation.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: (navigation.length + index) * 0.1 }}
          >
            {renderNavigationItem(item)}
          </motion.div>
        ))}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <motion.div
          className="flex items-center space-x-3 p-3 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-md">
            <span className="text-white font-semibold text-sm">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">John Doe</p>
            <p className="text-xs text-gray-500 truncate">Administrator</p>
          </div>
          <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
            <CogIcon className="h-4 w-4" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Sidebar;