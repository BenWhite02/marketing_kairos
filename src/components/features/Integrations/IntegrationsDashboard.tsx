// src/components/features/Integrations/IntegrationsDashboard.tsx

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Card, CardHeader, CardBody } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { useIntegrationStore, useFilteredIntegrations } from '../../../stores/integrations/integrationStore';
import { IntegrationType, IntegrationCategory, IntegrationStatus } from '../../../types/integrations';
import { classNames } from '../../../utils/dom/classNames';

interface IntegrationsDashboardProps {
  onAddIntegration?: () => void;
  onEditIntegration?: (integrationId: string) => void;
  onViewIntegration?: (integrationId: string) => void;
}

const IntegrationsDashboard: React.FC<IntegrationsDashboardProps> = ({
  onAddIntegration,
  onEditIntegration,
  onViewIntegration
}) => {
  const {
    isLoading,
    error,
    searchQuery,
    filterType,
    filterCategory,
    filterStatus,
    sortBy,
    sortOrder,
    viewMode,
    fetchIntegrations,
    fetchHealth,
    setSearchQuery,
    setFilters,
    setSorting,
    setViewMode,
    clearError,
    syncIntegration,
    testConnection
  } = useIntegrationStore();

  const filteredIntegrations = useFilteredIntegrations();
  const [showFilters, setShowFilters] = useState(false);
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  const [testingIds, setTestingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchIntegrations();
    fetchHealth();
  }, [fetchIntegrations, fetchHealth]);

  const handleSync = async (integrationId: string) => {
    setSyncingIds(prev => new Set([...prev, integrationId]));
    try {
      await syncIntegration(integrationId);
    } finally {
      setSyncingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(integrationId);
        return newSet;
      });
    }
  };

  const handleTestConnection = async (integrationId: string) => {
    setTestingIds(prev => new Set([...prev, integrationId]));
    try {
      const isConnected = await testConnection(integrationId);
      // Show success/failure notification
      console.log(`Connection test ${isConnected ? 'passed' : 'failed'} for ${integrationId}`);
    } finally {
      setTestingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(integrationId);
        return newSet;
      });
    }
  };

  const getStatusColor = (status: IntegrationStatus) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'connecting':
      case 'syncing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'disconnected':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status: IntegrationStatus) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'connecting':
      case 'syncing':
        return <ClockIcon className="w-4 h-4 animate-spin" />;
      case 'error':
        return <XCircleIcon className="w-4 h-4" />;
      case 'disconnected':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  // Summary stats
  const totalIntegrations = filteredIntegrations.length;
  const connectedIntegrations = filteredIntegrations.filter(i => i.status === 'connected').length;
  const errorIntegrations = filteredIntegrations.filter(i => i.status === 'error').length;
  const averageHealth = filteredIntegrations.length > 0 
    ? Math.round(filteredIntegrations.reduce((sum, i) => sum + i.healthScore, 0) / filteredIntegrations.length)
    : 0;

  if (error) {
    return (
      <div className="p-6">
        <Card variant="outline" className="border-red-200 bg-red-50">
          <CardBody>
            <div className="flex items-center space-x-3">
              <XCircleIcon className="w-5 h-5 text-red-500" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error loading integrations</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={clearError}>
                Retry
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-600 mt-1">
            Manage connections to external platforms and services
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <Button
            variant="primary"
            icon={PlusIcon}
            onClick={onAddIntegration}
          >
            Add Integration
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-gray-900">{totalIntegrations}</div>
            <div className="text-sm text-gray-600">Total Integrations</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-green-600">{connectedIntegrations}</div>
            <div className="text-sm text-gray-600">Connected</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-red-600">{errorIntegrations}</div>
            <div className="text-sm text-gray-600">Errors</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className={classNames("text-2xl font-bold", getHealthColor(averageHealth))}>
              {averageHealth}%
            </div>
            <div className="text-sm text-gray-600">Avg Health</div>
          </CardBody>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
        {/* Search */}
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={classNames(
              "p-2 rounded-md transition-colors",
              viewMode === 'grid'
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <Squares2X2Icon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={classNames(
              "p-2 rounded-md transition-colors",
              viewMode === 'list'
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <ListBulletIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Toggle */}
        <Button
          variant="outline"
          icon={AdjustmentsHorizontalIcon}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filters
        </Button>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilters({ type: e.target.value as IntegrationType | 'all' })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="all">All Types</option>
                      <option value="crm">CRM</option>
                      <option value="email-provider">Email Provider</option>
                      <option value="analytics">Analytics</option>
                      <option value="data-warehouse">Data Warehouse</option>
                      <option value="social-media">Social Media</option>
                    </select>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilters({ category: e.target.value as IntegrationCategory | 'all' })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="all">All Categories</option>
                      <option value="customer-data">Customer Data</option>
                      <option value="marketing-automation">Marketing Automation</option>
                      <option value="analytics-reporting">Analytics & Reporting</option>
                      <option value="communication">Communication</option>
                      <option value="data-storage">Data Storage</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilters({ status: e.target.value as IntegrationStatus | 'all' })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="all">All Statuses</option>
                      <option value="connected">Connected</option>
                      <option value="disconnected">Disconnected</option>
                      <option value="error">Error</option>
                      <option value="connecting">Connecting</option>
                    </select>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <div className="flex space-x-2">
                      <select
                        value={sortBy}
                        onChange={(e) => setSorting(e.target.value, sortOrder)}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="name">Name</option>
                        <option value="type">Type</option>
                        <option value="status">Status</option>
                        <option value="lastSync">Last Sync</option>
                        <option value="health">Health</option>
                      </select>
                      <button
                        onClick={() => setSorting(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        <ChevronDownIcon 
                          className={classNames(
                            "w-4 h-4 transition-transform",
                            sortOrder === 'desc' ? 'rotate-180' : ''
                          )}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Integrations Grid/List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardBody>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <motion.div
          layout
          className={classNames(
            viewMode === 'grid'
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          )}
        >
          <AnimatePresence>
            {filteredIntegrations.map((integration) => (
              <motion.div
                key={integration.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  className="group hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onViewIntegration?.(integration.id)}
                >
                  <CardBody>
                    <div className={classNames(
                      "flex items-center",
                      viewMode === 'grid' ? "flex-col text-center space-y-4" : "space-x-4"
                    )}>
                      {/* Logo */}
                      <div className="flex-shrink-0">
                        <img
                          src={integration.logoUrl}
                          alt={integration.provider}
                          className="w-12 h-12 rounded-lg object-contain bg-gray-50 p-2"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/integrations/default.svg';
                          }}
                        />
                      </div>

                      {/* Content */}
                      <div className={classNames(
                        "flex-1 min-w-0",
                        viewMode === 'grid' ? "text-center" : ""
                      )}>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {integration.name}
                          </h3>
                          {viewMode === 'list' && (
                            <div className="flex items-center space-x-2">
                              {/* Health Score */}
                              <div className={classNames(
                                "text-xs font-medium",
                                getHealthColor(integration.healthScore)
                              )}>
                                {integration.healthScore}%
                              </div>
                              {/* Status Badge */}
                              <Badge 
                                variant="outline" 
                                className={getStatusColor(integration.status)}
                              >
                                <div className="flex items-center space-x-1">
                                  {getStatusIcon(integration.status)}
                                  <span className="capitalize">
                                    {integration.status.replace('-', ' ')}
                                  </span>
                                </div>
                              </Badge>
                            </div>
                          )}
                        </div>

                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                          {integration.description}
                        </p>

                        {viewMode === 'grid' && (
                          <div className="flex items-center justify-center space-x-4 mb-3">
                            {/* Health Score */}
                            <div className={classNames(
                              "text-sm font-medium",
                              getHealthColor(integration.healthScore)
                            )}>
                              {integration.healthScore}% Health
                            </div>
                            {/* Status Badge */}
                            <Badge 
                              variant="outline" 
                              className={getStatusColor(integration.status)}
                            >
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(integration.status)}
                                <span className="capitalize">
                                  {integration.status.replace('-', ' ')}
                                </span>
                              </div>
                            </Badge>
                          </div>
                        )}

                        {/* Last Sync */}
                        {integration.lastSync && (
                          <div className="text-xs text-gray-500">
                            Last sync: {integration.lastSync.toLocaleDateString()} at{' '}
                            {integration.lastSync.toLocaleTimeString()}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className={classNames(
                          "flex space-x-2 mt-4",
                          viewMode === 'grid' ? "justify-center" : "justify-start"
                        )}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTestConnection(integration.id);
                            }}
                            isLoading={testingIds.has(integration.id)}
                            disabled={integration.status === 'disconnected'}
                          >
                            Test
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSync(integration.id);
                            }}
                            isLoading={syncingIds.has(integration.id)}
                            disabled={integration.status !== 'connected'}
                          >
                            Sync
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditIntegration?.(integration.id);
                            }}
                          >
                            Configure
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && filteredIntegrations.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <PlusIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || filterType !== 'all' || filterCategory !== 'all' || filterStatus !== 'all'
              ? 'No integrations found'
              : 'No integrations yet'
            }
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || filterType !== 'all' || filterCategory !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your search criteria or filters.'
              : 'Connect to external platforms to start syncing your data.'
            }
          </p>
          <Button
            variant="primary"
            icon={PlusIcon}
            onClick={onAddIntegration}
          >
            Add Integration
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default IntegrationsDashboard;