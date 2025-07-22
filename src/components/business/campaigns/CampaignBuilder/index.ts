// src/components/business/campaigns/CampaignBuilder/index.ts

export { CampaignBuilder } from './CampaignBuilder';
export { CampaignWizard } from './CampaignWizard';
export { CampaignConfig } from './CampaignConfig';
export { TemplateLibrary } from './TemplateLibrary';

// Types and interfaces
export interface Campaign {
  id: string;
  name: string;
  type: 'acquisition' | 'retention' | 'conversion' | 'engagement' | 'winback';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  goal: string;
  budget: {
    total: number;
    spent: number;
    remaining: number;
    currency: string;
  };
  timeline: {
    startDate: string;
    endDate: string;
    duration: number;
    progress: number;
  };
  audience: {
    size: number;
    segments: string[];
  };
  channels: string[];
  moments: number;
  performance: {
    reach: number;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    roas: number;
    ctr: number;
    conversionRate: number;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  category: 'acquisition' | 'retention' | 'conversion' | 'engagement' | 'winback';
  industry: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedROI: number;
  timeToSetup: number;
  popularity: number;
  usageCount: number;
  features: string[];
  channels: string[];
  audienceSize: {
    min: number;
    max: number;
  };
  budget: {
    min: number;
    recommended: number;
  };
  preview: {
    moments: number;
    touchpoints: number;
    automations: number;
  };
  tags: string[];
  author: string;
  lastUpdated: string;
  isFavorite?: boolean;
}

export interface CampaignFormData {
  name: string;
  type: string;
  goal: string;
  description: string;
  budget: {
    total: number;
    currency: string;
    allocation: 'even' | 'weighted' | 'performance';
  };
  timeline: {
    startDate: string;
    endDate: string;
    timezone: string;
  };
  audience: {
    segments: string[];
    estimatedSize: number;
    targeting: 'broad' | 'specific' | 'custom';
  };
  channels: {
    email: boolean;
    sms: boolean;
    push: boolean;
    social: boolean;
    display: boolean;
    search: boolean;
  };
  objectives: {
    primary: string;
    secondary: string[];
    kpis: string[];
  };
}