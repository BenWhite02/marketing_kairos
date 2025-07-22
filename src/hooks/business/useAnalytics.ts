// src/hooks/business/useAnalytics.ts

import { useState, useEffect, useCallback, useMemo } from 'react';

// Types for analytics data
interface PerformanceMetric {
  id: string;
  label: string;
  value: string | number;
  previousValue?: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
  format?: 'currency' | 'percentage' | 'number' | 'decimal';
  description?: string;
}

interface MetricData {
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

interface AttributionData {
  channel: string;
  revenue: number;
  percentage: number;
  previousRevenue?: number;
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  conversions: number;
  roas: number;
  cost: number;
  color: string;
}

interface CampaignAnalytics {
  summary: MetricData;
  performanceTrend: Array<{
    date: string;
    performance: number;
    [key: string]: any;
  }>;
  roiDistribution: Array<{
    campaign: string;
    roi: number;
    [key: string]: any;
  }>;
  channelPerformance: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  funnelData: Array<{
    name: string;
    value: number;
    description?: string;
  }>;
}

interface MomentAnalytics {
  summary: MetricData;
  deliveryRates: Array<{
    date: string;
    rate: number;
  }>;
  engagementByChannel: Array<{
    channel: string;
    engagement: number;
  }>;
}

interface AtomPerformance {
  summary: MetricData;
  usageDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

interface AudienceInsights {
  growthTrend: Array<{
    date: string;
    audience: number;
  }>;
  segmentDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

interface DashboardData {
  lastUpdated: Date;
  totalRevenue: number;
  totalConversions: number;
  totalReach: number;
  averageROAS: number;
}

interface UseAnalyticsParams {
  timeRange: string | { start: Date; end: Date };
  view: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseAnalyticsReturn {
  // Data
  dashboardData: DashboardData | null;
  performanceMetrics: PerformanceMetric[];
  revenueData: AttributionData[];
  campaignAnalytics: CampaignAnalytics | null;
  momentAnalytics: MomentAnalytics | null;
  atomPerformance: AtomPerformance | null;
  audienceInsights: AudienceInsights | null;
  
  // State
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  refreshData: () => Promise<void>;
  exportData: (format: 'csv' | 'excel' | 'pdf') => Promise<void>;
}

// Mock data generators
const generateMockPerformanceMetrics = (): PerformanceMetric[] => {
  return [
    {
      id: 'revenue',
      label: 'Total Revenue',
      value: 2847293,
      previousValue: 2456180,
      change: 15.9,
      changeType: 'increase',
      icon: (() => null) as any,
      color: 'green',
      format: 'currency'
    },
    {
      id: 'roas',
      label: 'ROAS',
      value: 4.2,
      previousValue: 3.8,
      change: 10.5,
      changeType: 'increase',
      icon: (() => null) as any,
      color: 'blue',
      format: 'decimal'
    },
    {
      id: 'conversions',
      label: 'Conversions',
      value: 18765,
      previousValue: 16432,
      change: 14.2,
      changeType: 'increase',
      icon: (() => null) as any,
      color: 'purple',
      format: 'number'
    },
    {
      id: 'ctr',
      label: 'Click-Through Rate',
      value: 3.4,
      previousValue: 3.1,
      change: 9.7,
      changeType: 'increase',
      icon: (() => null) as any,
      color: 'indigo',
      format: 'percentage'
    }
  ];
};

const generateMockAttributionData = (): AttributionData[] => {
  return [
    {
      channel: 'Email',
      revenue: 847293,
      percentage: 32.4,
      previousRevenue: 723456,
      trend: 17.1,
      trendDirection: 'up',
      conversions: 5847,
      roas: 5.2,
      cost: 163133,
      color: '#3B82F6'
    },
    {
      channel: 'Paid Search',
      revenue: 634821,
      percentage: 24.3,
      previousRevenue: 689234,
      trend: -7.9,
      trendDirection: 'down',
      conversions: 3921,
      roas: 3.8,
      cost: 167058,
      color: '#EF4444'
    },
    {
      channel: 'Social Media',
      revenue: 456789,
      percentage: 17.5,
      previousRevenue: 398765,
      trend: 14.5,
      trendDirection: 'up',
      conversions: 2834,
      roas: 4.1,
      cost: 111412,
      color: '#10B981'
    },
    {
      channel: 'Display',
      revenue: 298456,
      percentage: 11.4,
      previousRevenue: 324567,
      trend: -8.0,
      trendDirection: 'down',
      conversions: 1923,
      roas: 2.9,
      cost: 102917,
      color: '#F59E0B'
    }
  ];
};

const generateMockCampaignAnalytics = (): CampaignAnalytics => {
  return {
    summary: {
      total: 47,
      active: 23,
      performance: {
        impressions: 12847293,
        clicks: 456789,
        conversions: 18765,
        revenue: 2847293,
        ctr: 3.4,
        conversionRate: 4.1,
        averageOrderValue: 151.7
      },
      trends: {
        impressions: 12.3,
        clicks: 15.7,
        conversions: 14.2,
        revenue: 15.9
      }
    },
    performanceTrend: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      performance: 75 + Math.random() * 20 + Math.sin(i / 5) * 10
    })),
    roiDistribution: [
      { campaign: 'Summer Sale', roi: 4.2 },
      { campaign: 'Back to School', roi: 3.8 },
      { campaign: 'Holiday Promo', roi: 5.1 },
      { campaign: 'New Product Launch', roi: 2.9 }
    ],
    channelPerformance: [
      { name: 'Email', value: 35, color: '#3B82F6' },
      { name: 'Social', value: 28, color: '#10B981' },
      { name: 'Search', value: 22, color: '#F59E0B' },
      { name: 'Display', value: 15, color: '#EF4444' }
    ],
    funnelData: [
      { name: 'Impressions', value: 1000000, description: 'Total ad impressions' },
      { name: 'Clicks', value: 34000, description: 'Users who clicked' },
      { name: 'Visits', value: 28500, description: 'Website visits' },
      { name: 'Leads', value: 8200, description: 'Lead form submissions' },
      { name: 'Conversions', value: 1850, description: 'Completed purchases' }
    ]
  };
};

const generateMockMomentAnalytics = (): MomentAnalytics => {
  return {
    summary: {
      total: 156,
      active: 89,
      performance: {
        impressions: 8947293,
        clicks: 234567,
        conversions: 12456,
        revenue: 1847293,
        ctr: 2.6,
        conversionRate: 5.3,
        averageOrderValue: 148.3
      },
      trends: {
        impressions: 8.7,
        clicks: 12.4,
        conversions: 16.8,
        revenue: 18.2
      }
    },
    deliveryRates: Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      rate: 92 + Math.random() * 6
    })),
    engagementByChannel: [
      { channel: 'Email', engagement: 24.5 },
      { channel: 'SMS', engagement: 18.2 },
      { channel: 'Push', engagement: 12.8 },
      { channel: 'In-App', engagement: 31.7 }
    ]
  };
};

const generateMockAtomPerformance = (): AtomPerformance => {
  return {
    summary: {
      total: 234,
      active: 187,
      performance: {
        impressions: 15847293,
        clicks: 567890,
        conversions: 23456,
        revenue: 3247293,
        ctr: 3.6,
        conversionRate: 4.1,
        averageOrderValue: 138.5
      },
      trends: {
        impressions: 6.3,
        clicks: 9.1,
        conversions: 11.7,
        revenue: 13.4
      }
    },
    usageDistribution: [
      { name: 'Demographic', value: 45, color: '#3B82F6' },
      { name: 'Behavioral', value: 32, color: '#10B981' },
      { name: 'Transactional', value: 18, color: '#F59E0B' },
      { name: 'Contextual', value: 5, color: '#EF4444' }
    ]
  };
};

const generateMockAudienceInsights = (): AudienceInsights => {
  return {
    growthTrend: Array.from({ length: 90 }, (_, i) => ({
      date: new Date(Date.now() - (89 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      audience: 850000 + i * 1200 + Math.random() * 5000
    })),
    segmentDistribution: [
      { name: 'New Customers', value: 28, color: '#3B82F6' },
      { name: 'Returning Customers', value: 42, color: '#10B981' },
      { name: 'VIP Customers', value: 18, color: '#F59E0B' },
      { name: 'At-Risk Customers', value: 12, color: '#EF4444' }
    ]
  };
};

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useAnalytics = (params: UseAnalyticsParams): UseAnalyticsReturn => {
  const { timeRange, view, autoRefresh = false, refreshInterval = 30000 } = params;

  // State
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [revenueData, setRevenueData] = useState<AttributionData[]>([]);
  const [campaignAnalytics, setCampaignAnalytics] = useState<CampaignAnalytics | null>(null);
  const [momentAnalytics, setMomentAnalytics] = useState<MomentAnalytics | null>(null);
  const [atomPerformance, setAtomPerformance] = useState<AtomPerformance | null>(null);
  const [audienceInsights, setAudienceInsights] = useState<AudienceInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Data fetching function
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate API call
      await delay(800);

      // Generate mock data based on view
      const metrics = generateMockPerformanceMetrics();
      const revenue = generateMockAttributionData();
      const campaigns = generateMockCampaignAnalytics();
      const moments = generateMockMomentAnalytics();
      const atoms = generateMockAtomPerformance();
      const audience = generateMockAudienceInsights();

      const dashboard: DashboardData = {
        lastUpdated: new Date(),
        totalRevenue: revenue.reduce((sum, item) => sum + item.revenue, 0),
        totalConversions: campaigns.summary.performance.conversions,
        totalReach: campaigns.summary.performance.impressions,
        averageROAS: revenue.reduce((sum, item) => sum + item.roas, 0) / revenue.length
      };

      // Update state
      setDashboardData(dashboard);
      setPerformanceMetrics(metrics);
      setRevenueData(revenue);
      setCampaignAnalytics(campaigns);
      setMomentAnalytics(moments);
      setAtomPerformance(atoms);
      setAudienceInsights(audience);

    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange, view]);

  // Refresh data function
  const refreshData = useCallback(async () => {
    await fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Export data function
  const exportData = useCallback(async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      // Simulate export process
      await delay(1000);
      
      // In a real implementation, this would trigger a download
      console.log(`Exporting analytics data as ${format}`);
      
      // Mock file download
      const filename = `analytics-${new Date().toISOString().split('T')[0]}.${format}`;
      console.log(`Download started: ${filename}`);
      
    } catch (err) {
      setError(err as Error);
    }
  }, [dashboardData, performanceMetrics, revenueData]);

  // Initial data fetch
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchAnalyticsData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchAnalyticsData]);

  return {
    // Data
    dashboardData,
    performanceMetrics,
    revenueData,
    campaignAnalytics,
    momentAnalytics,
    atomPerformance,
    audienceInsights,
    
    // State
    isLoading,
    error,
    
    // Actions
    refreshData,
    exportData
  };
};