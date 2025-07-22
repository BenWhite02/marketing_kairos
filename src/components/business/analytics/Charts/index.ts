// src/components/business/analytics/Charts/index.ts

export { LineChart } from './LineChart';
export { BarChart } from './BarChart';
export { PieChart } from './PieChart';
export { FunnelChart } from './FunnelChart';

// Chart component prop types
export interface BaseChartProps {
  height?: number;
  loading?: boolean;
  className?: string;
  animationDuration?: number;
}

export interface InteractiveChartProps extends BaseChartProps {
  showTooltip?: boolean;
  showLegend?: boolean;
  onDataClick?: (data: any, index: number) => void;
}

export interface FormattingProps {
  formatValue?: (value: number) => string;
  formatLabel?: (label: string) => string;
  formatTooltip?: (value: any, name: string) => [string, string];
}

// Common data interfaces
export interface ChartDataPoint {
  [key: string]: any;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  [key: string]: any;
}

export interface CategoryDataPoint {
  category: string;
  value: number;
  color?: string;
  [key: string]: any;
}

export interface FunnelDataPoint {
  name: string;
  value: number;
  percentage?: number;
  color?: string;
  dropoffRate?: number;
  conversionRate?: number;
  description?: string;
}

// Chart color palettes
export const chartColorPalettes = {
  default: [
    '#3B82F6', // blue
    '#EF4444', // red
    '#10B981', // green
    '#F59E0B', // amber
    '#8B5CF6', // violet
    '#06B6D4', // cyan
    '#EC4899', // pink
    '#84CC16'  // lime
  ],
  
  blues: [
    '#3B82F6', // blue-500
    '#1D4ED8', // blue-700
    '#1E40AF', // blue-800
    '#1E3A8A', // blue-900
    '#172554'  // blue-950
  ],
  
  performance: [
    '#10B981', // green - good
    '#F59E0B', // amber - warning
    '#EF4444', // red - critical
    '#6B7280'  // gray - neutral
  ],
  
  sequential: [
    '#EFF6FF', // blue-50
    '#DBEAFE', // blue-100
    '#BFDBFE', // blue-200
    '#93C5FD', // blue-300
    '#60A5FA', // blue-400
    '#3B82F6', // blue-500
    '#2563EB', // blue-600
    '#1D4ED8'  // blue-700
  ]
};

// Chart formatting utilities
export const chartFormatters = {
  currency: (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  },
  
  number: (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  },
  
  percentage: (value: number): string => {
    return `${value.toFixed(1)}%`;
  },
  
  decimal: (value: number, decimals: number = 1): string => {
    return value.toFixed(decimals);
  },
  
  date: (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  },
  
  dateTime: (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }
};

// Chart responsive breakpoints
export const chartBreakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280
};

// Default chart dimensions
export const chartDimensions = {
  small: 200,
  medium: 300,
  large: 400,
  xlarge: 500
};