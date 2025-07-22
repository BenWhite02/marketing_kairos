// src/components/business/analytics/Charts/LineChart.tsx

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Brush
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { classNames } from '../../../../utils/dom/classNames';

interface DataPoint {
  [key: string]: any;
  date?: string;
  timestamp?: string | Date;
}

interface LineChartProps {
  data: DataPoint[];
  xAxis: string;
  yAxis: string | string[];
  height?: number;
  loading?: boolean;
  className?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  showBrush?: boolean;
  showTooltip?: boolean;
  colors?: string[];
  strokeWidth?: number;
  animationDuration?: number;
  formatXAxis?: (value: any) => string;
  formatYAxis?: (value: any) => string;
  formatTooltip?: (value: any, name: string) => [string, string];
}

const defaultColors = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // green
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#06B6D4', // cyan
  '#EC4899', // pink
  '#84CC16'  // lime
];

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const formatNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString();
};

const formatDate = (dateString: string | Date): string => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'MMM dd');
  } catch {
    return dateString.toString();
  }
};

const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

const CustomTooltip: React.FC<any> = ({ active, payload, label, formatTooltip }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      <p className="text-sm font-medium text-gray-900 mb-2">
        {formatDate(label)}
      </p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600">{entry.name}:</span>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {formatTooltip ? formatTooltip(entry.value, entry.name)[0] : formatNumber(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

const LoadingSkeleton: React.FC<{ height: number }> = ({ height }) => (
  <div className="animate-pulse" style={{ height }}>
    <div className="h-full bg-gray-200 rounded" />
  </div>
);

export const LineChart: React.FC<LineChartProps> = ({
  data,
  xAxis,
  yAxis,
  height = 300,
  loading = false,
  className,
  showGrid = true,
  showLegend = true,
  showBrush = false,
  showTooltip = true,
  colors = defaultColors,
  strokeWidth = 2,
  animationDuration = 1500,
  formatXAxis,
  formatYAxis,
  formatTooltip
}) => {
  const yAxisKeys = useMemo(() => {
    return Array.isArray(yAxis) ? yAxis : [yAxis];
  }, [yAxis]);

  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      // Ensure date formatting for x-axis
      [xAxis]: item[xAxis]
    }));
  }, [data, xAxis]);

  const defaultFormatXAxis = (value: any) => {
    if (formatXAxis) return formatXAxis(value);
    if (xAxis === 'date' || xAxis === 'timestamp') {
      return formatDate(value);
    }
    return value.toString();
  };

  const defaultFormatYAxis = (value: any) => {
    if (formatYAxis) return formatYAxis(value);
    return formatNumber(value);
  };

  if (loading) {
    return <LoadingSkeleton height={height} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={classNames('w-full', className)}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={processedData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: showBrush ? 60 : 5
          }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E5E7EB"
              horizontal={true}
              vertical={false}
            />
          )}
          
          <XAxis
            dataKey={xAxis}
            tickFormatter={defaultFormatXAxis}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={{ stroke: '#E5E7EB' }}
            interval="preserveStartEnd"
          />
          
          <YAxis
            tickFormatter={defaultFormatYAxis}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={{ stroke: '#E5E7EB' }}
            width={60}
          />
          
          {showTooltip && (
            <Tooltip
              content={<CustomTooltip formatTooltip={formatTooltip} />}
              cursor={{ stroke: '#9CA3AF', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
          )}
          
          {showLegend && yAxisKeys.length > 1 && (
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '12px'
              }}
            />
          )}
          
          {yAxisKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[index % colors.length]}
              strokeWidth={strokeWidth}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={animationDuration}
              connectNulls={false}
            />
          ))}
          
          {showBrush && (
            <Brush
              dataKey={xAxis}
              height={30}
              stroke={colors[0]}
              tickFormatter={defaultFormatXAxis}
            />
          )}
        </RechartsLineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default LineChart;