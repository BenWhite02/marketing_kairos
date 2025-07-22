// src/components/business/analytics/Dashboard/MetricsSummary.tsx

import React from 'react';
import { motion } from 'framer-motion';
import {
  RocketLaunchIcon,
  ClockIcon,
  BeakerIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  EyeIcon,
  HandRaisedIcon
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardBody } from '../../../ui/Card';
import { classNames } from '../../../../utils/dom/classNames';

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

interface MetricsSummaryProps {
  campaigns?: MetricData;
  moments?: MetricData;
  atoms?: MetricData;
  loading?: boolean;
  className?: string;
}

const defaultData: MetricData = {
  total: 0,
  active: 0,
  performance: {
    impressions: 0,
    clicks: 0,
    conversions: 0,
    revenue: 0,
    ctr: 0,
    conversionRate: 0,
    averageOrderValue: 0
  },
  trends: {
    impressions: 0,
    clicks: 0,
    conversions: 0,
    revenue: 0
  }
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

const getTrendIcon = (trend: number) => {
  if (trend > 0) return TrendingUpIcon;
  if (trend < 0) return TrendingDownIcon;
  return null;
};

const getTrendColor = (trend: number): string => {
  if (trend > 0) return 'text-green-600';
  if (trend < 0) return 'text-red-600';
  return 'text-gray-500';
};

interface MetricCardProps {
  title: string;
  icon: React.ComponentType<any>;
  data: MetricData;
  color: string;
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, icon: Icon, data, color, loading }) => {
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50',
    purple: 'border-purple-200 bg-purple-50',
    emerald: 'border-emerald-200 bg-emerald-50'
  };

  const iconColorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    purple: 'text-purple-600 bg-purple-100',
    emerald: 'text-emerald-600 bg-emerald-100'
  };

  if (loading) {
    return (
      <Card className={classNames('border-l-4', colorClasses[color as keyof typeof colorClasses])}>
        <CardHeader title={title} />
        <CardBody>
          <div className="animate-pulse space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-16 h-8 bg-gray-200 rounded"></div>
              <div className="w-12 h-6 bg-gray-200 rounded"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="w-16 h-4 bg-gray-200 rounded"></div>
                  <div className="w-12 h-3 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className={classNames('border-l-4', colorClasses[color as keyof typeof colorClasses])}>
      <CardHeader 
        title={title}
        subtitle={`${data.active} active of ${data.total} total`}
        icon={
          <div className={classNames('p-2 rounded-lg', iconColorClasses[color as keyof typeof iconColorClasses])}>
            <Icon className="h-5 w-5" />
          </div>
        }
      />
      
      <CardBody>
        <div className="space-y-6">
          {/* Key Performance Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Impressions</span>
                {data.trends.impressions !== 0 && (
                  <div className={classNames('flex items-center space-x-1 text-xs', getTrendColor(data.trends.impressions))}>
                    {getTrendIcon(data.trends.impressions) && (
                      <TrendingUpIcon className="h-3 w-3" />
                    )}
                    <span>{Math.abs(data.trends.impressions).toFixed(1)}%</span>
                  </div>
                )}
              </div>
              <div className="text-xl font-bold text-gray-900">
                {formatNumber(data.performance.impressions)}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Clicks</span>
                {data.trends.clicks !== 0 && (
                  <div className={classNames('flex items-center space-x-1 text-xs', getTrendColor(data.trends.clicks))}>
                    {getTrendIcon(data.trends.clicks) && (
                      <TrendingUpIcon className="h-3 w-3" />
                    )}
                    <span>{Math.abs(data.trends.clicks).toFixed(1)}%</span>
                  </div>
                )}
              </div>
              <div className="text-xl font-bold text-gray-900">
                {formatNumber(data.performance.clicks)}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Conversions</span>
                {data.trends.conversions !== 0 && (
                  <div className={classNames('flex items-center space-x-1 text-xs', getTrendColor(data.trends.conversions))}>
                    {getTrendIcon(data.trends.conversions) && (
                      <TrendingUpIcon className="h-3 w-3" />
                    )}
                    <span>{Math.abs(data.trends.conversions).toFixed(1)}%</span>
                  </div>
                )}
              </div>
              <div className="text-xl font-bold text-gray-900">
                {formatNumber(data.performance.conversions)}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Revenue</span>
                {data.trends.revenue !== 0 && (
                  <div className={classNames('flex items-center space-x-1 text-xs', getTrendColor(data.trends.revenue))}>
                    {getTrendIcon(data.trends.revenue) && (
                      <TrendingUpIcon className="h-3 w-3" />
                    )}
                    <span>{Math.abs(data.trends.revenue).toFixed(1)}%</span>
                  </div>
                )}
              </div>
              <div className="text-xl font-bold text-gray-900">
                {formatCurrency(data.performance.revenue)}
              </div>
            </div>
          </div>

          {/* Performance Ratios */}
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  CTR
                </div>
                <div className="text-sm font-bold text-gray-900">
                  {formatPercentage(data.performance.ctr)}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Conv. Rate
                </div>
                <div className="text-sm font-bold text-gray-900">
                  {formatPercentage(data.performance.conversionRate)}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  AOV
                </div>
                <div className="text-sm font-bold text-gray-900">
                  {formatCurrency(data.performance.averageOrderValue)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export const MetricsSummary: React.FC<MetricsSummaryProps> = ({
  campaigns = defaultData,
  moments = defaultData,
  atoms = defaultData,
  loading = false,
  className
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={classNames('grid grid-cols-1 lg:grid-cols-3 gap-6', className)}
    >
      <motion.div variants={cardVariants}>
        <MetricCard
          title="Campaigns"
          icon={RocketLaunchIcon}
          data={campaigns}
          color="blue"
          loading={loading}
        />
      </motion.div>

      <motion.div variants={cardVariants}>
        <MetricCard
          title="Moments"
          icon={ClockIcon}
          data={moments}
          color="purple"
          loading={loading}
        />
      </motion.div>

      <motion.div variants={cardVariants}>
        <MetricCard
          title="Atoms"
          icon={BeakerIcon}
          data={atoms}
          color="emerald"
          loading={loading}
        />
      </motion.div>
    </motion.div>
  );
};

export default MetricsSummary;