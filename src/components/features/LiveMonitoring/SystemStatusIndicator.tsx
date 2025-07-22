// File Path: src/components/features/LiveMonitoring/SystemStatusIndicator.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useMonitoringStore } from '../../../stores/ui/monitoringStore';
import { useWebSocketSubscription } from '../../../hooks/realtime/useWebSocket';
import { WebSocketEventType } from '../../../services/websocket/MessageTypes';
import { SystemHealth } from '../../../types/monitoring';
import { formatDistanceToNow } from 'date-fns';

interface SystemStatusIndicatorProps {
  showDetails?: boolean;
  onStatusClick?: () => void;
}

export const SystemStatusIndicator: React.FC<SystemStatusIndicatorProps> = ({
  showDetails = false,
  onStatusClick,
}) => {
  const { systemHealth, updateSystemHealth } = useMonitoringStore();
  const [isExpanded, setIsExpanded] = useState(false);

  // Subscribe to system health updates
  useWebSocketSubscription<SystemHealth>(
    WebSocketEventType.SYSTEM_STATUS,
    (health) => {
      updateSystemHealth(health);
    },
    []
  );

  if (!systemHealth) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <div className="h-3 w-3 bg-gray-300 rounded-full animate-pulse"></div>
        <span className="text-sm">Checking status...</span>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'down':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <div className="h-3 w-3 bg-gray-300 rounded-full" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'All systems operational';
      case 'degraded':
        return 'Some services degraded';
      case 'down':
        return 'System experiencing issues';
      default:
        return 'Status unknown';
    }
  };

  const getServiceStatusIcon = (status: string) => {
    switch (status) {
      case 'up':
        return <div className="h-2 w-2 bg-green-500 rounded-full" />;
      case 'degraded':
        return <div className="h-2 w-2 bg-yellow-500 rounded-full" />;
      case 'down':
        return <div className="h-2 w-2 bg-red-500 rounded-full" />;
      default:
        return <div className="h-2 w-2 bg-gray-300 rounded-full" />;
    }
  };

  const formatUptime = (uptime: number) => {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div
        className={`
          flex items-center justify-between p-4 
          ${onStatusClick ? 'cursor-pointer hover:bg-gray-50' : ''}
        `}
        onClick={() => {
          onStatusClick?.();
          setIsExpanded(!isExpanded);
        }}
      >
        <div className="flex items-center space-x-3">
          {getStatusIcon(systemHealth.status)}
          <div>
            <h3 className={`text-sm font-medium ${getStatusColor(systemHealth.status)}`}>
              {getStatusText(systemHealth.status)}
            </h3>
            <p className="text-xs text-gray-500">
              Response time: {systemHealth.metrics.responseTime}ms
            </p>
          </div>
        </div>

        {showDetails && (
          <ChevronDownIcon
            className={`h-5 w-5 text-gray-400 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        )}
      </div>

      <AnimatePresence>
        {showDetails && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Services Status */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Services</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(systemHealth.services).map(([service, status]) => (
                    <div key={service} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getServiceStatusIcon(status.status)}
                        <span className="text-sm text-gray-600 capitalize">{service}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {status.responseTime}ms
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Metrics */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Metrics</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Uptime</span>
                    <div className="font-medium">{formatUptime(systemHealth.metrics.uptime)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Active Users</span>
                    <div className="font-medium">{systemHealth.metrics.activeUsers.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Error Rate</span>
                    <div className="font-medium">{(systemHealth.metrics.errorRate * 100).toFixed(2)}%</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Memory Usage</span>
                    <div className="font-medium">{(systemHealth.metrics.memoryUsage * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </div>

              {/* Last Updated */}
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <ClockIcon className="h-3 w-3" />
                <span>
                  Updated {formatDistanceToNow(new Date(systemHealth.timestamp), { addSuffix: true })}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};