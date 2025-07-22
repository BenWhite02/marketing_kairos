// src/types/enterprise.ts

export interface BrandConfiguration {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'archived';
  
  // Visual Branding
  logo: {
    primary: string; // URL or base64
    secondary?: string;
    favicon: string;
    width: number;
    height: number;
  };
  
  // Color Scheme
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
    status: {
      success: string;
      warning: string;
      error: string;
      info: string;
    };
  };
  
  // Typography
  typography: {
    fontFamily: {
      primary: string;
      secondary: string;
      monospace: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
  
  // Layout & Spacing
  layout: {
    borderRadius: {
      none: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      full: string;
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
    };
    shadows: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };
  
  // Custom Domain
  domain: {
    customDomain?: string;
    subdomainPrefix?: string;
    sslEnabled: boolean;
    status: 'pending' | 'active' | 'failed';
  };
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: number;
}

export interface SecurityConfiguration {
  id: string;
  organizationId: string;
  
  // Single Sign-On
  sso: {
    enabled: boolean;
    provider: 'saml' | 'oauth2' | 'openid' | 'ldap';
    configuration: {
      entityId?: string;
      ssoUrl?: string;
      certificate?: string;
      clientId?: string;
      clientSecret?: string;
      issuer?: string;
      scope?: string[];
      ldapUrl?: string;
      baseDn?: string;
    };
    attributes: {
      email: string;
      firstName: string;
      lastName: string;
      groups: string;
    };
    autoProvisioning: boolean;
    defaultRole: string;
  };
  
  // Multi-Factor Authentication
  mfa: {
    enabled: boolean;
    required: boolean;
    methods: ('totp' | 'sms' | 'email' | 'backup_codes')[];
    gracePeriod: number; // days
    trustedDevices: boolean;
    maxTrustedDevices: number;
  };
  
  // Password Policy
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAge: number; // days
    preventReuse: number; // last N passwords
    lockoutThreshold: number;
    lockoutDuration: number; // minutes
  };
  
  // Session Management
  session: {
    maxDuration: number; // minutes
    idleTimeout: number; // minutes
    concurrentSessions: number;
    secureCookies: boolean;
    sameSitePolicy: 'strict' | 'lax' | 'none';
  };
  
  // IP Restrictions
  ipRestrictions: {
    enabled: boolean;
    allowedRanges: string[];
    deniedRanges: string[];
    requireVpn: boolean;
  };
  
  // Audit Settings
  audit: {
    enabled: boolean;
    logSuccessfulLogins: boolean;
    logFailedAttempts: boolean;
    logDataAccess: boolean;
    logConfigChanges: boolean;
    retentionDays: number;
  };
  
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceConfiguration {
  id: string;
  organizationId: string;
  
  // GDPR Compliance
  gdpr: {
    enabled: boolean;
    dataController: {
      name: string;
      email: string;
      address: string;
    };
    dataProcessor?: {
      name: string;
      email: string;
      address: string;
    };
    legalBasis: ('consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests')[];
    dataRetention: {
      defaultPeriod: number; // days
      categories: {
        [key: string]: number; // category -> retention days
      };
    };
    consentManagement: {
      explicitConsent: boolean;
      granularConsent: boolean;
      consentWithdrawal: boolean;
      consentLogging: boolean;
    };
    dataSubjectRights: {
      portability: boolean;
      erasure: boolean;
      rectification: boolean;
      restriction: boolean;
      objection: boolean;
      automatedDecisionMaking: boolean;
    };
    breachNotification: {
      enabled: boolean;
      notificationPeriod: number; // hours
      supervisoryAuthority: string;
      contactEmail: string;
    };
  };
  
  // SOX Compliance (Sarbanes-Oxley)
  sox: {
    enabled: boolean;
    financialReporting: boolean;
    internalControls: {
      changeManagement: boolean;
      accessControls: boolean;
      segregationOfDuties: boolean;
      auditTrails: boolean;
    };
    documentation: {
      controlDocumentation: boolean;
      evidenceRetention: number; // years
      testingDocumentation: boolean;
    };
    reporting: {
      quarterlyReports: boolean;
      managementCertification: boolean;
      auditorReports: boolean;
    };
  };
  
  // HIPAA Compliance
  hipaa: {
    enabled: boolean;
    coveredEntity: boolean;
    businessAssociate: boolean;
    safeguards: {
      administrative: {
        securityOfficer: string;
        conductTraining: boolean;
        accessManagement: boolean;
        workforceClearing: boolean;
      };
      physical: {
        facilityControls: boolean;
        workstationControls: boolean;
        deviceControls: boolean;
        mediaControls: boolean;
      };
      technical: {
        accessControl: boolean;
        auditControls: boolean;
        integrity: boolean;
        transmissionSecurity: boolean;
        encryption: boolean;
      };
    };
    breachNotification: {
      enabled: boolean;
      notificationPeriod: number; // days
      hhs: boolean;
      media: boolean;
      individuals: boolean;
    };
  };
  
  // Data Classification
  dataClassification: {
    enabled: boolean;
    levels: {
      public: { label: string; color: string; description: string; };
      internal: { label: string; color: string; description: string; };
      confidential: { label: string; color: string; description: string; };
      restricted: { label: string; color: string; description: string; };
    };
    autoClassification: boolean;
    retentionPolicies: {
      [level: string]: number; // days
    };
  };
  
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  displayName: string;
  description: string;
  type: 'enterprise' | 'business' | 'startup' | 'agency';
  status: 'active' | 'suspended' | 'trial' | 'expired';
  
  // Subscription & Billing
  subscription: {
    plan: 'starter' | 'professional' | 'enterprise' | 'custom';
    features: string[];
    limits: {
      users: number;
      campaigns: number;
      atoms: number;
      moments: number;
      apiCalls: number;
      storage: number; // GB
    };
    billing: {
      interval: 'monthly' | 'yearly';
      amount: number;
      currency: string;
      nextBillingDate: string;
      paymentMethod: string;
    };
  };
  
  // Contact Information
  contact: {
    primaryEmail: string;
    billingEmail: string;
    supportEmail: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  
  // Settings
  settings: {
    timezone: string;
    dateFormat: string;
    currency: string;
    language: string;
    dataResidency: string;
  };
  
  // Hierarchy
  parentOrganizationId?: string;
  childOrganizations: string[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface AuditLog {
  id: string;
  organizationId: string;
  userId: string;
  userName: string;
  userEmail: string;
  
  // Event Details
  event: {
    type: 'authentication' | 'authorization' | 'data_access' | 'configuration' | 'compliance' | 'security';
    action: string;
    resource: string;
    resourceId?: string;
    description: string;
  };
  
  // Context
  context: {
    ipAddress: string;
    userAgent: string;
    location?: {
      country: string;
      region: string;
      city: string;
    };
    sessionId: string;
    requestId: string;
  };
  
  // Data Changes
  changes?: {
    before: Record<string, any>;
    after: Record<string, any>;
    fields: string[];
  };
  
  // Risk Assessment
  risk: {
    level: 'low' | 'medium' | 'high' | 'critical';
    score: number;
    factors: string[];
  };
  
  // Status
  status: 'success' | 'failure' | 'warning';
  errorCode?: string;
  errorMessage?: string;
  
  // Timestamps
  timestamp: string;
  duration?: number; // milliseconds
}

export interface Role {
  id: string;
  organizationId: string;
  name: string;
  displayName: string;
  description: string;
  type: 'system' | 'custom';
  
  // Permissions
  permissions: {
    [resource: string]: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      admin: boolean;
    };
  };
  
  // Restrictions
  restrictions: {
    ipRestrictions: string[];
    timeRestrictions: {
      allowedHours: { start: string; end: string; }[];
      allowedDays: number[]; // 0-6, Sunday-Saturday
      timezone: string;
    };
    dataRestrictions: {
      regions: string[];
      classifications: string[];
    };
  };
  
  // Metadata
  userCount: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  organizationId: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar?: string;
  
  // Authentication
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  emailVerified: boolean;
  mfaEnabled: boolean;
  lastLoginAt?: string;
  passwordChangedAt: string;
  
  // Roles & Permissions
  roles: string[];
  customPermissions: {
    [resource: string]: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      admin: boolean;
    };
  };
  
  // Settings
  preferences: {
    language: string;
    timezone: string;
    dateFormat: string;
    emailNotifications: boolean;
    browserNotifications: boolean;
  };
  
  // Compliance
  dataProcessingConsent: boolean;
  marketingConsent: boolean;
  consentDate: string;
  lastDataAccess: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}