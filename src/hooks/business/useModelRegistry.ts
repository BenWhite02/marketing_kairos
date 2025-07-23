// src/hooks/business/useModelRegistry.ts

import { useState, useCallback, useEffect } from 'react';
import { useAIStore } from '../../stores/business/aiStore';
import { MLModel, ModelPerformanceMetrics } from '../../types/ai';

export const useModelRegistry = () => {
  const [selectedModelDetails, setSelectedModelDetails] = useState<MLModel | null>(null);
  const [modelPerformance, setModelPerformance] = useState<ModelPerformanceMetrics[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  
  const {
    models,
    selectedModel,
    setSelectedModel,
    deployModel,
    updateModelStatus,
    getModelPerformance,
    performanceMetrics,
    isInitialized,
    error
  } = useAIStore();

  /**
   * Deploy a model to production
   */
  const handleDeployModel = useCallback(async (modelId: string) => {
    setIsDeploying(true);
    try {
      await deployModel(modelId);
      console.log(`[useModelRegistry] Model ${modelId} deployed successfully`);
    } catch (error) {
      console.error(`[useModelRegistry] Failed to deploy model ${modelId}:`, error);
    } finally {
      setIsDeploying(false);
    }
  }, [deployModel]);

  /**
   * Update model status
   */
  const handleUpdateModelStatus = useCallback(async (
    modelId: string, 
    status: MLModel['status']
  ) => {
    try {
      await updateModelStatus(modelId, status);
      console.log(`[useModelRegistry] Model ${modelId} status updated to ${status}`);
    } catch (error) {
      console.error(`[useModelRegistry] Failed to update model status:`, error);
    }
  }, [updateModelStatus]);

  /**
   * Select a model and load its details
   */
  const selectModel = useCallback((modelId: string | null) => {
    setSelectedModel(modelId);
    
    if (modelId) {
      const model = models.find(m => m.id === modelId);
      setSelectedModelDetails(model || null);
      
      // Load performance metrics for the selected model
      const metrics = performanceMetrics.filter(m => m.modelId === modelId);
      setModelPerformance(metrics);
    } else {
      setSelectedModelDetails(null);
      setModelPerformance([]);
    }
  }, [setSelectedModel, models, performanceMetrics]);

  /**
   * Get models by status
   */
  const getModelsByStatus = useCallback((status: MLModel['status']) => {
    return models.filter(model => model.status === status);
  }, [models]);

  /**
   * Get models by purpose
   */
  const getModelsByPurpose = useCallback((purpose: MLModel['purpose']) => {
    return models.filter(model => model.purpose === purpose);
  }, [models]);

  /**
   * Get model statistics
   */
  const getModelStats = useCallback(() => {
    const totalModels = models.length;
    const deployedModels = models.filter(m => m.status === 'deployed').length;
    const trainingModels = models.filter(m => m.status === 'training').length;
    const errorModels = models.filter(m => m.status === 'error').length;
    
    const avgAccuracy = models.length > 0 
      ? models.reduce((sum, m) => sum + m.performance.accuracy, 0) / models.length
      : 0;
    
    const avgLatency = models.length > 0
      ? models.reduce((sum, m) => sum + m.performance.latency, 0) / models.length
      : 0;

    return {
      totalModels,
      deployedModels,
      trainingModels,
      errorModels,
      avgAccuracy,
      avgLatency,
      deploymentRate: totalModels > 0 ? (deployedModels / totalModels) * 100 : 0
    };
  }, [models]);

  /**
   * Get performance summary for selected model
   */
  const getSelectedModelPerformance = useCallback(() => {
    if (!selectedModelDetails) return null;
    
    const recentMetrics = modelPerformance.slice(-10); // Last 10 metrics
    
    if (recentMetrics.length === 0) return null;
    
    const avgAccuracy = recentMetrics.reduce((sum, m) => sum + m.metrics.accuracy, 0) / recentMetrics.length;
    const avgLatency = recentMetrics.reduce((sum, m) => sum + m.metrics.latency, 0) / recentMetrics.length;
    const avgThroughput = recentMetrics.reduce((sum, m) => sum + m.metrics.throughput, 0) / recentMetrics.length;
    
    // Calculate trend (improving/degrading/stable)
    let trend: 'improving' | 'stable' | 'degrading' = 'stable';
    if (recentMetrics.length >= 5) {
      const recent = recentMetrics.slice(-3);
      const earlier = recentMetrics.slice(-6, -3);
      
      const recentAvgAccuracy = recent.reduce((sum, m) => sum + m.metrics.accuracy, 0) / recent.length;
      const earlierAvgAccuracy = earlier.reduce((sum, m) => sum + m.metrics.accuracy, 0) / earlier.length;
      
      if (recentAvgAccuracy > earlierAvgAccuracy + 0.02) {
        trend = 'improving';
      } else if (recentAvgAccuracy < earlierAvgAccuracy - 0.02) {
        trend = 'degrading';
      }
    }
    
    return {
      modelId: selectedModelDetails.id,
      avgAccuracy,
      avgLatency,
      avgThroughput,
      trend,
      dataPoints: recentMetrics.length,
      lastEvaluated: recentMetrics[recentMetrics.length - 1]?.timestamp
    };
  }, [selectedModelDetails, modelPerformance]);

  /**
   * Check if model can be deployed
   */
  const canDeployModel = useCallback((modelId: string) => {
    const model = models.find(m => m.id === modelId);
    return model && model.status === 'ready' && !isDeploying;
  }, [models, isDeploying]);

  /**
   * Get model comparison data
   */
  const getModelComparison = useCallback((modelIds: string[]) => {
    const comparisonModels = models.filter(m => modelIds.includes(m.id));
    
    return comparisonModels.map(model => ({
      id: model.id,
      name: model.name,
      accuracy: model.performance.accuracy,
      latency: model.performance.latency,
      throughput: model.performance.throughput,
      status: model.status,
      purpose: model.purpose,
      lastTrained: model.metadata.lastTrained
    }));
  }, [models]);

  // Auto-select first deployed model if none selected
  useEffect(() => {
    if (!selectedModel && models.length > 0) {
      const deployedModel = models.find(m => m.status === 'deployed');
      if (deployedModel) {
        selectModel(deployedModel.id);
      }
    }
  }, [models, selectedModel, selectModel]);

  // Update selected model details when models change
  useEffect(() => {
    if (selectedModel) {
      const model = models.find(m => m.id === selectedModel);
      setSelectedModelDetails(model || null);
    }
  }, [models, selectedModel]);

  return {
    // Core data
    models,
    selectedModel,
    selectedModelDetails,
    modelPerformance,
    
    // Actions
    selectModel,
    deployModel: handleDeployModel,
    updateModelStatus: handleUpdateModelStatus,
    
    // Queries
    getModelsByStatus,
    getModelsByPurpose,
    getModelStats,
    getSelectedModelPerformance,
    getModelComparison,
    
    // State
    isDeploying,
    isInitialized,
    error,
    
    // Utilities
    canDeployModel,
    
    // Computed stats
    stats: getModelStats(),
    selectedModelPerformance: getSelectedModelPerformance()
  };
};

// src/hooks/business/useExperimentation.ts

import { useState, useCallback, useEffect } from 'react';
import { useAIStore } from '../../stores/business/aiStore';
import { Experiment, ExperimentResults, ExperimentVariant } from '../../types/ai';

export const useExperimentation = () => {
  const [selectedExperimentResults, setSelectedExperimentResults] = useState<ExperimentResults | null>(null);
  const [isCreatingExperiment, setIsCreatingExperiment] = useState(false);
  const [isStartingExperiment, setIsStartingExperiment] = useState(false);
  
  const {
    experiments,
    selectedExperiment,
    setSelectedExperiment,
    createExperiment,
    startExperiment,
    stopExperiment,
    getExperimentResults,
    trackConversion,
    isInitialized,
    error
  } = useAIStore();

  /**
   * Create a new experiment
   */
  const handleCreateExperiment = useCallback(async (experiment: Experiment) => {
    setIsCreatingExperiment(true);
    try {
      await createExperiment(experiment);
      console.log(`[useExperimentation] Experiment ${experiment.id} created successfully`);
      return true;
    } catch (error) {
      console.error('[useExperimentation] Failed to create experiment:', error);
      return false;
    } finally {
      setIsCreatingExperiment(false);
    }
  }, [createExperiment]);

  /**
   * Start an experiment
   */
  const handleStartExperiment = useCallback(async (experimentId: string) => {
    setIsStartingExperiment(true);
    try {
      await startExperiment(experimentId);
      console.log(`[useExperimentation] Experiment ${experimentId} started successfully`);
      return true;
    } catch (error) {
      console.error(`[useExperimentation] Failed to start experiment ${experimentId}:`, error);
      return false;
    } finally {
      setIsStartingExperiment(false);
    }
  }, [startExperiment]);

  /**
   * Stop an experiment
   */
  const handleStopExperiment = useCallback(async (experimentId: string) => {
    try {
      await stopExperiment(experimentId);
      console.log(`[useExperimentation] Experiment ${experimentId} stopped successfully`);
      return true;
    } catch (error) {
      console.error(`[useExperimentation] Failed to stop experiment ${experimentId}:`, error);
      return false;
    }
  }, [stopExperiment]);

  /**
   * Select an experiment and load its results
   */
  const selectExperiment = useCallback(async (experimentId: string | null) => {
    setSelectedExperiment(experimentId);
    
    if (experimentId) {
      try {
        const results = await getExperimentResults(experimentId);
        setSelectedExperimentResults(results);
      } catch (error) {
        console.error(`[useExperimentation] Failed to load results for experiment ${experimentId}:`, error);
        setSelectedExperimentResults(null);
      }
    } else {
      setSelectedExperimentResults(null);
    }
  }, [setSelectedExperiment, getExperimentResults]);

  /**
   * Track a conversion for an experiment
   */
  const handleTrackConversion = useCallback(async (
    experimentId: string,
    customerId: string,
    tenantId: string,
    metric: string,
    value: number
  ) => {
    try {
      await trackConversion(experimentId, customerId, tenantId, metric, value);
      
      // Refresh results if this is the selected experiment
      if (experimentId === selectedExperiment) {
        const results = await getExperimentResults(experimentId);
        setSelectedExperimentResults(results);
      }
      
      return true;
    } catch (error) {
      console.error('[useExperimentation] Failed to track conversion:', error);
      return false;
    }
  }, [trackConversion, selectedExperiment, getExperimentResults]);

  /**
   * Get experiments by status
   */
  const getExperimentsByStatus = useCallback((status: Experiment['status']) => {
    return experiments.filter(exp => exp.status === status);
  }, [experiments]);

  /**
   * Get experiment statistics
   */
  const getExperimentStats = useCallback(() => {
    const totalExperiments = experiments.length;
    const runningExperiments = experiments.filter(e => e.status === 'running').length;
    const completedExperiments = experiments.filter(e => e.status === 'completed').length;
    const draftExperiments = experiments.filter(e => e.status === 'draft').length;
    
    const experimentsWithResults = experiments.filter(e => e.results).length;
    const significantResults = experiments.filter(e => 
      e.results && e.results.confidence > 0.95
    ).length;

    return {
      totalExperiments,
      runningExperiments,
      completedExperiments,
      draftExperiments,
      experimentsWithResults,
      significantResults,
      completionRate: totalExperiments > 0 ? (completedExperiments / totalExperiments) * 100 : 0,
      significanceRate: experimentsWithResults > 0 ? (significantResults / experimentsWithResults) * 100 : 0
    };
  }, [experiments]);

  /**
   * Create experiment template
   */
  const createExperimentTemplate = useCallback((
    name: string,
    description: string,
    variants: ExperimentVariant[],
    primaryMetric: string
  ): Experiment => {
    return {
      id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      status: 'draft',
      type: 'ab_test',
      startDate: new Date(),
      targetAudience: {
        criteria: 'all_active_users',
        size: 10000,
        allocation: variants.reduce((acc, variant) => {
          acc[variant.id] = variant.allocation;
          return acc;
        }, {} as { [variantId: string]: number })
      },
      variants,
      metrics: {
        primary: primaryMetric,
        secondary: ['conversion_rate', 'engagement_rate']
      },
      configuration: {
        confidenceLevel: 0.95,
        minimumDetectableEffect: 0.05,
        trafficAllocation: 0.5,
        randomizationUnit: 'customer'
      }
    };
  }, []);

  /**
   * Validate experiment configuration
   */
  const validateExperiment = useCallback((experiment: Experiment): string[] => {
    const errors: string[] = [];
    
    if (!experiment.name) errors.push('Experiment name is required');
    if (!experiment.variants || experiment.variants.length < 2) {
      errors.push('At least 2 variants are required');
    }
    
    if (experiment.variants) {
      const totalAllocation = experiment.variants.reduce((sum, v) => sum + v.allocation, 0);
      if (Math.abs(totalAllocation - 1) > 0.01) {
        errors.push('Variant allocations must sum to 1.0');
      }
    }
    
    if (experiment.targetAudience.size <= 0) {
      errors.push('Target audience size must be positive');
    }
    
    return errors;
  }, []);

  // Auto-refresh results for selected experiment
  useEffect(() => {
    if (selectedExperiment) {
      const interval = setInterval(async () => {
        try {
          const results = await getExperimentResults(selectedExperiment);
          setSelectedExperimentResults(results);
        } catch (error) {
          console.error('[useExperimentation] Failed to refresh experiment results:', error);
        }
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [selectedExperiment, getExperimentResults]);

  return {
    // Core data
    experiments,
    selectedExperiment,
    selectedExperimentResults,
    
    // Actions
    createExperiment: handleCreateExperiment,
    startExperiment: handleStartExperiment,
    stopExperiment: handleStopExperiment,
    selectExperiment,
    trackConversion: handleTrackConversion,
    
    // Queries
    getExperimentsByStatus,
    getExperimentStats,
    
    // Templates and validation
    createExperimentTemplate,
    validateExperiment,
    
    // State
    isCreatingExperiment,
    isStartingExperiment,
    isInitialized,
    error,
    
    // Computed stats
    stats: getExperimentStats()
  };
};