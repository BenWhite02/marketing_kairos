// src/stores/business/aiStore.ts

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  DecisionRequest, 
  DecisionResult, 
  MLModel, 
  AIInsight, 
  Experiment,
  ExperimentResults,
  ModelPerformanceMetrics,
  CustomerContext 
} from '../../types/ai';
import { DecisionEngine } from '../../services/ai/DecisionEngine';
import { ModelRegistry } from '../../services/ai/ModelRegistry';
import { FeatureStore } from '../../services/ai/FeatureStore';
import { ExperimentationEngine } from '../../services/ai/ExperimentationEngine';
import { InsightsGenerator } from '../../services/ai/InsightsGenerator';

interface AIState {
  // Core Services
  decisionEngine: DecisionEngine | null;
  modelRegistry: ModelRegistry | null;
  featureStore: FeatureStore | null;
  experimentationEngine: ExperimentationEngine | null;
  insightsGenerator: InsightsGenerator | null;
  
  // Data State
  models: MLModel[];
  experiments: Experiment[];
  insights: AIInsight[];
  recentDecisions: DecisionResult[];
  performanceMetrics: ModelPerformanceMetrics[];
  
  // UI State
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  selectedModel: string | null;
  selectedExperiment: string | null;
  dashboardFilters: {
    timeRange: '1h' | '24h' | '7d' | '30d';
    modelId?: string;
    experimentId?: string;
    insightType?: string;
  };
  
  // Performance Metrics
  systemMetrics: {
    totalDecisions: number;
    avgDecisionTime: number;
    avgConfidence: number;
    activeExperiments: number;
    modelAccuracy: number;
    systemHealth: 'healthy' | 'warning' | 'critical';
  };
}

interface AIActions {
  // Initialization
  initializeAI: () => Promise<void>;
  
  // Decision Making
  makeDecision: (request: DecisionRequest) => Promise<DecisionResult>;
  getDecisionHistory: (customerId: string, limit?: number) => DecisionResult[];
  
  // Model Management
  loadModels: () => Promise<void>;
  deployModel: (modelId: string) => Promise<void>;
  updateModelStatus: (modelId: string, status: MLModel['status']) => Promise<void>;
  getModelPerformance: (modelId: string) => ModelPerformanceMetrics | null;
  
  // Experimentation
  loadExperiments: () => Promise<void>;
  createExperiment: (experiment: Experiment) => Promise<void>;
  startExperiment: (experimentId: string) => Promise<void>;
  stopExperiment: (experimentId: string) => Promise<void>;
  getExperimentResults: (experimentId: string) => Promise<ExperimentResults | null>;
  trackConversion: (experimentId: string, customerId: string, tenantId: string, metric: string, value: number) => Promise<void>;
  
  // Insights
  generateInsights: () => Promise<void>;
  dismissInsight: (insightId: string, reason?: string) => void;
  recordInsightAction: (insightId: string, action: string) => void;
  
  // Feature Management
  updateCustomerFeatures: (customerId: string, tenantId: string, features: { [key: string]: any }) => Promise<void>;
  getCustomerFeatures: (customerId: string, tenantId: string) => Promise<{ [key: string]: any }>;
  
  // UI Actions
  setSelectedModel: (modelId: string | null) => void;
  setSelectedExperiment: (experimentId: string | null) => void;
  updateDashboardFilters: (filters: Partial<AIState['dashboardFilters']>) => void;
  clearError: () => void;
  
  // Performance Monitoring
  updateSystemMetrics: () => void;
  recordDecisionMetric: (result: DecisionResult) => void;
}

type AIStore = AIState & AIActions;

export const useAIStore = create<AIStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    decisionEngine: null,
    modelRegistry: null,
    featureStore: null,
    experimentationEngine: null,
    insightsGenerator: null,
    
    models: [],
    experiments: [],
    insights: [],
    recentDecisions: [],
    performanceMetrics: [],
    
    isInitialized: false,
    isLoading: false,
    error: null,
    selectedModel: null,
    selectedExperiment: null,
    dashboardFilters: {
      timeRange: '24h'
    },
    
    systemMetrics: {
      totalDecisions: 0,
      avgDecisionTime: 0,
      avgConfidence: 0,
      activeExperiments: 0,
      modelAccuracy: 0,
      systemHealth: 'healthy'
    },
    
    // Actions
    initializeAI: async () => {
      console.log('[AIStore] Initializing AI services...');
      set({ isLoading: true, error: null });
      
      try {
        // Initialize core services
        const decisionEngine = new DecisionEngine();
        const modelRegistry = new ModelRegistry();
        const featureStore = new FeatureStore();
        const experimentationEngine = new ExperimentationEngine();
        const insightsGenerator = new InsightsGenerator();
        
        // Start periodic cleanup for insights
        insightsGenerator.startPeriodicCleanup();
        
        set({
          decisionEngine,
          modelRegistry,
          featureStore,
          experimentationEngine,
          insightsGenerator,
          isInitialized: true,
          isLoading: false
        });
        
        // Load initial data
        await get().loadModels();
        await get().loadExperiments();
        get().updateSystemMetrics();
        
        console.log('[AIStore] AI services initialized successfully');
        
      } catch (error) {
        console.error('[AIStore] Failed to initialize AI services:', error);
        set({ 
          error: error instanceof Error ? error.message : 'Failed to initialize AI services',
          isLoading: false 
        });
      }
    },
    
    makeDecision: async (request: DecisionRequest): Promise<DecisionResult> => {
      const { decisionEngine, experimentationEngine } = get();
      
      if (!decisionEngine) {
        throw new Error('Decision engine not initialized');
      }
      
      try {
        // Apply experiments if available
        let finalRequest = request;
        let experimentsApplied: string[] = [];
        
        if (experimentationEngine) {
          const experimentResult = await experimentationEngine.applyExperiments(request);
          finalRequest = experimentResult.request;
          experimentsApplied = experimentResult.experimentsApplied;
        }
        
        // Make decision
        const result = await decisionEngine.makeDecision(finalRequest);
        
        // Store decision in recent history
        set(state => ({
          recentDecisions: [result, ...state.recentDecisions.slice(0, 999)] // Keep last 1000
        }));
        
        // Record performance metrics
        get().recordDecisionMetric(result);
        
        return result;
        
      } catch (error) {
        console.error('[AIStore] Decision making failed:', error);
        throw error;
      }
    },
    
    getDecisionHistory: (customerId: string, limit: number = 50): DecisionResult[] => {
      const { recentDecisions } = get();
      return recentDecisions
        .filter(decision => decision.customerId === customerId)
        .slice(0, limit);
    },
    
    loadModels: async () => {
      const { modelRegistry } = get();
      
      if (!modelRegistry) {
        throw new Error('Model registry not initialized');
      }
      
      try {
        const models = modelRegistry.getModels();
        set({ models });
        
        console.log(`[AIStore] Loaded ${models.length} models`);
        
      } catch (error) {
        console.error('[AIStore] Failed to load models:', error);
        set({ error: 'Failed to load models' });
      }
    },
    
    deployModel: async (modelId: string) => {
      const { modelRegistry } = get();
      
      if (!modelRegistry) {
        throw new Error('Model registry not initialized');
      }
      
      try {
        await modelRegistry.deployModel(modelId);
        await get().loadModels(); // Refresh models
        
        console.log(`[AIStore] Model ${modelId} deployed successfully`);
        
      } catch (error) {
        console.error(`[AIStore] Failed to deploy model ${modelId}:`, error);
        set({ error: `Failed to deploy model: ${error instanceof Error ? error.message : 'Unknown error'}` });
      }
    },
    
    updateModelStatus: async (modelId: string, status: MLModel['status']) => {
      const { modelRegistry } = get();
      
      if (!modelRegistry) {
        throw new Error('Model registry not initialized');
      }
      
      try {
        await modelRegistry.updateModelStatus(modelId, status);
        await get().loadModels(); // Refresh models
        
      } catch (error) {
        console.error(`[AIStore] Failed to update model status:`, error);
        set({ error: 'Failed to update model status' });
      }
    },
    
    getModelPerformance: (modelId: string): ModelPerformanceMetrics | null => {
      const { performanceMetrics } = get();
      const modelMetrics = performanceMetrics.filter(m => m.modelId === modelId);
      return modelMetrics.length > 0 ? modelMetrics[modelMetrics.length - 1] : null;
    },
    
    loadExperiments: async () => {
      const { experimentationEngine } = get();
      
      if (!experimentationEngine) {
        throw new Error('Experimentation engine not initialized');
      }
      
      try {
        const experiments = experimentationEngine.getExperiments();
        set({ experiments });
        
        console.log(`[AIStore] Loaded ${experiments.length} experiments`);
        
      } catch (error) {
        console.error('[AIStore] Failed to load experiments:', error);
        set({ error: 'Failed to load experiments' });
      }
    },
    
    createExperiment: async (experiment: Experiment) => {
      const { experimentationEngine } = get();
      
      if (!experimentationEngine) {
        throw new Error('Experimentation engine not initialized');
      }
      
      try {
        await experimentationEngine.createExperiment(experiment);
        await get().loadExperiments(); // Refresh experiments
        
        console.log(`[AIStore] Experiment ${experiment.id} created successfully`);
        
      } catch (error) {
        console.error('[AIStore] Failed to create experiment:', error);
        set({ error: 'Failed to create experiment' });
      }
    },
    
    startExperiment: async (experimentId: string) => {
      const { experimentationEngine } = get();
      
      if (!experimentationEngine) {
        throw new Error('Experimentation engine not initialized');
      }
      
      try {
        await experimentationEngine.startExperiment(experimentId);
        await get().loadExperiments(); // Refresh experiments
        
        console.log(`[AIStore] Experiment ${experimentId} started successfully`);
        
      } catch (error) {
        console.error(`[AIStore] Failed to start experiment ${experimentId}:`, error);
        set({ error: `Failed to start experiment: ${error instanceof Error ? error.message : 'Unknown error'}` });
      }
    },
    
    stopExperiment: async (experimentId: string) => {
      const { experimentationEngine } = get();
      
      if (!experimentationEngine) {
        throw new Error('Experimentation engine not initialized');
      }
      
      try {
        await experimentationEngine.stopExperiment(experimentId);
        await get().loadExperiments(); // Refresh experiments
        
        console.log(`[AIStore] Experiment ${experimentId} stopped successfully`);
        
      } catch (error) {
        console.error(`[AIStore] Failed to stop experiment ${experimentId}:`, error);
        set({ error: 'Failed to stop experiment' });
      }
    },
    
    getExperimentResults: async (experimentId: string): Promise<ExperimentResults | null> => {
      const { experimentationEngine } = get();
      
      if (!experimentationEngine) {
        throw new Error('Experimentation engine not initialized');
      }
      
      try {
        return await experimentationEngine.getExperimentResults(experimentId);
      } catch (error) {
        console.error(`[AIStore] Failed to get experiment results:`, error);
        return null;
      }
    },
    
    trackConversion: async (
      experimentId: string, 
      customerId: string, 
      tenantId: string, 
      metric: string, 
      value: number
    ) => {
      const { experimentationEngine } = get();
      
      if (!experimentationEngine) {
        throw new Error('Experimentation engine not initialized');
      }
      
      try {
        await experimentationEngine.trackConversion(experimentId, customerId, tenantId, metric, value);
      } catch (error) {
        console.error('[AIStore] Failed to track conversion:', error);
      }
    },
    
    generateInsights: async () => {
      const { insightsGenerator, recentDecisions, performanceMetrics } = get();
      
      if (!insightsGenerator) {
        throw new Error('Insights generator not initialized');
      }
      
      try {
        // Generate mock customer contexts from recent decisions
        const customerContexts: CustomerContext[] = recentDecisions.slice(0, 100).map(decision => ({
          customerId: decision.customerId,
          tenantId: decision.tenantId,
          demographics: {
            age: 35,
            location: { country: 'US', city: 'New York', timezone: 'America/New_York' },
            segment: 'standard'
          },
          behavioral: {
            totalPurchases: Math.floor(Math.random() * 10),
            avgOrderValue: Math.random() * 200 + 50,
            lifetimeValue: Math.random() * 2000 + 100,
            churnRisk: Math.random(),
            engagementScore: Math.floor(Math.random() * 100),
            preferredChannels: ['email'],
            activityLevel: Math.random() > 0.5 ? 'high' : 'medium'
          },
          contextual: {
            currentTime: new Date(),
            deviceType: Math.random() > 0.5 ? 'mobile' : 'desktop',
            sessionDuration: Math.floor(Math.random() * 600) + 60,
            pageViews: Math.floor(Math.random() * 10) + 1
          },
          preferences: {
            communicationFrequency: 'medium',
            contentTypes: ['promotional'],
            topics: ['technology'],
            optedOutChannels: []
          }
        }));
        
        const insights = await insightsGenerator.generateInsights(
          recentDecisions,
          performanceMetrics,
          customerContexts
        );
        
        set({ insights });
        
        console.log(`[AIStore] Generated ${insights.length} insights`);
        
      } catch (error) {
        console.error('[AIStore] Failed to generate insights:', error);
        set({ error: 'Failed to generate insights' });
      }
    },
    
    dismissInsight: (insightId: string, reason?: string) => {
      const { insightsGenerator } = get();
      
      if (!insightsGenerator) return;
      
      insightsGenerator.dismissInsight(insightId, reason);
      
      set(state => ({
        insights: state.insights.map(insight => 
          insight.id === insightId 
            ? { ...insight, dismissed: true }
            : insight
        )
      }));
    },
    
    recordInsightAction: (insightId: string, action: string) => {
      const { insightsGenerator } = get();
      
      if (!insightsGenerator) return;
      
      insightsGenerator.recordActionTaken(insightId, action);
      
      set(state => ({
        insights: state.insights.map(insight => 
          insight.id === insightId 
            ? { 
                ...insight, 
                actions_taken: [...(insight.actions_taken || []), action]
              }
            : insight
        )
      }));
    },
    
    updateCustomerFeatures: async (
      customerId: string, 
      tenantId: string, 
      features: { [key: string]: any }
    ) => {
      const { featureStore } = get();
      
      if (!featureStore) {
        throw new Error('Feature store not initialized');
      }
      
      try {
        await featureStore.updateCustomerFeatures(customerId, tenantId, features);
      } catch (error) {
        console.error('[AIStore] Failed to update customer features:', error);
        set({ error: 'Failed to update customer features' });
      }
    },
    
    getCustomerFeatures: async (customerId: string, tenantId: string): Promise<{ [key: string]: any }> => {
      const { featureStore } = get();
      
      if (!featureStore) {
        throw new Error('Feature store not initialized');
      }
      
      try {
        return await featureStore.getCustomerFeatures(customerId, tenantId);
      } catch (error) {
        console.error('[AIStore] Failed to get customer features:', error);
        return {};
      }
    },
    
    setSelectedModel: (modelId: string | null) => {
      set({ selectedModel: modelId });
    },
    
    setSelectedExperiment: (experimentId: string | null) => {
      set({ selectedExperiment: experimentId });
    },
    
    updateDashboardFilters: (filters: Partial<AIState['dashboardFilters']>) => {
      set(state => ({
        dashboardFilters: { ...state.dashboardFilters, ...filters }
      }));
    },
    
    clearError: () => {
      set({ error: null });
    },
    
    updateSystemMetrics: () => {
      const { recentDecisions, experiments, models } = get();
      
      const totalDecisions = recentDecisions.length;
      const avgDecisionTime = totalDecisions > 0 
        ? recentDecisions.reduce((sum, d) => sum + d.executionTimeMs, 0) / totalDecisions 
        : 0;
      const avgConfidence = totalDecisions > 0
        ? recentDecisions.reduce((sum, d) => sum + d.overallConfidence, 0) / totalDecisions
        : 0;
      const activeExperiments = experiments.filter(e => e.status === 'running').length;
      const deployedModels = models.filter(m => m.status === 'deployed');
      const modelAccuracy = deployedModels.length > 0
        ? deployedModels.reduce((sum, m) => sum + m.performance.accuracy, 0) / deployedModels.length
        : 0;
      
      // Determine system health
      let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (avgDecisionTime > 100 || modelAccuracy < 0.7) {
        systemHealth = 'warning';
      }
      if (avgDecisionTime > 200 || modelAccuracy < 0.5 || deployedModels.length === 0) {
        systemHealth = 'critical';
      }
      
      set({
        systemMetrics: {
          totalDecisions,
          avgDecisionTime,
          avgConfidence,
          activeExperiments,
          modelAccuracy,
          systemHealth
        }
      });
    },
    
    recordDecisionMetric: (result: DecisionResult) => {
      // Simulate performance metric recording
      const performanceMetric: ModelPerformanceMetrics = {
        modelId: 'decision_engine',
        timestamp: new Date(),
        metrics: {
          accuracy: result.overallConfidence,
          precision: result.overallConfidence * 0.95,
          recall: result.overallConfidence * 0.9,
          f1Score: result.overallConfidence * 0.92,
          latency: result.executionTimeMs,
          throughput: 1000 / result.executionTimeMs // Requests per second
        },
        dataQuality: {
          missingValues: Math.random() * 0.1,
          outliers: Math.random() * 0.05,
          drift: Math.random() * 0.2,
          bias: Math.random() * 0.1
        },
        businessMetrics: {
          conversionRate: 0.15,
          revenue: result.recommendations.reduce((sum, rec) => sum + rec.expectedValue, 0),
          customerSatisfaction: 4.2,
          retention: 0.85
        }
      };
      
      set(state => ({
        performanceMetrics: [performanceMetric, ...state.performanceMetrics.slice(0, 999)]
      }));
      
      // Update system metrics
      get().updateSystemMetrics();
    }
  }))
);

// Auto-initialize AI services when store is created
useAIStore.getState().initializeAI();

// Subscribe to state changes for logging
useAIStore.subscribe(
  (state) => state.systemMetrics,
  (metrics) => {
    console.log('[AIStore] System metrics updated:', metrics);
  }
);

export type { AIStore, AIState, AIActions };