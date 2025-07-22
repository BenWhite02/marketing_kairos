// src/components/business/campaigns/CampaignBuilder/TemplateLibrary.tsx

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  StarIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  ClockIcon,
  UserGroupIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Button } from '../../../ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '../../../ui/Card';
import { Input, Select } from '../../../ui/Input';
import { Modal } from '../../../ui/Modal';

interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  category: 'acquisition' | 'retention' | 'conversion' | 'engagement' | 'winback';
  industry: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedROI: number;
  timeToSetup: number; // in hours
  popularity: number; // 1-5 rating
  usageCount: number;
  features: string[];
  channels: string[];
  audienceSize: {
    min: number;
    max: number;
  };
  budget: {
    min: number;
    recommended: number;
  };
  preview: {
    moments: number;
    touchpoints: number;
    automations: number;
  };
  tags: string[];
  author: string;
  lastUpdated: string;
  isFavorite?: boolean;
}

interface TemplateLibraryProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (template: CampaignTemplate) => void;
}

const MOCK_TEMPLATES: CampaignTemplate[] = [
  {
    id: '1',
    name: 'Welcome Series for New Customers',
    description: 'A comprehensive 7-day onboarding journey to engage new customers and drive first purchase',
    category: 'acquisition',
    industry: ['E-commerce', 'SaaS', 'Retail'],
    difficulty: 'beginner',
    estimatedROI: 320,
    timeToSetup: 2,
    popularity: 5,
    usageCount: 1247,
    features: ['Email automation', 'Personalization', 'Behavioral triggers', 'A/B testing'],
    channels: ['email', 'sms', 'push'],
    audienceSize: { min: 1000, max: 100000 },
    budget: { min: 500, recommended: 2000 },
    preview: { moments: 7, touchpoints: 12, automations: 5 },
    tags: ['onboarding', 'welcome', 'automation', 'beginner-friendly'],
    author: 'Kairos Team',
    lastUpdated: '2025-07-15T10:00:00Z',
    isFavorite: true
  },
  {
    id: '2',
    name: 'Cart Abandonment Recovery Pro',
    description: 'Advanced multi-channel sequence to recover abandoned carts with dynamic product recommendations',
    category: 'conversion',
    industry: ['E-commerce', 'Retail', 'Fashion'],
    difficulty: 'intermediate',
    estimatedROI: 450,
    timeToSetup: 4,
    popularity: 5,
    usageCount: 892,
    features: ['Dynamic content', 'Cross-channel orchestration', 'ML recommendations', 'Revenue tracking'],
    channels: ['email', 'sms', 'retargeting', 'push'],
    audienceSize: { min: 5000, max: 500000 },
    budget: { min: 1000, recommended: 5000 },
    preview: { moments: 5, touchpoints: 15, automations: 8 },
    tags: ['cart abandonment', 'e-commerce', 'conversion', 'revenue'],
    author: 'E-commerce Experts',
    lastUpdated: '2025-07-10T14:30:00Z'
  },
  {
    id: '3',
    name: 'VIP Customer Loyalty Program',
    description: 'Sophisticated retention campaign for high-value customers with exclusive rewards and experiences',
    category: 'retention',
    industry: ['Luxury', 'Hospitality', 'Financial Services'],
    difficulty: 'advanced',
    estimatedROI: 280,
    timeToSetup: 8,
    popularity: 4,
    usageCount: 456,
    features: ['Tier-based rewards', 'Predictive analytics', 'Exclusive experiences', 'Lifetime value optimization'],
    channels: ['email', 'sms', 'in-app', 'direct mail'],
    audienceSize: { min: 500, max: 50000 },
    budget: { min: 2000, recommended: 10000 },
    preview: { moments: 12, touchpoints: 25, automations: 15 },
    tags: ['VIP', 'loyalty', 'retention', 'high-value'],
    author: 'Loyalty Masters',
    lastUpdated: '2025-07-05T16:45:00Z',
    isFavorite: true
  },
  {
    id: '4',
    name: 'Re-engagement Win-back Campaign',
    description: 'Automated campaign to re-activate dormant customers with personalized incentives',
    category: 'winback',
    industry: ['SaaS', 'Subscription', 'Media'],
    difficulty: 'intermediate',
    estimatedROI: 190,
    timeToSetup: 3,
    popularity: 4,
    usageCount: 678,
    features: ['Dormancy detection', 'Progressive incentives', 'Channel optimization', 'Churn prevention'],
    channels: ['email', 'sms', 'social', 'display'],
    audienceSize: { min: 2000, max: 200000 },
    budget: { min: 800, recommended: 3000 },
    preview: { moments: 6, touchpoints: 10, automations: 7 },
    tags: ['winback', 'churn', 'reactivation', 'dormant'],
    author: 'Retention Specialists',
    lastUpdated: '2025-07-12T09:15:00Z'
  },
  {
    id: '5',
    name: 'Social Media Engagement Booster',
    description: 'Cross-platform campaign to increase social engagement and build community',
    category: 'engagement',
    industry: ['Media', 'Entertainment', 'Fashion', 'Lifestyle'],
    difficulty: 'beginner',
    estimatedROI: 150,
    timeToSetup: 1.5,
    popularity: 4,
    usageCount: 934,
    features: ['Social integration', 'User-generated content', 'Viral mechanics', 'Community building'],
    channels: ['social', 'email', 'push', 'web'],
    audienceSize: { min: 10000, max: 1000000 },
    budget: { min: 300, recommended: 1500 },
    preview: { moments: 4, touchpoints: 8, automations: 3 },
    tags: ['social', 'engagement', 'community', 'viral'],
    author: 'Social Media Gurus',
    lastUpdated: '2025-07-18T11:20:00Z'
  },
  {
    id: '6',
    name: 'Product Launch Announcement',
    description: 'Comprehensive product launch campaign with pre-launch buzz and post-launch follow-up',
    category: 'acquisition',
    industry: ['Technology', 'Consumer Goods', 'Fashion'],
    difficulty: 'intermediate',
    estimatedROI: 380,
    timeToSetup: 6,
    popularity: 5,
    usageCount: 567,
    features: ['Countdown mechanics', 'Influencer integration', 'Media coordination', 'Launch optimization'],
    channels: ['email', 'social', 'display', 'search', 'pr'],
    audienceSize: { min: 20000, max: 2000000 },
    budget: { min: 5000, recommended: 20000 },
    preview: { moments: 15, touchpoints: 30, automations: 12 },
    tags: ['launch', 'product', 'buzz', 'announcement'],
    author: 'Launch Experts',
    lastUpdated: '2025-07-08T13:40:00Z'
  }
];

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'acquisition', label: 'Customer Acquisition', icon: '🎯' },
  { value: 'retention', label: 'Customer Retention', icon: '💝' },
  { value: 'conversion', label: 'Conversion Optimization', icon: '⚡' },
  { value: 'engagement', label: 'Engagement Building', icon: '🔥' },
  { value: 'winback', label: 'Win-back Campaign', icon: '🎪' }
];

const INDUSTRIES = [
  'All Industries', 'E-commerce', 'SaaS', 'Retail', 'Fashion', 'Technology',
  'Financial Services', 'Healthcare', 'Media', 'Entertainment', 'Hospitality'
];

const DIFFICULTY_LEVELS = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner', color: 'green' },
  { value: 'intermediate', label: 'Intermediate', color: 'yellow' },
  { value: 'advanced', label: 'Advanced', color: 'red' }
];

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  open,
  onClose,
  onSelectTemplate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('All Industries');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [favorites, setFavorites] = useState<string[]>(['1', '3']);
  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null);

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let filtered = MOCK_TEMPLATES.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesIndustry = selectedIndustry === 'All Industries' || 
                            template.industry.includes(selectedIndustry);
      const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesIndustry && matchesDifficulty;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'popularity':
          return b.popularity - a.popularity || b.usageCount - a.usageCount;
        case 'roi':
          return b.estimatedROI - a.estimatedROI;
        case 'setup-time':
          return a.timeToSetup - b.timeToSetup;
        case 'recent':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        default:
          return 0;
      }
    });
  }, [searchTerm, selectedCategory, selectedIndustry, selectedDifficulty, sortBy]);

  const toggleFavorite = (templateId: string) => {
    setFavorites(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIconSolid
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Modal open={open} onClose={onClose} size="full">
      <div className="h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Campaign Template Library</h2>
            <p className="text-gray-600">Choose from proven campaign templates to get started quickly</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} icon={XMarkIcon} />
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={MagnifyingGlassIcon}
              />
            </div>
            
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {CATEGORIES.map(category => (
                <option key={category.value} value={category.value}>
                  {category.icon ? `${category.icon} ` : ''}{category.label}
                </option>
              ))}
            </Select>
            
            <Select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
            >
              {INDUSTRIES.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </Select>
            
            <Select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              {DIFFICULTY_LEVELS.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </Select>
            
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="popularity">Most Popular</option>
              <option value="name">Name</option>
              <option value="roi">Highest ROI</option>
              <option value="setup-time">Quick Setup</option>
              <option value="recent">Recently Updated</option>
            </Select>
          </div>
        </div>

        {/* Template Grid */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <motion.div
                key={template.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="group hover:shadow-lg transition-all duration-200 h-full flex flex-col">
                  <CardHeader className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                          {template.difficulty}
                        </span>
                        <span className="text-xs text-gray-500">
                          {template.timeToSetup}h setup
                        </span>
                      </div>
                      
                      <button
                        onClick={() => toggleFavorite(template.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {favorites.includes(template.id) ? (
                          <StarIconSolid className="w-5 h-5 text-yellow-400" />
                        ) : (
                          <StarIcon className="w-5 h-5 text-gray-400 hover:text-yellow-400" />
                        )}
                      </button>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {template.description}
                    </p>
                  </CardHeader>

                  <CardBody className="p-4 pt-0 flex-1">
                    <div className="space-y-4">
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Est. ROI</div>
                          <div className="font-semibold text-green-600">{template.estimatedROI}%</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Budget</div>
                          <div className="font-semibold">{formatCurrency(template.budget.recommended)}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Audience</div>
                          <div className="font-semibold">{template.audienceSize.min.toLocaleString()}+</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Used by</div>
                          <div className="font-semibold">{template.usageCount.toLocaleString()}</div>
                        </div>
                      </div>

                      {/* Preview Stats */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div>
                            <div className="font-medium text-gray-900">{template.preview.moments}</div>
                            <div className="text-gray-600">Moments</div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{template.preview.touchpoints}</div>
                            <div className="text-gray-600">Touchpoints</div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{template.preview.automations}</div>
                            <div className="text-gray-600">Automations</div>
                          </div>
                        </div>
                      </div>

                      {/* Channels */}
                      <div>
                        <div className="text-xs text-gray-600 mb-2">Channels</div>
                        <div className="flex flex-wrap gap-1">
                          {template.channels.map((channel) => (
                            <span
                              key={channel}
                              className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs capitalize"
                            >
                              {channel}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Features */}
                      <div>
                        <div className="text-xs text-gray-600 mb-2">Key Features</div>
                        <div className="flex flex-wrap gap-1">
                          {template.features.slice(0, 2).map((feature) => (
                            <span
                              key={feature}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                            >
                              {feature}
                            </span>
                          ))}
                          {template.features.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              +{template.features.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center justify-between">
                        {renderStars(template.popularity)}
                        <div className="text-xs text-gray-500">
                          {new Date(template.lastUpdated).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardBody>

                  <CardFooter className="p-4 pt-0">
                    <div className="flex items-center gap-2 w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTemplate(template)}
                        icon={EyeIcon}
                      >
                        Preview
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onSelectTemplate(template)}
                        icon={DocumentDuplicateIcon}
                        className="flex-1"
                      >
                        Use Template
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <DocumentDuplicateIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-600">
                Try adjusting your search or filters to find more templates
              </p>
            </div>
          )}
        </div>

        {/* Template Preview Modal */}
        {selectedTemplate && (
          <Modal 
            open={!!selectedTemplate} 
            onClose={() => setSelectedTemplate(null)}
            size="lg"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedTemplate.name}
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedTemplate(null)} 
                  icon={XMarkIcon} 
                />
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600">{selectedTemplate.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Template Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium capitalize">{selectedTemplate.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Difficulty:</span>
                        <span className={`font-medium capitalize ${getDifficultyColor(selectedTemplate.difficulty)}`}>
                          {selectedTemplate.difficulty}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Setup Time:</span>
                        <span className="font-medium">{selectedTemplate.timeToSetup} hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Est. ROI:</span>
                        <span className="font-medium text-green-600">{selectedTemplate.estimatedROI}%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Requirements</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Min Budget:</span>
                        <span className="font-medium">{formatCurrency(selectedTemplate.budget.min)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Recommended:</span>
                        <span className="font-medium">{formatCurrency(selectedTemplate.budget.recommended)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Min Audience:</span>
                        <span className="font-medium">{selectedTemplate.audienceSize.min.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max Audience:</span>
                        <span className="font-medium">{selectedTemplate.audienceSize.max.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Features Included</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedTemplate.features.map((feature) => (
                      <div key={feature} className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Supported Industries</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.industry.map((industry) => (
                      <span
                        key={industry}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {industry}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <UserGroupIcon className="w-4 h-4" />
                      {selectedTemplate.usageCount.toLocaleString()} uses
                    </div>
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      Updated {new Date(selectedTemplate.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <Button
                    variant="primary"
                    onClick={() => {
                      onSelectTemplate(selectedTemplate);
                      setSelectedTemplate(null);
                    }}
                    icon={DocumentDuplicateIcon}
                  >
                    Use This Template
                  </Button>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </Modal>
  );
};