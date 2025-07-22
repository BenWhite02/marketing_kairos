// src/components/business/analytics/Charts/PieChart.tsx

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { classNames } from '../../../../utils/dom/classNames';

interface DataPoint {
  name: string;
  value: number;
  percentage?: number;
  color?: string;
  [key: string]: any;
}

interface PieChartProps {
  data: DataPoint[];
  height?: number;
  loading?: boolean;
  className?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  showLabels?: boolean;
  showPercentages?: boolean;
  colors?: string[];
  innerRadius?: number;
  outerRadius?: number;
  animationDuration?: number;
  formatValue?: (value: number) => string;
  onSegmentClick?: (data: DataPoint) => void;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
}

const defaultColors = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // green
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#06B6D4', // cyan
  '#EC4899', // pink
  '#84CC16', // lime
  '#F97316', // orange
  '#6366F1'  // indigo
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

const CustomTooltip: React.FC<any> = ({ active, payload, formatValue }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      <div className="flex items-center space-x-2 mb-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: data.color }}
        />
        <span className="text-sm font-medium text-gray-900">{data.name}</span>
      </div>
      <div className="space-y-1">
        <div className="text-sm text-gray-600">
          Value: <span className="font-medium text-gray-900">
            {formatValue ? formatValue(data.value) : formatNumber(data.value)}
          </span>
        </div>
        {data.percentage && (
          <div className="text-sm text-gray-600">
            Percentage: <span className="font-medium text-gray-900">
              {formatPercentage(data.percentage)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const CustomLabel: React.FC<any> = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, showPercentages }) => {
  if (!showPercentages || percent < 0.05) return null; // Don't show labels for slices smaller than 5%

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomLegend: React.FC<any> = ({ payload, formatValue, onLegendClick, legendPosition }) => {
  const isHorizontal = legendPosition === 'top' || legendPosition === 'bottom';
  
  return (
    <div className={classNames(
      'flex flex-wrap gap-2',
      isHorizontal ? 'justify-center' : 'flex-col'
    )}>
      {payload.map((entry: any, index: number) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className={classNames(
            'flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors',
            isHorizontal ? 'flex-shrink-0' : 'w-full'
          )}
          onClick={() => onLegendClick && onLegendClick(entry.payload)}
        >
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-700 truncate">{entry.value}</span>
          <span className="text-sm font-medium text-gray-900 ml-auto">
            {formatValue ? formatValue(entry.payload.value) : formatNumber(entry.payload.value)}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

const LoadingSkeleton: React.FC<{ height: number }> = ({ height }) => (
  <div className="animate-pulse flex items-center justify-center" style={{ height }}>
    <div className="w-48 h-48 bg-gray-200 rounded-full" />
  </div>
);

export const PieChart: React.FC<PieChartProps> = ({
  data,
  height = 300,
  loading = false,
  className,
  showLegend = true,
  showTooltip = true,
  showLabels = false,
  showPercentages = true,
  colors = defaultColors,
  innerRadius = 0,
  outerRadius,
  animationDuration = 1500,
  formatValue,
  onSegmentClick,
  legendPosition = 'right'
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const processedData = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    return data.map((item, index) => ({
      ...item,
      percentage: item.percentage || (item.value / total) * 100,
      color: item.color || colors[index % colors.length]
    }));
  }, [data, colors]);

  const calculatedOuterRadius = outerRadius || Math.min(height * 0.35, 120);

  const handleSegmentClick = (data: DataPoint, index: number) => {
    if (onSegmentClick) {
      onSegmentClick(data);
    }
  };

  const handleMouseEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  if (loading) {
    return <LoadingSkeleton height={height} />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-gray-500" style={{ height }}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2" />
          <p className="text-sm">No data available</p>
        </div>
      </div>
    );
  }

  const isHorizontalLegend = legendPosition === 'top' || legendPosition === 'bottom';
  const legendComponent = showLegend && (
    <CustomLegend
      payload={processedData}
      formatValue={formatValue}
      onLegendClick={onSegmentClick}
      legendPosition={legendPosition}
    />
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={classNames('w-full', className)}
      style={{ height }}
    >
      <div className={classNames(
        'h-full',
        showLegend && isHorizontalLegend ? 'flex flex-col' : 'flex',
        showLegend && legendPosition === 'left' ? 'flex-row-reverse' : ''
      )}>
        {/* Legend - Top/Left */}
        {showLegend && (legendPosition === 'top' || legendPosition === 'left') && (
          <div className={classNames(
            legendPosition === 'top' ? 'mb-4' : 'mr-6 flex-shrink-0',
            legendPosition === 'left' ? 'w-48' : ''
          )}>
            {legendComponent}
          </div>
        )}

        {/* Chart */}
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={processedData}
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius={calculatedOuterRadius}
                paddingAngle={2}
                dataKey="value"
                animationDuration={animationDuration}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleSegmentClick}
                cursor={onSegmentClick ? 'pointer' : 'default'}
                label={showLabels ? (props) => <CustomLabel {...props} showPercentages={showPercentages} /> : false}
                labelLine={false}
              >
                {processedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={activeIndex === index ? '#374151' : 'none'}
                    strokeWidth={activeIndex === index ? 2 : 0}
                    style={{
                      filter: activeIndex === index ? 'brightness(1.1)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  />
                ))}
              </Pie>
              
              {showTooltip && (
                <Tooltip
                  content={<CustomTooltip formatValue={formatValue} />}
                />
              )}
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend - Bottom/Right */}
        {showLegend && (legendPosition === 'bottom' || legendPosition === 'right') && (
          <div className={classNames(
            legendPosition === 'bottom' ? 'mt-4' : 'ml-6 flex-shrink-0',
            legendPosition === 'right' ? 'w-48' : ''
          )}>
            {legendComponent}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PieChart;