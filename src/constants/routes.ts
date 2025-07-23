// src/constants/routes.ts
// ✅ COMPLETE: All route constants for Kairos navigation system
// File path: src/constants/routes.ts

export const ROUTES = {
  // ==========================================
  // AUTHENTICATION ROUTES
  // ==========================================
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    VERIFY_EMAIL: '/verify-email',
  },

  // ==========================================
  // DASHBOARD ROUTES
  // ==========================================
  DASHBOARD: {
    HOME: '/dashboard',
    OVERVIEW: '/dashboard/overview',
    PERFORMANCE: '/dashboard/performance',
    ALERTS: '/dashboard/alerts',
  },

  // ==========================================
  // AI & MACHINE LEARNING ROUTES
  // ==========================================
  AI: {
    DASHBOARD: '/ai',
    DECISION_ENGINE: '/ai/decision-engine',
    MODEL_REGISTRY: '/ai/models',
    FEATURE_STORE: '/ai/features',
    EXPERIMENTS: '/ai/experiments',
    INSIGHTS: '/ai/insights',
    RULE_BUILDER: '/ai/rule-builder',
  },

  // ==========================================
  // ELIGIBILITY ATOMS ROUTES
  // ==========================================
  ATOMS: {
    LIST: '/atoms',
    BUILDER: '/atoms/builder',
    COMPOSER: '/atoms/composer',
    ANALYTICS: '/atoms/analytics',
    TESTING: '/atoms/testing',
  },

  // ==========================================
  // MARKETING MOMENTS ROUTES
  // ==========================================
  MOMENTS: {
    LIST: '/moments',
    BUILDER: '/moments/builder',
    TEMPLATES: '/moments/templates',
    CALENDAR: '/moments/calendar',
    ANALYTICS: '/moments/analytics',
  },

  // ==========================================
  // CAMPAIGN ROUTES
  // ==========================================
  CAMPAIGNS: {
    LIST: '/campaigns',
    BUILDER: '/campaigns/builder',
    JOURNEY: '/campaigns/journey',
    CALENDAR: '/campaigns/calendar',
    ATTRIBUTION: '/campaigns/attribution',
    ANALYTICS: '/campaigns/analytics',
  },

  // ==========================================
  // CUSTOMER DATA PLATFORM ROUTES
  // ==========================================
  CUSTOMERS: {
    LIST: '/customers',
    PROFILES: '/customers/profiles',
    SEGMENTATION: '/customers/segmentation',
    JOURNEY_ANALYSIS: '/customers/journey',
    DATA_MANAGEMENT: '/customers/data',
    IMPORT: '/customers/import',
  },

  // ==========================================
  // ANALYTICS ROUTES
  // ==========================================
  ANALYTICS: {
    DASHBOARD: '/analytics',
    REPORTS: '/analytics/reports',
    REPORT_BUILDER: '/analytics/builder',
    REAL_TIME: '/analytics/real-time',
    PREDICTIVE: '/analytics/predictive',
    ATTRIBUTION: '/analytics/attribution',
  },

  // ==========================================
  // TESTING ROUTES
  // ==========================================
  TESTING: {
    EXPERIMENTS: '/testing',
    EXPERIMENT_BUILDER: '/testing/builder',
    RESULTS: '/testing/results',
    STATISTICAL_ANALYSIS: '/testing/analysis',
    WINNER_DECLARATION: '/testing/winners',
  },

  // ==========================================
  // INTEGRATIONS ROUTES
  // ==========================================
  INTEGRATIONS: {
    OVERVIEW: '/integrations',
    MARKETPLACE: '/integrations/marketplace',
  },

  // ==========================================
  // MONITORING ROUTES
  // ==========================================
  MONITORING: {
    DASHBOARD: '/monitoring',
    LIVE_METRICS: '/monitoring/metrics',
    SYSTEM_STATUS: '/monitoring/status',
    ALERTS: '/monitoring/alerts',
    PERFORMANCE: '/monitoring/performance',
  },

  // ==========================================
  // ENTERPRISE ROUTES
  // ==========================================
  ENTERPRISE: {
    OVERVIEW: '/enterprise',
    ORGANIZATIONS: '/enterprise/organizations',
    BRANDING: '/enterprise/branding',
    SECURITY: '/enterprise/security',
    SSO: '/enterprise/sso',
    COMPLIANCE: '/enterprise/compliance',
    USER_MANAGEMENT: '/enterprise/users',
  },

  // ==========================================
  // SETTINGS ROUTES
  // ==========================================
  SETTINGS: {
    GENERAL: '/settings',
    PROFILE: '/settings/profile',
    ACCOUNT: '/settings/account',
    NOTIFICATIONS: '/settings/notifications',
    API_KEYS: '/settings/api-keys',
    BILLING: '/settings/billing',
    TEAM: '/settings/team',
  },

  // ==========================================
  // ERROR ROUTES
  // ==========================================
  ERROR: {
    NOT_FOUND: '/404',
    UNAUTHORIZED: '/unauthorized',
    SERVER_ERROR: '/server-error',
  },
} as const;

// Export individual route groups for convenience
export const AUTH_ROUTES = ROUTES.AUTH;
export const DASHBOARD_ROUTES = ROUTES.DASHBOARD;
export const AI_ROUTES = ROUTES.AI;
export const ATOMS_ROUTES = ROUTES.ATOMS;
export const MOMENTS_ROUTES = ROUTES.MOMENTS;
export const CAMPAIGNS_ROUTES = ROUTES.CAMPAIGNS;
export const CUSTOMERS_ROUTES = ROUTES.CUSTOMERS;
export const ANALYTICS_ROUTES = ROUTES.ANALYTICS;
export const TESTING_ROUTES = ROUTES.TESTING;
export const INTEGRATIONS_ROUTES = ROUTES.INTEGRATIONS;
export const ENTERPRISE_ROUTES = ROUTES.ENTERPRISE;
export const ERROR_ROUTES = ROUTES.ERROR;

// Route permissions mapping (for future use)
export const ROUTE_PERMISSIONS = {
  [ROUTES.TESTING.EXPERIMENTS]: ['testing:read'],
  [ROUTES.INTEGRATIONS.OVERVIEW]: ['integrations:read'],
  [ROUTES.ENTERPRISE.BRANDING]: ['admin:branding'],
  [ROUTES.ENTERPRISE.SECURITY]: ['admin:security'],
  [ROUTES.ENTERPRISE.COMPLIANCE]: ['admin:compliance'],
  [ROUTES.ENTERPRISE.ORGANIZATIONS]: ['admin:organizations'],
} as const;

// Public routes that don't require authentication
export const PUBLIC_ROUTES = [
  ROUTES.AUTH.LOGIN,
  ROUTES.AUTH.REGISTER,
  ROUTES.AUTH.FORGOT_PASSWORD,
  ROUTES.AUTH.RESET_PASSWORD,
  ROUTES.AUTH.VERIFY_EMAIL,
  ROUTES.ERROR.NOT_FOUND,
  ROUTES.ERROR.UNAUTHORIZED,
  ROUTES.ERROR.SERVER_ERROR,
] as const;

// Helper function to check if route is public
export const isPublicRoute = (path: string): boolean => {
  return PUBLIC_ROUTES.includes(path as any);
};

// Helper function to get route by pattern
export const getRouteWithParams = (baseRoute: string, params: Record<string, string>): string => {
  let route = baseRoute;
  Object.entries(params).forEach(([key, value]) => {
    route = route.replace(`:${key}`, value);
  });
  return route;
};

// Export default for backward compatibility
export default ROUTES;