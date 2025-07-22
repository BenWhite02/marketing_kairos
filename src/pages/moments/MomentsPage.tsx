// src/pages/moments/MomentsPage.tsx
import React, { useState, useMemo } from 'react';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  FunnelIcon,
  ChevronDownIcon,
  DocumentArrowDownIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
// Updated import for the compatible component
import { CompatibleMomentCard } from '@/components/business/moments/MomentCard/CompatibleMomentCard';

// Keep the original interface for compatibility
interface Moment {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'sms' | 'push' | 'web' | 'in-app';
  status: 'active' | 'draft' | 'scheduled' | 'paused' | 'completed';
  trigger: 'immediate' | 'scheduled' | 'event-based' | 'behavior-based';
  audience: string;
  channel: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledFor?: string;
  createdBy: string;
  lastModified: string;
  tags: string[];
  personalization: boolean;
  abTest: boolean;
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
  };
  content: {
    subject?: string;
    preview: string;
    template: string;
  };
}

// Mock moments data (unchanged)
const mockMoments: Moment[] = [
  {
    id: 'moment-001',
    name: 'Welcome Email Series',
    description: 'Multi-step onboarding email sequence for new users',
    type: 'email',
    status: 'active',
    trigger: 'event-based',
    audience: 'New Users',
    channel: ['email'],
    priority: 'high',
    createdBy: 'Sarah Chen',
    lastModified: '2025-07-20',
    tags: ['onboarding', 'welcome', 'series'],
    personalization: true,
    abTest: true,
    metrics: {
      sent: 15420,
      delivered: 15205,
      opened: 9123,
      clicked: 2435,
      converted: 487,
      deliveryRate: 98.6,
      openRate: 60.0,
      clickRate: 26.7,
      conversionRate: 20.0
    },
    content: {
      subject: 'Welcome to {{company_name}}! Let\'s get started 🚀',
      preview: 'Your journey begins here. Follow these simple steps...',
      template: 'welcome-email-v2'
    }
  },
  {
    id: 'moment-002',
    name: 'Cart Abandonment Push',
    description: 'Push notification for users who abandoned their cart',
    type: 'push',
    status: 'active',
    trigger: 'behavior-based',
    audience: 'Cart Abandoners',
    channel: ['push', 'web'],
    priority: 'high',
    createdBy: 'Mike Rodriguez',
    lastModified: '2025-07-19',
    tags: ['cart', 'abandonment', 'recovery', 'push'],
    personalization: true,
    abTest: false,
    metrics: {
      sent: 8934,
      delivered: 8756,
      opened: 3245,
      clicked: 891,
      converted: 234,
      deliveryRate: 98.0,
      openRate: 37.1,
      clickRate: 27.5,
      conversionRate: 26.3
    },
    content: {
      preview: 'Don\'t forget about your items! Complete your purchase now.',
      template: 'cart-abandonment-push'
    }
  },
  {
    id: 'moment-003',
    name: 'Birthday Special Offer',
    description: 'Personalized birthday SMS with special discount',
    type: 'sms',
    status: 'scheduled',
    trigger: 'scheduled',
    audience: 'Birthday Customers',
    channel: ['sms'],
    priority: 'medium',
    scheduledFor: '2025-07-25',
    createdBy: 'Emma Davis',
    lastModified: '2025-07-18',
    tags: ['birthday', 'offer', 'discount', 'personal'],
    personalization: true,
    abTest: true,
    metrics: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      converted: 0,
      deliveryRate: 0,
      openRate: 0,
      clickRate: 0,
      conversionRate: 0
    },
    content: {
      preview: 'Happy Birthday {{first_name}}! Enjoy 25% off your next purchase 🎉',
      template: 'birthday-sms'
    }
  }
];

const MomentsPage: React.FC = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTrigger, setSelectedTrigger] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'lastModified' | 'priority' | 'openRate'>('lastModified');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedMoments, setSelectedMoments] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Derived data
  const filteredMoments = useMemo(() => {
    return mockMoments
      .filter(moment => {
        const matchesSearch = moment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            moment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            moment.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = selectedType === 'all' || moment.type === selectedType;
        const matchesStatus = selectedStatus === 'all' || moment.status === selectedStatus;
        const matchesTrigger = selectedTrigger === 'all' || moment.trigger === selectedTrigger;
        const matchesPriority = selectedPriority === 'all' || moment.priority === selectedPriority;
        
        return matchesSearch && matchesType && matchesStatus && matchesTrigger && matchesPriority;
      })
      .sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
          case 'name':
            aValue = a.name;
            bValue = b.name;
            break;
          case 'priority':
            const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
            aValue = priorityOrder[a.priority];
            bValue = priorityOrder[b.priority];
            break;
          case 'openRate':
            aValue = a.metrics.openRate;
            bValue = b.metrics.openRate;
            break;
          case 'lastModified':
            aValue = new Date(a.lastModified).getTime();
            bValue = new Date(b.lastModified).getTime();
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
  }, [searchTerm, selectedType, selectedStatus, selectedTrigger, selectedPriority, sortBy, sortOrder]);

  // Get unique values for filters
  const uniqueTypes = [...new Set(mockMoments.map(moment => moment.type))];
  const uniqueStatuses = [...new Set(mockMoments.map(moment => moment.status))];
  const uniqueTriggers = [...new Set(mockMoments.map(moment => moment.trigger))];
  const uniquePriorities = [...new Set(mockMoments.map(moment => moment.priority))];

  // Handlers
  const handleMomentSelect = (momentId: string) => {
    setSelectedMoments(prev => 
      prev.includes(momentId) 
        ? prev.filter(id => id !== momentId)
        : [...prev, momentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMoments.length === filteredMoments.length) {
      setSelectedMoments([]);
    } else {
      setSelectedMoments(filteredMoments.map(moment => moment.id));
    }
  };

  const handleBulkDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmBulkDelete = () => {
    console.log('Deleting moments:', selectedMoments);
    setSelectedMoments([]);
    setShowDeleteConfirm(false);
  };

  const handleExport = () => {
    console.log('Exporting moments:', selectedMoments.length > 0 ? selectedMoments : 'all');
  };

  const handleCreateMoment = () => {
    setShowCreateModal(true);
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk ${action} for moments:`, selectedMoments);
  };

  // Enhanced moment action handlers
  const handleMomentEdit = (momentId: string) => {
    console.log('Edit moment:', momentId);
  };

  const handleMomentTest = (momentId: string) => {
    console.log('Test moment:', momentId);
  };

  const handleMomentDuplicate = (momentId: string) => {
    console.log('Duplicate moment:', momentId);
  };

  const handleMomentToggleStatus = (momentId: string) => {
    console.log('Toggle status for moment:', momentId);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Perfect Moments</h1>
            <p className="text-slate-600 mt-1">
              Create and manage personalized customer moments across all channels
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
              onClick={handleCreateMoment}
              className="flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Create Moment
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-6 flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search moments by name, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant={showFilters ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <FunnelIcon className="h-4 w-4" />
              Filters
              {showFilters && (
                <span className="ml-1 bg-white text-slate-600 px-1.5 py-0.5 rounded text-xs">
                  {[selectedType, selectedStatus, selectedTrigger, selectedPriority].filter(f => f !== 'all').length}
                </span>
              )}
            </Button>

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
                <label className="block text-sm font-medium text-slate-700 mb-1">Trigger</label>
                <select
                  value={selectedTrigger}
                  onChange={(e) => setSelectedTrigger(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">All Triggers</option>
                  {uniqueTriggers.map(trigger => (
                    <option key={trigger} value={trigger}>
                      {trigger.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
                    <option value="lastModified">Modified</option>
                    <option value="name">Name</option>
                    <option value="priority">Priority</option>
                    <option value="openRate">Open Rate</option>
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
        {selectedMoments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-50 border-b border-emerald-200 px-6 py-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-emerald-800">
                  {selectedMoments.length} moment{selectedMoments.length !== 1 ? 's' : ''} selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMoments([])}
                  className="text-emerald-700 hover:text-emerald-800"
                >
                  Clear selection
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('activate')}
                  className="flex items-center gap-2"
                >
                  <PlayIcon className="h-4 w-4" />
                  Activate
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
            Showing {filteredMoments.length} of {mockMoments.length} moments
          </p>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={selectedMoments.length === filteredMoments.length && filteredMoments.length > 0}
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {filteredMoments.map((moment) => (
                <motion.div
                  key={moment.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative"
                >
                  <input
                    type="checkbox"
                    checked={selectedMoments.includes(moment.id)}
                    onChange={() => handleMomentSelect(moment.id)}
                    className="absolute top-4 right-4 z-10 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <CompatibleMomentCard
                    id={moment.id}
                    name={moment.name}
                    description={moment.description}
                    type={moment.type}
                    status={moment.status}
                    trigger={moment.trigger}
                    audience={moment.audience}
                    channel={moment.channel}
                    priority={moment.priority}
                    scheduledFor={moment.scheduledFor}
                    metrics={moment.metrics}
                    tags={moment.tags}
                    personalization={moment.personalization}
                    abTest={moment.abTest}
                    lastModified={moment.lastModified}
                    variant="default"
                    isSelected={selectedMoments.includes(moment.id)}
                    onSelect={() => handleMomentSelect(moment.id)}
                    onEdit={() => handleMomentEdit(moment.id)}
                    onTest={() => handleMomentTest(moment.id)}
                    onDuplicate={() => handleMomentDuplicate(moment.id)}
                    onToggleStatus={() => handleMomentToggleStatus(moment.id)}
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
                          checked={selectedMoments.length === filteredMoments.length && filteredMoments.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Name</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Type</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Status</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Priority</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Open Rate</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Conversions</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Modified</th>
                      <th className="w-16 px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredMoments.map((moment) => (
                      <motion.tr
                        key={moment.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedMoments.includes(moment.id)}
                            onChange={() => handleMomentSelect(moment.id)}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium ${
                              moment.type === 'email' ? 'bg-blue-500' :
                              moment.type === 'sms' ? 'bg-green-500' :
                              moment.type === 'push' ? 'bg-purple-500' :
                              moment.type === 'web' ? 'bg-orange-500' :
                              'bg-slate-500'
                            }`}>
                              {moment.type === 'email' ? '📧' :
                               moment.type === 'sms' ? '📱' :
                               moment.type === 'push' ? '🔔' :
                               moment.type === 'web' ? '🌐' :
                               '📲'}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">{moment.name}</div>
                              <div className="text-sm text-slate-500 truncate max-w-xs">{moment.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            moment.type === 'email' ? 'bg-blue-100 text-blue-800' :
                            moment.type === 'sms' ? 'bg-green-100 text-green-800' :
                            moment.type === 'push' ? 'bg-purple-100 text-purple-800' :
                            moment.type === 'web' ? 'bg-orange-100 text-orange-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {moment.type}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            moment.status === 'active' ? 'bg-green-100 text-green-800' :
                            moment.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            moment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            moment.status === 'paused' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {moment.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            moment.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            moment.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            moment.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {moment.priority}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-900">
                              {moment.metrics.openRate.toFixed(1)}%
                            </span>
                            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${Math.min(moment.metrics.openRate, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-900">
                          {moment.metrics.converted.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-500">{moment.lastModified}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleMomentEdit(moment.id)}>
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleMomentEdit(moment.id)}>
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

          {filteredMoments.length === 0 && (
            <div className="text-center py-12">
              <div className="text-slate-400 text-6xl mb-4">⏰</div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No moments found</h3>
              <p className="text-slate-500 mb-6">
                {searchTerm || selectedType !== 'all' || selectedStatus !== 'all' || selectedTrigger !== 'all' || selectedPriority !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'Get started by creating your first perfect moment.'}
              </p>
              <Button variant="primary" onClick={handleCreateMoment}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Create First Moment
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Create Moment Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Moment"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Moment Name
            </label>
            <Input
              type="text"
              placeholder="Enter a descriptive name for your moment..."
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <Input
              type="text"
              placeholder="Describe the purpose of this moment..."
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Channel Type
              </label>
              <select className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="push">Push Notification</option>
                <option value="web">Web Notification</option>
                <option value="in-app">In-App Message</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Trigger Type
              </label>
              <select className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                <option value="immediate">Immediate</option>
                <option value="scheduled">Scheduled</option>
                <option value="event-based">Event-Based</option>
                <option value="behavior-based">Behavior-Based</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Target Audience
              </label>
              <select className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                <option value="new-users">New Users</option>
                <option value="engaged-customers">Engaged Customers</option>
                <option value="cart-abandoners">Cart Abandoners</option>
                <option value="premium-customers">Premium Customers</option>
                <option value="dormant-users">Dormant Users</option>
                <option value="birthday-customers">Birthday Customers</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Features
            </label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-700">Enable Personalization</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-700">A/B Testing</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-700">AI Optimization</span>
              </label>
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
                console.log('Creating moment...');
                setShowCreateModal(false);
              }}
            >
              Create Moment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmBulkDelete}
        title="Delete Selected Moments"
        message={`Are you sure you want to delete ${selectedMoments.length} moment${selectedMoments.length !== 1 ? 's' : ''}? This action cannot be undone and will stop all active campaigns.`}
        type="danger"
      />
    </div>
  );
};

export default MomentsPage;