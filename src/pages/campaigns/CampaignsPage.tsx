// File: src/pages/campaigns/CampaignsPage.tsx
import React, { useState, useMemo } from 'react';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  FunnelIcon,
  EllipsisVerticalIcon,
  ChevronDownIcon,
  DocumentArrowDownIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { CampaignCard } from '@/components/business/campaigns/CampaignCard';

// Mock data structure
interface Campaign {
  id: string;
  name: string;
  description: string;
  type: 'acquisition' | 'retention' | 'conversion' | 'engagement' | 'winback';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'scheduled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  goal: 'awareness' | 'consideration' | 'conversion' | 'retention' | 'advocacy';
  startDate: string;
  endDate: string;
  budget: {
    total: number;
    spent: number;
    remaining: number;
  };
  audience: {
    size: number;
    segments: string[];
  };
  channels: string[];
  moments: number;
  atoms: number;
  createdBy: string;
  lastModified: string;
  tags: string[];
  metrics: {
    reach: number;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    roas: number;
    ctr: number;
    conversionRate: number;
    cpc: number;
    cpa: number;
  };
  timeline: {
    totalDays: number;
    daysRemaining: number;
    progress: number;
  };
}

// Transform function to convert mock data to CampaignCard format
const transformCampaignData = (campaign: Campaign) => {
  return {
    id: campaign.id,
    name: campaign.name,
    description: campaign.description,
    status: campaign.status as 'draft' | 'active' | 'paused' | 'completed' | 'archived',
    type: campaign.type,
    goal: campaign.goal,
    budget: campaign.budget,
    timeline: {
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      duration: campaign.timeline.totalDays,
    },
    performance: {
      impressions: campaign.metrics.impressions,
      clicks: campaign.metrics.clicks,
      conversions: campaign.metrics.conversions,
      revenue: campaign.metrics.revenue,
      roas: campaign.metrics.roas,
      ctr: campaign.metrics.ctr / 100, // Convert percentage to decimal
      cvr: campaign.metrics.conversionRate / 100, // Convert percentage to decimal
    },
    audience: campaign.audience,
    channels: campaign.channels,
    priority: campaign.priority === 'urgent' ? 'critical' as const : campaign.priority as 'low' | 'medium' | 'high',
    createdAt: new Date().toISOString(),
    updatedAt: campaign.lastModified,
  };
};

// Mock campaigns data
const mockCampaigns: Campaign[] = [
  {
    id: 'campaign-001',
    name: 'Q3 Summer Sale Blitz',
    description: 'Multi-channel summer promotion targeting high-value customers',
    type: 'conversion',
    status: 'active',
    priority: 'high',
    goal: 'conversion',
    startDate: '2025-07-01',
    endDate: '2025-07-31',
    budget: {
      total: 150000,
      spent: 92300,
      remaining: 57700
    },
    audience: {
      size: 45670,
      segments: ['High-Value Customers', 'Summer Shoppers', 'Email Engaged']
    },
    channels: ['email', 'sms', 'push', 'web'],
    moments: 12,
    atoms: 8,
    createdBy: 'Sarah Chen',
    lastModified: '2025-07-20',
    tags: ['summer', 'sale', 'promotion', 'multi-channel'],
    metrics: {
      reach: 42150,
      impressions: 234567,
      clicks: 18734,
      conversions: 3456,
      revenue: 487350,
      roas: 5.28,
      ctr: 7.98,
      conversionRate: 18.45,
      cpc: 4.93,
      cpa: 26.70
    },
    timeline: {
      totalDays: 31,
      daysRemaining: 11,
      progress: 64.5
    }
  },
  {
    id: 'campaign-002',
    name: 'Welcome Journey Optimization',
    description: 'Improved onboarding experience for new user acquisition',
    type: 'acquisition',
    status: 'active',
    priority: 'medium',
    goal: 'conversion',
    startDate: '2025-06-15',
    endDate: '2025-09-15',
    budget: {
      total: 75000,
      spent: 28400,
      remaining: 46600
    },
    audience: {
      size: 12450,
      segments: ['New Users', 'Mobile First', 'Onboarding']
    },
    channels: ['email', 'in-app', 'push'],
    moments: 8,
    atoms: 6,
    createdBy: 'Mike Rodriguez',
    lastModified: '2025-07-19',
    tags: ['onboarding', 'welcome', 'new-users', 'journey'],
    metrics: {
      reach: 11890,
      impressions: 87653,
      clicks: 12456,
      conversions: 2134,
      revenue: 128450,
      roas: 4.52,
      ctr: 14.21,
      conversionRate: 17.14,
      cpc: 2.28,
      cpa: 13.31
    },
    timeline: {
      totalDays: 92,
      daysRemaining: 56,
      progress: 39.1
    }
  },
  {
    id: 'campaign-003',
    name: 'Black Friday Preview',
    description: 'Early access campaign for VIP customers',
    type: 'retention',
    status: 'draft', // Changed from 'scheduled' to match CampaignCard interface
    priority: 'urgent',
    goal: 'conversion',
    startDate: '2025-11-20',
    endDate: '2025-11-29',
    budget: {
      total: 300000,
      spent: 0,
      remaining: 300000
    },
    audience: {
      size: 8790,
      segments: ['VIP Customers', 'High Lifetime Value', 'Early Access']
    },
    channels: ['email', 'sms'],
    moments: 6,
    atoms: 4,
    createdBy: 'Emma Davis',
    lastModified: '2025-07-18',
    tags: ['black-friday', 'vip', 'early-access', 'exclusive'],
    metrics: {
      reach: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      roas: 0,
      ctr: 0,
      conversionRate: 0,
      cpc: 0,
      cpa: 0
    },
    timeline: {
      totalDays: 10,
      daysRemaining: 122,
      progress: 0
    }
  },
  {
    id: 'campaign-004',
    name: 'Cart Recovery Automation',
    description: 'Automated sequence to recover abandoned shopping carts',
    type: 'conversion',
    status: 'active',
    priority: 'high',
    goal: 'conversion',
    startDate: '2025-06-01',
    endDate: '2025-12-31',
    budget: {
      total: 120000,
      spent: 67800,
      remaining: 52200
    },
    audience: {
      size: 23450,
      segments: ['Cart Abandoners', 'Recent Visitors', 'Price Sensitive']
    },
    channels: ['email', 'sms', 'web'],
    moments: 5,
    atoms: 3,
    createdBy: 'Alex Thompson',
    lastModified: '2025-07-17',
    tags: ['cart-recovery', 'automation', 'abandonment', 'conversion'],
    metrics: {
      reach: 21345,
      impressions: 156789,
      clicks: 9876,
      conversions: 1987,
      revenue: 298450,
      roas: 4.40,
      ctr: 6.30,
      conversionRate: 20.11,
      cpc: 6.87,
      cpa: 34.13
    },
    timeline: {
      totalDays: 214,
      daysRemaining: 163,
      progress: 23.8
    }
  },
  {
    id: 'campaign-005',
    name: 'Loyalty Program Launch',
    description: 'Introduction campaign for new customer loyalty program',
    type: 'engagement',
    status: 'paused',
    priority: 'medium',
    goal: 'retention',
    startDate: '2025-05-15',
    endDate: '2025-08-15',
    budget: {
      total: 90000,
      spent: 34500,
      remaining: 55500
    },
    audience: {
      size: 56780,
      segments: ['Existing Customers', 'Repeat Buyers', 'Engagement Eligible']
    },
    channels: ['email', 'in-app', 'web'],
    moments: 10,
    atoms: 7,
    createdBy: 'David Kim',
    lastModified: '2025-07-16',
    tags: ['loyalty', 'program', 'engagement', 'retention'],
    metrics: {
      reach: 52340,
      impressions: 189567,
      clicks: 15678,
      conversions: 4567,
      revenue: 156780,
      roas: 4.54,
      ctr: 8.27,
      conversionRate: 29.13,
      cpc: 2.20,
      cpa: 7.55
    },
    timeline: {
      totalDays: 92,
      daysRemaining: 25,
      progress: 72.8
    }
  },
  {
    id: 'campaign-006',
    name: 'Win-Back Series',
    description: 'Re-engagement campaign for inactive customers',
    type: 'winback',
    status: 'completed',
    priority: 'low',
    goal: 'retention',
    startDate: '2025-04-01',
    endDate: '2025-06-30',
    budget: {
      total: 45000,
      spent: 43200,
      remaining: 1800
    },
    audience: {
      size: 34560,
      segments: ['Inactive Customers', 'Dormant Users', 'Churn Risk']
    },
    channels: ['email', 'sms'],
    moments: 7,
    atoms: 5,
    createdBy: 'Lisa Zhang',
    lastModified: '2025-07-15',
    tags: ['winback', 'inactive', 'reengagement', 'churn'],
    metrics: {
      reach: 31245,
      impressions: 123456,
      clicks: 7890,
      conversions: 1234,
      revenue: 89670,
      roas: 2.08,
      ctr: 6.39,
      conversionRate: 15.64,
      cpc: 5.48,
      cpa: 35.01
    },
    timeline: {
      totalDays: 91,
      daysRemaining: 0,
      progress: 100
    }
  }
];

const CampaignsPage: React.FC = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedGoal, setSelectedGoal] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'startDate' | 'budget' | 'roas' | 'priority'>('startDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Derived data
  const filteredCampaigns = useMemo(() => {
    return mockCampaigns
      .filter(campaign => {
        const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            campaign.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = selectedType === 'all' || campaign.type === selectedType;
        const matchesStatus = selectedStatus === 'all' || campaign.status === selectedStatus;
        const matchesGoal = selectedGoal === 'all' || campaign.goal === selectedGoal;
        const matchesPriority = selectedPriority === 'all' || campaign.priority === selectedPriority;
        
        return matchesSearch && matchesType && matchesStatus && matchesGoal && matchesPriority;
      })
      .sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
          case 'name':
            aValue = a.name;
            bValue = b.name;
            break;
          case 'startDate':
            aValue = new Date(a.startDate).getTime();
            bValue = new Date(b.startDate).getTime();
            break;
          case 'budget':
            aValue = a.budget.total;
            bValue = b.budget.total;
            break;
          case 'roas':
            aValue = a.metrics.roas;
            bValue = b.metrics.roas;
            break;
          case 'priority':
            const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
            aValue = priorityOrder[a.priority];
            bValue = priorityOrder[b.priority];
            break;
          default:
            return 0;
        }
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
  }, [searchTerm, selectedType, selectedStatus, selectedGoal, selectedPriority, sortBy, sortOrder]);

  // Get unique values for filters
  const uniqueTypes = [...new Set(mockCampaigns.map(campaign => campaign.type))];
  const uniqueStatuses = [...new Set(mockCampaigns.map(campaign => campaign.status))];
  const uniqueGoals = [...new Set(mockCampaigns.map(campaign => campaign.goal))];
  const uniquePriorities = [...new Set(mockCampaigns.map(campaign => campaign.priority))];

  // Aggregate metrics for summary
  const summaryMetrics = useMemo(() => {
    const activeCampaigns = filteredCampaigns.filter(c => c.status === 'active');
    const totalBudget = activeCampaigns.reduce((sum, c) => sum + c.budget.total, 0);
    const totalSpent = activeCampaigns.reduce((sum, c) => sum + c.budget.spent, 0);
    const totalRevenue = activeCampaigns.reduce((sum, c) => sum + c.metrics.revenue, 0);
    const totalReach = activeCampaigns.reduce((sum, c) => sum + c.metrics.reach, 0);
    const avgRoas = activeCampaigns.length > 0 
      ? activeCampaigns.reduce((sum, c) => sum + c.metrics.roas, 0) / activeCampaigns.length 
      : 0;

    return {
      activeCampaigns: activeCampaigns.length,
      totalBudget,
      totalSpent,
      totalRevenue,
      totalReach,
      avgRoas,
      budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
    };
  }, [filteredCampaigns]);

  // Handlers
  const handleCampaignSelect = (campaignId: string) => {
    setSelectedCampaigns(prev => 
      prev.includes(campaignId) 
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCampaigns.length === filteredCampaigns.length) {
      setSelectedCampaigns([]);
    } else {
      setSelectedCampaigns(filteredCampaigns.map(campaign => campaign.id));
    }
  };

  const handleBulkDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmBulkDelete = () => {
    console.log('Deleting campaigns:', selectedCampaigns);
    setSelectedCampaigns([]);
    setShowDeleteConfirm(false);
    setShowBulkActions(false);
  };

  const handleExport = () => {
    console.log('Exporting campaigns:', selectedCampaigns.length > 0 ? selectedCampaigns : 'all');
  };

  const handleCreateCampaign = () => {
    setShowCreateModal(true);
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk ${action} for campaigns:`, selectedCampaigns);
    setShowBulkActions(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Campaign Orchestration</h1>
            <p className="text-slate-600 mt-1">
              Manage multi-channel campaigns and track performance across touchpoints
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="flex items-center gap-2"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              Export
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateCampaign}
              className="flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Create Campaign
            </Button>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <PlayIcon className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-800">Active</span>
            </div>
            <div className="text-2xl font-bold text-emerald-900 mt-1">
              {summaryMetrics.activeCampaigns}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Budget</span>
            </div>
            <div className="text-xl font-bold text-blue-900 mt-1">
              ${(summaryMetrics.totalBudget / 1000).toFixed(0)}K
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Revenue</span>
            </div>
            <div className="text-xl font-bold text-purple-900 mt-1">
              ${(summaryMetrics.totalRevenue / 1000).toFixed(0)}K
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <UserGroupIcon className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Reach</span>
            </div>
            <div className="text-xl font-bold text-orange-900 mt-1">
              {(summaryMetrics.totalReach / 1000).toFixed(0)}K
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-green-600">ROAS</span>
            </div>
            <div className="text-xl font-bold text-green-900 mt-1">
              {summaryMetrics.avgRoas.toFixed(1)}x
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-yellow-800">Budget Used</span>
            </div>
            <div className="text-xl font-bold text-yellow-900 mt-1">
              {summaryMetrics.budgetUtilization.toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-6 flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search campaigns by name, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-3">
            <Button
              variant={showFilters ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <FunnelIcon className="h-4 w-4" />
              Filters
              {showFilters && <span className="ml-1 bg-white text-slate-600 px-1.5 py-0.5 rounded text-xs">
                {[selectedType, selectedStatus, selectedGoal, selectedPriority].filter(f => f !== 'all').length}
              </span>}
            </Button>

            {/* View Mode Toggle */}
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-4 border-t border-slate-200 pt-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">All Types</option>
                  {uniqueTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">All Statuses</option>
                  {uniqueStatuses.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Goal</label>
                <select
                  value={selectedGoal}
                  onChange={(e) => setSelectedGoal(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">All Goals</option>
                  {uniqueGoals.map(goal => (
                    <option key={goal} value={goal}>
                      {goal.charAt(0).toUpperCase() + goal.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">All Priorities</option>
                  {uniquePriorities.map(priority => (
                    <option key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sort By</label>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="startDate">Start Date</option>
                    <option value="name">Name</option>
                    <option value="budget">Budget</option>
                    <option value="roas">ROAS</option>
                    <option value="priority">Priority</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                  >
                    <ChevronDownIcon className={`h-4 w-4 transition-transform ${
                      sortOrder === 'asc' ? 'rotate-180' : ''
                    }`} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedCampaigns.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-50 border-b border-emerald-200 px-6 py-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-emerald-800">
                  {selectedCampaigns.length} campaign{selectedCampaigns.length !== 1 ? 's' : ''} selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCampaigns([])}
                  className="text-emerald-700 hover:text-emerald-800"
                >
                  Clear selection
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('launch')}
                  className="flex items-center gap-2"
                >
                  <PlayIcon className="h-4 w-4" />
                  Launch
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('pause')}
                  className="flex items-center gap-2"
                >
                  <PauseIcon className="h-4 w-4" />
                  Pause
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('duplicate')}
                  className="flex items-center gap-2"
                >
                  <DocumentDuplicateIcon className="h-4 w-4" />
                  Duplicate
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Summary */}
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing {filteredCampaigns.length} of {mockCampaigns.length} campaigns
          </p>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={selectedCampaigns.length === filteredCampaigns.length && filteredCampaigns.length > 0}
                onChange={handleSelectAll}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              Select all visible
            </label>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCampaigns.map((campaign) => (
                <motion.div
                  key={campaign.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative"
                >
                  <input
                    type="checkbox"
                    checked={selectedCampaigns.includes(campaign.id)}
                    onChange={() => handleCampaignSelect(campaign.id)}
                    className="absolute top-4 right-4 z-10 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  {/* FIXED: Pass correct campaign object structure */}
                  <CampaignCard
                    campaign={transformCampaignData(campaign)}
                    variant="default"
                    selected={selectedCampaigns.includes(campaign.id)}
                    onSelect={() => handleCampaignSelect(campaign.id)}
                    onEdit={(campaignId) => console.log('Edit:', campaignId)}
                    onDuplicate={(campaignId) => console.log('Duplicate:', campaignId)}
                    onArchive={(campaignId) => console.log('Archive:', campaignId)}
                    onToggleStatus={(campaignId) => console.log('Toggle:', campaignId)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="w-12 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedCampaigns.length === filteredCampaigns.length && filteredCampaigns.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Campaign</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Type</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Status</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Budget</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">ROAS</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Progress</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">End Date</th>
                      <th className="w-16 px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredCampaigns.map((campaign) => (
                      <motion.tr
                        key={campaign.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedCampaigns.includes(campaign.id)}
                            onChange={() => handleCampaignSelect(campaign.id)}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <div className="font-medium text-slate-900">{campaign.name}</div>
                            <div className="text-sm text-slate-500 truncate max-w-xs">{campaign.description}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            campaign.type === 'acquisition' ? 'bg-blue-100 text-blue-800' :
                            campaign.type === 'retention' ? 'bg-green-100 text-green-800' :
                            campaign.type === 'conversion' ? 'bg-purple-100 text-purple-800' :
                            campaign.type === 'engagement' ? 'bg-orange-100 text-orange-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {campaign.type}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                            campaign.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            campaign.status === 'paused' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              ${(campaign.budget.total / 1000).toFixed(0)}K
                            </div>
                            <div className="text-xs text-slate-500">
                              ${(campaign.budget.spent / 1000).toFixed(0)}K spent
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-sm font-medium ${
                            campaign.metrics.roas >= 4 ? 'text-green-600' :
                            campaign.metrics.roas >= 2 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {campaign.metrics.roas.toFixed(1)}x
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${Math.min(campaign.timeline.progress, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-600">
                              {campaign.timeline.progress.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-500">
                          {new Date(campaign.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {filteredCampaigns.length === 0 && (
            <div className="text-center py-12">
              <div className="text-slate-400 text-6xl mb-4">🚀</div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No campaigns found</h3>
              <p className="text-slate-500 mb-6">
                {searchTerm || selectedType !== 'all' || selectedStatus !== 'all' || selectedGoal !== 'all' || selectedPriority !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'Get started by creating your first marketing campaign.'}
              </p>
              <Button variant="primary" onClick={handleCreateCampaign}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Create First Campaign
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Create Campaign Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Campaign"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Campaign Name
            </label>
            <Input
              type="text"
              placeholder="Enter a descriptive name for your campaign..."
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <Input
              type="text"
              placeholder="Describe the goal and approach of this campaign..."
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Campaign Type
              </label>
              <select className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                <option value="acquisition">Acquisition</option>
                <option value="retention">Retention</option>
                <option value="conversion">Conversion</option>
                <option value="engagement">Engagement</option>
                <option value="winback">Win-back</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Primary Goal
              </label>
              <select className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                <option value="awareness">Awareness</option>
                <option value="consideration">Consideration</option>
                <option value="conversion">Conversion</option>
                <option value="retention">Retention</option>
                <option value="advocacy">Advocacy</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Start Date
              </label>
              <Input
                type="date"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                End Date
              </label>
              <Input
                type="date"
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Total Budget ($)
              </label>
              <Input
                type="number"
                placeholder="50000"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Priority Level
              </label>
              <select className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Channels
            </label>
            <div className="flex flex-wrap gap-3">
              {['Email', 'SMS', 'Push', 'Web', 'In-App', 'Social'].map(channel => (
                <label key={channel} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-700">{channel}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                console.log('Creating campaign...');
                setShowCreateModal(false);
              }}
            >
              Create Campaign
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmBulkDelete}
        title="Delete Selected Campaigns"
        message={`Are you sure you want to delete ${selectedCampaigns.length} campaign${selectedCampaigns.length !== 1 ? 's' : ''}? This action cannot be undone and will stop all active moments and tracking.`}
        type="danger"
      />
    </div>
  );
};

export default CampaignsPage;