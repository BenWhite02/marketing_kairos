// src/components/business/atoms/AtomCard/AtomCard.tsx

import React from 'react';
import { motion } from 'framer-motion';
import {
  BeakerIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PlayIcon,
  ChartBarIcon,
  CogIcon,
  DocumentDuplicateIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../../../ui/Button';
import { Badge } from '../../../ui/Badge';
import { Progress } from '../../../ui/Progress';
import { Tooltip } from '../../../ui/Tooltip';

export interface EligibilityAtom {
  id: string;
  name: string;
  description: string;
  type: 'demographic' | 'behavioral' | 'transactional' | 'contextual';
  category: string;
  conditions: number;
  accuracy: number;
  usage: number;
  performance: {
    impressions: number;
    conversions: number;
    conversionRate: number;
  };
  status: 'active' | 'inactive' | 'testing' | 'archived';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  trend: 'up' | 'down' | 'stable';
}

interface AtomCardProps {
  atom: EligibilityAtom;
  variant?: 'default' | 'compact' | 'detailed';
  isSelected?: boolean;
  onSelect?: (atom: EligibilityAtom) => void;
  onEdit?: (atom: EligibilityAtom) => void;
  onTest?: (atom: EligibilityAtom) => void;
  onDuplicate?: (atom: EligibilityAtom) => void;
  className?: string;
}

export const AtomCard: React.FC<AtomCardProps> = ({
  atom,
  variant = 'default',
  isSelected = false,
  onSelect,
  onEdit,
  onTest,
  onDuplicate,
  className,
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'demographic':
        return <BeakerIcon className="w-4 h-4" />;
      case 'behavioral':
        return <ChartBarIcon className="w-4 h-4" />;
      case 'transactional':
        return <CogIcon className="w-4 h-4" />;
      case 'contextual':
        return <ClockIcon className="w-4 h-4" />;
      default:
        return <BeakerIcon className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'demographic':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'behavioral':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'transactional':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'contextual':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'testing':
        return <Badge variant="warning">Testing</Badge>;
      case 'archived':
        return <Badge variant="default">Archived</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />;
      case 'down':
        return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />;
      case 'stable':
        return <MinusIcon className="w-4 h-4 text-gray-500" />;
      default:
        return <MinusIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className={`group relative p-4 bg-white border rounded-lg hover:shadow-md transition-all cursor-pointer ${
          isSelected ? 'ring-2 ring-blue-500 border-blue-300' : 'border-gray-200 hover:border-gray-300'
        } ${className}`}
        onClick={() => onSelect?.(atom)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg border ${getTypeColor(atom.type)}`}>
              {getTypeIcon(atom.type)}
            </div>
            <div>
              <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                {atom.name}
              </h3>
              <p className="text-xs text-gray-500">{atom.category}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(atom.status)}
            {getTrendIcon(atom.trend)}
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
        } ${className}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl border ${getTypeColor(atom.type)}`}>
              {getTypeIcon(atom.type)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {atom.name}
              </h3>
              <p className="text-sm text-gray-600">{atom.category}</p>
              <div className="flex items-center space-x-2 mt-1">
                {getStatusBadge(atom.status)}
                <span className="text-xs text-gray-500">â€¢</span>
                <span className="text-xs text-gray-500">{atom.conditions} conditions</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {getTrendIcon(atom.trend)}
            <Tooltip content="View atom details">
              <Button variant="outline" size="sm" onClick={() => onSelect?.(atom)}>
                <EyeIcon className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{atom.description}</p>

        {/* Metrics */}
        <div className="space-y-4 mb-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Accuracy</span>
              <span className="text-sm text-gray-900">{atom.accuracy}%</span>
            </div>
            <Progress 
              value={atom.accuracy} 
              variant={atom.accuracy >= 90 ? 'success' : atom.accuracy >= 70 ? 'warning' : 'error'}
              size="sm" 
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Usage</span>
              <span className="text-sm text-gray-900">{atom.usage}%</span>
            </div>
            <Progress 
              value={atom.usage} 
              variant="info"
              size="sm" 
            />
          </div>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-xs text-gray-500">Impressions</p>
            <p className="text-sm font-semibold text-gray-900">{formatNumber(atom.performance.impressions)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Conversions</p>
            <p className="text-sm font-semibold text-gray-900">{formatNumber(atom.performance.conversions)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Conv. Rate</p>
            <p className="text-sm font-semibold text-gray-900">{atom.performance.conversionRate.toFixed(1)}%</p>
          </div>
        </div>

        {/* Tags */}
        {atom.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {atom.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {atom.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{atom.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500">Updated {formatDate(atom.updatedAt)}</span>
          <div className="flex space-x-2">
            <Tooltip content="Test atom">
              <Button variant="outline" size="sm" onClick={() => onTest?.(atom)}>
                <PlayIcon className="w-3 h-3" />
              </Button>
            </Tooltip>
            <Tooltip content="Duplicate atom">
              <Button variant="outline" size="sm" onClick={() => onDuplicate?.(atom)}>
                <DocumentDuplicateIcon className="w-3 h-3" />
              </Button>
            </Tooltip>
            <Button variant="primary" size="sm" onClick={() => onEdit?.(atom)}>
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
      } ${className}`}
      onClick={() => onSelect?.(atom)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg border ${getTypeColor(atom.type)}`}>
            {getTypeIcon(atom.type)}
          </div>
          <div>
            <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
              {atom.name}
            </h3>
            <p className="text-xs text-gray-500">{atom.category}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(atom.status)}
          {getTrendIcon(atom.trend)}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{atom.description}</p>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Accuracy</span>
            <span className="text-xs font-medium text-gray-900">{atom.accuracy}%</span>
          </div>
          <Progress 
            value={atom.accuracy} 
            variant={atom.accuracy >= 90 ? 'success' : atom.accuracy >= 70 ? 'warning' : 'error'}
            size="sm" 
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Usage</span>
            <span className="text-xs font-medium text-gray-900">{atom.usage}%</span>
          </div>
          <Progress 
            value={atom.usage} 
            variant="info"
            size="sm" 
          />
        </div>
      </div>

      {/* Performance */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span>{formatNumber(atom.performance.impressions)} impressions</span>
        <span>{atom.performance.conversionRate.toFixed(1)}% conv. rate</span>
      </div>

      {/* Tags */}
      {atom.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {atom.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {atom.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{atom.tags.length - 2}
            </Badge>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-500">{atom.conditions} conditions</span>
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Tooltip content="Test atom">
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onTest?.(atom); }}>
              <PlayIcon className="w-3 h-3" />
            </Button>
          </Tooltip>
          <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); onEdit?.(atom); }}>
            Edit
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
