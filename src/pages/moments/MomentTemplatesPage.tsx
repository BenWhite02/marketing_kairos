// src/pages/moments/MomentTemplatesPage.tsx
import React, { useState, useMemo } from 'react';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShareIcon,
  StarIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  BellIcon,
  ComputerDesktopIcon,
  ChatBubbleLeftRightIcon,
  InformationCircleIcon,
  SparklesIcon,
  FireIcon,
  TrophyIcon,
  AcademicCapIcon,
  GiftIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';

// Types
interface MomentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'onboarding' | 'promotional' | 'transactional' | 'retention' | 'educational' | 'notification';
  type: 'email' | 'sms' | 'push' | 'web' | 'in-app';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  usageCount: number;
  rating: number;
  tags: string[];
  preview: {
    subject?: string;
    message: string;
    cta?: string;
  };
  features: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
  isPopular: boolean;
  isFavorite: boolean;
  isRecommended: boolean;
  performance?: {
    avgOpenRate: number;
    avgClickRate: number;
    avgConversionRate: number;
  };
}

const MomentTemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | MomentTemplate['category']>('all');
  const [selectedType, setSelectedType] = useState<'all' | MomentTemplate['type']>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | MomentTemplate['difficulty']>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'rating' | 'usage'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(false);

  // Mock templates data - replace with actual API call
  const templates = useMemo<MomentTemplate[]>(() => [
    {
      id: '1',
      name: 'Welcome Series - Day 1',
      description: 'Perfect first touchpoint for new customers with personalized product recommendations and account setup guidance.',
      category: 'onboarding',
      type: 'email',
      difficulty: 'beginner',
      estimatedTime: 15,
      usageCount: 2847,
      rating: 4.8,
      tags: ['welcome', 'personalization', 'new-users', 'high-converting'],
      preview: {
        subject: 'Welcome to {{company_name}}, {{first_name}}! Your journey starts here',
        message: 'Thank you for joining us! We\'re excited to help you discover amazing products tailored just for you. Based on your interests, we\'ve curated some recommendations to get you started...',
        cta: 'Start Shopping'
      },
      features: ['Dynamic personalization', 'Product recommendations', 'Welcome bonus', 'Social proof'],
      author: 'Kairos Team',
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: '2024-01-12T14:30:00Z',
      isPopular: true,
      isFavorite: false,
      isRecommended: true,
      performance: {
        avgOpenRate: 42.3,
        avgClickRate: 18.7,
        avgConversionRate: 23.1
      }
    },
    {
      id: '2',
      name: 'Flash Sale Alert',
      description: 'High-urgency promotional template for time-sensitive offers with countdown timer and limited inventory messaging.',
      category: 'promotional',
      type: 'push',
      difficulty: 'intermediate',
      estimatedTime: 10,
      usageCount: 1923,
      rating: 4.6,
      tags: ['sale', 'urgency', 'countdown', 'mobile-optimized'],
      preview: {
        message: '🔥 FLASH SALE: 50% OFF Everything! Only 4 hours left. Limited stock - grab yours before they\'re gone!',
        cta: 'Shop Now'
      },
      features: ['Countdown timer', 'Urgency messaging', 'Stock indicators', 'Emoji optimization'],
      author: 'Marketing Pro',
      createdAt: '2024-01-08T09:00:00Z',
      updatedAt: '2024-01-11T16:20:00Z',
      isPopular: true,
      isFavorite: true,
      isRecommended: false,
      performance: {
        avgOpenRate: 65.8,
        avgClickRate: 28.4,
        avgConversionRate: 15.2
      }
    },
    {
      id: '3',
      name: 'Cart Abandonment Recovery',
      description: 'Automated follow-up sequence for abandoned carts with product images, personalized incentives, and easy checkout.',
      category: 'transactional',
      type: 'email',
      difficulty: 'advanced',
      estimatedTime: 25,
      usageCount: 3156,
      rating: 4.9,
      tags: ['automation', 'recovery', 'personalized', 'multi-step'],
      preview: {
        subject: 'Don\'t forget these items in your cart, {{first_name}}',
        message: 'We noticed you left some great items in your cart. Complete your purchase now and get free shipping on orders over $50...',
        cta: 'Complete Purchase'
      },
      features: ['Product carousels', 'Dynamic pricing', 'Shipping incentives', 'Social proof'],
      author: 'E-commerce Expert',
      createdAt: '2024-01-05T11:00:00Z',
      updatedAt: '2024-01-09T13:45:00Z',
      isPopular: true,
      isFavorite: false,
      isRecommended: true,
      performance: {
        avgOpenRate: 38.9,
        avgClickRate: 22.4,
        avgConversionRate: 28.7
      }
    },
    {
      id: '4',
      name: 'Win-Back Campaign',
      description: 'Re-engagement template for inactive customers with exclusive offers and "we miss you" messaging.',
      category: 'retention',
      type: 'email',
      difficulty: 'intermediate',
      estimatedTime: 20,
      usageCount: 876,
      rating: 4.4,
      tags: ['win-back', 'retention', 'exclusive', 'emotional'],
      preview: {
        subject: 'We miss you! Here\'s 30% off to welcome you back',
        message: 'It\'s been a while since your last visit, and we wanted to reach out with a special offer just for you. As a valued customer, enjoy 30% off your next purchase...',
        cta: 'Claim Your Discount'
      },
      features: ['Personalized messaging', 'Exclusive discounts', 'Account insights', 'Re-engagement tracking'],
      author: 'Retention Specialist',
      createdAt: '2024-01-03T14:00:00Z',
      updatedAt: '2024-01-07T10:15:00Z',
      isPopular: false,
      isFavorite: true,
      isRecommended: false,
      performance: {
        avgOpenRate: 28.3,
        avgClickRate: 12.1,
        avgConversionRate: 15.2
      }
    },
    {
      id: '5',
      name: 'Product Education Series',
      description: 'Educational content template series to help customers get maximum value from their purchases.',
      category: 'educational',
      type: 'email',
      difficulty: 'beginner',
      estimatedTime: 30,
      usageCount: 1245,
      rating: 4.7,
      tags: ['education', 'value', 'engagement', 'tutorial'],
      preview: {
        subject: 'Get the most out of your {{product_name}} with these pro tips',
        message: 'Congratulations on your recent purchase! Here are some expert tips and tricks to help you get the maximum benefit from your new {{product_name}}...',
        cta: 'Learn More'
      },
      features: ['Video tutorials', 'Step-by-step guides', 'Tips and tricks', 'Community links'],
      author: 'Education Team',
      createdAt: '2024-01-01T08:00:00Z',
      updatedAt: '2024-01-06T12:30:00Z',
      isPopular: false,
      isFavorite: false,
      isRecommended: true,
      performance: {
        avgOpenRate: 34.5,
        avgClickRate: 16.8,
        avgConversionRate: 19.3
      }
    },
    {
      id: '6',
      name: 'Order Confirmation',
      description: 'Professional transactional template with order details, shipping info, and cross-sell opportunities.',
      category: 'transactional',
      type: 'email',
      difficulty: 'beginner',
      estimatedTime: 12,
      usageCount: 4521,
      rating: 4.5,
      tags: ['confirmation', 'transactional', 'cross-sell', 'professional'],
      preview: {
        subject: 'Order Confirmation - Your items are on the way!',
        message: 'Thank you for your order! Your items are being prepared and will ship within 1-2 business days. Here are your order details...',
        cta: 'Track Order'
      },
      features: ['Order tracking', 'Cross-sell recommendations', 'Customer service links', 'Mobile-optimized'],
      author: 'Kairos Team',
      createdAt: '2023-12-28T16:00:00Z',
      updatedAt: '2024-01-04T09:45:00Z',
      isPopular: true,
      isFavorite: false,
      isRecommended: false,
      performance: {
        avgOpenRate: 89.2,
        avgClickRate: 12.4,
        avgConversionRate: 8.7
      }
    },
    {
      id: '7',
      name: 'Birthday Special',
      description: 'Celebratory template with personalized birthday wishes and exclusive birthday discount offers.',
      category: 'promotional',
      type: 'email',
      difficulty: 'beginner',
      estimatedTime: 15,
      usageCount: 687,
      rating: 4.3,
      tags: ['birthday', 'celebration', 'personal', 'discount'],
      preview: {
        subject: '🎉 Happy Birthday {{first_name}}! Your special gift awaits',
        message: 'It\'s your special day, and we want to celebrate with you! Enjoy a birthday discount just for you, plus free shipping on any order...',
        cta: 'Claim Birthday Gift'
      },
      features: ['Birthday personalization', 'Special discounts', 'Celebratory design', 'Gift messaging'],
      author: 'Celebration Expert',
      createdAt: '2023-12-25T12:00:00Z',
      updatedAt: '2024-01-02T15:20:00Z',
      isPopular: false,
      isFavorite: true,
      isRecommended: false,
      performance: {
        avgOpenRate: 52.1,
        avgClickRate: 24.6,
        avgConversionRate: 31.4
      }
    },
    {
      id: '8',
      name: 'Shipping Notification',
      description: 'Clean transactional template for shipping confirmations with tracking information and delivery estimates.',
      category: 'notification',
      type: 'sms',
      difficulty: 'beginner',
      estimatedTime: 8,
      usageCount: 8934,
      rating: 4.6,
      tags: ['shipping', 'notification', 'tracking', 'concise'],
      preview: {
        message: 'Your order #{{order_id}} has shipped! Track your package: {{tracking_link}} Est. delivery: {{delivery_date}}'
      },
      features: ['Tracking integration', 'Delivery estimates', 'Concise messaging', 'Link optimization'],
      author: 'Logistics Team',
      createdAt: '2023-12-20T10:00:00Z',
      updatedAt: '2023-12-30T11:30:00Z',
      isPopular: true,
      isFavorite: false,
      isRecommended: false,
      performance: {
        avgOpenRate: 95.7,
        avgClickRate: 45.2,
        avgConversionRate: 5.1
      }
    }
  ], []);

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let filtered = templates.filter(template => {
      const matchesSearch = searchTerm === '' || 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesType = selectedType === 'all' || template.type === selectedType;
      const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesType && matchesDifficulty;
    });

    // Sort templates
    switch (sortBy) {
      case 'popular':
        return filtered.sort((a, b) => b.usageCount - a.usageCount);
      case 'recent':
        return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      case 'rating':
        return filtered.sort((a, b) => b.rating - a.rating);
      case 'usage':
        return filtered.sort((a, b) => b.usageCount - a.usageCount);
      default:
        return filtered;
    }
  }, [templates, searchTerm, selectedCategory, selectedType, selectedDifficulty, sortBy]);

  const handleCreateTemplate = () => {
    navigate('/moments/templates/create');
  };

  const handleUseTemplate = (templateId: string) => {
    navigate(`/moments/builder?template=${templateId}`);
  };

  const handlePreviewTemplate = (templateId: string) => {
    console.log('Previewing template:', templateId);
  };

  const handleEditTemplate = (templateId: string) => {
    navigate(`/moments/templates/${templateId}/edit`);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      setLoading(true);
      try {
        // API call to delete template
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Deleting template:', templateId);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleFavorite = async (templateId: string) => {
    setLoading(true);
    try {
      // API call to toggle favorite
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Toggling favorite for template:', templateId);
    } finally {
      setLoading(false);
    }
  };

  const getChannelIcon = (type: MomentTemplate['type']) => {
    const icons = {
      email: EnvelopeIcon,
      sms: DevicePhoneMobileIcon,
      push: BellIcon,
      web: ComputerDesktopIcon,
      'in-app': ChatBubbleLeftRightIcon
    };
    return icons[type] || InformationCircleIcon;
  };

  const getCategoryIcon = (category: MomentTemplate['category']) => {
    const icons = {
      onboarding: AcademicCapIcon,
      promotional: GiftIcon,
      transactional: DocumentDuplicateIcon,
      retention: TrophyIcon,
      educational: SparklesIcon,
      notification: ExclamationCircleIcon
    };
    return icons[category] || InformationCircleIcon;
  };

  const getDifficultyColor = (difficulty: MomentTemplate['difficulty']) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    return colors[difficulty];
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'onboarding', label: 'Onboarding' },
    { value: 'promotional', label: 'Promotional' },
    { value: 'transactional', label: 'Transactional' },
    { value: 'retention', label: 'Retention' },
    { value: 'educational', label: 'Educational' },
    { value: 'notification', label: 'Notification' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Moment Templates</h1>
              <p className="text-gray-600 mt-1">Professional templates to accelerate your moment creation</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                {viewMode === 'grid' ? '☰ List' : '⚏ Grid'}
              </Button>
              <Button onClick={handleCreateTemplate}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mt-6 space-y-4 lg:space-y-0">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>

              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
              >
                <option value="all">All Types</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="push">Push</option>
                <option value="web">Web</option>
                <option value="in-app">In-App</option>
              </select>

              {/* Difficulty Filter */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
              >
                <option value="popular">Most Popular</option>
                <option value="recent">Recently Updated</option>
                <option value="rating">Highest Rated</option>
                <option value="usage">Most Used</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-6 mt-4 text-sm text-gray-600">
            <span>{filteredTemplates.length} templates found</span>
            <span>•</span>
            <span>{templates.filter(t => t.isPopular).length} popular</span>
            <span>•</span>
            <span>{templates.filter(t => t.isRecommended).length} recommended</span>
          </div>
        </div>

        {/* Template Grid/List */}
        {filteredTemplates.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <DocumentDuplicateIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search criteria or create a new template.</p>
              <Button onClick={handleCreateTemplate}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </CardBody>
          </Card>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredTemplates.map((template) => {
              const ChannelIcon = getChannelIcon(template.type);
              const CategoryIcon = getCategoryIcon(template.category);

              if (viewMode === 'list') {
                return (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardBody>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="flex-shrink-0">
                            <CategoryIcon className="w-8 h-8 text-gray-600" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {template.name}
                              </h3>
                              
                              <div className="flex items-center space-x-2">
                                {template.isPopular && (
                                  <Badge className="bg-orange-100 text-orange-800 flex items-center">
                                    <FireIcon className="w-3 h-3 mr-1" />
                                    Popular
                                  </Badge>
                                )}
                                {template.isRecommended && (
                                  <Badge className="bg-blue-100 text-blue-800 flex items-center">
                                    <SparklesIcon className="w-3 h-3 mr-1" />
                                    Recommended
                                  </Badge>
                                )}
                                <Badge className={getDifficultyColor(template.difficulty)}>
                                  {template.difficulty}
                                </Badge>
                              </div>
                            </div>
                            
                            <p className="text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                              <div className="flex items-center space-x-1">
                                <ChannelIcon className="w-4 h-4" />
                                <span className="capitalize">{template.type}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <ClockIcon className="w-4 h-4" />
                                <span>{template.estimatedTime} min</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <UserGroupIcon className="w-4 h-4" />
                                <span>{template.usageCount} uses</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <StarIcon className="w-4 h-4" />
                                <span>{template.rating}</span>
                              </div>
                            </div>
                            
                            {template.performance && (
                              <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                                <span>Open: {template.performance.avgOpenRate}%</span>
                                <span>Click: {template.performance.avgClickRate}%</span>
                                <span>Convert: {template.performance.avgConversionRate}%</span>
                              </div>
                            )}
                            
                            <div className="flex flex-wrap gap-1">
                              {template.tags.slice(0, 4).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {template.tags.length > 4 && (
                                <Badge variant="outline" className="text-xs">
                                  +{template.tags.length - 4} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleToggleFavorite(template.id)}
                            className="p-2 text-gray-400 hover:text-yellow-500 transition-colors"
                          >
                            {template.isFavorite ? (
                              <StarIconSolid className="w-4 h-4 text-yellow-500" />
                            ) : (
                              <StarIcon className="w-4 h-4" />
                            )}
                          </button>
                          <Button variant="outline" size="sm" onClick={() => handlePreviewTemplate(template.id)}>
                            <EyeIcon className="w-4 h-4" />
                          </Button>
                          <Button size="sm" onClick={() => handleUseTemplate(template.id)}>
                            Use Template
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                );
              }

              return (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardBody>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <CategoryIcon className="w-5 h-5 text-gray-600" />
                        <ChannelIcon className="w-4 h-4 text-gray-500" />
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {template.isPopular && (
                          <FireIcon className="w-4 h-4 text-orange-500" />
                        )}
                        {template.isRecommended && (
                          <SparklesIcon className="w-4 h-4 text-blue-500" />
                        )}
                        <button
                          onClick={() => handleToggleFavorite(template.id)}
                          className="text-gray-400 hover:text-yellow-500 transition-colors"
                        >
                          {template.isFavorite ? (
                            <StarIconSolid className="w-4 h-4 text-yellow-500" />
                          ) : (
                            <StarIcon className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {template.name}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {template.description}
                    </p>
                    
                    {/* Preview */}
                    <div className="bg-gray-50 rounded-md p-3 mb-4">
                      <div className="text-xs text-gray-500 mb-1">Preview:</div>
                      {template.preview.subject && (
                        <div className="text-xs font-medium mb-1 truncate">
                          Subject: {template.preview.subject}
                        </div>
                      )}
                      <div className="text-xs text-gray-700 line-clamp-2">
                        {template.preview.message}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-3 h-3" />
                          <span>{template.estimatedTime}m</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <UserGroupIcon className="w-3 h-3" />
                          <span>{template.usageCount}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <StarIcon className="w-3 h-3" />
                          <span>{template.rating}</span>
                        </div>
                      </div>
                      
                      <Badge className={getDifficultyColor(template.difficulty)}>
                        {template.difficulty}
                      </Badge>
                    </div>
                    
                    {template.performance && (
                      <div className="flex justify-between text-xs text-gray-500 mb-4">
                        <span>Open: {template.performance.avgOpenRate}%</span>
                        <span>Click: {template.performance.avgClickRate}%</span>
                        <span>Convert: {template.performance.avgConversionRate}%</span>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handlePreviewTemplate(template.id)} className="flex-1">
                        <EyeIcon className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button size="sm" onClick={() => handleUseTemplate(template.id)} className="flex-1">
                        Use Template
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}

        {/* Template Categories Quick Access */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.slice(1).map((category) => {
              const Icon = getCategoryIcon(category.value as MomentTemplate['category']);
              const count = templates.filter(t => t.category === category.value).length;
              
              return (
                <Card 
                  key={category.value} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedCategory(category.value as any)}
                >
                  <CardBody className="text-center">
                    <Icon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <div className="font-medium text-sm text-gray-900">{category.label}</div>
                    <div className="text-xs text-gray-500">{count} templates</div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Popular Templates Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Popular Templates</h2>
            <Button variant="outline" onClick={() => setSortBy('popular')}>
              View All Popular
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {templates
              .filter(t => t.isPopular)
              .slice(0, 4)
              .map((template) => {
                const ChannelIcon = getChannelIcon(template.type);
                
                return (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardBody>
                      <div className="flex items-center justify-between mb-3">
                        <ChannelIcon className="w-5 h-5 text-gray-600" />
                        <div className="flex items-center space-x-1">
                          <FireIcon className="w-4 h-4 text-orange-500" />
                          <span className="text-xs text-gray-500">{template.usageCount} uses</span>
                        </div>
                      </div>
                      
                      <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                        {template.name}
                      </h4>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span className="capitalize">{template.category}</span>
                        <div className="flex items-center space-x-1">
                          <StarIcon className="w-3 h-3" />
                          <span>{template.rating}</span>
                        </div>
                      </div>
                      
                      <Button size="sm" onClick={() => handleUseTemplate(template.id)} className="w-full">
                        Use Template
                      </Button>
                    </CardBody>
                  </Card>
                );
              })}
          </div>
        </div>

        {/* Getting Started Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started with Templates</h2>
            <p className="text-gray-700 mb-6">
              Templates are pre-built moment configurations that help you create professional marketing communications quickly. 
              Each template includes optimized content, targeting suggestions, and proven performance metrics.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-white w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <MagnifyingGlassIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">1. Browse & Search</h3>
                <p className="text-sm text-gray-600">Find the perfect template for your campaign using our smart filters and search.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-white w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <PencilIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">2. Customize</h3>
                <p className="text-sm text-gray-600">Personalize the template with your content, branding, and targeting rules.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-white w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <ChartBarIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">3. Launch & Optimize</h3>
                <p className="text-sm text-gray-600">Deploy your moment and track performance with built-in analytics.</p>
              </div>
            </div>
            
            <div className="flex justify-center mt-8">
              <Button onClick={handleCreateTemplate} className="mr-4">
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Your First Template
              </Button>
              <Button variant="outline">
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MomentTemplatesPage;