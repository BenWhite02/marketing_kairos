// src/types/integrations.ts

export interface Integration {
  id: string;
  name: string;
  type: IntegrationType;
  category: IntegrationCategory;
  status: IntegrationStatus;
  provider: string;
  description: string;
  logoUrl: string;
  configuration: IntegrationConfig;
  lastSync?: Date;
  syncFrequency: SyncFrequency;
  dataMapping: DataMapping;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags: string[];
  isActive: boolean;
  healthScore: number; // 0-100
  errorCount: number;
  lastError?: string;
}

export type IntegrationType = 
  | 'crm'
  | 'email-provider'
  | 'social-media'
  | 'analytics'
  | 'data-warehouse'
  | 'e-commerce'
  | 'sso'
  | 'webhook'
  | 'custom';

export type IntegrationCategory = 
  | 'customer-data'
  | 'marketing-automation'
  | 'analytics-reporting'
  | 'data-storage'
  | 'authentication'
  | 'communication'
  | 'e-commerce'
  | 'custom';

export type IntegrationStatus = 
  | 'connected'
  | 'disconnected'
  | 'connecting'
  | 'error'
  | 'syncing'
  | 'configuration-required';

export type SyncFrequency = 
  | 'real-time'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'manual';

export interface IntegrationConfig {
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  baseUrl?: string;
  clientId?: string;
  clientSecret?: string;
  webhookUrl?: string;
  customFields: Record<string, any>;
  rateLimits: RateLimit;
  retrySettings: RetrySettings;
}

export interface RateLimit {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
}

export interface RetrySettings {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export interface DataMapping {
  fieldMappings: FieldMapping[];
  transformations: DataTransformation[];
  syncDirection: SyncDirection;
  conflictResolution: ConflictResolution;
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  dataType: DataType;
  isRequired: boolean;
  defaultValue?: any;
  transformation?: string;
}

export type DataType = 
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'email'
  | 'phone'
  | 'url'
  | 'json'
  | 'array';

export interface DataTransformation {
  id: string;
  name: string;
  type: TransformationType;
  config: Record<string, any>;
  isActive: boolean;
}

export type TransformationType = 
  | 'format'
  | 'validate'
  | 'enrich'
  | 'filter'
  | 'aggregate'
  | 'custom';

export type SyncDirection = 
  | 'bidirectional'
  | 'inbound'
  | 'outbound';

export type ConflictResolution = 
  | 'source-wins'
  | 'target-wins'
  | 'most-recent'
  | 'manual'
  | 'merge';

// CRM Specific Types
export interface CRMIntegration extends Integration {
  type: 'crm';
  crmProvider: CRMProvider;
  supportedObjects: CRMObject[];
  customObjects: CustomCRMObject[];
}

export type CRMProvider = 
  | 'salesforce'
  | 'hubspot'
  | 'dynamics-365'
  | 'pipedrive'
  | 'zoho'
  | 'custom';

export type CRMObject = 
  | 'contact'
  | 'lead'
  | 'account'
  | 'opportunity'
  | 'campaign'
  | 'activity'
  | 'task'
  | 'event';

export interface CustomCRMObject {
  name: string;
  apiName: string;
  fields: CRMField[];
  relationships: CRMRelationship[];
}

export interface CRMField {
  name: string;
  apiName: string;
  dataType: DataType;
  isRequired: boolean;
  isCustom: boolean;
  picklistValues?: string[];
}

export interface CRMRelationship {
  name: string;
  relatedObject: string;
  relationshipType: 'lookup' | 'master-detail' | 'many-to-many';
}

// Email Provider Types
export interface EmailProviderIntegration extends Integration {
  type: 'email-provider';
  provider: EmailProvider;
  capabilities: EmailCapability[];
  templates: EmailTemplate[];
}

export type EmailProvider = 
  | 'sendgrid'
  | 'mailchimp'
  | 'klaviyo'
  | 'constant-contact'
  | 'campaign-monitor'
  | 'custom';

export type EmailCapability = 
  | 'transactional'
  | 'marketing'
  | 'automation'
  | 'templates'
  | 'analytics'
  | 'segmentation';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  isActive: boolean;
  category: string;
  tags: string[];
}

// Analytics Platform Types
export interface AnalyticsIntegration extends Integration {
  type: 'analytics';
  provider: AnalyticsProvider;
  trackingId: string;
  dimensions: AnalyticsDimension[];
  metrics: AnalyticsMetric[];
}

export type AnalyticsProvider = 
  | 'google-analytics'
  | 'adobe-analytics'
  | 'mixpanel'
  | 'amplitude'
  | 'segment'
  | 'custom';

export interface AnalyticsDimension {
  name: string;
  type: string;
  category: string;
}

export interface AnalyticsMetric {
  name: string;
  type: string;
  aggregationType: 'sum' | 'avg' | 'count' | 'unique';
}

// Data Warehouse Types
export interface DataWarehouseIntegration extends Integration {
  type: 'data-warehouse';
  provider: DataWarehouseProvider;
  connectionString: string;
  schemas: DataSchema[];
  queryCapabilities: QueryCapability[];
}

export type DataWarehouseProvider = 
  | 'snowflake'
  | 'bigquery'
  | 'redshift'
  | 'databricks'
  | 'synapse'
  | 'custom';

export interface DataSchema {
  name: string;
  tables: DataTable[];
}

export interface DataTable {
  name: string;
  columns: DataColumn[];
  rowCount: number;
  lastUpdated: Date;
}

export interface DataColumn {
  name: string;
  dataType: string;
  isNullable: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
}

export type QueryCapability = 
  | 'select'
  | 'insert'
  | 'update'
  | 'delete'
  | 'aggregate'
  | 'join'
  | 'window-functions';

// Integration Events
export interface IntegrationEvent {
  id: string;
  integrationId: string;
  type: IntegrationEventType;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  duration?: number;
  recordsProcessed?: number;
}

export type IntegrationEventType = 
  | 'sync-started'
  | 'sync-completed'
  | 'sync-failed'
  | 'connection-established'
  | 'connection-lost'
  | 'configuration-updated'
  | 'rate-limit-exceeded'
  | 'data-transformed'
  | 'error-resolved';

// Integration Health
export interface IntegrationHealth {
  integrationId: string;
  overallScore: number;
  connectionHealth: HealthMetric;
  dataQuality: HealthMetric;
  performance: HealthMetric;
  errorRate: HealthMetric;
  lastCheck: Date;
  recommendations: HealthRecommendation[];
}

export interface HealthMetric {
  score: number; // 0-100
  status: 'excellent' | 'good' | 'fair' | 'poor';
  trend: 'improving' | 'stable' | 'declining';
  details: string;
}

export interface HealthRecommendation {
  type: 'optimization' | 'fix' | 'upgrade';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  actionRequired: string;
  estimatedImpact: string;
}

// Webhook Types
export interface WebhookIntegration extends Integration {
  type: 'webhook';
  url: string;
  events: WebhookEvent[];
  headers: Record<string, string>;
  authentication: WebhookAuth;
  retryPolicy: WebhookRetryPolicy;
}

export interface WebhookEvent {
  name: string;
  description: string;
  payloadSchema: Record<string, any>;
  isActive: boolean;
}

export interface WebhookAuth {
  type: 'none' | 'basic' | 'bearer' | 'api-key' | 'signature';
  credentials: Record<string, string>;
}

export interface WebhookRetryPolicy {
  maxRetries: number;
  retryIntervals: number[]; // in seconds
  failureThreshold: number;
}

// Integration Marketplace
export interface IntegrationTemplate {
  id: string;
  name: string;
  description: string;
  provider: string;
  category: IntegrationCategory;
  logoUrl: string;
  isOfficial: boolean;
  rating: number;
  installCount: number;
  documentation: string;
  supportLevel: 'community' | 'partner' | 'official';
  configurationSchema: Record<string, any>;
  requiredPermissions: string[];
  tags: string[];
  version: string;
  lastUpdated: Date;
}

// API Response Types
export interface IntegrationsResponse {
  integrations: Integration[];
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface IntegrationTemplatesResponse {
  templates: IntegrationTemplate[];
  categories: IntegrationCategory[];
  totalCount: number;
}

export interface IntegrationHealthResponse {
  health: IntegrationHealth[];
  summary: {
    totalIntegrations: number;
    healthyIntegrations: number;
    warningIntegrations: number;
    criticalIntegrations: number;
    averageHealth: number;
  };
}