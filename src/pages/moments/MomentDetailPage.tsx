// src/pages/moments/MomentDetailPage.tsx
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  PencilIcon, 
  PlayIcon, 
  PauseIcon, 
  StopIcon,
  ClockIcon,
  ChartBarIcon,
  EyeIcon,
  ShareIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  BellIcon,
  ComputerDesktopIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

// Types
interface MomentDetail {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'sms' | 'push' | 'web' | 'in-app';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  trigger: 'immediate' | 'scheduled' | 'event-based' | 'behavior-based';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  audienceSize: number;
  content: {
    subject?: string;
    message: string;
    cta?: string;
    template: string;
  };
  channels: string[];
  schedule: {
    startDate?: string;
    endDate?: string;
    timezone: string;
    frequency?: 'once' | 'daily' | 'weekly' | 'monthly';
  };
  targeting: {
    segments: string[];
    atoms: string[];
    rules: any[];
  };
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
    revenue: number;
  };
  versions: Array<{
    id: string;
    version: string;
    createdAt: string;
    status: string;
    changes: string[];
  }>;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastActivatedAt?: string;
  createdBy: string;
  updatedBy: string;
}

const MomentDetailPage: React.FC = () => {
  const { momentId } = useParams<{ momentId: string }>();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'targeting' | 'performance' | 'versions'>('overview');
  const [loading, setLoading] = useState(false);

  // Mock moment data - replace with actual API call
  const moment = useMemo<MomentDetail>(() => ({
    id: momentId || '1',
    name: 'Welcome Series - Day 1',
    description: 'First touchpoint in new customer onboarding sequence with personalized product recommendations',
    type: 'email',
    status: 'active',
    trigger: 'event-based',
    priority: 'high',
    audienceSize: 12847,
    content: {
      subject: 'Welcome to {{company_name}}, {{first_name}}! Your journey starts here',
      message: 'Personalized welcome message with dynamic product recommendations based on signup preferences...',
      cta: 'Start Shopping',
      template: 'welcome-series-v2'
    },
    channels: ['email', 'push'],
    schedule: {
      startDate: '2024-01-15T09:00:00Z',
      timezone: 'America/New_York',
      frequency: 'once'
    },
    targeting: {
      segments: ['new-customers', 'high-value-prospects'],
      atoms: ['Age Range 25-45', 'Email Preference: Marketing', 'Purchase Intent: High'],
      rules: []
    },
    metrics: {
      sent: 12847,
      delivered: 12654,
      opened: 4826,
      clicked: 967,
      converted: 234,
      deliveryRate: 98.5,
      openRate: 38.1,
      clickRate: 20.0,
      conversionRate: 24.2,
      revenue: 45780
    },
    versions: [
      { id: 'v3', version: '1.3', createdAt: '2024-01-14T10:30:00Z', status: 'active', changes: ['Updated subject line', 'Enhanced personalization'] },
      { id: 'v2', version: '1.2', createdAt: '2024-01-10T14:20:00Z', status: 'archived', changes: ['Added CTA button', 'Improved mobile layout'] },
      { id: 'v1', version: '1.1', createdAt: '2024-01-08T09:15:00Z', status: 'archived', changes: ['Initial version'] }
    ],
    tags: ['onboarding', 'welcome', 'personalized', 'high-priority'],
    createdAt: '2024-01-08T09:15:00Z',
    updatedAt: '2024-01-14T10:30:00Z',
    lastActivatedAt: '2024-01-15T09:00:00Z',
    createdBy: 'sarah.marketing@company.com',
    updatedBy: 'sarah.marketing@company.com'
  }), [momentId]);

  const handleStatusChange = async (newStatus: MomentDetail['status']) => {
    setLoading(true);
    try {
      // API call to change status
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Changing moment ${momentId} status to ${newStatus}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    setLoading(true);
    try {
      switch (action) {
        case 'duplicate':
          console.log('Duplicating moment...');
          break;
        case 'share':
          console.log('Sharing moment...');
          break;
        case 'delete':
          if (confirm('Are you sure you want to delete this moment? This action cannot be undone.')) {
            console.log('Deleting moment...');
            navigate('/moments');
          }
          return;
        default:
          console.log(`Action: ${action}`);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: MomentDetail['status']) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      archived: 'bg-gray-100 text-gray-600'
    };
    return colors[status];
  };

  const getPriorityColor = (priority: MomentDetail['priority']) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority];
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: EyeIcon },
    { id: 'content', label: 'Content', icon: DocumentDuplicateIcon },
    { id: 'targeting', label: 'Targeting', icon: ChartBarIcon },
    { id: 'performance', label: 'Performance', icon: ChartBarIcon },
    { id: 'versions', label: 'Versions', icon: ClockIcon }
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/moments')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Moments
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{moment.name}</h1>
                <p className="text-gray-600 mt-1">{moment.description}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge className={getPriorityColor(moment.priority)}>
                {moment.priority.toUpperCase()}
              </Badge>
              <Badge className={getStatusColor(moment.status)}>
                {moment.status.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2 mt-6">
            {moment.status === 'draft' && (
              <Button onClick={() => handleStatusChange('active')} loading={loading}>
                <PlayIcon className="w-4 h-4 mr-2" />
                Activate
              </Button>
            )}
            
            {moment.status === 'active' && (
              <Button variant="secondary" onClick={() => handleStatusChange('paused')} loading={loading}>
                <PauseIcon className="w-4 h-4 mr-2" />
                Pause
              </Button>
            )}
            
            {moment.status === 'paused' && (
              <Button onClick={() => handleStatusChange('active')} loading={loading}>
                <PlayIcon className="w-4 h-4 mr-2" />
                Resume
              </Button>
            )}
            
            <Button variant="outline" onClick={() => navigate(`/moments/${momentId}/edit`)}>
              <PencilIcon className="w-4 h-4 mr-2" />
              Edit
            </Button>
            
            <Button variant="outline" onClick={() => handleAction('duplicate')} loading={loading}>
              <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
              Duplicate
            </Button>
            
            <Button variant="outline" onClick={() => handleAction('share')} loading={loading}>
              <ShareIcon className="w-4 h-4 mr-2" />
              Share
            </Button>
            
            <Button variant="outline" onClick={() => handleAction('delete')} loading={loading}>
              <TrashIcon className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Moment Details</h3>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Type</label>
                        <div className="flex items-center mt-1">
                          {React.createElement(getChannelIcon(moment.type), { className: "w-4 h-4 mr-2 text-gray-600" })}
                          <span className="capitalize">{moment.type}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Trigger</label>
                        <p className="mt-1 capitalize">{moment.trigger.replace('-', ' ')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Audience Size</label>
                        <p className="mt-1 font-semibold">{moment.audienceSize.toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Timezone</label>
                        <p className="mt-1">{moment.schedule.timezone}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Channels</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {moment.channels.map((channel) => {
                          const Icon = getChannelIcon(channel);
                          return (
                            <Badge key={channel} variant="secondary" className="flex items-center">
                              <Icon className="w-3 h-3 mr-1" />
                              {channel.toUpperCase()}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tags</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {moment.tags.map((tag) => (
                          <Badge key={tag} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Performance Summary */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Performance Summary</h3>
                  </CardHeader>
                  <CardBody>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{moment.metrics.deliveryRate}%</div>
                        <div className="text-sm text-gray-500">Delivery Rate</div>
                        <div className="text-xs text-gray-400">{moment.metrics.delivered.toLocaleString()} delivered</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{moment.metrics.openRate}%</div>
                        <div className="text-sm text-gray-500">Open Rate</div>
                        <div className="text-xs text-gray-400">{moment.metrics.opened.toLocaleString()} opens</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{moment.metrics.clickRate}%</div>
                        <div className="text-sm text-gray-500">Click Rate</div>
                        <div className="text-xs text-gray-400">{moment.metrics.clicked.toLocaleString()} clicks</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{moment.metrics.conversionRate}%</div>
                        <div className="text-sm text-gray-500">Conversion Rate</div>
                        <div className="text-xs text-gray-400">${moment.metrics.revenue.toLocaleString()} revenue</div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Timeline</h3>
                  </CardHeader>
                  <CardBody className="space-y-3">
                    <div className="flex items-center text-sm">
                      <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                      <div>
                        <div className="font-medium">Created</div>
                        <div className="text-gray-500">{format(new Date(moment.createdAt), 'MMM d, yyyy h:mm a')}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                      <div>
                        <div className="font-medium">Last Updated</div>
                        <div className="text-gray-500">{format(new Date(moment.updatedAt), 'MMM d, yyyy h:mm a')}</div>
                      </div>
                    </div>
                    
                    {moment.lastActivatedAt && (
                      <div className="flex items-center text-sm">
                        <CheckCircleIcon className="w-4 h-4 text-blue-500 mr-2" />
                        <div>
                          <div className="font-medium">Activated</div>
                          <div className="text-gray-500">{format(new Date(moment.lastActivatedAt), 'MMM d, yyyy h:mm a')}</div>
                        </div>
                      </div>
                    )}
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Team</h3>
                  </CardHeader>
                  <CardBody className="space-y-3">
                    <div>
                      <div className="text-sm font-medium">Created by</div>
                      <div className="text-sm text-gray-600">{moment.createdBy}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Last updated by</div>
                      <div className="text-sm text-gray-600">{moment.updatedBy}</div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          )}

          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Content Details</h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  {moment.content.subject && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Subject Line</label>
                      <p className="mt-1 p-3 bg-gray-50 rounded border text-sm">{moment.content.subject}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Message</label>
                    <p className="mt-1 p-3 bg-gray-50 rounded border text-sm">{moment.content.message}</p>
                  </div>
                  
                  {moment.content.cta && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Call to Action</label>
                      <p className="mt-1 p-3 bg-gray-50 rounded border text-sm">{moment.content.cta}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Template</label>
                    <p className="mt-1 text-sm">{moment.content.template}</p>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Preview</h3>
                </CardHeader>
                <CardBody>
                  <div className="bg-white border rounded-lg p-4 shadow-sm">
                    <div className="text-sm text-gray-500 mb-2">Email Preview</div>
                    <div className="space-y-2">
                      <div className="font-medium text-sm">Subject: {moment.content.subject}</div>
                      <div className="text-sm text-gray-700 leading-relaxed">{moment.content.message}</div>
                      {moment.content.cta && (
                        <div className="mt-3">
                          <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium">
                            {moment.content.cta}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {/* Targeting Tab */}
          {activeTab === 'targeting' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Audience Segments</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-2">
                    {moment.targeting.segments.map((segment) => (
                      <Badge key={segment} variant="secondary">{segment}</Badge>
                    ))}
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Eligibility Atoms</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-2">
                    {moment.targeting.atoms.map((atom) => (
                      <Badge key={atom} variant="outline">{atom}</Badge>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardBody className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{moment.metrics.sent.toLocaleString()}</div>
                  <div className="text-sm text-gray-500 mt-1">Total Sent</div>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="text-center">
                  <div className="text-3xl font-bold text-green-600">{moment.metrics.delivered.toLocaleString()}</div>
                  <div className="text-sm text-gray-500 mt-1">Delivered</div>
                  <div className="text-xs text-gray-400 mt-1">{moment.metrics.deliveryRate}% rate</div>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{moment.metrics.opened.toLocaleString()}</div>
                  <div className="text-sm text-gray-500 mt-1">Opened</div>
                  <div className="text-xs text-gray-400 mt-1">{moment.metrics.openRate}% rate</div>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{moment.metrics.clicked.toLocaleString()}</div>
                  <div className="text-sm text-gray-500 mt-1">Clicked</div>
                  <div className="text-xs text-gray-400 mt-1">{moment.metrics.clickRate}% rate</div>
                </CardBody>
              </Card>
            </div>
          )}

          {/* Versions Tab */}
          {activeTab === 'versions' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Version History</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {moment.versions.map((version) => (
                    <div key={version.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <Badge variant={version.status === 'active' ? 'default' : 'secondary'}>
                            v{version.version}
                          </Badge>
                          <Badge className={getStatusColor(version.status as MomentDetail['status'])}>
                            {version.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(version.createdAt), 'MMM d, yyyy h:mm a')}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1">Changes:</div>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {version.changes.map((change, idx) => (
                            <li key={idx}>{change}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MomentDetailPage;