// src/pages/integrations/SyncMonitorPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowPathIcon,
  PauseIcon,
  PlayIcon,
  ClockIcon,
  BoltIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';

interface SyncStatus {
  id: string;
  integrationName: string;
  integrationId: string;
  logo: string;
  status: 'active' | 'paused' | 'error' | 'syncing';
  lastSync: string;
  nextSync?: string;
  recordsProcessed: number;
  recordsTotal: number;
  errorCount: number;
  syncFrequency: 'realtime' | '5min' | '15min' | '1hour' | '6hour' | '24hour';
  dataDirection: 'bidirectional' | 'import' | 'export';
  avgSyncTime: number; // in seconds
  successRate: number; // percentage
  totalRecords: number;
}

const mockSyncStatuses: SyncStatus[] = [
  {
    id: '1',
    integrationName: 'Salesforce CRM',
    integrationId: 'salesforce',
    logo: '🔗',
    status: 'active',
    lastSync: '2 minutes ago',
    nextSync: '3 minutes',
    recordsProcessed: 1247,
    recordsTotal: 1250,
    errorCount: 0,
    syncFrequency: '5min',
    dataDirection: 'bidirectional',
    avgSyncTime: 45,
    successRate: 99.8,
    totalRecords: 45230
  },
  {
    id: '2',
    integrationName: 'HubSpot',
    integrationId: 'hubspot',
    logo: '🧡',
    status: 'syncing',
    lastSync: '1 minute ago',
    recordsProcessed: 823,
    recordsTotal: 1100,
    errorCount: 2,
    syncFrequency: '15min',
    dataDirection: 'bidirectional',
    avgSyncTime: 72,
    successRate: 98.5,
    totalRecords: 28940
  },
  {
    id: '3',
    integrationName: 'SendGrid',
    integrationId: 'sendgrid',
    logo: '📧',
    status: 'active',
    lastSync: '5 minutes ago',
    nextSync: '10 minutes',
    recordsProcessed: 342,
    recordsTotal: 342,
    errorCount: 0,
    syncFrequency: '15min',
    dataDirection: 'export',
    avgSyncTime: 12,
    successRate: 100,
    totalRecords: 12500
  },
  {
    id: '4',
    integrationName: 'Snowflake',
    integrationId: 'snowflake',
    logo: '❄️',
    status: 'error',
    lastSync: '2 hours ago',
    recordsProcessed: 0,
    recordsTotal: 5400,
    errorCount: 15,
    syncFrequency: '1hour',
    dataDirection: 'import',
    avgSyncTime: 180,
    successRate: 85.2,
    totalRecords: 125000
  },
  {
    id: '5',
    integrationName: 'Shopify',
    integrationId: 'shopify',
    logo: '🛍️',
    status: 'paused',
    lastSync: '1 day ago',
    recordsProcessed: 0,
    recordsTotal: 0,
    errorCount: 0,
    syncFrequency: '6hour',
    dataDirection: 'import',
    avgSyncTime: 95,
    successRate: 97.3,
    totalRecords: 8750
  }
];

const SyncMonitorPage: React.FC = () => {
  const navigate = useNavigate();
  const [syncStatuses, setSyncStatuses] = useState<SyncStatus[]>(mockSyncStatuses);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'error' | 'paused'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Simulate real-time updates
        setSyncStatuses(prev => prev.map(status => {
          if (status.status === 'syncing') {
            const progress = Math.min(status.recordsProcessed + 10, status.recordsTotal);
            return {
              ...status,
              recordsProcessed: progress,
              status: progress === status.recordsTotal ? 'active' : 'syncing'
            };
          }
          return status;
        }));
      }, refreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const getStatusIcon = (status: SyncStatus['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'syncing':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'paused':
        return <PauseIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: SyncStatus['status']) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'syncing':
        return 'Syncing';
      case 'error':
        return 'Error';
      case 'paused':
        return 'Paused';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: SyncStatus['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'syncing':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'paused':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getProgressPercentage = (processed: number, total: number) => {
    return total > 0 ? Math.round((processed / total) * 100) : 0;
  };

  const filteredStatuses = syncStatuses.filter(status => {
    if (selectedStatus === 'all') return true;
    return status.status === selectedStatus;
  });

  const pauseSync = (id: string) => {
    setSyncStatuses(prev => prev.map(status =>
      status.id === id ? { ...status, status: 'paused' as const } : status
    ));
  };

  const resumeSync = (id: string) => {
    setSyncStatuses(prev => prev.map(status =>
      status.id === id ? { ...status, status: 'active' as const } : status
    ));
  };

  const forceSync = (id: string) => {
    setSyncStatuses(prev => prev.map(status =>
      status.id === id ? { ...status, status: 'syncing' as const, recordsProcessed: 0 } : status
    ));
  };

  const totalActiveIntegrations = syncStatuses.filter(s => s.status === 'active').length;
  const totalErrorIntegrations = syncStatuses.filter(s => s.status === 'error').length;
  const totalRecordsToday = syncStatuses.reduce((sum, s) => sum + s.recordsProcessed, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/integrations')}
                className="flex items-center"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Integrations
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Sync Monitor
                </h1>
                <p className="text-gray-600">
                  Monitor real-time data synchronization across all integrations
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Auto-refresh</label>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoRefresh ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoRefresh ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="flex items-center"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardBody className="text-center">
              <div className="text-3xl font-bold text-blue-600">{totalActiveIntegrations}</div>
              <div className="text-sm text-gray-600">Active Integrations</div>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody className="text-center">
              <div className="text-3xl font-bold text-red-600">{totalErrorIntegrations}</div>
              <div className="text-sm text-gray-600">Error State</div>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody className="text-center">
              <div className="text-3xl font-bold text-green-600">{totalRecordsToday.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Records Synced Today</div>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {Math.round(syncStatuses.reduce((sum, s) => sum + s.successRate, 0) / syncStatuses.length)}%
              </div>
              <div className="text-sm text-gray-600">Average Success Rate</div>
            </CardBody>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { key: 'all', label: 'All', count: syncStatuses.length },
            { key: 'active', label: 'Active', count: syncStatuses.filter(s => s.status === 'active').length },
            { key: 'error', label: 'Errors', count: totalErrorIntegrations },
            { key: 'paused', label: 'Paused', count: syncStatuses.filter(s => s.status === 'paused').length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedStatus(tab.key as any)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center space-x-2 ${
                selectedStatus === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                selectedStatus === tab.key ? 'bg-gray-100' : 'bg-gray-200'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Sync Status Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredStatuses.map((sync) => (
            <Card key={sync.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                      {sync.logo}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {sync.integrationName}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(sync.status)}
                        <span className="text-sm text-gray-600">
                          {getStatusText(sync.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(sync.status)}`}>
                    {sync.dataDirection === 'bidirectional' ? '↔️' : sync.dataDirection === 'import' ? '⬇️' : '⬆️'}
                    {sync.dataDirection}
                  </div>
                </div>
              </CardHeader>

              <CardBody className="pt-0">
                {/* Sync Progress */}
                {sync.status === 'syncing' && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Syncing records...</span>
                      <span>{sync.recordsProcessed}/{sync.recordsTotal}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(sync.recordsProcessed, sync.recordsTotal)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {getProgressPercentage(sync.recordsProcessed, sync.recordsTotal)}% complete
                    </div>
                  </div>
                )}

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-semibold text-gray-900">
                      {sync.totalRecords.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">Total Records</div>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-semibold text-gray-900">
                      {sync.successRate}%
                    </div>
                    <div className="text-xs text-gray-600">Success Rate</div>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-semibold text-gray-900">
                      {sync.avgSyncTime}s
                    </div>
                    <div className="text-xs text-gray-600">Avg Sync Time</div>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-semibold text-gray-900">
                      {sync.syncFrequency}
                    </div>
                    <div className="text-xs text-gray-600">Frequency</div>
                  </div>
                </div>

                {/* Last Sync Info */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="h-4 w-4" />
                    <span>Last sync: {sync.lastSync}</span>
                  </div>
                  
                  {sync.nextSync && sync.status === 'active' && (
                    <div className="flex items-center space-x-1">
                      <BoltIcon className="h-4 w-4" />
                      <span>Next: {sync.nextSync}</span>
                    </div>
                  )}
                </div>

                {/* Error Display */}
                {sync.errorCount > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-700 font-medium">
                        {sync.errorCount} error{sync.errorCount > 1 ? 's' : ''} detected
                      </span>
                    </div>
                    <div className="text-xs text-red-600 mt-1">
                      Last error: Connection timeout during sync operation
                    </div>
                  </div>
                )}
              </CardBody>

              <CardFooter className="border-t bg-gray-50">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    {sync.status === 'paused' ? (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => resumeSync(sync.id)}
                        className="flex items-center"
                      >
                        <PlayIcon className="h-3 w-3 mr-1" />
                        Resume
                      </Button>
                    ) : sync.status !== 'syncing' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => pauseSync(sync.id)}
                        className="flex items-center"
                      >
                        <PauseIcon className="h-3 w-3 mr-1" />
                        Pause
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled
                        className="flex items-center"
                      >
                        <ArrowPathIcon className="h-3 w-3 mr-1 animate-spin" />
                        Syncing...
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => forceSync(sync.id)}
                      disabled={sync.status === 'syncing'}
                      className="flex items-center"
                    >
                      <ArrowPathIcon className="h-3 w-3 mr-1" />
                      Sync Now
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/integrations/mapping/${sync.integrationId}`)}
                      className="flex items-center"
                    >
                      <AdjustmentsHorizontalIcon className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center"
                    >
                      <EyeIcon className="h-3 w-3 mr-1" />
                      Logs
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredStatuses.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ArrowPathIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {selectedStatus !== 'all' ? selectedStatus : ''} integrations found
            </h3>
            <p className="text-gray-600 mb-6">
              {selectedStatus === 'all' 
                ? "You haven't set up any integrations yet." 
                : `No integrations are currently in ${selectedStatus} state.`}
            </p>
            <Button 
              variant="primary"
              onClick={() => navigate('/integrations')}
            >
              Set Up Integration
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SyncMonitorPage;