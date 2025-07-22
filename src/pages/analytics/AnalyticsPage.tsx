// src/pages/analytics/AnalyticsPage.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DocumentArrowDownIcon,
  CalendarIcon,
  AdjustmentsHorizontalIcon,
  ChartBarIcon,
  InformationCircleIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import { AnalyticsDashboard } from '../../components/business/analytics/Dashboard/AnalyticsDashboard';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select, Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useAnalytics } from '../../hooks/business/useAnalytics';
import { classNames } from '../../utils/dom/classNames';

interface AnalyticsPageProps {
  className?: string;
}

type ExportFormat = 'csv' | 'excel' | 'pdf';
type RefreshInterval = 30000 | 60000 | 300000 | 0; // 30s, 1m, 5m, manual

const exportFormatOptions = [
  { value: 'csv', label: 'CSV File' },
  { value: 'excel', label: 'Excel Spreadsheet' },
  { value: 'pdf', label: 'PDF Report' }
];

const refreshIntervalOptions = [
  { value: 30000, label: 'Every 30 seconds' },
  { value: 60000, label: 'Every minute' },
  { value: 300000, label: 'Every 5 minutes' },
  { value: 0, label: 'Manual only' }
];

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ className }) => {
  // Settings state
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<RefreshInterval>(60000);
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });
  
  // Modal state
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('excel');
  const [isExporting, setIsExporting] = useState(false);

  // Analytics hook
  const {
    dashboardData,
    isLoading,
    error,
    refreshData,
    exportData
  } = useAnalytics({
    timeRange: '30d', // This could be made dynamic
    view: 'overview',
    autoRefresh,
    refreshInterval: refreshInterval > 0 ? refreshInterval : undefined
  });

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportData(exportFormat);
      setShowExportModal(false);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleToggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  const handleApplySettings = () => {
    setShowSettingsModal(false);
    // Settings are applied via state changes
  };

  const formatLastUpdated = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.3 }}
      className={classNames('min-h-screen bg-gray-50', className)}
    >
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <ChartBarIcon className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                  <p className="text-sm text-gray-500">
                    Real-time insights and performance metrics
                  </p>
                </div>
              </div>
              
              {dashboardData?.lastUpdated && (
                <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-500">
                  <InformationCircleIcon className="h-4 w-4" />
                  <span>Last updated: {formatLastUpdated(dashboardData.lastUpdated)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {/* Auto-refresh toggle */}
              <Button
                onClick={handleToggleAutoRefresh}
                variant={autoRefresh ? "primary" : "outline"}
                size="sm"
                className="flex items-center space-x-2"
              >
                {autoRefresh ? (
                  <PauseIcon className="h-4 w-4" />
                ) : (
                  <PlayIcon className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {autoRefresh ? 'Pause' : 'Auto'} Refresh
                </span>
              </Button>

              {/* Settings */}
              <Button
                onClick={() => setShowSettingsModal(true)}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <AdjustmentsHorizontalIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </Button>

              {/* Export */}
              <Button
                onClick={() => setShowExportModal(true)}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <DocumentArrowDownIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <Card className="border-red-200 bg-red-50">
            <CardBody>
              <div className="text-center py-12">
                <ChartBarIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-red-900 mb-2">
                  Analytics Error
                </h3>
                <p className="text-red-700 mb-6">{error.message}</p>
                <Button onClick={refreshData} variant="outline">
                  Try Again
                </Button>
              </div>
            </CardBody>
          </Card>
        ) : (
          <AnalyticsDashboard 
            loading={isLoading}
            customTimeRange={
              customDateRange.start && customDateRange.end
                ? {
                    start: new Date(customDateRange.start),
                    end: new Date(customDateRange.end)
                  }
                : undefined
            }
          />
        )}
      </div>

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Analytics Data"
        size="md"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <Select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
              options={exportFormatOptions}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range (Optional)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                <Input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) => setCustomDateRange(prev => ({ 
                    ...prev, 
                    start: e.target.value 
                  }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                <Input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) => setCustomDateRange(prev => ({ 
                    ...prev, 
                    end: e.target.value 
                  }))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <InformationCircleIcon className="h-5 w-5 text-blue-400 flex-shrink-0" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Export Information
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>CSV: Raw data for further analysis</li>
                    <li>Excel: Formatted spreadsheet with charts</li>
                    <li>PDF: Executive summary report</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              onClick={handleExport}
              loading={isExporting}
              disabled={isExporting}
              className="flex-1"
            >
              {isExporting ? 'Exporting...' : 'Export Data'}
            </Button>
            <Button
              onClick={() => setShowExportModal(false)}
              variant="outline"
              disabled={isExporting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="Analytics Settings"
        size="md"
      >
        <div className="space-y-6">
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Auto-refresh data
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-7">
              Automatically update analytics data at regular intervals
            </p>
          </div>

          {autoRefresh && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refresh Interval
              </label>
              <Select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value) as RefreshInterval)}
                options={refreshIntervalOptions}
                className="w-full"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Time Range
            </label>
            <Select
              value="30d"
              onChange={() => {}} // This would be implemented with more comprehensive settings
              options={[
                { value: '24h', label: 'Last 24 Hours' },
                { value: '7d', label: 'Last 7 Days' },
                { value: '30d', label: 'Last 30 Days' },
                { value: '90d', label: 'Last 90 Days' }
              ]}
              className="w-full"
            />
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Performance Optimization
            </h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  defaultChecked={true}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Enable data caching</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  defaultChecked={false}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Reduce animation effects</span>
              </label>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              onClick={handleApplySettings}
              className="flex-1"
            >
              Apply Settings
            </Button>
            <Button
              onClick={() => setShowSettingsModal(false)}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Auto-refresh status indicator */}
      {autoRefresh && (
        <div className="fixed bottom-4 left-4 z-50">
          <div className="bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm font-medium shadow-lg flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>Auto-refresh: {refreshInterval / 1000}s</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AnalyticsPage;