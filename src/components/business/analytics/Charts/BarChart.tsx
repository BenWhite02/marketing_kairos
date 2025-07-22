// src/components/business/analytics/Charts/BarChart.tsx

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';
import { classNames } from '../../../../utils/dom/classNames';

interface DataPoint {
  [key: string]: any;
}

interface BarChartProps {
  data: DataPoint[];
  xAxis: string;
  yAxis: string | string[];
  height?: number;
  loading?: boolean;
  className?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  colors?: string[];
  orientation?: 'vertical' | 'horizontal';
  stackId?: string;
  animationDuration?: number;
  formatXAxis?: (value: any) => string;
  formatYAxis?: (value: any) => string;
  formatTooltip?: (value: any, name: string) => [string, string];
  onBarClick?: (data: any) => void;
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
        {label}
      </p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-sm"
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

export const BarChart: React.FC<BarChartProps> = ({
  data,
  xAxis,
  yAxis,
  height = 300,
  loading = false,
  className,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  colors = defaultColors,
  orientation = 'vertical',
  stackId,
  animationDuration = 1500,
  formatXAxis,
  formatYAxis,
  formatTooltip,
  onBarClick
}) => {
  const yAxisKeys = useMemo(() => {
    return Array.isArray(yAxis) ? yAxis : [yAxis];
  }, [yAxis]);

  const processedData = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      _index: index
    }));
  }, [data]);

  const defaultFormatXAxis = (value: any) => {
    if (formatXAxis) return formatXAxis(value);
    return value.toString();
  };

  const defaultFormatYAxis = (value: any) => {
    if (formatYAxis) return formatYAxis(value);
    return formatNumber(value);
  };

  const handleBarClick = (data: any, index: number) => {
    if (onBarClick) {
      onBarClick({ ...data, index });
    }
  };

  if (loading) {
    return <LoadingSkeleton height={height} />;
  }

  const ChartComponent = orientation === 'horizontal' ? RechartsBarChart : RechartsBarChart;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={classNames('w-full', className)}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent
          data={processedData}
          layout={orientation === 'horizontal' ? 'horizontal' : 'vertical'}
          margin={{
            top: 5,
            right: 30,
            left: orientation === 'horizontal' ? 100 : 20,
            bottom: 5
          }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E5E7EB"
              horizontal={orientation === 'vertical'}
              vertical={orientation === 'horizontal'}
            />
          )}
          
          {orientation === 'vertical' ? (
            <>
              <XAxis
                dataKey={xAxis}
                tickFormatter={defaultFormatXAxis}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={{ stroke: '#E5E7EB' }}
                interval={0}
                angle={data.length > 8 ? -45 : 0}
                textAnchor={data.length > 8 ? 'end' : 'middle'}
                height={data.length > 8 ? 80 : 60}
              />
              <YAxis
                tickFormatter={defaultFormatYAxis}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={{ stroke: '#E5E7EB' }}
                width={60}
              />
            </>
          ) : (
            <>
              <XAxis
                type="number"
                tickFormatter={defaultFormatYAxis}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis
                type="category"
                dataKey={xAxis}
                tickFormatter={defaultFormatXAxis}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={{ stroke: '#E5E7EB' }}
                width={90}
              />
            </>
          )}
          
          {showTooltip && (
            <Tooltip
              content={<CustomTooltip formatTooltip={formatTooltip} />}
              cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
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
          
          {yAxisKeys.map((key, keyIndex) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colors[keyIndex % colors.length]}
              stackId={stackId}
              animationDuration={animationDuration}
              onClick={(data, index) => handleBarClick(data, index)}
              cursor={onBarClick ? 'pointer' : 'default'}
              radius={[2, 2, 0, 0]}
            >
              {yAxisKeys.length === 1 && (
                processedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || colors[index % colors.length]}
                  />
                ))
              )}
            </Bar>
          ))}
        </ChartComponent>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default BarChart;