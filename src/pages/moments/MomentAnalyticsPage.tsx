// src/pages/moments/MomentAnalyticsPage.tsx
import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  FunnelIcon,
  PresentationChartLineIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  AdjustmentsHorizontalIcon,
  InformationCircleIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  BellIcon,
  ComputerDesktopIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';

import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Input';

// Types
interface AnalyticsData {
  overview: {
    totalSent: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
    revenue: number;
    trends: {
      sent: number;
      delivery: number;
      opens: number;
      clicks: number;
      conversions: number;
      revenue: number;
    };
  };
  timeSeriesData: Array<{
    date: string;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
    revenue: number;
  }>;
  channelData: Array<{
    channel: string;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
    revenue: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
  }>;
  funnelData: Array<{
    stage: string;
    value: number;
    percentage: number;
  }>;
  segmentData: Array<{
    segment: string;
    users: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
    revenue: number;
  }>;
  revenueBreakdown: Array<{
    category: string;
    value: number;
    percentage: number;
    color: string;
  }>;
}

const MomentAnalyticsPage: React.FC = () => {
  const { momentId } = useParams<{ momentId: string }>();
  
  const [dateRange, setDateRange] = useState('30d');
  const [viewType, setViewType] = useState<'overview' | 'funnel' | 'channels' | 'segments' | 'revenue'>('overview');
  const [loading, setLoading] = useState(false);

  // Mock analytics data - replace with actual API call
  const analyticsData = useMemo<AnalyticsData>(() => {
    const generateTimeSeriesData = () => {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      return Array.from({ length: days }, (_, i) => {
        const date = format(subDays(new Date(), days - i - 1), 'yyyy-MM-dd');
        const baseSent = 800 + Math.random() * 400;
        const delivered = baseSent * (0.95 + Math.random() * 0.04);
        const opened = delivered * (0.35 + Math.random() * 0.1);
        const clicked = opened * (0.15 + Math.random() * 0.1);
        const converted = clicked * (0.20 + Math.random() * 0.1);
        
        return {
          date,
          sent: Math.round(baseSent),
          delivered: Math.round(delivered),
          opened: Math.round(opened),
          clicked: Math.round(clicked),
          converted: Math.round(converted),
          revenue: Math.round(converted * (150 + Math.random() * 100))
        };
      });
    };

    const timeSeriesData = generateTimeSeriesData();
    const totals = timeSeriesData.reduce((acc, day) => ({
      sent: acc.sent + day.sent,
      delivered: acc.delivered + day.delivered,
      opened: acc.opened + day.opened,
      clicked: acc.clicked + day.clicked,
      converted: acc.converted + day.converted,
      revenue: acc.revenue + day.revenue
    }), { sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0, revenue: 0 });

    return {
      overview: {
        totalSent: totals.sent,
        deliveryRate: (totals.delivered / totals.sent) * 100,
        openRate: (totals.opened / totals.delivered) * 100,
        clickRate: (totals.clicked / totals.opened) * 100,
        conversionRate: (totals.converted / totals.clicked) * 100,
        revenue: totals.revenue,
        trends: {
          sent: 5.2,
          delivery: 1.8,
          opens: -2.1,
          clicks: 8.7,
          conversions: 12.3,
          revenue: 15.6
        }
      },
      timeSeriesData,
      channelData: [
        { channel: 'email', sent: 18642, delivered: 18321, opened: 6985, clicked: 1397, converted: 279, revenue: 41850, deliveryRate: 98.3, openRate: 38.1, clickRate: 20.0, conversionRate: 20.0 },
        { channel: 'push', sent: 12847, delivered: 12654, opened: 3796, clicked: 569, converted: 142, revenue: 21300, deliveryRate: 98.5, openRate: 30.0, clickRate: 15.0, conversionRate: 25.0 },
        { channel: 'sms', sent: 5623, delivered: 5578, opened: 2789, clicked: 445, converted: 89, revenue: 13350, deliveryRate: 99.2, openRate: 50.0, clickRate: 16.0, conversionRate: 20.0 },
        { channel: 'web', sent: 8956, delivered: 8687, opened: 2172, clicked: 348, converted: 87, revenue: 13050, deliveryRate: 97.0, openRate: 25.0, clickRate: 16.0, conversionRate: 25.0 }
      ],
      funnelData: [
        { stage: 'Sent', value: 46068, percentage: 100 },
        { stage: 'Delivered', value: 45240, percentage: 98.2 },
        { stage: 'Opened', value: 15742, percentage: 34.8 },
        { stage: 'Clicked', value: 2759, percentage: 17.5 },
        { stage: 'Converted', value: 597, percentage: 21.6 }
      ],
      segmentData: [
        { segment: 'New Customers', users: 12456, openRate: 42.3, clickRate: 18.7, conversionRate: 23.1, revenue: 34567 },
        { segment: 'Returning Customers', users: 8732, openRate: 35.6, clickRate: 16.2, conversionRate: 19.8, revenue: 28943 },
        { segment: 'High Value', users: 3421, openRate: 38.9, clickRate: 22.4, conversionRate: 28.7, revenue: 15678 },
        { segment: 'At Risk', users: 5467, openRate: 28.3, clickRate: 12.1, conversionRate: 15.2, revenue: 9876 }
      ],
      revenueBreakdown: [
        { category: 'Products', value: 56780, percentage: 65.2, color: '#3B82F6' },
        { category: 'Services', value: 23450, percentage: 26.9, color: '#10B981' },
        { category: 'Subscriptions', value: 6890, percentage: 7.9, color: '#F59E0B' }
      ]
    };
  }, [dateRange]);

  const handleExport = async (format: 'csv' | 'pdf' | 'excel') => {
    setLoading(true);
    try {
      // Mock export functionality
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log(`Exporting analytics data as ${format}`);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    console.log('Sharing analytics report');
  };

  const getChannelIcon = (channel: string) => {
    const icons = {
      email: EnvelopeIcon,
      sms: DevicePhoneMobileIcon,
      push: BellIcon,
      web: ComputerDesktopIcon,
      'in-app': ChatBubbleLeftRightIcon
    };
    return icons[channel as keyof typeof icons] || InformationCircleIcon;
  };

  const getTrendIcon = (trend: number) => {
    return trend >= 0 ? ArrowUpIcon : ArrowDownIcon;
  };

  const getTrendColor = (trend: number) => {
    return trend >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Moment Analytics</h1>
              <p className="text-gray-600 mt-1">Performance insights and detailed metrics for your moment</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="w-32">
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </Select>
              
              <Button variant="outline" onClick={handleShare}>
                <ShareIcon className="w-4 h-4 mr-2" />
                Share
              </Button>
              
              <div className="relative">
                <Button variant="outline" onClick={() => handleExport('pdf')} loading={loading}>
                  <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* View Tabs */}
          <div className="flex space-x-1 mt-6 bg-gray-100 p-1 rounded-lg w-fit">
            {[
              { id: 'overview', label: 'Overview', icon: ChartBarIcon },
              { id: 'funnel', label: 'Funnel', icon: FunnelIcon },
              { id: 'channels', label: 'Channels', icon: PresentationChartLineIcon },
              { id: 'segments', label: 'Segments', icon: AdjustmentsHorizontalIcon },
              { id: 'revenue', label: 'Revenue', icon: CalendarIcon }
            ].map((view) => {
              const Icon = view.icon;
              return (
                <button
                  key={view.id}
                  onClick={() => setViewType(view.id as any)}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewType === view.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {view.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Overview View */}
        {viewType === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Total Sent', value: analyticsData.overview.totalSent.toLocaleString(), trend: analyticsData.overview.trends.sent, icon: EnvelopeIcon },
                { label: 'Delivery Rate', value: `${analyticsData.overview.deliveryRate.toFixed(1)}%`, trend: analyticsData.overview.trends.delivery, icon: CheckCircleIcon },
                { label: 'Open Rate', value: `${analyticsData.overview.openRate.toFixed(1)}%`, trend: analyticsData.overview.trends.opens, icon: EyeIcon },
                { label: 'Click Rate', value: `${analyticsData.overview.clickRate.toFixed(1)}%`, trend: analyticsData.overview.trends.clicks, icon: CursorArrowRaysIcon },
                { label: 'Conversion Rate', value: `${analyticsData.overview.conversionRate.toFixed(1)}%`, trend: analyticsData.overview.trends.conversions, icon: ChartBarIcon },
                { label: 'Revenue', value: `$${analyticsData.overview.revenue.toLocaleString()}`, trend: analyticsData.overview.trends.revenue, icon: CurrencyDollarIcon }
              ].map((kpi, index) => {
                const Icon = kpi.icon;
                const TrendIcon = getTrendIcon(kpi.trend);
                return (
                  <Card key={index}>
                    <CardBody>
                      <div className="flex items-center justify-between">
                        <Icon className="w-5 h-5 text-gray-400" />
                        <div className={`flex items-center text-sm ${getTrendColor(kpi.trend)}`}>
                          <TrendIcon className="w-3 h-3 mr-1" />
                          {Math.abs(kpi.trend)}%
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="text-2xl font-bold">{kpi.value}</div>
                        <div className="text-sm text-gray-500">{kpi.label}</div>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>

            {/* Time Series Chart */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Performance Over Time</h3>
              </CardHeader>
              <CardBody>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="sent" stroke="#3B82F6" strokeWidth={2} />
                      <Line type="monotone" dataKey="delivered" stroke="#10B981" strokeWidth={2} />
                      <Line type="monotone" dataKey="opened" stroke="#F59E0B" strokeWidth={2} />
                      <Line type="monotone" dataKey="clicked" stroke="#EF4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>

            {/* Channel Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Channel Performance</h3>
                </CardHeader>
                <CardBody>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.channelData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="channel" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="openRate" fill="#3B82F6" />
                        <Bar dataKey="clickRate" fill="#10B981" />
                        <Bar dataKey="conversionRate" fill="#F59E0B" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Revenue by Channel</h3>
                </CardHeader>
                <CardBody>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.channelData}
                          dataKey="revenue"
                          nameKey="channel"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, value }) => `${name}: $${value.toLocaleString()}`}
                        >
                          {analyticsData.channelData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        )}

        {/* Funnel View */}
        {viewType === 'funnel' && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Conversion Funnel</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData.funnelData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="stage" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-4">
                  {analyticsData.funnelData.map((stage, index) => (
                    <div key={stage.stage} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                          index === 0 ? 'bg-blue-600' : index === 1 ? 'bg-green-600' : index === 2 ? 'bg-yellow-600' : index === 3 ? 'bg-orange-600' : 'bg-purple-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{stage.stage}</div>
                          <div className="text-sm text-gray-500">{stage.percentage.toFixed(1)}% conversion</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{stage.value.toLocaleString()}</div>
                        {index > 0 && (
                          <div className="text-sm text-gray-500">
                            -{((analyticsData.funnelData[index - 1].value - stage.value) / analyticsData.funnelData[index - 1].value * 100).toFixed(1)}% drop
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Channels View */}
        {viewType === 'channels' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {analyticsData.channelData.map((channel) => {
                const Icon = getChannelIcon(channel.channel);
                return (
                  <Card key={channel.channel}>
                    <CardBody>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <Icon className="w-5 h-5 text-gray-600" />
                          <span className="font-medium capitalize">{channel.channel}</span>
                        </div>
                        <Badge variant="secondary">{channel.sent.toLocaleString()} sent</Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Delivery Rate</span>
                          <span className="font-medium">{channel.deliveryRate}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Open Rate</span>
                          <span className="font-medium">{channel.openRate}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Click Rate</span>
                          <span className="font-medium">{channel.clickRate}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Conversion Rate</span>
                          <span className="font-medium">{channel.conversionRate}%</span>
                        </div>
                        <div className="flex justify-between text-sm border-t pt-2">
                          <span className="text-gray-500">Revenue</span>
                          <span className="font-bold text-green-600">${channel.revenue.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Channel Comparison</h3>
              </CardHeader>
              <CardBody>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.channelData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="channel" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="deliveryRate" fill="#3B82F6" />
                      <Bar dataKey="openRate" fill="#10B981" />
                      <Bar dataKey="clickRate" fill="#F59E0B" />
                      <Bar dataKey="conversionRate" fill="#EF4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Segments View */}
        {viewType === 'segments' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {analyticsData.segmentData.map((segment) => (
                <Card key={segment.segment}>
                  <CardBody>
                    <div className="mb-4">
                      <h4 className="font-medium">{segment.segment}</h4>
                      <p className="text-sm text-gray-500">{segment.users.toLocaleString()} users</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Open Rate</span>
                        <span className="font-medium">{segment.openRate}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Click Rate</span>
                        <span className="font-medium">{segment.clickRate}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Conversion Rate</span>
                        <span className="font-medium">{segment.conversionRate}%</span>
                      </div>
                      <div className="flex justify-between text-sm border-t pt-2">
                        <span className="text-gray-500">Revenue</span>
                        <span className="font-bold text-green-600">${segment.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Segment Performance Comparison</h3>
              </CardHeader>
              <CardBody>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.segmentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="segment" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="openRate" fill="#3B82F6" />
                      <Bar dataKey="clickRate" fill="#10B981" />
                      <Bar dataKey="conversionRate" fill="#F59E0B" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Revenue View */}
        {viewType === 'revenue' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Revenue Breakdown</h3>
                </CardHeader>
                <CardBody>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.revenueBreakdown}
                          dataKey="value"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percentage }) => `${name}: ${percentage}%`}
                        >
                          {analyticsData.revenueBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Revenue Details</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {analyticsData.revenueBreakdown.map((item) => (
                      <div key={item.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }}></div>
                          <span className="font-medium">{item.category}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">${item.value.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">{item.percentage}%</div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t pt-3">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total Revenue</span>
                        <span className="text-green-600">
                          ${analyticsData.revenueBreakdown.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Revenue Over Time</h3>
              </CardHeader>
              <CardBody>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData.timeSeriesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="revenue" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

// Additional icons for the missing ones (add these imports at the top if not available)
import { CheckCircleIcon, EyeIcon, CursorArrowRaysIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

export default MomentAnalyticsPage;