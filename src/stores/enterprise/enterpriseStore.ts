// src/stores/enterprise/enterpriseStore.ts

import { create } from 'zustand';
import { 
  Organization, 
  User, 
  Role, 
  SecurityConfiguration, 
  ComplianceConfiguration,
  AuditLog 
} from '../../types/enterprise';

interface EnterpriseState {
  // Organizations
  currentOrganization: Organization | null;
  organizations: Organization[];
  
  // Users & Roles
  users: User[];
  roles: Role[];
  
  // Security & Compliance
  securityConfig: SecurityConfiguration | null;
  complianceConfig: ComplianceConfiguration | null;
  auditLogs: AuditLog[];
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadOrganizations: () => Promise<void>;
  setCurrentOrganization: (org: Organization) => void;
  createOrganization: (org: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateOrganization: (id: string, updates: Partial<Organization>) => Promise<void>;
  deleteOrganization: (id: string) => Promise<void>;
  
  loadUsers: (organizationId: string) => Promise<void>;
  createUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  
  loadRoles: (organizationId: string) => Promise<void>;
  createRole: (role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateRole: (id: string, updates: Partial<Role>) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
  
  loadSecurityConfig: (organizationId: string) => Promise<void>;
  updateSecurityConfig: (config: Partial<SecurityConfiguration>) => Promise<void>;
  
  loadComplianceConfig: (organizationId: string) => Promise<void>;
  updateComplianceConfig: (config: Partial<ComplianceConfiguration>) => Promise<void>;
  
  loadAuditLogs: (organizationId: string, filters?: any) => Promise<void>;
  
  // Utility Actions
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

// Mock API functions
const mockApi = {
  async getOrganizations(): Promise<Organization[]> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [
      {
        id: 'org-1',
        name: 'acme-corp',
        displayName: 'Acme Corporation',
        description: 'Leading technology company focused on innovative solutions',
        type: 'enterprise',
        status: 'active',
        subscription: {
          plan: 'enterprise',
          features: ['advanced_analytics', 'sso', 'api_access', 'white_label', 'priority_support'],
          limits: {
            users: 1000,
            campaigns: 500,
            atoms: 1000,
            moments: 2000,
            apiCalls: 1000000,
            storage: 1000,
          },
          billing: {
            interval: 'yearly',
            amount: 24000,
            currency: 'USD',
            nextBillingDate: '2024-12-01T00:00:00Z',
            paymentMethod: 'credit_card',
          },
        },
        contact: {
          primaryEmail: 'admin@acme.com',
          billingEmail: 'billing@acme.com',
          supportEmail: 'support@acme.com',
          phone: '+1-555-0123',
          address: {
            street: '123 Business Ave',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94105',
            country: 'US',
          },
        },
        settings: {
          timezone: 'America/Los_Angeles',
          dateFormat: 'MM/DD/YYYY',
          currency: 'USD',
          language: 'en',
          dataResidency: 'US',
        },
        childOrganizations: [],
        createdAt: '2023-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
        createdBy: 'system',
      },
    ];
  },

  async getUsers(organizationId: string): Promise<User[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return [
      {
        id: 'user-1',
        organizationId,
        email: 'admin@acme.com',
        firstName: 'John',
        lastName: 'Admin',
        displayName: 'John Admin',
        status: 'active',
        emailVerified: true,
        mfaEnabled: true,
        lastLoginAt: '2024-01-15T09:00:00Z',
        passwordChangedAt: '2023-12-01T00:00:00Z',
        roles: ['admin'],
        customPermissions: {},
        preferences: {
          language: 'en',
          timezone: 'America/Los_Angeles',
          dateFormat: 'MM/DD/YYYY',
          emailNotifications: true,
          browserNotifications: true,
        },
        dataProcessingConsent: true,
        marketingConsent: false,
        consentDate: '2023-01-15T00:00:00Z',
        lastDataAccess: '2024-01-15T09:00:00Z',
        createdAt: '2023-01-15T00:00:00Z',
        updatedAt: '2024-01-15T09:00:00Z',
        createdBy: 'system',
      },
    ];
  },

  async getRoles(organizationId: string): Promise<Role[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return [
      {
        id: 'admin',
        organizationId,
        name: 'admin',
        displayName: 'Administrator',
        description: 'Full system access with all permissions',
        type: 'system',
        permissions: {
          users: { create: true, read: true, update: true, delete: true, admin: true },
          campaigns: { create: true, read: true, update: true, delete: true, admin: true },
          analytics: { create: true, read: true, update: true, delete: true, admin: true },
          settings: { create: true, read: true, update: true, delete: true, admin: true },
        },
        restrictions: {
          ipRestrictions: [],
          timeRestrictions: {
            allowedHours: [],
            allowedDays: [],
            timezone: 'UTC',
          },
          dataRestrictions: {
            regions: [],
            classifications: [],
          },
        },
        userCount: 1,
        isDefault: false,
        createdAt: '2023-01-15T00:00:00Z',
        updatedAt: '2023-01-15T00:00:00Z',
      },
    ];
  },

  async getSecurityConfig(organizationId: string): Promise<SecurityConfiguration> {
    await new Promise(resolve => setTimeout(resolve, 700));
    return {
      id: 'sec-1',
      organizationId,
      sso: {
        enabled: false,
        provider: 'saml',
        configuration: {},
        attributes: {
          email: 'email',
          firstName: 'firstName',
          lastName: 'lastName',
          groups: 'groups',
        },
        autoProvisioning: true,
        defaultRole: 'user',
      },
      mfa: {
        enabled: true,
        required: false,
        methods: ['totp', 'sms'],
        gracePeriod: 30,
        trustedDevices: true,
        maxTrustedDevices: 3,
      },
      passwordPolicy: {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAge: 90,
        preventReuse: 10,
        lockoutThreshold: 5,
        lockoutDuration: 30,
      },
      session: {
        maxDuration: 480,
        idleTimeout: 60,
        concurrentSessions: 3,
        secureCookies: true,
        sameSitePolicy: 'strict',
      },
      ipRestrictions: {
        enabled: false,
        allowedRanges: [],
        deniedRanges: [],
        requireVpn: false,
      },
      audit: {
        enabled: true,
        logSuccessfulLogins: true,
        logFailedAttempts: true,
        logDataAccess: true,
        logConfigChanges: true,
        retentionDays: 365,
      },
      createdAt: '2023-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    };
  },

  async getComplianceConfig(organizationId: string): Promise<ComplianceConfiguration> {
    await new Promise(resolve => setTimeout(resolve, 900));
    return {
      id: 'comp-1',
      organizationId,
      gdpr: {
        enabled: true,
        dataController: {
          name: 'Acme Corporation',
          email: 'dpo@acme.com',
          address: '123 Business Ave, San Francisco, CA 94105',
        },
        legalBasis: ['consent', 'contract', 'legitimate_interests'],
        dataRetention: {
          defaultPeriod: 2555,
          categories: {
            'customer_data': 2555,
            'marketing_data': 1095,
            'analytics_data': 730,
            'support_tickets': 1825,
          },
        },
        consentManagement: {
          explicitConsent: true,
          granularConsent: true,
          consentWithdrawal: true,
          consentLogging: true,
        },
        dataSubjectRights: {
          portability: true,
          erasure: true,
          rectification: true,
          restriction: true,
          objection: true,
          automatedDecisionMaking: false,
        },
        breachNotification: {
          enabled: true,
          notificationPeriod: 72,
          supervisoryAuthority: 'Data Protection Authority',
          contactEmail: 'dpo@acme.com',
        },
      },
      sox: {
        enabled: false,
        financialReporting: false,
        internalControls: {
          changeManagement: false,
          accessControls: false,
          segregationOfDuties: false,
          auditTrails: false,
        },
        documentation: {
          controlDocumentation: false,
          evidenceRetention: 7,
          testingDocumentation: false,
        },
        reporting: {
          quarterlyReports: false,
          managementCertification: false,
          auditorReports: false,
        },
      },
      hipaa: {
        enabled: false,
        coveredEntity: false,
        businessAssociate: false,
        safeguards: {
          administrative: {
            securityOfficer: '',
            conductTraining: false,
            accessManagement: false,
            workforceClearing: false,
          },
          physical: {
            facilityControls: false,
            workstationControls: false,
            deviceControls: false,
            mediaControls: false,
          },
          technical: {
            accessControl: false,
            auditControls: false,
            integrity: false,
            transmissionSecurity: false,
            encryption: false,
          },
        },
        breachNotification: {
          enabled: false,
          notificationPeriod: 60,
          hhs: false,
          media: false,
          individuals: false,
        },
      },
      dataClassification: {
        enabled: true,
        levels: {
          public: { label: 'Public', color: '#10b981', description: 'Information that can be freely shared' },
          internal: { label: 'Internal', color: '#3b82f6', description: 'Information for internal use only' },
          confidential: { label: 'Confidential', color: '#f59e0b', description: 'Sensitive business information' },
          restricted: { label: 'Restricted', color: '#ef4444', description: 'Highly sensitive information' },
        },
        autoClassification: false,
        retentionPolicies: {
          public: 1095,
          internal: 2190,
          confidential: 2555,
          restricted: 3650,
        },
      },
      createdAt: '2023-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    };
  },

  async getAuditLogs(organizationId: string): Promise<AuditLog[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      {
        id: 'audit-1',
        organizationId,
        userId: 'user-1',
        userName: 'John Admin',
        userEmail: 'admin@acme.com',
        event: {
          type: 'authentication',
          action: 'user_login',
          resource: 'system',
          resourceId: 'system',
          description: 'User successfully logged in',
        },
        context: {
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          location: {
            country: 'US',
            region: 'CA',
            city: 'San Francisco',
          },
          sessionId: 'sess-123',
          requestId: 'req-456',
        },
        risk: {
          level: 'low',
          score: 15,
          factors: ['known_device', 'normal_location'],
        },
        status: 'success',
        timestamp: '2024-01-15T09:00:00Z',
        duration: 150,
      },
    ];
  },

  // CRUD operations
  async createOrganization(data: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1200));
    return `org-${Date.now()}`;
  },

  async updateOrganization(id: string, updates: Partial<Organization>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 800));
  },

  async deleteOrganization(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 600));
  },

  async createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `user-${Date.now()}`;
  },

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 700));
  },

  async deleteUser(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
  },

  async createRole(data: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 900));
    return `role-${Date.now()}`;
  },

  async updateRole(id: string, updates: Partial<Role>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 600));
  },

  async deleteRole(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
  },

  async updateSecurityConfig(id: string, config: Partial<SecurityConfiguration>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 800));
  },

  async updateComplianceConfig(id: string, config: Partial<ComplianceConfiguration>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 700));
  },
};

export const useEnterpriseStore = create<EnterpriseState>((set, get) => ({
  // Initial State
  currentOrganization: null,
  organizations: [],
  users: [],
  roles: [],
  securityConfig: null,
  complianceConfig: null,
  auditLogs: [],
  isLoading: false,
  error: null,

  // Organization Actions
  loadOrganizations: async () => {
    set({ isLoading: true, error: null });
    try {
      const organizations = await mockApi.getOrganizations();
      set({ organizations, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load organizations', isLoading: false });
    }
  },

  setCurrentOrganization: (org) => {
    set({ currentOrganization: org });
  },

  createOrganization: async (orgData) => {
    set({ isLoading: true, error: null });
    try {
      const id = await mockApi.createOrganization(orgData);
      const newOrg: Organization = {
        ...orgData,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        childOrganizations: [],
      };
      set(state => ({
        organizations: [...state.organizations, newOrg],
        isLoading: false,
      }));
      return id;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create organization', isLoading: false });
      throw error;
    }
  },

  updateOrganization: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      await mockApi.updateOrganization(id, updates);
      set(state => ({
        organizations: state.organizations.map(org => 
          org.id === id ? { ...org, ...updates, updatedAt: new Date().toISOString() } : org
        ),
        currentOrganization: state.currentOrganization?.id === id 
          ? { ...state.currentOrganization, ...updates, updatedAt: new Date().toISOString() }
          : state.currentOrganization,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update organization', isLoading: false });
    }
  },

  deleteOrganization: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await mockApi.deleteOrganization(id);
      set(state => ({
        organizations: state.organizations.filter(org => org.id !== id),
        currentOrganization: state.currentOrganization?.id === id ? null : state.currentOrganization,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete organization', isLoading: false });
    }
  },

  // User Actions
  loadUsers: async (organizationId) => {
    set({ isLoading: true, error: null });
    try {
      const users = await mockApi.getUsers(organizationId);
      set({ users, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load users', isLoading: false });
    }
  },

  createUser: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const id = await mockApi.createUser(userData);
      const newUser: User = {
        ...userData,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set(state => ({
        users: [...state.users, newUser],
        isLoading: false,
      }));
      return id;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create user', isLoading: false });
      throw error;
    }
  },

  updateUser: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      await mockApi.updateUser(id, updates);
      set(state => ({
        users: state.users.map(user => 
          user.id === id ? { ...user, ...updates, updatedAt: new Date().toISOString() } : user
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update user', isLoading: false });
    }
  },

  deleteUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await mockApi.deleteUser(id);
      set(state => ({
        users: state.users.filter(user => user.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete user', isLoading: false });
    }
  },

  // Role Actions
  loadRoles: async (organizationId) => {
    set({ isLoading: true, error: null });
    try {
      const roles = await mockApi.getRoles(organizationId);
      set({ roles, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load roles', isLoading: false });
    }
  },

  createRole: async (roleData) => {
    set({ isLoading: true, error: null });
    try {
      const id = await mockApi.createRole(roleData);
      const newRole: Role = {
        ...roleData,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set(state => ({
        roles: [...state.roles, newRole],
        isLoading: false,
      }));
      return id;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create role', isLoading: false });
      throw error;
    }
  },

  updateRole: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      await mockApi.updateRole(id, updates);
      set(state => ({
        roles: state.roles.map(role => 
          role.id === id ? { ...role, ...updates, updatedAt: new Date().toISOString() } : role
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update role', isLoading: false });
    }
  },

  deleteRole: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await mockApi.deleteRole(id);
      set(state => ({
        roles: state.roles.filter(role => role.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete role', isLoading: false });
    }
  },

  // Security Configuration Actions
  loadSecurityConfig: async (organizationId) => {
    set({ isLoading: true, error: null });
    try {
      const securityConfig = await mockApi.getSecurityConfig(organizationId);
      set({ securityConfig, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load security config', isLoading: false });
    }
  },

  updateSecurityConfig: async (config) => {
    const currentConfig = get().securityConfig;
    if (!currentConfig) return;

    set({ isLoading: true, error: null });
    try {
      await mockApi.updateSecurityConfig(currentConfig.id, config);
      set(state => ({
        securityConfig: state.securityConfig 
          ? { ...state.securityConfig, ...config, updatedAt: new Date().toISOString() }
          : null,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update security config', isLoading: false });
    }
  },

  // Compliance Configuration Actions
  loadComplianceConfig: async (organizationId) => {
    set({ isLoading: true, error: null });
    try {
      const complianceConfig = await mockApi.getComplianceConfig(organizationId);
      set({ complianceConfig, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load compliance config', isLoading: false });
    }
  },

  updateComplianceConfig: async (config) => {
    const currentConfig = get().complianceConfig;
    if (!currentConfig) return;

    set({ isLoading: true, error: null });
    try {
      await mockApi.updateComplianceConfig(currentConfig.id, config);
      set(state => ({
        complianceConfig: state.complianceConfig 
          ? { ...state.complianceConfig, ...config, updatedAt: new Date().toISOString() }
          : null,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update compliance config', isLoading: false });
    }
  },

  // Audit Log Actions
  loadAuditLogs: async (organizationId, filters) => {
    set({ isLoading: true, error: null });
    try {
      const auditLogs = await mockApi.getAuditLogs(organizationId);
      set({ auditLogs, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load audit logs', isLoading: false });
    }
  },

  // Utility Actions
  clearError: () => set({ error: null }),
  setLoading: (loading) => set({ isLoading: loading }),
}));