// File Path: src/components/business/campaigns/CampaignCard/CampaignCard.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { 
  CalendarIcon, 
  CurrencyDollarIcon, 
  EyeIcon, 
  ChartBarIcon,
  PlayIcon,
  PauseIcon,
  Cog6ToothIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardBody, CardFooter } from '../../../ui/Card';
import { Button } from '../../../ui/Button';
import { Badge } from '../../../ui/Badge';
import { cn } from '../../../../utils/dom/classNames';

export interface CampaignCardProps {
  campaign: {
    id: string;
    name: string;
    description?: string;
    status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
    type: 'acquisition' | 'retention' | 'conversion' | 'engagement' | 'winback';
    goal: 'awareness' | 'consideration' | 'conversion' | 'retention' | 'advocacy';
    budget: {
      total: number;
      spent: number;
      remaining: number;
    };
    timeline: {
      startDate: string;
      endDate: string;
      duration: number; // in days
    };
    performance: {
      impressions: number;
      clicks: number;
      conversions: number;
      revenue: number;
      roas: number;
      ctr: number;
      cvr: number;
    };
    audience: {
      size: number;
      segments: string[];
    };
    channels: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
    createdAt: string;
    updatedAt: string;
  };
  variant?: 'default' | 'compact' | 'detailed';
  selected?: boolean;
  onSelect?: (campaignId: string) => void;
  onEdit?: (campaignId: string) => void;
  onDuplicate?: (campaignId: string) => void;
  onArchive?: (campaignId: string) => void;
  onToggleStatus?: (campaignId: string) => void;
  className?: string;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  variant = 'default',
  selected = false,
  onSelect,
  onEdit,
  onDuplicate,
  onArchive,
  onToggleStatus,
  className,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'completed': return 'info';
      case 'draft': return 'secondary';
      case 'archived': return 'outline';
      default: return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'acquisition': return 'bg-blue-100 text-blue-800';
      case 'retention': return 'bg-green-100 text-green-800';
      case 'conversion': return 'bg-purple-100 text-purple-800';
      case 'engagement': return 'bg-orange-100 text-orange-800';
      case 'winback': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getGoalEmoji = (goal: string) => {
    switch (goal) {
      case 'awareness': return '👁️';
      case 'consideration': return '🤔';
      case 'conversion': return '💰';
      case 'retention': return '🔄';
      case 'advocacy': return '📢';
      default: return '🎯';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${(num * 100).toFixed(1)}%`;
  };

  const getBudgetUtilization = () => {
    return campaign.budget.total > 0 ? (campaign.budget.spent / campaign.budget.total) * 100 : 0;
  };

  const getTimeProgress = () => {
    const start = new Date(campaign.timeline.startDate);
    const end = new Date(campaign.timeline.endDate);
    const now = new Date();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return (elapsed / total) * 100;
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(campaign.id);
    }
  };

  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'relative cursor-pointer transition-all duration-200',
          selected && 'ring-2 ring-blue-500 ring-offset-2',
          className
        )}
        onClick={handleCardClick}
      >
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className={`h-3 w-3 rounded-full ${getPriorityColor(campaign.priority)}`} />
              <h3 className="font-semibold text-gray-900 truncate">{campaign.name}</h3>
            </div>
            <Badge variant={getStatusColor(campaign.status) as any}>
              {campaign.status}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(campaign.type)}`}>
              {campaign.type}
            </span>
            <span>{getGoalEmoji(campaign.goal)} {campaign.goal}</span>
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(campaign.performance.revenue)}
              </p>
              <p className="text-xs text-gray-500">Revenue</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">
                {campaign.performance.roas.toFixed(1)}x
              </p>
              <p className="text-xs text-gray-500">ROAS</p>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        'relative cursor-pointer transition-all duration-200',
        selected && 'ring-2 ring-blue-500 ring-offset-2',
        className
      )}
      onClick={handleCardClick}
    >
      <Card className="overflow-hidden">
        {/* Priority indicator */}
        <div className={`absolute top-0 right-0 w-0 h-0 border-l-[20px] border-b-[20px] border-l-transparent border-b-${campaign.priority === 'critical' ? 'red' : campaign.priority === 'high' ? 'orange' : campaign.priority === 'medium' ? 'yellow' : 'green'}-500`} />
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {campaign.name}
                </h3>
                <Badge variant={getStatusColor(campaign.status) as any}>
                  {campaign.status}
                </Badge>
              </div>
              
              {campaign.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {campaign.description}
                </p>
              )}
              
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(campaign.type)}`}>
                  {campaign.type}
                </span>
                <span className="text-sm text-gray-600">
                  {getGoalEmoji(campaign.goal)} {campaign.goal}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(campaign.id);
                }}
                className="p-2"
              >
                <Cog6ToothIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStatus?.(campaign.id);
                }}
                className="p-2"
              >
                {campaign.status === 'active' ? (
                  <PauseIcon className="h-4 w-4" />
                ) : (
                  <PlayIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardBody className="py-4">
          {/* Budget Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Budget</span>
              <span className="text-sm text-gray-600">
                {formatCurrency(campaign.budget.spent)} / {formatCurrency(campaign.budget.total)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  getBudgetUtilization() > 90 ? 'bg-red-500' :
                  getBudgetUtilization() > 75 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(getBudgetUtilization(), 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{getBudgetUtilization().toFixed(1)}% utilized</span>
              <span>{formatCurrency(campaign.budget.remaining)} remaining</span>
            </div>
          </div>

          {/* Timeline Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Timeline</span>
              <span className="text-sm text-gray-600">
                {campaign.timeline.duration} days
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(getTimeProgress(), 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{getTimeProgress().toFixed(1)}% complete</span>
              <span>{new Date(campaign.timeline.endDate).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <EyeIcon className="h-4 w-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Reach
                </span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {formatNumber(campaign.performance.impressions)}
              </p>
              <p className="text-xs text-gray-500">
                CTR: {formatPercentage(campaign.performance.ctr)}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <ChartBarIcon className="h-4 w-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Conversions
                </span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {formatNumber(campaign.performance.conversions)}
              </p>
              <p className="text-xs text-gray-500">
                CVR: {formatPercentage(campaign.performance.cvr)}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <CurrencyDollarIcon className="h-4 w-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Revenue
                </span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(campaign.performance.revenue)}
              </p>
              <p className="text-xs text-gray-500">
                ROAS: {campaign.performance.roas.toFixed(1)}x
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Audience
                </span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {formatNumber(campaign.audience.size)}
              </p>
              <p className="text-xs text-gray-500">
                {campaign.audience.segments.length} segments
              </p>
            </div>
          </div>
        </CardBody>

        <CardFooter className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              {campaign.channels.slice(0, 3).map((channel, index) => (
                <span
                  key={channel}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {channel}
                </span>
              ))}
              {campaign.channels.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{campaign.channels.length - 3} more
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate?.(campaign.id);
                }}
              >
                Duplicate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(campaign.id);
                }}
              >
                Edit
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};