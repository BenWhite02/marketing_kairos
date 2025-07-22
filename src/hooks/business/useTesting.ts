// src/hooks/business/useTesting.ts

import { useState, useEffect, useCallback } from 'react';
import type { ExperimentConfig } from '../../components/business/testing/ExperimentDesigner/ExperimentBuilder';

// Mock data for testing (replace with real API calls)
const MOCK_EXPERIMENTS: ExperimentConfig[] = [
  {
    id: 'exp_1',
    name: 'Email Subject Line Test',
    description: 'Testing different subject line approaches for email campaigns',
    hypothesis: 'Personalized subject lines will increase open rates by 15%',
    type: 'ab',
    status: 'active',
    variants: [
      {
        id: 'control',
        name: 'Control',
        description: 'Standard subject line',
        isControl: true,
        traffic: 50,
        content: { type: 'moment', config: { subject: 'Your Weekly Update' } },
        performance: {
          impressions: 15000,
          conversions: 2250,
          conversionRate: 15.0,
          confidence: 95.2,
          isWinner: false
        }
      },
      {
        id: 'variant_a',
        name: 'Personalized',
        description: 'Personalized subject line with name',
        isControl: false,
        traffic: 50,
        content: { type: 'moment', config: { subject: 'Hi {{name}}, Your Weekly Update' } },
        performance: {
          impressions: 15000,
          conversions: 2775,
          conversionRate: 18.5,
          confidence: 98.7,
          isWinner: true
        }
      }
    ],
    audience: {
      size: 30000,
      segments: ['email_engaged'],
      filters: [
        { atomId: 'email_engagement', operator: 'greater_than', value: 10 }
      ]
    },
    goals: [
      {
        id: 'goal_1',
        name: 'Email Open Rate',
        type: 'engagement',
        metric: 'open_rate',
        isPrimary: true,
        weight: 100
      }
    ],
    traffic: {
      allocation: 100,
      distribution: { control: 50, variant_a: 50 }
    },
    statistical: {
      confidenceLevel: 95,
      minimumDetectableEffect: 5,
      statisticalPower: 80,
      sampleSize: 15000,
      earlyStoppingEnabled: true,
      significanceThreshold: 0.05
    },
    duration: 14,
    startDate: new Date('2025-07-01'),
    createdAt: new Date('2025-06-25'),
    updatedAt: new Date('2025-07-21')
  },
  {
    id: 'exp_2',
    name: 'Checkout Button Color',
    description: 'Testing different button colors for checkout conversion',
    hypothesis: 'Red button will outperform blue button by 10%',
    type: 'ab',
    status: 'completed',
    variants: [
      {
        id: 'control',
        name: 'Blue Button',
        description: 'Current blue checkout button',
        isControl: true,
        traffic: 50,
        content: { type: 'moment', config: { buttonColor: 'blue' } },
        performance: {
          impressions: 8500,
          conversions: 765,
          conversionRate: 9.0,
          confidence: 87.3,
          isWinner: false
        }
      },
      {
        id: 'variant_a',
        name: 'Red Button',
        description: 'New red checkout button',
        isControl: false,
        traffic: 50,
        content: { type: 'moment', config: { buttonColor: 'red' } },
        performance: {
          impressions: 8500,
          conversions: 935,
          conversionRate: 11.0,
          confidence: 96.1,
          isWinner: true
        }
      }
    ],
    audience: {
      size: 17000,
      segments: ['recent_purchasers'],
      filters: []
    },
    goals: [
      {
        id: 'goal_1',
        name: 'Checkout Conversion Rate',
        type: 'conversion',
        metric: 'conversion_rate',
        isPrimary: true,
        weight: 100
      }
    ],
    traffic: {
      allocation: 80,
      distribution: { control: 50, variant_a: 50 }
    },
    statistical: {
      confidenceLevel: 95,
      minimumDetectableEffect: 10,
      statisticalPower: 80,
      sampleSize: 8500,
      earlyStoppingEnabled: true,
      significanceThreshold: 0.05
    },
    duration: 7,
    startDate: new Date('2025-07-10'),
    endDate: new Date('2025-07-17'),
    createdAt: new Date('2025-07-08'),
    updatedAt: new Date('2025-07-17')
  },
  {
    id: 'exp_3',
    name: 'Product Recommendation Algorithm',
    description: 'Testing collaborative filtering vs content-based recommendations',
    hypothesis: 'Collaborative filtering will increase CTR by 20%',
    type: 'ab',
    status: 'draft',
    variants: [
      {
        id: 'control',
        name: 'Content-Based',
        description: 'Current content-based recommendations',
        isControl: true,
        traffic: 50,
        content: { type: 'campaign', config: { algorithm: 'content_based' } }
      },
      {
        id: 'variant_a',
        name: 'Collaborative Filtering',
        description: 'New collaborative filtering algorithm',
        isControl: false,
        traffic: 50,
        content: { type: 'campaign', config: { algorithm: 'collaborative' } }
      }
    ],
    audience: {
      size: 50000,
      segments: ['high_value', 'recent_purchasers'],
      filters: [
        { atomId: 'purchase_frequency', operator: 'greater_than', value: 2 }
      ]
    },
    goals: [
      {
        id: 'goal_1',
        name: 'Click-Through Rate',
        type: 'engagement',
        metric: 'click_through_rate',
        isPrimary: true,
        weight: 70
      },
      {
        id: 'goal_2',
        name: 'Conversion Rate',
        type: 'conversion',
        metric: 'conversion_rate',
        isPrimary: false,
        weight: 30
      }
    ],
    traffic: {
      allocation: 50,
      distribution: { control: 50, variant_a: 50 }
    },
    statistical: {
      confidenceLevel: 95,
      minimumDetectableEffect: 20,
      statisticalPower: 80,
      sampleSize: 12500,
      earlyStoppingEnabled: false,
      significanceThreshold: 0.05
    },
    duration: 21,
    createdAt: new Date('2025-07-20'),
    updatedAt: new Date('2025-07-21')
  }
];

interface UseTestingData {
  experiments: ExperimentConfig[];
  isLoading: boolean;
  error: string | null;
  createExperiment: (experiment: ExperimentConfig) => Promise<void>;
  updateExperiment: (experiment: ExperimentConfig) => Promise<void>;
  deleteExperiment: (experimentId: string) => Promise<void>;
  startExperiment: (experimentId: string) => Promise<void>;
  pauseExperiment: (experimentId: string) => Promise<void>;
  stopExperiment: (experimentId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

export const useTestingData = (): UseTestingData => {
  const [experiments, setExperiments] = useState<ExperimentConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate API loading
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setExperiments(MOCK_EXPERIMENTS);
      } catch (err) {
        setError('Failed to load experiments');
        console.error('Error loading experiments:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const createExperiment = useCallback(async (experiment: ExperimentConfig) => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newExperiment = {
        ...experiment,
        id: `exp_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setExperiments(prev => [...prev, newExperiment]);
    } catch (err) {
      setError('Failed to create experiment');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateExperiment = useCallback(async (experiment: ExperimentConfig) => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedExperiment = {
        ...experiment,
        updatedAt: new Date()
      };
      
      setExperiments(prev => 
        prev.map(exp => exp.id === experiment.id ? updatedExperiment : exp)
      );
    } catch (err) {
      setError('Failed to update experiment');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteExperiment = useCallback(async (experimentId: string) => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setExperiments(prev => prev.filter(exp => exp.id !== experimentId));
    } catch (err) {
      setError('Failed to delete experiment');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startExperiment = useCallback(async (experimentId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setExperiments(prev => 
        prev.map(exp => 
          exp.id === experimentId 
            ? { ...exp, status: 'active' as const, startDate: new Date(), updatedAt: new Date() }
            : exp
        )
      );
    } catch (err) {
      setError('Failed to start experiment');
      throw err;
    }
  }, []);

  const pauseExperiment = useCallback(async (experimentId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setExperiments(prev => 
        prev.map(exp => 
          exp.id === experimentId 
            ? { ...exp, status: 'paused' as const, updatedAt: new Date() }
            : exp
        )
      );
    } catch (err) {
      setError('Failed to pause experiment');
      throw err;
    }
  }, []);

  const stopExperiment = useCallback(async (experimentId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setExperiments(prev => 
        prev.map(exp => 
          exp.id === experimentId 
            ? { ...exp, status: 'completed' as const, endDate: new Date(), updatedAt: new Date() }
            : exp
        )
      );
    } catch (err) {
      setError('Failed to stop experiment');
      throw err;
    }
  }, []);

  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setExperiments(MOCK_EXPERIMENTS);
    } catch (err) {
      setError('Failed to refresh data');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    experiments,
    isLoading,
    error,
    createExperiment,
    updateExperiment,
    deleteExperiment,
    startExperiment,
    pauseExperiment,
    stopExperiment,
    refreshData
  };
};