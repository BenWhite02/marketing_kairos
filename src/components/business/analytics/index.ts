// src/components/business/analytics/index.ts

// Dashboard Components
export { AnalyticsDashboard } from './Dashboard/AnalyticsDashboard';
export { PerformanceOverview } from './Dashboard/PerformanceOverview';
export { MetricsSummary } from './Dashboard/MetricsSummary';
export { RevenueAttribution } from './Dashboard/RevenueAttribution';

// Chart Components
export { LineChart } from './Charts/LineChart';
export { BarChart } from './Charts/BarChart';
export { PieChart } from './Charts/PieChart';
export { FunnelChart } from './Charts/FunnelChart';

// Chart utilities and types
export {
  chartColorPalettes,
  chartFormatters,
  chartBreakpoints,
  chartDimensions
} from './Charts';

export type {
  BaseChartProps,
  InteractiveChartProps,
  FormattingProps,
  ChartDataPoint,
  TimeSeriesDataPoint,
  CategoryDataPoint,
  FunnelDataPoint
} from './Charts';

// Dashboard types
export type {
  DashboardProps,
  AnalyticsMetrics,
  TimeSeriesData,
  ChannelPerformance,
  CampaignSummary,
  PerformanceMetric,
  MetricData,
  AttributionData
} from './Dashboard';

// Pages
export { AnalyticsPage } from '../../pages/analytics/AnalyticsPage';

// Hooks
export { useAnalytics } from '../../hooks/business/useAnalytics';

// Analytics utilities
export const analyticsUtils = {
  formatCurrency: (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  },

  formatNumber: (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  },

  formatPercentage: (value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`;
  },

  formatRatio: (value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}:1`;
  },

  calculateGrowthRate: (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  },

  calculateROAS: (revenue: number, cost: number): number => {
    if (cost === 0) return 0;
    return revenue / cost;
  },

  calculateCTR: (clicks: number, impressions: number): number => {
    if (impressions === 0) return 0;
    return (clicks / impressions) * 100;
  },

  calculateConversionRate: (conversions: number, clicks: number): number => {
    if (clicks === 0) return 0;
    return (conversions / clicks) * 100;
  },

  calculateAverageOrderValue: (revenue: number, orders: number): number => {
    if (orders === 0) return 0;
    return revenue / orders;
  },

  generateDateRange: (days: number): string[] => {
    const dates: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  },

  aggregateMetrics: (data: any[], groupBy: string): any[] => {
    const grouped = data.reduce((acc, item) => {
      const key = item[groupBy];
      if (!acc[key]) {
        acc[key] = { ...item, count: 0 };
      }
      acc[key].count += 1;
      
      // Sum numeric values
      Object.keys(item).forEach(prop => {
        if (typeof item[prop] === 'number' && prop !== groupBy) {
          acc[key][prop] = (acc[key][prop] || 0) + item[prop];
        }
      });
      
      return acc;
    }, {});

    return Object.values(grouped);
  },

  interpolateData: (data: any[], targetLength: number): any[] => {
    if (data.length >= targetLength) return data;
    
    const step = (data.length - 1) / (targetLength - 1);
    const interpolated: any[] = [];
    
    for (let i = 0; i < targetLength; i++) {
      const index = i * step;
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      const weight = index - lower;
      
      if (lower === upper) {
        interpolated.push(data[lower]);
      } else {
        // Simple linear interpolation for numeric values
        const interpolatedItem = { ...data[lower] };
        Object.keys(data[lower]).forEach(key => {
          if (typeof data[lower][key] === 'number' && typeof data[upper][key] === 'number') {
            interpolatedItem[key] = data[lower][key] * (1 - weight) + data[upper][key] * weight;
          }
        });
        interpolated.push(interpolatedItem);
      }
    }
    
    return interpolated;
  }
};

// Export default configuration
export const analyticsConfig = {
  defaultTimeRange: '30d',
  defaultRefreshInterval: 60000,
  maxDataPoints: 1000,
  defaultChartHeight: 300,
  animationDuration: 1500,
  colors: {
    primary: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#06B6D4',
    purple: '#8B5CF6',
    pink: '#EC4899',
    lime: '#84CC16'
  },
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1280
  }
};