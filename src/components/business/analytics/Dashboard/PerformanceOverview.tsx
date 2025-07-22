// src/components/business/analytics/Dashboard/PerformanceOverview.tsx

import React from 'react';
import { motion } from 'framer-motion';
import {
  CurrencyDollarIcon,
  UsersIcon,
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon,
  EyeIcon,
  HandRaisedIcon,
  BoltIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { Card, CardBody } from '../../../ui/Card';
import { classNames } from '../../../../utils/dom/classNames';

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

interface PerformanceOverviewProps {
  metrics?: PerformanceMetric[];
  timeRange: string;
  loading?: boolean;
  compact?: boolean;
  className?: string;
}

const defaultMetrics: PerformanceMetric[] = [
  {
    id: 'revenue',
    label: 'Total Revenue',
    value: 2847293,
    previousValue: 2456180,
    change: 15.9,
    changeType: 'increase',
    icon: CurrencyDollarIcon,
    color: 'green',
    format: 'currency',
    description: 'Revenue generated from all campaigns'
  },
  {
    id: 'roas',
    label: 'ROAS',
    value: 4.2,
    previousValue: 3.8,
    change: 10.5,
    changeType: 'increase',
    icon: TrendingUpIcon,
    color: 'blue',
    format: 'decimal',
    description: 'Return on advertising spend'
  },
  {
    id: 'conversions',
    label: 'Conversions',
    value: 18765,
    previousValue: 16432,
    change: 14.2,
    changeType: 'increase',
    icon: HandRaisedIcon,
    color: 'purple',
    format: 'number',
    description: 'Total campaign conversions'
  },
  {
    id: 'ctr',
    label: 'Click-Through Rate',
    value: 3.4,
    previousValue: 3.1,
    change: 9.7,
    changeType: 'increase',
    icon: EyeIcon,
    color: 'indigo',
    format: 'percentage',
    description: 'Average CTR across all campaigns'
  },
  {
    id: 'reach',
    label: 'Total Reach',
    value: 1247830,
    previousValue: 1198650,
    change: 4.1,
    changeType: 'increase',
    icon: UsersIcon,
    color: 'teal',
    format: 'number',
    description: 'Unique users reached'
  },
  {
    id: 'campaigns',
    label: 'Active Campaigns',
    value: 47,
    previousValue: 52,
    change: -9.6,
    changeType: 'decrease',
    icon: BoltIcon,
    color: 'orange',
    format: 'number',
    description: 'Currently running campaigns'
  },
  {
    id: 'moments',
    label: 'Moments Delivered',
    value: 847293,
    previousValue: 723184,
    change: 17.2,
    changeType: 'increase',
    icon: CalendarDaysIcon,
    color: 'pink',
    format: 'number',
    description: 'Total moments delivered'
  },
  {
    id: 'efficiency',
    label: 'Campaign Efficiency',
    value: 87.3,
    previousValue: 84.1,
    change: 3.8,
    changeType: 'increase',
    icon: ChartBarIcon,
    color: 'emerald',
    format: 'percentage',
    description: 'Overall campaign performance score'
  }
];

const formatValue = (value: string | number, format?: string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(numValue);
    
    case 'percentage':
      return `${numValue.toFixed(1)}%`;
    
    case 'decimal':
      return numValue.toFixed(1);
    
    case 'number':
      return new Intl.NumberFormat('en-US').format(numValue);
    
    default:
      return value.toString();
  }
};

const getTrendIcon = (changeType?: string) => {
  switch (changeType) {
    case 'increase':
      return TrendingUpIcon;
    case 'decrease':
      return TrendingDownIcon;
    default:
      return MinusIcon;
  }
};

const getTrendColor = (changeType?: string) => {
  switch (changeType) {
    case 'increase':
      return 'text-green-600';
    case 'decrease':
      return 'text-red-600';
    default:
      return 'text-gray-500';
  }
};

const getCardColorClasses = (color: string) => {
  const colorMap: Record<string, string> = {
    green: 'border-l-green-500 bg-green-50',
    blue: 'border-l-blue-500 bg-blue-50',
    purple: 'border-l-purple-500 bg-purple-50',
    indigo: 'border-l-indigo-500 bg-indigo-50',
    teal: 'border-l-teal-500 bg-teal-50',
    orange: 'border-l-orange-500 bg-orange-50',
    pink: 'border-l-pink-500 bg-pink-50',
    emerald: 'border-l-emerald-500 bg-emerald-50'
  };
  
  return colorMap[color] || 'border-l-gray-500 bg-gray-50';
};

const getIconColorClasses = (color: string) => {
  const colorMap: Record<string, string> = {
    green: 'text-green-600 bg-green-100',
    blue: 'text-blue-600 bg-blue-100',
    purple: 'text-purple-600 bg-purple-100',
    indigo: 'text-indigo-600 bg-indigo-100',
    teal: 'text-teal-600 bg-teal-100',
    orange: 'text-orange-600 bg-orange-100',
    pink: 'text-pink-600 bg-pink-100',
    emerald: 'text-emerald-600 bg-emerald-100'
  };
  
  return colorMap[color] || 'text-gray-600 bg-gray-100';
};

export const PerformanceOverview: React.FC<PerformanceOverviewProps> = ({
  metrics = defaultMetrics,
  timeRange,
  loading = false,
  compact = false,
  className
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className={classNames('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="border-l-4 border-l-gray-200">
            <CardBody className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                  <div className="w-12 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="w-16 h-6 bg-gray-200 rounded mb-2"></div>
                <div className="w-24 h-4 bg-gray-200 rounded"></div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={classNames('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}
    >
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const TrendIcon = getTrendIcon(metric.changeType);
        const cardColorClasses = getCardColorClasses(metric.color);
        const iconColorClasses = getIconColorClasses(metric.color);
        const trendColorClasses = getTrendColor(metric.changeType);

        return (
          <motion.div key={metric.id} variants={itemVariants}>
            <Card className={classNames('border-l-4', cardColorClasses, 'hover:shadow-lg transition-shadow')}>
              <CardBody className={compact ? 'p-4' : 'p-6'}>
                <div className="flex items-center justify-between mb-4">
                  <div className={classNames('p-2 rounded-lg', iconColorClasses)}>
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  {metric.change !== undefined && (
                    <div className={classNames('flex items-center space-x-1', trendColorClasses)}>
                      <TrendIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {Math.abs(metric.change).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatValue(metric.value, metric.format)}
                  </div>
                  
                  <div className="text-sm font-medium text-gray-600">
                    {metric.label}
                  </div>
                  
                  {metric.description && !compact && (
                    <div className="text-xs text-gray-500">
                      {metric.description}
                    </div>
                  )}
                  
                  {metric.previousValue && (
                    <div className="text-xs text-gray-400">
                      Previous: {formatValue(metric.previousValue, metric.format)}
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default PerformanceOverview;