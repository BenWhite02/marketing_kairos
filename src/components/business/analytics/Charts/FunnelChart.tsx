// src/components/business/analytics/Charts/FunnelChart.tsx

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { classNames } from '../../../../utils/dom/classNames';

interface FunnelStage {
  name: string;
  value: number;
  percentage?: number;
  color?: string;
  dropoffRate?: number;
  conversionRate?: number;
  description?: string;
}

interface FunnelChartProps {
  data: FunnelStage[];
  height?: number;
  loading?: boolean;
  className?: string;
  showLabels?: boolean;
  showValues?: boolean;
  showPercentages?: boolean;
  showDropoff?: boolean;
  orientation?: 'vertical' | 'horizontal';
  colors?: string[];
  animationDuration?: number;
  formatValue?: (value: number) => string;
  onStageClick?: (stage: FunnelStage, index: number) => void;
}

const defaultColors = [
  '#3B82F6', // blue
  '#1D4ED8', // blue-700
  '#1E40AF', // blue-800
  '#1E3A8A', // blue-900
  '#172554'  // blue-950
];

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

const LoadingSkeleton: React.FC<{ height: number }> = ({ height }) => (
  <div className="animate-pulse space-y-4" style={{ height }}>
    {Array.from({ length: 5 }).map((_, index) => (
      <div
        key={index}
        className="bg-gray-200 rounded"
        style={{
          height: height / 6,
          width: `${100 - index * 15}%`,
          marginLeft: `${index * 7.5}%`
        }}
      />
    ))}
  </div>
);

export const FunnelChart: React.FC<FunnelChartProps> = ({
  data,
  height = 400,
  loading = false,
  className,
  showLabels = true,
  showValues = true,
  showPercentages = true,
  showDropoff = true,
  orientation = 'vertical',
  colors = defaultColors,
  animationDuration = 1000,
  formatValue,
  onStageClick
}) => {
  const processedData = useMemo(() => {
    if (!data.length) return [];

    const maxValue = Math.max(...data.map(stage => stage.value));
    
    return data.map((stage, index) => {
      const percentage = stage.percentage || (stage.value / maxValue) * 100;
      const conversionRate = index === 0 ? 100 : (stage.value / data[0].value) * 100;
      const dropoffRate = index > 0 ? ((data[index - 1].value - stage.value) / data[index - 1].value) * 100 : 0;
      
      return {
        ...stage,
        percentage,
        conversionRate,
        dropoffRate,
        color: stage.color || colors[index % colors.length],
        width: percentage
      };
    });
  }, [data, colors]);

  const defaultFormatValue = (value: number) => {
    if (formatValue) return formatValue(value);
    return formatNumber(value);
  };

  const handleStageClick = (stage: FunnelStage, index: number) => {
    if (onStageClick) {
      onStageClick(stage, index);
    }
  };

  if (loading) {
    return <LoadingSkeleton height={height} />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-gray-500" style={{ height }}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded mx-auto mb-2" />
          <p className="text-sm">No funnel data available</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={classNames('w-full', className)}
      style={{ height }}
    >
      <div className="h-full flex flex-col justify-center space-y-2">
        {processedData.map((stage, index) => (
          <div key={index} className="relative">
            {/* Funnel Stage */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: `${stage.width}%`, opacity: 1 }}
              transition={{
                duration: animationDuration / 1000,
                delay: index * 0.1,
                ease: 'easeOut'
              }}
              className={classNames(
                'relative mx-auto rounded-lg shadow-sm border border-gray-200 transition-all duration-200',
                onStageClick ? 'cursor-pointer hover:shadow-md' : ''
              )}
              style={{
                backgroundColor: stage.color,
                height: `${Math.max(height / data.length - 8, 40)}px`,
                minHeight: '40px'
              }}
              onClick={() => handleStageClick(stage, index)}
            >
              {/* Stage Content */}
              <div className="h-full flex items-center justify-between px-4 text-white">
                <div className="flex-1">
                  {showLabels && (
                    <div className="font-medium text-sm lg:text-base">
                      {stage.name}
                    </div>
                  )}
                  
                  {stage.description && (
                    <div className="text-xs opacity-90 mt-1">
                      {stage.description}
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  {showValues && (
                    <div className="font-bold text-sm lg:text-lg">
                      {defaultFormatValue(stage.value)}
                    </div>
                  )}
                  
                  {showPercentages && (
                    <div className="text-xs opacity-90">
                      {formatPercentage(stage.conversionRate)}
                    </div>
                  )}
                </div>
              </div>

              {/* Hover Effect Overlay */}
              {onStageClick && (
                <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-200 rounded-lg" />
              )}
            </motion.div>

            {/* Dropoff Indicator */}
            {showDropoff && index < processedData.length - 1 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: (index + 1) * 0.1 + 0.2
                }}
                className="flex items-center justify-center py-2"
              >
                <div className="flex items-center space-x-2 text-gray-500">
                  <ChevronDownIcon className="h-4 w-4" />
                  
                  {stage.dropoffRate > 0 && (
                    <div className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                      -{formatPercentage(stage.dropoffRate)} dropoff
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-gray-900">
            {defaultFormatValue(processedData[0]?.value || 0)}
          </div>
          <div className="text-xs text-gray-600">Total Visitors</div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-green-600">
            {defaultFormatValue(processedData[processedData.length - 1]?.value || 0)}
          </div>
          <div className="text-xs text-gray-600">Conversions</div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-blue-600">
            {formatPercentage(processedData[processedData.length - 1]?.conversionRate || 0)}
          </div>
          <div className="text-xs text-gray-600">Conversion Rate</div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-orange-600">
            {processedData.length}
          </div>
          <div className="text-xs text-gray-600">Funnel Steps</div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FunnelChart;