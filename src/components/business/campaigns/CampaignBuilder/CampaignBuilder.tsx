// src/components/business/campaigns/CampaignBuilder/CampaignBuilder.tsx

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  PencilIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../../ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '../../../ui/Card';
import { Input, Select } from '../../../ui/Input';
import { Modal } from '../../../ui/Modal';
import { CampaignWizard } from './CampaignWizard';
import { CampaignConfig } from './CampaignConfig';
import { TemplateLibrary } from './TemplateLibrary';

interface Campaign {
  id: string;
  name: string;
  type: 'acquisition' | 'retention' | 'conversion' | 'engagement' | 'winback';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  goal: string;
  budget: {
    total: number;
    spent: number;
    remaining: number;
    currency: string;
  };
  timeline: {
    startDate: string;
    endDate: string;
    duration: number;
    progress: number;
  };
  audience: {
    size: number;
    segments: string[];
  };
  channels: string[];
  moments: number;
  performance: {
    reach: number;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    roas: number;
    ctr: number;
    conversionRate: number;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface CampaignBuilderProps {
  campaigns?: Campaign[];
  onCreateCampaign?: (campaign: Partial<Campaign>) => void;
  onUpdateCampaign?: (id: string, updates: Partial<Campaign>) => void;
  onDeleteCampaign?: (id: string) => void;
  onDuplicateCampaign?: (id: string) => void;
  loading?: boolean;
}

const CAMPAIGN_TYPES = [
  { value: 'acquisition', label: 'Customer Acquisition', icon: '🎯', color: 'blue' },
  { value: 'retention', label: 'Customer Retention', icon: '💝', color: 'green' },
  { value: 'conversion', label: 'Conversion Optimization', icon: '⚡', color: 'purple' },
  { value: 'engagement', label: 'Engagement Building', icon: '🔥', color: 'orange' },
  { value: 'winback', label: 'Win-back Campaign', icon: '🎪', color: 'red' }
];

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: '1',
    name: 'Holiday Season Launch',
    type: 'acquisition',
    status: 'active',
    goal: 'Acquire 10,000 new customers for holiday shopping',
    budget: { total: 50000, spent: 15000, remaining: 35000, currency: 'USD' },
    timeline: { 
      startDate: '2025-11-01', 
      endDate: '2025-12-31', 
      duration: 60, 
      progress: 35 
    },
    audience: { size: 250000, segments: ['Holiday Shoppers', 'Gift Buyers', 'Deal Seekers'] },
    channels: ['email', 'social', 'display', 'search'],
    moments: 12,
    performance: {
      reach: 180000,
      impressions: 850000,
      clicks: 42500,
      conversions: 2550,
      revenue: 127500,
      roas: 8.5,
      ctr: 5.0,
      conversionRate: 6.0
    },
    createdAt: '2025-10-15T10:00:00Z',
    updatedAt: '2025-07-21T14:30:00Z',
    createdBy: 'Sarah Johnson'
  },
  {
    id: '2',
    name: 'VIP Customer Retention',
    type: 'retention',
    status: 'active',
    goal: 'Increase VIP customer lifetime value by 25%',
    budget: { total: 25000, spent: 8200, remaining: 16800, currency: 'USD' },
    timeline: { 
      startDate: '2025-07-01', 
      endDate: '2025-12-31', 
      duration: 183, 
      progress: 55 
    },
    audience: { size: 12500, segments: ['VIP Customers', 'High Value', 'Loyalty Members'] },
    channels: ['email', 'sms', 'in-app'],
    moments: 8,
    performance: {
      reach: 11800,
      impressions: 95000,
      clicks: 9500,
      conversions: 1425,
      revenue: 142500,
      roas: 17.4,
      ctr: 10.0,
      conversionRate: 15.0
    },
    createdAt: '2025-06-15T09:00:00Z',
    updatedAt: '2025-07-21T11:15:00Z',
    createdBy: 'Michael Chen'
  },
  {
    id: '3',
    name: 'Cart Abandonment Recovery',
    type: 'conversion',
    status: 'paused',
    goal: 'Recover 30% of abandoned carts',
    budget: { total: 15000, spent: 4500, remaining: 10500, currency: 'USD' },
    timeline: { 
      startDate: '2025-06-01', 
      endDate: '2025-08-31', 
      duration: 91, 
      progress: 60 
    },
    audience: { size: 85000, segments: ['Cart Abandoners', 'Browse Abandoners'] },
    channels: ['email', 'sms', 'retargeting'],
    moments: 6,
    performance: {
      reach: 72000,
      impressions: 360000,
      clicks: 21600,
      conversions: 6480,
      revenue: 324000,
      roas: 72.0,
      ctr: 6.0,
      conversionRate: 30.0
    },
    createdAt: '2025-05-20T14:00:00Z',
    updatedAt: '2025-07-18T16:45:00Z',
    createdBy: 'Emma Rodriguez'
  }
];

export const CampaignBuilder: React.FC<CampaignBuilderProps> = ({
  campaigns = MOCK_CAMPAIGNS,
  onCreateCampaign,
  onUpdateCampaign,
  onDeleteCampaign,
  onDuplicateCampaign,
  loading = false
}) => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('updatedAt');
  const [showWizard, setShowWizard] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  // Filter and sort campaigns
  const filteredCampaigns = React.useMemo(() => {
    let filtered = campaigns.filter(campaign => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          campaign.goal.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
      const matchesType = filterType === 'all' || campaign.type === filterType;
      
      return matchesSearch && matchesStatus && matchesType;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'budget':
          return b.budget.total - a.budget.total;
        case 'performance':
          return b.performance.roas - a.performance.roas;
        case 'updatedAt':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });
  }, [campaigns, searchTerm, filterStatus, filterType, sortBy]);

  const handleCreateCampaign = useCallback((campaignData: Partial<Campaign>) => {
    onCreateCampaign?.(campaignData);
    setShowWizard(false);
  }, [onCreateCampaign]);

  const handleConfigureCampaign = useCallback((campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowConfig(true);
  }, []);

  const handleUpdateCampaign = useCallback((updates: Partial<Campaign>) => {
    if (selectedCampaign) {
      onUpdateCampaign?.(selectedCampaign.id, updates);
      setShowConfig(false);
      setSelectedCampaign(null);
    }
  }, [selectedCampaign, onUpdateCampaign]);

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeConfig = (type: Campaign['type']) => {
    return CAMPAIGN_TYPES.find(t => t.value === type) || CAMPAIGN_TYPES[0];
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaign Management</h1>
          <p className="text-gray-600">Create and manage multi-touch customer journeys</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTemplates(true)}
            icon={DocumentDuplicateIcon}
          >
            Templates
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowWizard(true)}
            icon={BoltIcon}
          >
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardBody className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Input
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
            </Select>
            
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              {CAMPAIGN_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
            
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="updatedAt">Recently Updated</option>
              <option value="name">Name</option>
              <option value="budget">Budget</option>
              <option value="performance">Performance</option>
            </Select>

            <div className="flex items-center gap-2">
              <Button
                variant={view === 'grid' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setView('grid')}
              >
                Grid
              </Button>
              <Button
                variant={view === 'list' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setView('list')}
              >
                List
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Campaign Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className={view === 'grid' 
            ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
            : "space-y-4"
          }
        >
          {filteredCampaigns.map((campaign) => {
            const typeConfig = getTypeConfig(campaign.type);
            
            return (
              <motion.div
                key={campaign.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="group hover:shadow-lg transition-all duration-200">
                  <CardHeader className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{typeConfig.icon}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {campaign.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {campaign.goal}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleConfigureCampaign(campaign)}
                          icon={Cog6ToothIcon}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDuplicateCampaign?.(campaign.id)}
                          icon={DocumentDuplicateIcon}
                        />
                      </div>
                    </div>
                  </CardHeader>

                  <CardBody className="p-4 pt-0 space-y-4">
                    {/* Budget Progress */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Budget</span>
                        <span className="font-medium">
                          {formatCurrency(campaign.budget.spent)} / {formatCurrency(campaign.budget.total)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(campaign.budget.spent / campaign.budget.total) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Timeline Progress */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Timeline</span>
                        <span className="font-medium">{campaign.timeline.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${campaign.timeline.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">ROAS</div>
                        <div className="font-semibold text-green-600">
                          {campaign.performance.roas.toFixed(1)}x
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Conversions</div>
                        <div className="font-semibold">
                          {campaign.performance.conversions.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Audience</div>
                        <div className="font-semibold">
                          {campaign.audience.size.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Moments</div>
                        <div className="font-semibold">
                          {campaign.moments}
                        </div>
                      </div>
                    </div>

                    {/* Channels */}
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Channels</div>
                      <div className="flex flex-wrap gap-1">
                        {campaign.channels.map((channel) => (
                          <span
                            key={channel}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {channel}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardBody>

                  <CardFooter className="p-4 pt-0">
                    <div className="flex items-center justify-between w-full">
                      <div className="text-xs text-gray-500">
                        Updated {new Date(campaign.updatedAt).toLocaleDateString()}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {campaign.status === 'active' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateCampaign?.(campaign.id, { status: 'paused' })}
                            icon={PauseIcon}
                          >
                            Pause
                          </Button>
                        ) : campaign.status === 'paused' ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onUpdateCampaign?.(campaign.id, { status: 'active' })}
                            icon={PlayIcon}
                          >
                            Resume
                          </Button>
                        ) : null}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          icon={ChartBarIcon}
                        >
                          Analytics
                        </Button>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Empty State */}
      {filteredCampaigns.length === 0 && (
        <Card>
          <CardBody className="p-12 text-center">
            <BoltIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first campaign to get started'
              }
            </p>
            <Button
              variant="primary"
              onClick={() => setShowWizard(true)}
              icon={BoltIcon}
            >
              Create Campaign
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Modals */}
      <CampaignWizard
        open={showWizard}
        onClose={() => setShowWizard(false)}
        onSave={handleCreateCampaign}
      />

      <TemplateLibrary
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={(template) => {
          setShowTemplates(false);
          setShowWizard(true);
        }}
      />

      {selectedCampaign && (
        <CampaignConfig
          open={showConfig}
          campaign={selectedCampaign}
          onClose={() => {
            setShowConfig(false);
            setSelectedCampaign(null);
          }}
          onSave={handleUpdateCampaign}
        />
      )}
    </div>
  );
};