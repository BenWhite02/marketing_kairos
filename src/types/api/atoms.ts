// src/types/api/atoms.ts
export interface EligibilityAtom {
  id: string;
  name: string;
  description?: string;
  type: AtomType;
  status: AtomStatus;
  version: number;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  logic: AtomLogic;
  dependencies?: string[];
  tags?: string[];
}

export type AtomType = 'demographic' | 'behavioral' | 'technical' | 'predictive';
export type AtomStatus = 'active' | 'inactive' | 'draft' | 'archived';

export interface AtomLogic {
  conditions: AtomCondition[];
  operator: 'AND' | 'OR';
}

export interface AtomCondition {
  field: string;
  operator: string;
  value: any;
  dataType: 'string' | 'number' | 'boolean' | 'date';
}

export interface AtomMetrics {
  performanceScore: number;
  usageCount: number;
  conversionRate: number;
  lastUsed: Date;
  averageExecutionTime: number;
  errorRate: number;
}

// src/types/api/moments.ts
export interface Moment {
  id: string;
  name: string;
  description?: string;
  status: MomentStatus;
  channels: MomentChannel[];
  content?: MomentContent;
  eligibilityAtoms: string[];
  scheduledAt?: Date;
  isPersonalized: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  campaignId?: string;
  version: number;
}

export type MomentStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'failed';
export type MomentChannel = 'email' | 'sms' | 'push' | 'web' | 'inapp';

export interface MomentContent {
  subject?: string;
  body: string;
  cta?: string;
  images?: string[];
  variables?: Record<string, any>;
}

export interface MomentMetrics {
  sentCount: number;
  deliveredCount: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  revenue: number;
  unsubscribeRate: number;
}

// src/types/api/campaigns.ts
export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  goal?: CampaignGoalConfig;
  budget?: CampaignBudget;
  startDate: Date;
  endDate: Date;
  momentsCount?: number;
  priority?: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags?: string[];
}

export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'stopped' | 'failed';
export type CampaignGoal = 'awareness' | 'engagement' | 'conversion' | 'retention' | 'revenue';

export interface CampaignGoalConfig {
  type: CampaignGoal;
  target: number;
  metric: string;
}

export interface CampaignBudget {
  total: number;
  currency: string;
  dailyLimit?: number;
  allocation?: Record<string, number>;
}

export interface CampaignMetrics {
  totalReach: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  spent: number;
  revenue: number;
  roas: number;
  costPerConversion: number;
  frequencyCap: number;
}

// src/types/business/index.ts
export * from './atoms';
export * from './moments';
export * from './campaigns';