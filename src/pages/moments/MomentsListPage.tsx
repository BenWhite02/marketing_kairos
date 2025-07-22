// src/pages/moments/MomentsListPage.tsx - Enhanced version

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  EllipsisVerticalIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  DocumentDuplicateIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChartBarIcon,
  ClockIcon,
  UsersIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  BellIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Input, Select } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { MomentCard } from '../../components/business/moments/MomentCard';

// Types
interface Moment {
  id: string;
  name: string;
  description: string;
  type: 'immediate' | 'scheduled' | 'triggered' | 'behavioral';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: string[];
  audienceSize: number;
  createdAt: string;
  updatedAt: string;
  scheduledAt?: string;
  createdBy: string;
  metrics: MomentMetrics;
  tags: string[];
}

interface MomentMetrics {
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
}

const MomentsListPage: React.FC = () => {
  // State Management
  const [moments, setMoments] = useState<Moment[]>(mockMoments);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'updated' | 'performance'>('updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedMoments, setSelectedMoments] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [momentToDelete, setMomentToDelete] = useState<string | null>(null);

  // Mock Data
  const mockMoments: Moment[] = [
    {
      id: 'moment_1',
      name: 'Welcome Series - Part 1',
      description: 'First touchpoint for new users after signup',
      type: 'triggered',
      status: 'active',
      priority: 'high',
      channels: ['email', 'push'],
      audienceSize: 12450,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-18T14:20:00Z',
      createdBy: 'Sarah Connor',
      metrics: {
        sent: 12450,
        delivered: 12198,
        opened: 2745,
        clicked: 384,
        converted: 156,
        deliveryRate: 98.0,
        openRate: 22.5,
        clickRate: 14.0,
        conversionRate: 40.6,
        revenue: 15600
      },
      tags: ['welcome', 'onboarding', 'new-users']
    },
    {
      id: 'moment_2',
      name: 'Cart Abandonment Recovery',
      description: 'Re-engage users who abandoned their shopping cart',
      type: 'behavioral',
      status: 'active',
      priority: 'medium',
      channels: ['email', 'sms'],
      audienceSize: 8920,
      createdAt: '2024-01-10T09:15:00Z',
      updatedAt: '2024-01-19T11:45:00Z',
      createdBy: 'John Smith',
      metrics: {
        sent: 8920,
        delivered: 8654,
        opened: 1963,
        clicked: 432,
        converted: 187,
        deliveryRate: 97.0,
        openRate: 22.7,
        clickRate: 22.0,
        conversionRate: 43.3,
        revenue: 23400
      },
      tags: ['cart-recovery', 'e-commerce', 'conversion']
    },
    {
      id: 'moment_3',
      name: 'Weekly Newsletter',
      description: 'Weekly digest of news, updates, and featured content',
      type: 'scheduled',
      status: 'active',
      priority: 'low',
      channels: ['email'],
      audienceSize: 45200,
      createdAt: '2024-01-05T16:00:00Z',
      updatedAt: '2024-01-19T08:30:00Z',
      scheduledAt: '2024-01-22T10:00:00Z',
      createdBy: 'Marketing Team',
      metrics: {
        sent: 45200,
        delivered: 44298,
        opened: 9512,
        clicked: 1238,
        converted: 94,
        deliveryRate: 98.0,
        openRate: 21.5,
        clickRate: 13.0,
        conversionRate: 7.6,
        revenue: 4700
      },
      tags: ['newsletter', 'content', 'engagement']
    },
    {
      id: 'moment_4',
      name: 'Birthday Special Offer',
      description: 'Personalized birthday discount for loyalty members',
      type: 'triggered',
      status: 'draft',
      priority: 'medium',
      channels: ['email', 'push', 'sms'],
      audienceSize: 0,
      createdAt: '2024-01-19T13:45:00Z',
      updatedAt: '2024-01-19T15:22:00Z',
      createdBy: 'Sarah Connor',
      metrics: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        converted: 0,
        deliveryRate: 0,
        openRate: 0,
        clickRate: 0,
        conversionRate: 0,
        revenue: 0
      },
      tags: ['birthday', 'loyalty', 'promotion']
    },
    {
      id: 'moment_5',
      name: 'Flash Sale Alert',
      description: '24-hour flash sale notification for VIP customers',
      type: 'immediate',
      status: 'completed',
      priority: 'urgent',
      channels: ['push', 'sms', 'email'],
      audienceSize: 2840,
      createdAt: '2024-01-16T14:20:00Z',
      updatedAt: '2024-01-17T18:45:00Z',
      createdBy: 'Marketing Team',
      metrics: {
        sent: 2840,
        delivered: 2798,
        opened: 1426,
        clicked: 627,
        converted: 284,
        deliveryRate: 98.5,
        openRate: 51.0,
        clickRate: 44.0,
        conversionRate: 45.3,
        revenue: 28400
      },
      tags: ['flash-sale', 'vip', 'urgent']
    }
  ];

  // Event Handlers
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleStatusFilter = useCallback((status: string) => {
    setStatusFilter(status);
  }, []);

  const handleSort = useCallback((field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field as any);
      setSortOrder('desc');
    }
  }, [sortBy, sortOrder]);

  const handleMomentAction = useCallback((momentId: string, action: string) => {
    setMoments(prev => prev.map(moment => {
      if (moment.id === momentId) {
        switch (action) {
          case 'activate':
            return { ...moment, status: 'active' as const, updatedAt: new Date().toISOString() };
          case 'pause':
            return { ...moment, status: 'paused' as const, updatedAt: new Date().toISOString() };
          case 'stop':
            return { ...moment, status: 'completed' as const, updatedAt: new Date().toISOString() };
          default:
            return moment;
        }
      }
      return moment;
    }));
  }, []);

  const handleDuplicateMoment = useCallback((momentId: string) => {
    const originalMoment = moments.find(m => m.id === momentId);
    if (originalMoment) {
      const duplicatedMoment: Moment = {
        ...originalMoment,
        id: `moment_${Date.now()}`,
        name: `${originalMoment.name} (Copy)`,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metrics: {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          converted: 0,
          deliveryRate: 0,
          openRate: 0,
          clickRate: 0,
          conversionRate: 0,
          revenue: 0
        }
      };
      setMoments(prev => [...prev, duplicatedMoment]);
    }
  }, [moments]);

  const handleDeleteMoment = useCallback((momentId: string) => {
    setMoments(prev => prev.filter(m => m.id !== momentId));
    setMomentToDelete(null);
    setShowDeleteConfirm(false);
  }, []);

  const handleBulkAction = useCallback((action: string) => {
    switch (action) {
      case 'activate':
        setMoments(prev => prev.map(moment => 
          selectedMoments.includes(moment.id) 
            ? { ...moment, status: 'active' as const, updatedAt: new Date().toISOString() }
            : moment
        ));
        break;
      case 'pause':
        setMoments(prev => prev.map(moment => 
          selectedMoments.includes(moment.id) 
            ? { ...moment, status: 'paused' as const, updatedAt: new Date().toISOString() }
            : moment
        ));
        break;
      case 'delete':
        setMoments(prev => prev.filter(moment => !selectedMoments.includes(moment.id)));
        break;
    }
    setSelectedMoments([]);
  }, [selectedMoments]);

  // Computed Values
  const filteredAndSortedMoments = useMemo(() => {
    let filtered = moments;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(moment =>
        moment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        moment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        moment.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        moment.createdBy.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(moment => moment.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(moment => moment.type === typeFilter);
    }

    // Apply channel filter
    if (channelFilter !== 'all') {
      filtered = filtered.filter(moment => moment.channels.includes(channelFilter));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updated':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'performance':
          comparison = a.metrics.conversionRate - b.metrics.conversionRate;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [moments, searchQuery, statusFilter, typeFilter, channelFilter, sortBy, sortOrder]);

  const totalMetrics = useMemo(() => {
    return moments.reduce((acc, moment) => ({
      sent: acc.sent + moment.metrics.sent,
      delivered: acc.delivered + moment.metrics.delivered,
      opened: acc.opened + moment.metrics.opened,
      clicked: acc.clicked + moment.metrics.clicked,
      converted: acc.converted + moment.metrics.converted,
      revenue: acc.revenue + moment.metrics.revenue
    }), {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      converted: 0,
      revenue: 0
    });
  }, [moments]);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'paused':
        return <PauseIcon className="w-4 h-4 text-yellow-500" />;
      case 'draft':
        return <ExclamationCircleIcon className="w-4 h-4 text-gray-500" />;
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4 text-blue-500" />;
      case 'failed':
        return <XCircleIcon className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  }, []);

  const getChannelIcon = useCallback((channel: string) => {
    switch (channel) {
      case 'email':
        return <EnvelopeIcon className="w-4 h-4" />;
      case 'sms':
        return <DevicePhoneMobileIcon className="w-4 h-4" />;
      case 'push':
        return <BellIcon className="w-4 h-4" />;
      case 'web':
        return <GlobeAltIcon className="w-4 h-4" />;
      default:
        return null;
    }
  }, []);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Moments</h1>
            <p className="text-gray-600 mt-1">
              Manage and orchestrate customer engagement moments
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? 'List View' : 'Grid View'}
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Moment
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{moments.length}</div>
            <div className="text-sm text-gray-500">Total Moments</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalMetrics.sent.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Messages Sent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalMetrics.delivered.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Delivered</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{totalMetrics.opened.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Opened</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{totalMetrics.clicked.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Clicked</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">${totalMetrics.revenue.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Revenue</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="flex-1 max-w-md relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search moments..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <Select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="w-40"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </Select>

          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-40"
          >
            <option value="all">All Types</option>
            <option value="immediate">Immediate</option>
            <option value="scheduled">Scheduled</option>
            <option value="triggered">Triggered</option>
            <option value="behavioral">Behavioral</option>
          </Select>

          <Select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="w-40"
          >
            <option value="all">All Channels</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="push">Push</option>
            <option value="web">Web</option>
          </Select>

          {/* Sort */}
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-40"
          >
            <option value="updated">Last Updated</option>
            <option value="created">Date Created</option>
            <option value="name">Name</option>
            <option value="performance">Performance</option>
          </Select>

          <Button
            variant="ghost"
            onClick={() => handleSort(sortBy)}
            className="p-2"
          >
            <ArrowsUpDownIcon className="w-5 h-5" />
          </Button>
        </div>

        {/* Bulk Actions */}
        <AnimatePresence>
          {selectedMoments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-indigo-800">
                  {selectedMoments.length} moment(s) selected
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('activate')}
                  >
                    <PlayIcon className="w-4 h-4 mr-1" />
                    Activate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('pause')}
                  >
                    <PauseIcon className="w-4 h-4 mr-1" />
                    Pause
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('delete')}
                    className="text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMoments([])}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {filteredAndSortedMoments.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No moments found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || channelFilter !== 'all'
                ? 'Try adjusting your filters or search criteria'
                : 'Get started by creating your first moment'
              }
            </p>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Your First Moment
            </Button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }>
            {filteredAndSortedMoments.map((moment) => (
              <motion.div
                key={moment.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className={viewMode === 'list' ? 'w-full' : ''}
              >
                <MomentCard
                  moment={moment}
                  variant={viewMode === 'list' ? 'list' : 'card'}
                  onSelect={(selected) => {
                    if (selected) {
                      setSelectedMoments(prev => [...prev, moment.id]);
                    } else {
                      setSelectedMoments(prev => prev.filter(id => id !== moment.id));
                    }
                  }}
                  selected={selectedMoments.includes(moment.id)}
                  onAction={(action) => {
                    switch (action) {
                      case 'edit':
                        // Navigate to edit page
                        console.log('Navigate to edit:', moment.id);
                        break;
                      case 'duplicate':
                        handleDuplicateMoment(moment.id);
                        break;
                      case 'delete':
                        setMomentToDelete(moment.id);
                        setShowDeleteConfirm(true);
                        break;
                      case 'activate':
                      case 'pause':
                      case 'stop':
                        handleMomentAction(moment.id, action);
                        break;
                      default:
                        console.log('Unknown action:', action);
                    }
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Moment Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Moment"
        size="md"
      >
        <div className="p-6">
          <div className="text-center py-8 text-gray-500">
            <PlusIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Moment creation wizard will be available in Phase 2</p>
            <p className="text-sm mt-2">Navigate users through the moment builder interface</p>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setMomentToDelete(null);
        }}
        title="Delete Moment"
        size="sm"
      >
        <div className="p-6">
          <div className="text-center">
            <TrashIcon className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Moment</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this moment? This action cannot be undone.
            </p>
            <div className="flex justify-center space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setMomentToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => momentToDelete && handleDeleteMoment(momentToDelete)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MomentsListPage;
