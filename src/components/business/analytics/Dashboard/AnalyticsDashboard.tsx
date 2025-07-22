// src/components/business/analytics/Dashboard/AnalyticsDashboard.tsx

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ArrowPathIcon,
  FunnelIcon,
  MapIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardBody } from '../../../ui/Card';
import { Button } from '../../../ui/Button';
import { Select } from '../../../ui/Input';
import { PerformanceOverview } from './PerformanceOverview';
import { MetricsSummary } from './MetricsSummary';
import { RevenueAttribution } from './RevenueAttribution';
import { LineChart } from '../Charts/LineChart';
import { BarChart } from '../Charts/BarChart';
import { PieChart } from '../Charts/PieChart';
import { FunnelChart } from '../Charts/FunnelChart';
import { useAnalytics } from '../../../../hooks/business/useAnalytics';
import { classNames } from '../../../../utils/dom/classNames';

interface AnalyticsDashboardProps {
  className?: string;
  compact?: boolean;
  customTimeRange?: {
    start: Date;
    end: Date;
  };
}

type DashboardView = 'overview' | 'campaigns' | 'moments' | 'atoms' | 'audience';
type TimeRange = '24h' | '7d' | '30d' | '90d' | 'custom';

const timeRangeOptions = [
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'custom', label: 'Custom Range' }
];

const dashboardViews = [
  { id: 'overview', label: 'Overview', icon: ChartBarIcon },
  { id: 'campaigns', label: 'Campaigns', icon: FunnelIcon },
  { id: 'moments', label: 'Moments', icon: ClockIcon },
  { id: 'atoms', label: 'Atoms', icon: UsersIcon },
  { id: 'audience', label: 'Audience', icon: MapIcon }
];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  className,
  compact = false,
  customTimeRange
}) => {
  const [selectedView, setSelectedView] = useState<DashboardView>('overview');
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    dashboardData,
    performanceMetrics,
    revenueData,
    campaignAnalytics,
    momentAnalytics,
    atomPerformance,
    audienceInsights,
    isLoading,
    error,
    refreshData
  } = useAnalytics({
    timeRange: customTimeRange || timeRange,
    view: selectedView
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  const renderViewContent = useMemo(() => {
    switch (selectedView) {
      case 'overview':
        return (
          <div className="space-y-6">
            <PerformanceOverview
              metrics={performanceMetrics}
              timeRange={timeRange}
              loading={isLoading}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenueAttribution
                data={revenueData}
                loading={isLoading}
              />
              
              <Card>
                <CardHeader title="Campaign Performance Trend" />
                <CardBody>
                  <LineChart
                    data={campaignAnalytics?.performanceTrend || []}
                    xAxis="date"
                    yAxis="performance"
                    height={300}
                    loading={isLoading}
                  />
                </CardBody>
              </Card>
            </div>

            <MetricsSummary
              campaigns={campaignAnalytics?.summary}
              moments={momentAnalytics?.summary}
              atoms={atomPerformance?.summary}
              loading={isLoading}
            />
          </div>
        );

      case 'campaigns':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader title="Campaign ROI Distribution" />
                <CardBody>
                  <BarChart
                    data={campaignAnalytics?.roiDistribution || []}
                    xAxis="campaign"
                    yAxis="roi"
                    height={300}
                    loading={isLoading}
                  />
                </CardBody>
              </Card>
              
              <Card>
                <CardHeader title="Channel Performance" />
                <CardBody>
                  <PieChart
                    data={campaignAnalytics?.channelPerformance || []}
                    height={300}
                    loading={isLoading}
                  />
                </CardBody>
              </Card>
            </div>

            <Card>
              <CardHeader title="Campaign Funnel Analysis" />
              <CardBody>
                <FunnelChart
                  data={campaignAnalytics?.funnelData || []}
                  height={400}
                  loading={isLoading}
                />
              </CardBody>
            </Card>
          </div>
        );

      case 'moments':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader title="Moment Delivery Rates" />
                <CardBody>
                  <LineChart
                    data={momentAnalytics?.deliveryRates || []}
                    xAxis="date"
                    yAxis="rate"
                    height={300}
                    loading={isLoading}
                  />
                </CardBody>
              </Card>
              
              <Card>
                <CardHeader title="Engagement by Channel" />
                <CardBody>
                  <BarChart
                    data={momentAnalytics?.engagementByChannel || []}
                    xAxis="channel"
                    yAxis="engagement"
                    height={300}
                    loading={isLoading}
                  />
                </CardBody>
              </Card>
            </div>
          </div>
        );

      case 'atoms':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader title="Atom Usage Distribution" />
                <CardBody>
                  <PieChart
                    data={atomPerformance?.usageDistribution || []}
                    height={300}
                    loading={isLoading}
                  />
                </CardBody>
              </Card>
              
              <Card>
                <CardHeader title="Accuracy vs Usage" />
                <CardBody>
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    Scatter plot visualization coming soon
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        );

      case 'audience':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader title="Audience Growth" />
                <CardBody>
                  <LineChart
                    data={audienceInsights?.growthTrend || []}
                    xAxis="date"
                    yAxis="audience"
                    height={300}
                    loading={isLoading}
                  />
                </CardBody>
              </Card>
              
              <Card>
                <CardHeader title="Segment Distribution" />
                <CardBody>
                  <PieChart
                    data={audienceInsights?.segmentDistribution || []}
                    height={300}
                    loading={isLoading}
                  />
                </CardBody>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  }, [selectedView, campaignAnalytics, momentAnalytics, atomPerformance, audienceInsights, revenueData, performanceMetrics, timeRange, isLoading]);

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardBody>
          <div className="text-center py-8">
            <TrendingDownIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">
              Analytics Error
            </h3>
            <p className="text-red-700 mb-4">{error.message}</p>
            <Button onClick={handleRefresh} variant="outline">
              Try Again
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className={classNames('space-y-6', className)}>
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Real-time insights and performance metrics for your campaigns
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            options={timeRangeOptions}
            className="w-40"
          />
          
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={isRefreshing}
            className="flex items-center space-x-2"
          >
            <ArrowPathIcon className={classNames(
              'h-4 w-4',
              isRefreshing && 'animate-spin'
            )} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {dashboardViews.map((view) => {
            const Icon = view.icon;
            const isActive = selectedView === view.id;
            
            return (
              <button
                key={view.id}
                onClick={() => setSelectedView(view.id as DashboardView)}
                className={classNames(
                  'flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors',
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{view.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Dashboard Content */}
      <motion.div
        key={selectedView}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderViewContent}
      </motion.div>

      {/* Real-time Status Indicator */}
      <div className="fixed bottom-4 right-4">
        <div className={classNames(
          'flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium shadow-lg',
          isLoading
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-green-100 text-green-800'
        )}>
          <div className={classNames(
            'w-2 h-2 rounded-full',
            isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'
          )} />
          <span>{isLoading ? 'Updating...' : 'Live Data'}</span>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;