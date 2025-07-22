// src/components/business/analytics/Dashboard/RevenueAttribution.tsx

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ChartPieIcon,
  CurrencyDollarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  AdjustmentsHorizontalIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardBody } from '../../../ui/Card';
import { Button } from '../../../ui/Button';
import { Select } from '../../../ui/Input';
import { PieChart } from '../Charts/PieChart';
import { BarChart } from '../Charts/BarChart';
import { classNames } from '../../../../utils/dom/classNames';

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

interface RevenueAttributionProps {
  data?: AttributionData[];
  loading?: boolean;
  className?: string;
  showAdvanced?: boolean;
}

type ViewMode = 'pie' | 'bar' | 'table';
type AttributionModel = 'last-touch' | 'first-touch' | 'linear' | 'time-decay' | 'position-based' | 'data-driven';

const defaultData: AttributionData[] = [
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
  },
  {
    channel: 'Direct',
    revenue: 234567,
    percentage: 9.0,
    previousRevenue: 198234,
    trend: 18.3,
    trendDirection: 'up',
    conversions: 1456,
    roas: 8.7,
    cost: 26958,
    color: '#8B5CF6'
  },
  {
    channel: 'Organic',
    revenue: 134789,
    percentage: 5.2,
    previousRevenue: 145678,
    trend: -7.5,
    trendDirection: 'down',
    conversions: 892,
    roas: 12.4,
    cost: 10869,
    color: '#06B6D4'
  }
];

const attributionModelOptions = [
  { value: 'last-touch', label: 'Last Touch' },
  { value: 'first-touch', label: 'First Touch' },
  { value: 'linear', label: 'Linear' },
  { value: 'time-decay', label: 'Time Decay' },
  { value: 'position-based', label: 'Position Based' },
  { value: 'data-driven', label: 'Data Driven' }
];

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

const getTrendIcon = (direction?: string) => {
  switch (direction) {
    case 'up':
      return TrendingUpIcon;
    case 'down':
      return TrendingDownIcon;
    default:
      return null;
  }
};

const getTrendColor = (direction?: string): string => {
  switch (direction) {
    case 'up':
      return 'text-green-600';
    case 'down':
      return 'text-red-600';
    default:
      return 'text-gray-500';
  }
};

export const RevenueAttribution: React.FC<RevenueAttributionProps> = ({
  data = defaultData,
  loading = false,
  className,
  showAdvanced = false
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('pie');
  const [attributionModel, setAttributionModel] = useState<AttributionModel>('last-touch');
  const [showDetails, setShowDetails] = useState(false);

  const totalRevenue = useMemo(() => {
    return data.reduce((sum, item) => sum + item.revenue, 0);
  }, [data]);

  const pieChartData = useMemo(() => {
    return data.map(item => ({
      name: item.channel,
      value: item.revenue,
      percentage: item.percentage,
      color: item.color
    }));
  }, [data]);

  const barChartData = useMemo(() => {
    return data.map(item => ({
      channel: item.channel,
      revenue: item.revenue,
      roas: item.roas,
      color: item.color
    }));
  }, [data]);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader title="Revenue Attribution" />
        <CardBody>
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="w-20 h-4 bg-gray-200 rounded"></div>
                  <div className="w-16 h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  const renderChart = () => {
    switch (viewMode) {
      case 'pie':
        return (
          <PieChart
            data={pieChartData}
            height={280}
            showLegend={false}
            showTooltip={true}
          />
        );
      
      case 'bar':
        return (
          <BarChart
            data={barChartData}
            xAxis="channel"
            yAxis="revenue"
            height={280}
            showGrid={true}
          />
        );
      
      case 'table':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Channel
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    %
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ROAS
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((item, index) => {
                  const TrendIcon = getTrendIcon(item.trendDirection);
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-3"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm font-medium text-gray-900">
                            {item.channel}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        {formatCurrency(item.revenue)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-right">
                        {item.percentage.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                        {item.roas.toFixed(1)}x
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        {TrendIcon && item.trend && (
                          <div className={classNames('flex items-center justify-end space-x-1', getTrendColor(item.trendDirection))}>
                            <TrendIcon className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {Math.abs(item.trend).toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card className={className}>
      <CardHeader
        title="Revenue Attribution"
        subtitle={`Total: ${formatCurrency(totalRevenue)}`}
        icon={<ChartPieIcon className="h-5 w-5 text-blue-600" />}
        actions={
          <div className="flex items-center space-x-2">
            {showAdvanced && (
              <Select
                value={attributionModel}
                onChange={(e) => setAttributionModel(e.target.value as AttributionModel)}
                options={attributionModelOptions}
                className="w-36 text-sm"
              />
            )}
            
            <div className="flex rounded-md shadow-sm">
              <button
                onClick={() => setViewMode('pie')}
                className={classNames(
                  'px-3 py-1 text-xs font-medium rounded-l-md border',
                  viewMode === 'pie'
                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                )}
              >
                Pie
              </button>
              <button
                onClick={() => setViewMode('bar')}
                className={classNames(
                  'px-3 py-1 text-xs font-medium border-t border-b',
                  viewMode === 'bar'
                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                )}
              >
                Bar
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={classNames(
                  'px-3 py-1 text-xs font-medium rounded-r-md border',
                  viewMode === 'table'
                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                )}
              >
                Table
              </button>
            </div>
          </div>
        }
      />
      
      <CardBody>
        <div className="space-y-4">
          {/* Chart/Table Display */}
          <div className="min-h-[280px]">
            {renderChart()}
          </div>

          {/* Channel Summary - Only show for pie/bar views */}
          {viewMode !== 'table' && (
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {data.slice(0, 6).map((item, index) => {
                  const TrendIcon = getTrendIcon(item.trendDirection);
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {item.channel}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-gray-900">
                          {item.percentage.toFixed(1)}%
                        </span>
                        {TrendIcon && item.trend && (
                          <div className={classNames('flex items-center', getTrendColor(item.trendDirection))}>
                            <TrendIcon className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Attribution Model Info */}
          {showAdvanced && (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-start space-x-2">
                <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Attribution Model:</span> {attributionModelOptions.find(opt => opt.value === attributionModel)?.label}
                  {attributionModel === 'data-driven' && (
                    <span className="block mt-1 text-xs">
                      Uses machine learning to distribute credit based on actual conversion paths
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default RevenueAttribution;