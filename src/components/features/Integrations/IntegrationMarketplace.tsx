// src/components/features/Integrations/IntegrationMarketplace.tsx

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  StarIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  DocumentTextIcon,
  TagIcon,
  FunnelIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Card, CardHeader, CardBody, CardFooter } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { useIntegrationStore } from '../../../stores/integrations/integrationStore';
import { IntegrationTemplate, IntegrationCategory } from '../../../types/integrations';
import { classNames } from '../../../utils/dom/classNames';

interface IntegrationMarketplaceProps {
  onSelectTemplate?: (template: IntegrationTemplate) => void;
  onClose?: () => void;
  selectedCategories?: IntegrationCategory[];
}

const IntegrationMarketplace: React.FC<IntegrationMarketplaceProps> = ({
  onSelectTemplate,
  onClose,
  selectedCategories = []
}) => {
  const {
    templates,
    isLoading,
    error,
    fetchTemplates,
    setSelectedTemplate
  } = useIntegrationStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IntegrationCategory | 'all'>('all');
  const [selectedSupportLevel, setSelectedSupportLevel] = useState<'all' | 'official' | 'partner' | 'community'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'name' | 'recent'>('popular');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Filter and sort templates
  const filteredTemplates = React.useMemo(() => {
    let filtered = templates;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.provider.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Apply support level filter
    if (selectedSupportLevel !== 'all') {
      filtered = filtered.filter(template => template.supportLevel === selectedSupportLevel);
    }

    // Apply category preselection
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(template => selectedCategories.includes(template.category));
    }

    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.installCount - a.installCount;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'recent':
          return b.lastUpdated.getTime() - a.lastUpdated.getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [templates, searchQuery, selectedCategory, selectedSupportLevel, selectedCategories, sortBy]);

  const handleSelectTemplate = (template: IntegrationTemplate) => {
    setSelectedTemplate(template);
    onSelectTemplate?.(template);
  };

  const getSupportLevelColor = (level: string) => {
    switch (level) {
      case 'official':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'partner':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'community':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSupportLevelIcon = (level: string) => {
    switch (level) {
      case 'official':
        return <ShieldCheckIcon className="w-4 h-4" />;
      case 'partner':
        return <UserGroupIcon className="w-4 h-4" />;
      case 'community':
        return <UserGroupIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star} className="relative">
            {star <= rating ? (
              <StarIconSolid className="w-4 h-4 text-yellow-400" />
            ) : (
              <StarIcon className="w-4 h-4 text-gray-300" />
            )}
          </div>
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  const categories: { value: IntegrationCategory | 'all'; label: string; count: number }[] = [
    { value: 'all', label: 'All Categories', count: templates.length },
    { value: 'customer-data', label: 'Customer Data', count: templates.filter(t => t.category === 'customer-data').length },
    { value: 'marketing-automation', label: 'Marketing Automation', count: templates.filter(t => t.category === 'marketing-automation').length },
    { value: 'analytics-reporting', label: 'Analytics & Reporting', count: templates.filter(t => t.category === 'analytics-reporting').length },
    { value: 'communication', label: 'Communication', count: templates.filter(t => t.category === 'communication').length },
    { value: 'data-storage', label: 'Data Storage', count: templates.filter(t => t.category === 'data-storage').length },
    { value: 'authentication', label: 'Authentication', count: templates.filter(t => t.category === 'authentication').length },
    { value: 'e-commerce', label: 'E-commerce', count: templates.filter(t => t.category === 'e-commerce').length }
  ];

  if (error) {
    return (
      <div className="p-6">
        <Card variant="outline" className="border-red-200 bg-red-50">
          <CardBody>
            <div className="flex items-center space-x-3">
              <XMarkIcon className="w-5 h-5 text-red-500" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error loading templates</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={fetchTemplates}>
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Integration Marketplace</h2>
          <p className="text-gray-600 mt-1">
            Choose from {templates.length} pre-built integrations
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" icon={XMarkIcon} onClick={onClose}>
            Close
          </Button>
        )}
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

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="popular">Most Popular</option>
          <option value="rating">Highest Rated</option>
          <option value="name">Name A-Z</option>
          <option value="recent">Recently Updated</option>
        </select>

        {/* Filters Toggle */}
        <Button
          variant="outline"
          icon={FunnelIcon}
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Category
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {categories.map((category) => (
                        <label key={category.value} className="flex items-center">
                          <input
                            type="radio"
                            name="category"
                            value={category.value}
                            checked={selectedCategory === category.value}
                            onChange={(e) => setSelectedCategory(e.target.value as any)}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-900">
                            {category.label}
                          </span>
                          <span className="ml-auto text-xs text-gray-500">
                            ({category.count})
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Support Level Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Support Level
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'all', label: 'All Levels' },
                        { value: 'official', label: 'Official' },
                        { value: 'partner', label: 'Partner' },
                        { value: 'community', label: 'Community' }
                      ].map((level) => (
                        <label key={level.value} className="flex items-center">
                          <input
                            type="radio"
                            name="supportLevel"
                            value={level.value}
                            checked={selectedSupportLevel === level.value}
                            onChange={(e) => setSelectedSupportLevel(e.target.value as any)}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-900 flex items-center">
                            {level.value !== 'all' && getSupportLevelIcon(level.value)}
                            <span className={level.value !== 'all' ? 'ml-1' : ''}>
                              {level.label}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardBody>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardBody>
              <CardFooter>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredTemplates.map((template) => (
              <motion.div
                key={template.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      {/* Logo */}
                      <img
                        src={template.logoUrl}
                        alt={template.provider}
                        className="w-12 h-12 rounded-lg object-contain bg-gray-50 p-2"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/integrations/default.svg';
                        }}
                      />
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {template.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          by {template.provider}
                        </p>
                      </div>

                      {/* Official Badge */}
                      {template.isOfficial && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          <ShieldCheckIcon className="w-3 h-3 mr-1" />
                          Official
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardBody className="space-y-4">
                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {template.description}
                    </p>

                    {/* Rating and Install Count */}
                    <div className="flex items-center justify-between">
                      {renderStars(template.rating)}
                      <div className="text-sm text-gray-500">
                        {template.installCount.toLocaleString()} installs
                      </div>
                    </div>

                    {/* Support Level */}
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline" 
                        className={getSupportLevelColor(template.supportLevel)}
                      >
                        <div className="flex items-center space-x-1">
                          {getSupportLevelIcon(template.supportLevel)}
                          <span className="capitalize">{template.supportLevel}</span>
                        </div>
                      </Badge>
                      <span className="text-xs text-gray-500">
                        v{template.version}
                      </span>
                    </div>

                    {/* Tags */}
                    {template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Last Updated */}
                    <div className="text-xs text-gray-500">
                      Updated {template.lastUpdated.toLocaleDateString()}
                    </div>
                  </CardBody>

                  <CardFooter className="space-y-3">
                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={DocumentTextIcon}
                        onClick={() => window.open(template.documentation, '_blank')}
                        className="flex-1"
                      >
                        Docs
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={CheckIcon}
                        onClick={() => handleSelectTemplate(template)}
                        className="flex-1"
                      >
                        Select
                      </Button>
                    </div>

                    {/* Required Permissions */}
                    {template.requiredPermissions.length > 0 && (
                      <div className="text-xs text-gray-500">
                        <strong>Permissions:</strong> {template.requiredPermissions.slice(0, 2).join(', ')}
                        {template.requiredPermissions.length > 2 && ` +${template.requiredPermissions.length - 2} more`}
                      </div>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && filteredTemplates.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No integrations found
          </h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your search criteria or filters to find what you're looking for.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedSupportLevel('all');
            }}
          >
            Clear Filters
          </Button>
        </motion.div>
      )}

      {/* Results Count */}
      {!isLoading && filteredTemplates.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Showing {filteredTemplates.length} of {templates.length} integrations
        </div>
      )}
    </div>
  );
};

export default IntegrationMarketplace;