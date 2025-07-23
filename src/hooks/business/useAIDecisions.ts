// src/hooks/business/useAIDecisions.ts

import { useState, useCallback, useEffect } from 'react';
import { useAIStore } from '../../stores/business/aiStore';
import { DecisionRequest, DecisionResult, CustomerContext } from '../../types/ai';

export const useAIDecisions = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastDecision, setLastDecision] = useState<DecisionResult | null>(null);
  const [decisionHistory, setDecisionHistory] = useState<DecisionResult[]>([]);
  
  const {
    makeDecision: makeDecisionStore,
    getDecisionHistory,
    systemMetrics,
    isInitialized
  } = useAIStore();

  /**
   * Make a decision for a customer
   */
  const makeDecision = useCallback(async (
    customerId: string,
    tenantId: string,
    context: CustomerContext,
    decisionType: DecisionRequest['decisionType'] = 'next_best_action'
  ): Promise<DecisionResult | null> => {
    if (!isInitialized) {
      console.warn('[useAIDecisions] AI services not initialized');
      return null;
    }

    setIsProcessing(true);
    
    try {
      const request: DecisionRequest = {
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        customerId,
        tenantId,
        decisionType,
        context,
        objectives: [
          { type: 'revenue', weight: 0.4 },
          { type: 'engagement', weight: 0.3 },
          { type: 'retention', weight: 0.3 }
        ],
        options: {
          maxRecommendations: 5,
          includeReasons: true,
          includeConfidence: true,
          timeout: 5000
        }
      };

      const result = await makeDecisionStore(request);
      setLastDecision(result);
      
      // Update local history
      const history = getDecisionHistory(customerId, 50);
      setDecisionHistory(history);
      
      return result;
      
    } catch (error) {
      console.error('[useAIDecisions] Decision failed:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [isInitialized, makeDecisionStore, getDecisionHistory]);

  /**
   * Get quick recommendation for customer
   */
  const getQuickRecommendation = useCallback(async (
    customerId: string,
    tenantId: string,
    basicContext?: Partial<CustomerContext>
  ): Promise<{ recommendation: string; confidence: number } | null> => {
    const defaultContext: CustomerContext = {
      customerId,
      tenantId,
      demographics: {
        age: 35,
        segment: 'standard'
      },
      behavioral: {
        totalPurchases: 1,
        avgOrderValue: 75,
        lifetimeValue: 150,
        churnRisk: 0.3,
        engagementScore: 60,
        preferredChannels: ['email'],
        activityLevel: 'medium'
      },
      contextual: {
        currentTime: new Date(),
        deviceType: 'desktop',
        sessionDuration: 300,
        pageViews: 3
      },
      preferences: {
        communicationFrequency: 'medium',
        contentTypes: ['promotional'],
        topics: ['general'],
        optedOutChannels: []
      },
      ...basicContext
    };

    const result = await makeDecision(customerId, tenantId, defaultContext);
    
    if (result && result.recommendations.length > 0) {
      const topRecommendation = result.recommendations[0];
      return {
        recommendation: topRecommendation.title,
        confidence: topRecommendation.confidence
      };
    }
    
    return null;
  }, [makeDecision]);

  /**
   * Load decision history for a customer
   */
  const loadDecisionHistory = useCallback((customerId: string, limit?: number) => {
    const history = getDecisionHistory(customerId, limit);
    setDecisionHistory(history);
    return history;
  }, [getDecisionHistory]);

  /**
   * Get performance summary
   */
  const getPerformanceSummary = useCallback(() => {
    return {
      totalDecisions: systemMetrics.totalDecisions,
      avgDecisionTime: systemMetrics.avgDecisionTime,
      avgConfidence: systemMetrics.avgConfidence,
      systemHealth: systemMetrics.systemHealth
    };
  }, [systemMetrics]);

  // Auto-refresh decision history when customer changes
  useEffect(() => {
    if (lastDecision) {
      const history = getDecisionHistory(lastDecision.customerId, 50);
      setDecisionHistory(history);
    }
  }, [lastDecision, getDecisionHistory]);

  return {
    // Core functions
    makeDecision,
    getQuickRecommendation,
    loadDecisionHistory,
    
    // State
    isProcessing,
    lastDecision,
    decisionHistory,
    isInitialized,
    
    // Performance
    performanceSummary: getPerformanceSummary(),
    
    // Utilities
    canMakeDecision: isInitialized && !isProcessing
  };
};