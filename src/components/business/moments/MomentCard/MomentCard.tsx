// src/components/business/moments/MomentCard/MomentCard.tsx

import React from 'react';
import { motion } from 'framer-motion';
import {
  ClockIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  BellIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PauseIcon,
  ArchiveBoxIcon,
  EyeIcon,
  PencilIcon,
  PlayIcon,
  DocumentDuplicateIcon,
  UserGroupIcon,
  ChartBarIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../../../ui/Button';
import { Badge } from '../../../ui/Badge';
import { Progress } from '../../../ui/Progress';
import { Tooltip } from '../../../ui/Tooltip';

// Enhanced Moment interface with proper defaults and null safety
export interface Moment {
  id: string;
  name: string;
  description?: string;
  type: 'immediate' | 'scheduled' | 'triggered' | 'recurring';
  status: 'active' | 'paused' | 'draft' | 'archived';
  channel: 'email' | 'sms' | 'push' | 'web' | 'in-app';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Targeting with defaults
  audienceSize: number;
  segmentIds?: string[];
  
  // Performance with proper defaults
  performance: {
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
  
  // Optional scheduling
  schedule?: {
    type: 'immediate' | 'scheduled' | 'recurring';
    startDate?: string;
    endDate?: string;
    timezone?: string;
    frequency?: 'daily' | 'weekly' | 'monthly';
  };
  
  // Content with defaults
  content: {
    subject?: string;
    preview?: string;
    hasPersonalization: boolean;
    hasABTest: boolean;
    variants?: number;
  };
  
  // Metadata
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastRun?: string;
  nextRun?: string;
}

// Export the interface for external use
export interface MomentCardProps {
  moment: Moment | any; // Accept any to handle malformed data
  variant?: 'default' | 'compact' | 'detailed';
  isSelected?: boolean;
  onSelect?: (moment: Moment) => void;
  onEdit?: (moment: Moment) => void;
  onTest?: (moment: Moment) => void;
  onDuplicate?: (moment: Moment) => void;
  onToggleStatus?: (moment: Moment) => void;
  className?: string;
}

// Default moment data for error recovery
const defaultMoment: Partial<Moment> = {
  name: 'Unknown Moment',
  description: 'No description available',
  type: 'immediate',
  status: 'draft',
  channel: 'email',
  priority: 'medium',
  audienceSize: 0,
  performance: {
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    converted: 0,
    deliveryRate: 0,
    openRate: 0,
    clickRate: 0,
    conversionRate: 0,
  },
  content: {
    hasPersonalization: false,
    hasABTest: false,
    variants: 1,
  },
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'Unknown',
};

// Type guard for moment validation
const isValidMoment = (moment: any): moment is Moment => {
  return (
    moment &&
    typeof moment === 'object' &&
    typeof moment.id === 'string' &&
    typeof moment.name === 'string' &&
    moment.channel &&
    moment.performance &&
    typeof moment.performance === 'object'
  );
};

// Safe moment merger
const safeMoment = (moment: any): Moment => {
  if (!isValidMoment(moment)) {
    console.warn('Invalid moment data received, using defaults:', moment);
    return {
      ...defaultMoment,
      id: moment?.id || `temp-${Date.now()}`,
      name: moment?.name || defaultMoment.name,
    } as Moment;
  }

  // Merge with defaults to ensure all properties exist
  return {
    ...defaultMoment,
    ...moment,
    performance: {
      ...defaultMoment.performance,
      ...moment.performance,
    },
    content: {
      ...defaultMoment.content,
      ...moment.content,
    },
    tags: moment.tags || [],
  } as Moment;
};

export const MomentCard: React.FC<MomentCardProps> = ({
  moment: rawMoment,
  variant = 'default',
  isSelected = false,
  onSelect,
  onEdit,
  onTest,
  onDuplicate,
  onToggleStatus,
  className,
}) => {
  // Safe moment processing with error recovery
  const moment = React.useMemo(() => {
    try {
      return safeMoment(rawMoment);
    } catch (error) {
      console.error('Error processing moment data:', error);
      return {
        ...defaultMoment,
        id: `error-${Date.now()}`,
        name: 'Error Loading Moment',
      } as Moment;
    }
  }, [rawMoment]);

  // Safe channel access with fallback
  const safeChannel = moment.channel || 'email';

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <EnvelopeIcon className="w-4 h-4" />;
      case 'sms':
        return <DevicePhoneMobileIcon className="w-4 h-4" />;
      case 'push':
        return <BellIcon className="w-4 h-4" />;
      case 'web':
        return <GlobeAltIcon className="w-4 h-4" />;
      case 'in-app':
        return <DevicePhoneMobileIcon className="w-4 h-4" />;
      default:
        return <EnvelopeIcon className="w-4 h-4" />;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'email':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'sms':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'push':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'web':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'in-app':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'paused':
        return <PauseIcon className="w-4 h-4 text-yellow-500" />;
      case 'draft':
        return <ExclamationTriangleIcon className="w-4 h-4 text-gray-500" />;
      case 'archived':
        return <ArchiveBoxIcon className="w-4 h-4 text-gray-400" />;
      default:
        return <CheckCircleIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'paused':
        return <Badge variant="warning">Paused</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'archived':
        return <Badge variant="default">Archived</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="error">Urgent</Badge>;
      case 'high':
        return <Badge variant="warning">High</Badge>;
      case 'medium':
        return <Badge variant="info">Medium</Badge>;
      case 'low':
        return <Badge variant="default">Low</Badge>;
      default:
        return <Badge variant="default">{priority}</Badge>;
    }
  };

  const formatNumber = (num: number) => {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Error boundary for invalid moment data
  if (!moment.id || !moment.name) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-red-700">
          <ExclamationCircleIcon className="w-5 h-5" />
          <span className="font-medium">Error Loading Moment</span>
        </div>
        <p className="text-sm text-red-600 mt-1">
          Invalid moment data received. Please refresh or contact support.
        </p>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className={`group relative p-4 bg-white border rounded-lg hover:shadow-md transition-all cursor-pointer ${
          isSelected ? 'ring-2 ring-blue-500 border-blue-300' : 'border-gray-200 hover:border-gray-300'
        } ${className || ''}`}
        onClick={() => onSelect?.(moment)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg border ${getChannelColor(safeChannel)}`}>
              {getChannelIcon(safeChannel)}
            </div>
            <div>
              <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                {moment.name}
              </h3>
              <p className="text-xs text-gray-500">{safeChannel.toUpperCase()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(moment.status)}
            {getStatusIcon(moment.status)}
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === 'detailed') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className={`group relative p-6 bg-white border rounded-xl hover:shadow-lg transition-all ${
          isSelected ? 'ring-2 ring-blue-500 border-blue-300' : 'border-gray-200 hover:border-gray-300'
        } ${className || ''}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl border ${getChannelColor(safeChannel)}`}>
              {getChannelIcon(safeChannel)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {moment.name}
              </h3>
              <p className="text-sm text-gray-600">{safeChannel.toUpperCase()}</p>
              <div className="flex items-center space-x-2 mt-1">
                {getStatusBadge(moment.status)}
                {getPriorityBadge(moment.priority)}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Tooltip content="View moment details">
              <Button variant="outline" size="sm" onClick={() => onSelect?.(moment)}>
                <EyeIcon className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* Description */}
        {moment.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{moment.description}</p>
        )}

        {/* Performance Metrics */}
        <div className="space-y-4 mb-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Delivery Rate</span>
              <span className="text-sm text-gray-900">{moment.performance.deliveryRate.toFixed(1)}%</span>
            </div>
            <Progress 
              value={moment.performance.deliveryRate} 
              variant={moment.performance.deliveryRate >= 95 ? 'success' : moment.performance.deliveryRate >= 85 ? 'warning' : 'error'}
              size="sm" 
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Open Rate</span>
              <span className="text-sm text-gray-900">{moment.performance.openRate.toFixed(1)}%</span>
            </div>
            <Progress 
              value={moment.performance.openRate} 
              variant="info"
              size="sm" 
            />
          </div>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-xs text-gray-500">Sent</p>
            <p className="text-sm font-semibold text-gray-900">{formatNumber(moment.performance.sent)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Opened</p>
            <p className="text-sm font-semibold text-gray-900">{formatNumber(moment.performance.opened)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Converted</p>
            <p className="text-sm font-semibold text-gray-900">{formatNumber(moment.performance.converted)}</p>
          </div>
        </div>

        {/* Content Info */}
        <div className="mb-4">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <UserGroupIcon className="w-3 h-3" />
              <span>{formatNumber(moment.audienceSize)} audience</span>
            </div>
            {moment.content.hasPersonalization && (
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                Personalized
              </span>
            )}
            {moment.content.hasABTest && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                A/B Test
              </span>
            )}
          </div>
        </div>

        {/* Schedule Info */}
        {moment.schedule && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <ClockIcon className="w-3 h-3" />
              <span>
                {moment.schedule.type === 'immediate' ? 'Send immediately' :
                 moment.schedule.type === 'scheduled' && moment.schedule.startDate ? `Scheduled for ${formatDateTime(moment.schedule.startDate)}` :
                 moment.schedule.type === 'recurring' ? `Recurring ${moment.schedule.frequency || 'periodically'}` :
                 'Trigger-based'}
              </span>
            </div>
          </div>
        )}

        {/* Tags */}
        {moment.tags && moment.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {moment.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {moment.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{moment.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500">Updated {formatDate(moment.updatedAt)}</span>
          <div className="flex space-x-2">
            <Tooltip content="Test moment">
              <Button variant="outline" size="sm" onClick={() => onTest?.(moment)}>
                <PlayIcon className="w-3 h-3" />
              </Button>
            </Tooltip>
            <Tooltip content="Duplicate moment">
              <Button variant="outline" size="sm" onClick={() => onDuplicate?.(moment)}>
                <DocumentDuplicateIcon className="w-3 h-3" />
              </Button>
            </Tooltip>
            <Button variant="primary" size="sm" onClick={() => onEdit?.(moment)}>
              Edit
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`group relative p-5 bg-white border rounded-lg hover:shadow-md transition-all cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500 border-blue-300' : 'border-gray-200 hover:border-gray-300'
      } ${className || ''}`}
      onClick={() => onSelect?.(moment)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg border ${getChannelColor(safeChannel)}`}>
            {getChannelIcon(safeChannel)}
          </div>
          <div>
            <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
              {moment.name}
            </h3>
            <p className="text-xs text-gray-500">{safeChannel.toUpperCase()}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(moment.status)}
          {getPriorityBadge(moment.priority)}
        </div>
      </div>

      {/* Description */}
      {moment.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{moment.description}</p>
      )}

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Delivery</span>
            <span className="text-xs font-medium text-gray-900">{moment.performance.deliveryRate.toFixed(1)}%</span>
          </div>
          <Progress 
            value={moment.performance.deliveryRate} 
            variant={moment.performance.deliveryRate >= 95 ? 'success' : moment.performance.deliveryRate >= 85 ? 'warning' : 'error'}
            size="sm" 
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Open Rate</span>
            <span className="text-xs font-medium text-gray-900">{moment.performance.openRate.toFixed(1)}%</span>
          </div>
          <Progress 
            value={moment.performance.openRate} 
            variant="info"
            size="sm" 
          />
        </div>
      </div>

      {/* Performance Stats */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span>{formatNumber(moment.performance.sent)} sent</span>
        <span>{moment.performance.conversionRate.toFixed(1)}% conv. rate</span>
      </div>

      {/* Audience & Content Info */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <div className="flex items-center space-x-1">
          <UserGroupIcon className="w-3 h-3" />
          <span>{formatNumber(moment.audienceSize)}</span>
        </div>
        <div className="flex space-x-1">
          {moment.content.hasPersonalization && (
            <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-xs">P</span>
          )}
          {moment.content.hasABTest && (
            <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs">A/B</span>
          )}
        </div>
      </div>

      {/* Tags */}
      {moment.tags && moment.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {moment.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {moment.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{moment.tags.length - 2}
            </Badge>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          {moment.nextRun ? `Next: ${formatDateTime(moment.nextRun)}` : `Updated ${formatDate(moment.updatedAt)}`}
        </div>
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Tooltip content="Test moment">
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onTest?.(moment); }}>
              <PlayIcon className="w-3 h-3" />
            </Button>
          </Tooltip>
          <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); onEdit?.(moment); }}>
            Edit
          </Button>
        </div>
      </div>
    </motion.div>
  );
};