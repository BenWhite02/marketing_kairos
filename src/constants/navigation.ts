// src/constants/navigation.ts
// ✅ FIXED: Navigation Configuration - Fixed missing routes error
// File path: src/constants/navigation.ts

import { ROUTES } from './routes';

console.log('🔄 navigation: Module loading...');
console.log('🔄 navigation: ROUTES imported:', !!ROUTES);
console.log('🔄 navigation: ROUTES.DASHBOARD:', ROUTES.DASHBOARD);

/**
 * KAIROS - Navigation Configuration
 * Complete sidebar navigation structure
 */

export interface NavigationItem {
  id: string;
  label: string;
  path?: string;
  icon: string;
  badge?: string | number;
  children?: NavigationItem[];
  permissions?: string[];
  isNew?: boolean;
  isBeta?: boolean;
  isEnterprise?: boolean;
}

// ✅ FIXED: Simplified navigation to prevent loading errors
export const NAVIGATION: NavigationItem[] = [
  // Main Dashboard
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'home',
  },

  // AI & Machine Learning
  {
    id: 'ai',
    label: 'AI & ML',
    icon: 'brain',
    isNew: true,
    children: [
      {
        id: 'ai-dashboard',
        label: 'AI Dashboard',
        path: '/ai',
        icon: 'robot',
      },
      {
        id: 'decision-engine',
        label: 'Decision Engine',
        path: '/ai/decision-engine',
        icon: 'zap',
        isNew: true,
      },
    ],
  },

  // Eligibility Atoms
  {
    id: 'atoms',
    label: 'Eligibility Atoms',
    icon: 'atom',
    children: [
      {
        id: 'atoms-list',
        label: 'Atom Library',
        path: '/atoms',
        icon: 'library',
      },
      {
        id: 'atom-composer',
        label: 'Atom Composer',
        path: '/atoms/composer',
        icon: 'puzzle-piece',
      },
      {
        id: 'atom-analytics',
        label: 'Atom Analytics',
        path: '/atoms/analytics',
        icon: 'bar-chart',
      },
      {
        id: 'atom-testing',
        label: 'Atom Testing',
        path: '/atoms/testing',
        icon: 'flask',
      },
    ],
  },

  // Marketing Moments
  {
    id: 'moments',
    label: 'Marketing Moments',
    icon: 'clock',
    children: [
      {
        id: 'moments-list',
        label: 'Moments Library',
        path: '/moments',
        icon: 'collection',
      },
      {
        id: 'moment-builder',
        label: 'Moment Builder',
        path: '/moments/builder',
        icon: 'wrench',
      },
      {
        id: 'moment-templates',
        label: 'Templates',
        path: '/moments/templates',
        icon: 'template',
      },
      {
        id: 'moment-calendar',
        label: 'Calendar',
        path: '/moments/calendar',
        icon: 'calendar',
      },
      {
        id: 'moment-analytics',
        label: 'Moment Analytics',
        path: '/moments/analytics',
        icon: 'chart-pie',
      },
    ],
  },

  // Campaign Orchestration
  {
    id: 'campaigns',
    label: 'Campaigns',
    icon: 'megaphone',
    children: [
      {
        id: 'campaigns-list',
        label: 'Campaign Overview',
        path: '/campaigns',
        icon: 'list',
      },
    ],
  },

  // Customer Data Platform
  {
    id: 'customers',
    label: 'Customer CDP',
    icon: 'users',
    children: [
      {
        id: 'customer-list',
        label: 'Customer Database',
        path: '/customers',
        icon: 'database',
      },
    ],
  },

  // Analytics & Reporting
  {
    id: 'analytics',
    label: 'Analytics',
    icon: 'chart-bar',
    children: [
      {
        id: 'analytics-dashboard',
        label: 'Analytics Dashboard',
        path: '/analytics',
        icon: 'chart-line',
      },
    ],
  },

  // A/B Testing & Experimentation
  {
    id: 'testing',
    label: 'A/B Testing',
    icon: 'beaker',
    children: [
      {
        id: 'experiments',
        label: 'Experiments',
        path: '/testing',
        icon: 'test-tube',
      },
    ],
  },

  // Integrations - Simplified
  {
    id: 'integrations',
    label: 'Integrations',
    icon: 'plug',
    badge: '12',
    children: [
      {
        id: 'integrations-overview',
        label: 'Overview',
        path: '/integrations',
        icon: 'grid',
      },
    ],
  },

  // Enterprise Features
  {
    id: 'enterprise',
    label: 'Enterprise',
    icon: 'office-building',
    isEnterprise: true,
    children: [
      {
        id: 'branding',
        label: 'Branding',
        path: '/enterprise/branding',
        icon: 'color-swatch',
      },
      {
        id: 'security',
        label: 'Security',
        path: '/enterprise/security',
        icon: 'shield-check',
      },
      {
        id: 'compliance',
        label: 'Compliance',
        path: '/enterprise/compliance',
        icon: 'clipboard-check',
      },
      {
        id: 'organizations',
        label: 'Organizations',
        path: '/enterprise/organizations',
        icon: 'user-group',
      },
    ],
  },
];

// Navigation helpers
export const findNavigationItem = (id: string): NavigationItem | null => {
  const search = (items: NavigationItem[]): NavigationItem | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = search(item.children);
        if (found) return found;
      }
    }
    return null;
  };
  return search(NAVIGATION);
};

export const getActiveNavigation = (pathname: string): NavigationItem | null => {
  const search = (items: NavigationItem[]): NavigationItem | null => {
    for (const item of items) {
      if (item.path === pathname) return item;
      if (item.children) {
        const found = search(item.children);
        if (found) return found;
      }
    }
    return null;
  };
  return search(NAVIGATION);
};

export const flattenNavigation = (items: NavigationItem[] = NAVIGATION): NavigationItem[] => {
  const flatten = (items: NavigationItem[]): NavigationItem[] => {
    return items.reduce((acc, item) => {
      acc.push(item);
      if (item.children) {
        acc.push(...flatten(item.children));
      }
      return acc;
    }, [] as NavigationItem[]);
  };
  return flatten(items);
};

console.log('✅ navigation: Module loaded successfully');
console.log('🔄 navigation: NAVIGATION array length:', NAVIGATION.length);

export default NAVIGATION;