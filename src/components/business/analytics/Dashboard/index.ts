// src/components/business/analytics/Dashboard/index.ts

export { AnalyticsDashboard } from './AnalyticsDashboard';
export { PerformanceOverview } from './PerformanceOverview';
export { MetricsSummary } from './MetricsSummary';
export { RevenueAttribution } from './RevenueAttribution';

export type {
  PerformanceMetric,
  MetricData,
  AttributionData
} from './types';

// Component type definitions
export interface DashboardProps {
  className?: string;
  compact?: boolean;
  customTimeRange?: {
    start: Date;
    end: Date;
  };
}

export interface AnalyticsMetrics {
  revenue: number;
  roas: number;
  conversions: number;
  clicks: number;
  impressions: number;
  ctr: number;
  conversionRate: number;
  reach: number;
  activeCampaigns: number;
  momentsDelivered: number;
  campaignEfficiency: number;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  metric: string;
}

export interface ChannelPerformance {
  channel: string;
  revenue: number;
  conversions: number;
  roas: number;
  cost: number;
  impressions: number;
  clicks: number;
  ctr: number;
  color: string;
}

export interface CampaignSummary {
  total: number;
  active: number;
  performance: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    ctr: number;
    conversionRate: number;
    averageOrderValue: number;
  };
  trends: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
  };
}