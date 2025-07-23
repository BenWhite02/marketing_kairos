// src/pages/atoms/AtomAnalyticsPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  CalendarIcon,
  FunnelIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LineChart, BarChart, PieChart, FunnelChart } from '@/components/business/analytics/Charts';
import { ROUTES } from '@/constants/routes';

interface AnalyticsData {
  overview: {
    totalEvaluations: number;
    accuracy: number;
    conversionRate: number;
    revenue: number;
    trends: {
      evaluations: number;
      accuracy: number;
      conversions: number;
      revenue: number;
    };
  };
  usage: {
    daily: Array<{ date: string; evaluations: number; accuracy: number }>;
    byChannel: Array<{ channel: string; count: number; percentage: number }>;
    byMoment: Array<{ moment: string; count: number; accuracy: number }>;
  };
  performance: {
    accuracyTrend: Array<{ date: string; accuracy: number; threshold: number }>;
    conversionFunnel: Array<{ stage: string; count: number; rate: number }>;
    revenueAttribution: Array<{ period: string; revenue: number; conversions: number }>;
  };
  segments: {
    demographics: Array<{ segment: string; count: number; conversionRate: number }>;
    behavioral: Array<{ behavior: string; accuracy: number; usage: number }>;
  };
}

export const AtomAnalyticsPage: React.FC = () => {
  const { atomId } = useParams<{ atomId: string }>();
  const navigate = useNavigate();
  const [atom, setAtom] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState<'evaluations' | 'accuracy' | 'conversions' | 'revenue'>('evaluations');

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      try {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock atom data
        setAtom({
          id: atomId,
          name: 'High-Value Customer',
          description: 'Identifies customers with lifetime value above $5,000',
          type: 'behavioral',
          status: 'active'
        });

        // Mock analytics data
        const mockAnalytics: AnalyticsData = {
          overview: {
            totalEvaluations: 147832,
            accuracy: 87.5,
            conversionRate: 23.4,
            revenue: 1247500,
            trends: {
              evaluations: 12.3,
              accuracy: -2.1,
              conversions: 8.7,
              revenue: 15.2
            }
          },
          usage: {
            daily: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              evaluations: Math.floor(Math.random() * 5000) + 3000,
              accuracy: Math.random() * 10 + 80
            })),
            byChannel: [
              { channel: 'Email', count: 45230, percentage: 30.6 },
              { channel: 'Web', count: 38914, percentage: 26.3 },
              { channel: 'Mobile App', count: 32147, percentage: 21.7 },
              { channel: 'SMS', count: 18765, percentage: 12.7 },
              { channel: 'Push', count: 12776, percentage: 8.7 }
            ],
            byMoment: [
              { moment: 'Welcome Campaign', count: 28945, accuracy: 89.2 },
              { moment: 'Retention Drive', count: 25117, accuracy: 85.7 },
              { moment: 'Upsell Sequence', count: 19834, accuracy: 91.3 },
              { moment: 'Win-back Campaign', count: 15623, accuracy: 82.4 },
              { moment: 'Product Launch', count: 12187, accuracy: 87.9 }
            ]
          },
          performance: {
            accuracyTrend: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              accuracy: Math.random() * 15 + 80,
              threshold: 85
            })),
            conversionFunnel: [
              { stage: 'Atom Matched', count: 147832, rate: 100 },
              { stage: 'Moment Triggered', count: 125463, rate: 84.9 },
              { stage: 'Content Delivered', count: 118721, rate: 94.6 },
              { stage: 'Engagement', count: 67834, rate: 57.1 },
              { stage: 'Conversion', count: 34612, rate: 51.0 }
            ],
            revenueAttribution: Array.from({ length: 12 }, (_, i) => ({
              period: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
              revenue: Math.floor(Math.random() * 50000) + 80000,
              conversions: Math.floor(Math.random() * 1000) + 2000
            }))
          },
          segments: {
            demographics: [
              { segment: '25-34 years', count: 45782, conversionRate: 28.4 },
              { segment: '35-44 years', count: 38934, conversionRate: 31.2 },
              { segment: '45-54 years', count: 29145, conversionRate: 24.7 },
              { segment: '18-24 years', count: 21678, conversionRate: 19.3 },
              { segment: '55+ years', count: 12293, conversionRate: 22.1 }
            ],
            behavioral: [
              { behavior: 'High Frequency Buyers', accuracy: 92.3, usage: 34512 },
              { behavior: 'Seasonal Shoppers', accuracy: 84.7, usage: 28945 },
              { behavior: 'Price Sensitive', accuracy: 79.2, usage: 22134 },
              { behavior: 'Premium Customers', accuracy: 94.1, usage: 18765 },
              { behavior: 'Mobile First', accuracy: 86.5, usage: 15432 }
            ]
          }
        };

        setAnalyticsData(mockAnalytics);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (atomId) {
      fetchAnalyticsData();
    }
  }, [atomId, dateRange]);

  const handleExportData = () => {
    console.log('Exporting analytics data...');
    // In real app, trigger data export
  };

  const handleShareAnalytics = () => {
    console.log('Sharing analytics...');
    // In real app, generate shareable link
  };

  const getMetricTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <TrendingUpIcon className="h-4 w-4 text-green-600" />;
    } else if (trend < 0) {
      return <TrendingDownIcon className="h-4 w-4 text-red-600" />;
    }
    return null;
  };

  const getMetricTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (!atom || !analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Analytics Not Available</h2>
          <p className="text-gray-600 mb-4">Unable to load analytics data for this atom.</p>
          <Button onClick={() => navigate(ROUTES.ATOMS.LIST)}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Atoms
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate(`/atoms/${atomId}`)}
                className="p-2"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {atom.name} Analytics
                </h1>
                <p className="text-gray-600 mt-1">{atom.description}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Date Range Selector */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>

              <Button variant="secondary" onClick={handleExportData}>
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export
              </Button>

              <Button variant="secondary" onClick={handleShareAnalytics}>
                <ShareIcon className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Evaluations</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsData.overview.totalEvaluations.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <UsersIcon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className={`flex items-center mt-2 text-sm ${getMetricTrendColor(analyticsData.overview.trends.evaluations)}`}>
                  {getMetricTrendIcon(analyticsData.overview.trends.evaluations)}
                  <span className="ml-1">
                    {Math.abs(analyticsData.overview.trends.evaluations)}% vs last period
                  </span>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Accuracy</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsData.overview.accuracy}%
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <ChartBarIcon className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className={`flex items-center mt-2 text-sm ${getMetricTrendColor(analyticsData.overview.trends.accuracy)}`}>
                  {getMetricTrendIcon(analyticsData.overview.trends.accuracy)}
                  <span className="ml-1">
                    {Math.abs(analyticsData.overview.trends.accuracy)}% vs last period
                  </span>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsData.overview.conversionRate}%
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <FunnelIcon className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className={`flex items-center mt-2 text-sm ${getMetricTrendColor(analyticsData.overview.trends.conversions)}`}>
                  {getMetricTrendIcon(analyticsData.overview.trends.conversions)}
                  <span className="ml-1">
                    {Math.abs(analyticsData.overview.trends.conversions)}% vs last period
                  </span>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenue Impact</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${analyticsData.overview.revenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-full">
                    <CurrencyDollarIcon className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
                <div className={`flex items-center mt-2 text-sm ${getMetricTrendColor(analyticsData.overview.trends.revenue)}`}>
                  {getMetricTrendIcon(analyticsData.overview.trends.revenue)}
                  <span className="ml-1">
                    {Math.abs(analyticsData.overview.trends.revenue)}% vs last period
                  </span>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Usage Trend */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Usage & Accuracy Trend</h3>
                <div className="flex space-x-2">
                  {['evaluations', 'accuracy'].map((metric) => (
                    <button
                      key={metric}
                      onClick={() => setSelectedMetric(metric as any)}
                      className={`px-3 py-1 text-xs rounded-full ${
                        selectedMetric === metric
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {metric.charAt(0).toUpperCase() + metric.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <LineChart
                data={analyticsData.usage.daily}
                xKey="date"
                yKey={selectedMetric === 'evaluations' ? 'evaluations' : 'accuracy'}
                color="#3B82F6"
                height={300}
              />
            </CardBody>
          </Card>

          {/* Channel Distribution */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Usage by Channel</h3>
            </CardHeader>
            <CardBody>
              <PieChart
                data={analyticsData.usage.byChannel}
                nameKey="channel"
                valueKey="count"
                height={300}
              />
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Accuracy Trend with Threshold */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Accuracy Performance</h3>
              <p className="text-gray-600">Tracking accuracy against 85% threshold</p>
            </CardHeader>
            <CardBody>
              <LineChart
                data={analyticsData.performance.accuracyTrend}
                xKey="date"
                yKey="accuracy"
                color="#10B981"
                height={300}
                showThreshold={{
                  value: 85,
                  color: "#EF4444",
                  label: "Threshold"
                }}
              />
            </CardBody>
          </Card>

          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Conversion Funnel</h3>
              <p className="text-gray-600">Customer journey through atom-triggered moments</p>
            </CardHeader>
            <CardBody>
              <FunnelChart
                data={analyticsData.performance.conversionFunnel}
                nameKey="stage"
                valueKey="count"
                height={300}
              />
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Performing Moments */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Usage by Moment</h3>
              <p className="text-gray-600">Which moments use this atom most</p>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {analyticsData.usage.byMoment.map((moment, index) => (
                  <div key={moment.moment} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{moment.moment}</h4>
                      <p className="text-sm text-gray-600">
                        {moment.count.toLocaleString()} evaluations
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{moment.accuracy}%</p>
                      <p className="text-sm text-gray-600">accuracy</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Revenue Attribution */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Revenue Attribution</h3>
              <p className="text-gray-600">Monthly revenue impact</p>
            </CardHeader>
            <CardBody>
              <BarChart
                data={analyticsData.performance.revenueAttribution}
                xKey="period"
                yKey="revenue"
                color="#8B5CF6"
                height={300}
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};