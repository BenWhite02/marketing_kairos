// src/pages/atoms/AtomComposerPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  ShareIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import { AtomComposer, type AtomComposition, type AtomTemplate } from '../../components/business/atoms/AtomComposer';
import { useAtomComposition } from '../../hooks/business/useAtomComposition';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';

export const AtomComposerPage: React.FC = () => {
  const { compositionId } = useParams<{ compositionId?: string }>();
  const navigate = useNavigate();
  const isNewComposition = !compositionId || compositionId === 'new';

  const {
    composition,
    availableAtoms,
    isLoading,
    error,
    saveComposition,
    testComposition,
    deployComposition,
    duplicateComposition,
    deleteComposition
  } = useAtomComposition(isNewComposition ? undefined : compositionId);

  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  // Mock available atoms data
  const mockAtoms: AtomTemplate[] = [
    // Demographic Atoms
    {
      id: 'demo-age-1',
      name: 'Age Range 18-34',
      type: 'demographic',
      category: 'Age Groups',
      data: { minAge: 18, maxAge: 34 },
      accuracy: 95,
      usage: 2340,
      description: 'Users between 18 and 34 years old',
      tags: ['millennials', 'young-adults'],
      isPopular: true
    },
    {
      id: 'demo-location-1',
      name: 'Urban Residents',
      type: 'demographic',
      category: 'Geography',
      data: { locationType: 'urban', population: '>50000' },
      accuracy: 88,
      usage: 1890,
      description: 'Users living in urban areas',
      tags: ['city', 'metropolitan']
    },
    {
      id: 'demo-income-1',
      name: 'High Income',
      type: 'demographic',
      category: 'Income',
      data: { minIncome: 75000, currency: 'USD' },
      accuracy: 78,
      usage: 1456,
      description: 'Users with household income >$75k',
      tags: ['affluent', 'premium'],
      isFavorite: true
    },

    // Behavioral Atoms
    {
      id: 'behav-frequency-1',
      name: 'High Purchase Frequency',
      type: 'behavioral',
      category: 'Purchase Behavior',
      data: { minPurchasesPerMonth: 5 },
      accuracy: 92,
      usage: 3210,
      description: 'Users who purchase frequently',
      tags: ['loyal', 'active'],
      isPopular: true
    },
    {
      id: 'behav-engagement-1',
      name: 'High Email Engagement',
      type: 'behavioral',
      category: 'Engagement',
      data: { emailOpenRate: '>60%', clickRate: '>15%' },
      accuracy: 85,
      usage: 2780,
      description: 'Users with high email engagement rates',
      tags: ['engaged', 'responsive']
    },
    {
      id: 'behav-browsing-1',
      name: 'Mobile-First Users',
      type: 'behavioral',
      category: 'Device Usage',
      data: { primaryDevice: 'mobile', mobileSessionsPercent: '>80%' },
      accuracy: 91,
      usage: 4120,
      description: 'Users who primarily browse on mobile',
      tags: ['mobile', 'on-the-go'],
      isPopular: true
    },

    // Transactional Atoms
    {
      id: 'trans-value-1',
      name: 'High LTV Customers',
      type: 'transactional',
      category: 'Customer Value',
      data: { minLifetimeValue: 1000, currency: 'USD' },
      accuracy: 96,
      usage: 1567,
      description: 'Customers with high lifetime value',
      tags: ['valuable', 'vip'],
      isFavorite: true
    },
    {
      id: 'trans-recency-1',
      name: 'Recent Purchasers',
      type: 'transactional',
      category: 'Purchase Timing',
      data: { daysSinceLastPurchase: '<30' },
      accuracy: 89,
      usage: 2890,
      description: 'Users who purchased in last 30 days',
      tags: ['recent', 'active']
    },
    {
      id: 'trans-category-1',
      name: 'Electronics Buyers',
      type: 'transactional',
      category: 'Product Categories',
      data: { categories: ['electronics', 'gadgets'], minPurchases: 2 },
      accuracy: 87,
      usage: 1920,
      description: 'Users who buy electronics regularly',
      tags: ['tech-savvy', 'gadgets']
    },

    // Contextual Atoms
    {
      id: 'context-time-1',
      name: 'Weekend Shoppers',
      type: 'contextual',
      category: 'Shopping Patterns',
      data: { preferredDays: ['saturday', 'sunday'], timeframe: 'weekend' },
      accuracy: 82,
      usage: 2340,
      description: 'Users who shop primarily on weekends',
      tags: ['weekend', 'leisure']
    },
    {
      id: 'context-season-1',
      name: 'Holiday Shoppers',
      type: 'contextual',
      category: 'Seasonal Behavior',
      data: { seasonalSpikes: ['black-friday', 'christmas', 'valentine'] },
      accuracy: 94,
      usage: 1678,
      description: 'Users active during holiday seasons',
      tags: ['seasonal', 'gifting'],
      isPopular: true
    },
    {
      id: 'context-weather-1',
      name: 'Weather-Sensitive',
      type: 'contextual',
      category: 'Environmental',
      data: { weatherTriggers: ['rain', 'cold'], correlationStrength: 'high' },
      accuracy: 76,
      usage: 980,
      description: 'Shopping behavior influenced by weather',
      tags: ['weather', 'seasonal']
    }
  ];

  const handleSave = async (composition: AtomComposition) => {
    setIsSaving(true);
    try {
      await saveComposition(composition);
      if (isNewComposition) {
        navigate(`/atoms/composer/${composition.id}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async (composition: AtomComposition) => {
    setIsTesting(true);
    try {
      return await testComposition(composition);
    } finally {
      setIsTesting(false);
    }
  };

  const handleDeploy = async (composition: AtomComposition) => {
    setIsDeploying(true);
    try {
      await deployComposition(composition);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleDuplicate = async () => {
    if (!composition) return;
    
    try {
      const duplicated = await duplicateComposition(composition.id);
      navigate(`/atoms/composer/${duplicated.id}`);
    } catch (error) {
      console.error('Failed to duplicate composition:', error);
    }
  };

  const handleDelete = async () => {
    if (!composition) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to delete this composition? This action cannot be undone.'
    );
    
    if (confirmed) {
      try {
        await deleteComposition(composition.id);
        navigate('/atoms');
      } catch (error) {
        console.error('Failed to delete composition:', error);
      }
    }
  };

  const handleShare = () => {
    if (composition) {
      const shareUrl = `${window.location.origin}/atoms/composer/${composition.id}`;
      navigator.clipboard.writeText(shareUrl);
      // TODO: Show success toast
      console.log('Share URL copied to clipboard');
    }
  };

  const handleBookmark = () => {
    // TODO: Implement bookmark functionality
    console.log('Bookmark composition');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="text-red-600 dark:text-red-400 text-center">
          <h2 className="text-xl font-semibold mb-2">Error Loading Composition</h2>
          <p>{error}</p>
        </div>
        <Button
          onClick={() => navigate('/atoms')}
          variant="outline"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Atoms
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="flex-shrink-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate('/atoms')}
              variant="ghost"
              size="sm"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Atoms
            </Button>
            
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-600" />
            
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                {isNewComposition ? 'New Composition' : 'Edit Composition'}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Build complex eligibility rules using visual composition
              </p>
            </div>
          </div>

          {/* Header Actions */}
          {!isNewComposition && composition && (
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleBookmark}
                variant="ghost"
                size="sm"
                title="Bookmark"
              >
                <BookmarkIcon className="w-4 h-4" />
              </Button>
              
              <Button
                onClick={handleShare}
                variant="ghost"
                size="sm"
                title="Share"
              >
                <ShareIcon className="w-4 h-4" />
              </Button>
              
              <Button
                onClick={handleDuplicate}
                variant="ghost"
                size="sm"
                title="Duplicate"
              >
                <DocumentDuplicateIcon className="w-4 h-4" />
              </Button>
              
              <Button
                onClick={handleDelete}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                title="Delete"
              >
                <TrashIcon className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="flex-1 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          <AtomComposer
            composition={composition}
            availableAtoms={availableAtoms || mockAtoms}
            onSave={handleSave}
            onTest={handleTest}
            onDeploy={handleDeploy}
            readOnly={false}
          />
        </motion.div>
      </div>
    </div>
  );
};