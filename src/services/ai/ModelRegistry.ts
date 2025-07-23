// src/services/ai/ModelRegistry.ts

import { MLModel, ModelPerformanceMetrics } from '../../types/ai';

export class ModelRegistry {
  private models: Map<string, MLModel> = new Map();
  private performanceHistory: Map<string, ModelPerformanceMetrics[]> = new Map();
  private deploymentQueue: Map<string, 'pending' | 'deploying' | 'deployed' | 'failed'> = new Map();

  constructor() {
    this.initializeDefaultModels();
  }

  /**
   * Register a new model in the registry
   */
  async registerModel(model: MLModel): Promise<void> {
    console.log(`[ModelRegistry] Registering model: ${model.name} v${model.version}`);
    
    // Validate model configuration
    this.validateModel(model);
    
    // Store the model
    this.models.set(model.id, model);
    
    // Initialize performance tracking
    this.performanceHistory.set(model.id, []);
    
    console.log(`[ModelRegistry] Model registered successfully: ${model.id}`);
  }

  /**
   * Get a model by ID
   */
  getModel(modelId: string): MLModel | undefined {
    return this.models.get(modelId);
  }

  /**
   * Get all models with optional filtering
   */
  getModels(filters?: {
    status?: MLModel['status'];
    type?: MLModel['type'];
    purpose?: MLModel['purpose'];
    environment?: string;
  }): MLModel[] {
    let models = Array.from(this.models.values());
    
    if (filters) {
      if (filters.status) {
        models = models.filter(m => m.status === filters.status);
      }
      if (filters.type) {
        models = models.filter(m => m.type === filters.type);
      }
      if (filters.purpose) {
        models = models.filter(m => m.purpose === filters.purpose);
      }
      if (filters.environment) {
        models = models.filter(m => m.deployment.environment === filters.environment);
      }
    }
    
    return models;
  }

  /**
   * Get deployed models for decision making
   */
  getDeployedModels(): MLModel[] {
    return this.getModels({ status: 'deployed' });
  }

  /**
   * Update model status
   */
  async updateModelStatus(modelId: string, status: MLModel['status']): Promise<void> {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }
    
    console.log(`[ModelRegistry] Updating model ${modelId} status: ${model.status} -> ${status}`);
    
    model.status = status;
    this.models.set(modelId, model);
    
    // Update deployment queue if needed
    if (status === 'deployed') {
      this.deploymentQueue.set(modelId, 'deployed');
    }
  }

  /**
   * Deploy a model to production
   */
  async deployModel(modelId: string, environment: string = 'production'): Promise<void> {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }
    
    if (model.status !== 'ready') {
      throw new Error(`Model ${modelId} is not ready for deployment. Current status: ${model.status}`);
    }
    
    console.log(`[ModelRegistry] Deploying model ${modelId} to ${environment}`);
    
    this.deploymentQueue.set(modelId, 'deploying');
    
    try {
      // Simulate deployment process
      await this.simulateDeployment(model, environment);
      
      // Update model status and environment
      model.status = 'deployed';
      model.deployment.environment = environment as any;
      
      this.deploymentQueue.set(modelId, 'deployed');
      this.models.set(modelId, model);
      
      console.log(`[ModelRegistry] Model ${modelId} deployed successfully to ${environment}`);
      
    } catch (error) {
      this.deploymentQueue.set(modelId, 'failed');
      model.status = 'error';
      this.models.set(modelId, model);
      
      console.error(`[ModelRegistry] Failed to deploy model ${modelId}:`, error);
      throw error;
    }
  }

  /**
   * Rollback to previous model version
   */
  async rollbackModel(modelId: string, targetVersion: string): Promise<void> {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }
    
    console.log(`[ModelRegistry] Rolling back model ${modelId} to version ${targetVersion}`);
    
    // In a real implementation, this would:
    // 1. Find the target version in version history
    // 2. Redeploy that version
    // 3. Update routing to use the old version
    
    // For now, simulate rollback
    const previousVersion = this.findPreviousVersion(modelId, targetVersion);
    if (previousVersion) {
      await this.deployModel(previousVersion.id);
      console.log(`[ModelRegistry] Rollback completed for model ${modelId}`);
    } else {
      throw new Error(`Target version ${targetVersion} not found for model ${modelId}`);
    }
  }

  /**
   * Record model performance metrics
   */
  recordPerformance(modelId: string, metrics: ModelPerformanceMetrics): void {
    const history = this.performanceHistory.get(modelId) || [];
    history.push(metrics);
    
    // Keep only last 1000 metrics to prevent memory issues
    if (history.length > 1000) {
      history.shift();
    }
    
    this.performanceHistory.set(modelId, history);
    
    // Update model performance in registry
    const model = this.models.get(modelId);
    if (model) {
      model.performance = {
        ...model.performance,
        accuracy: metrics.metrics.accuracy,
        latency: metrics.metrics.latency,
        throughput: metrics.metrics.throughput,
        lastEvaluated: metrics.timestamp
      };
      
      // Check for performance degradation
      this.checkPerformanceDrift(model, metrics);
      
      this.models.set(modelId, model);
    }
  }

  /**
   * Get model performance history
   */
  getPerformanceHistory(modelId: string, limit: number = 100): ModelPerformanceMetrics[] {
    const history = this.performanceHistory.get(modelId) || [];
    return history.slice(-limit);
  }

  /**
   * Get model performance summary
   */
  getPerformanceSummary(modelId: string): {
    current: ModelPerformanceMetrics | null;
    trend: 'improving' | 'stable' | 'degrading';
    averageLatency: number;
    averageAccuracy: number;
    totalPredictions: number;
  } {
    const history = this.getPerformanceHistory(modelId, 50);
    
    if (history.length === 0) {
      return {
        current: null,
        trend: 'stable',
        averageLatency: 0,
        averageAccuracy: 0,
        totalPredictions: 0
      };
    }
    
    const current = history[history.length - 1];
    const averageLatency = history.reduce((sum, m) => sum + m.metrics.latency, 0) / history.length;
    const averageAccuracy = history.reduce((sum, m) => sum + m.metrics.accuracy, 0) / history.length;
    
    // Calculate trend (simplified)
    let trend: 'improving' | 'stable' | 'degrading' = 'stable';
    if (history.length >= 10) {
      const recent = history.slice(-5);
      const earlier = history.slice(-10, -5);
      
      const recentAvgAccuracy = recent.reduce((sum, m) => sum + m.metrics.accuracy, 0) / recent.length;
      const earlierAvgAccuracy = earlier.reduce((sum, m) => sum + m.metrics.accuracy, 0) / earlier.length;
      
      if (recentAvgAccuracy > earlierAvgAccuracy + 0.02) {
        trend = 'improving';
      } else if (recentAvgAccuracy < earlierAvgAccuracy - 0.02) {
        trend = 'degrading';
      }
    }
    
    return {
      current,
      trend,
      averageLatency,
      averageAccuracy,
      totalPredictions: history.length
    };
  }

  /**
   * Auto-retrain model based on performance degradation
   */
  async scheduleRetraining(modelId: string, reason: string): Promise<void> {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }
    
    console.log(`[ModelRegistry] Scheduling retraining for model ${modelId}: ${reason}`);
    
    // Update model status to training
    model.status = 'training';
    model.metadata.lastTrained = new Date();
    this.models.set(modelId, model);
    
    // In a real implementation, this would:
    // 1. Queue a training job
    // 2. Prepare training data
    // 3. Start the training process
    // 4. Validate the new model
    // 5. Deploy if performance is better
    
    // Simulate training process
    setTimeout(async () => {
      try {
        await this.simulateTraining(model);
        console.log(`[ModelRegistry] Retraining completed for model ${modelId}`);
      } catch (error) {
        console.error(`[ModelRegistry] Retraining failed for model ${modelId}:`, error);
        model.status = 'error';
        this.models.set(modelId, model);
      }
    }, 5000); // 5 second simulation
  }

  /**
   * Get model comparison metrics
   */
  compareModels(modelIds: string[]): {
    models: MLModel[];
    comparison: {
      accuracy: { [modelId: string]: number };
      latency: { [modelId: string]: number };
      throughput: { [modelId: string]: number };
    };
  } {
    const models = modelIds.map(id => this.models.get(id)).filter(Boolean) as MLModel[];
    
    const comparison = {
      accuracy: {} as { [modelId: string]: number },
      latency: {} as { [modelId: string]: number },
      throughput: {} as { [modelId: string]: number }
    };
    
    models.forEach(model => {
      comparison.accuracy[model.id] = model.performance.accuracy;
      comparison.latency[model.id] = model.performance.latency;
      comparison.throughput[model.id] = model.performance.throughput;
    });
    
    return { models, comparison };
  }

  /**
   * Private helper methods
   */
  private validateModel(model: MLModel): void {
    if (!model.id) throw new Error('Model ID is required');
    if (!model.name) throw new Error('Model name is required');
    if (!model.version) throw new Error('Model version is required');
    if (!model.type) throw new Error('Model type is required');
    if (!model.purpose) throw new Error('Model purpose is required');
    
    // Check for duplicate IDs
    if (this.models.has(model.id)) {
      throw new Error(`Model with ID ${model.id} already exists`);
    }
  }

  private async simulateDeployment(model: MLModel, environment: string): Promise<void> {
    // Simulate deployment steps
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate potential deployment failure (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('Deployment failed: Infrastructure error');
    }
    
    console.log(`[ModelRegistry] Model ${model.id} deployment simulation completed`);
  }

  private async simulateTraining(model: MLModel): Promise<void> {
    // Simulate training process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Simulate improved performance after retraining
    model.performance.accuracy = Math.min(model.performance.accuracy + 0.02, 0.99);
    model.status = 'ready';
    
    this.models.set(model.id, model);
  }

  private findPreviousVersion(modelId: string, targetVersion: string): MLModel | null {
    // In a real implementation, this would query version history
    // For now, return null to indicate no previous version found
    return null;
  }

  private checkPerformanceDrift(model: MLModel, metrics: ModelPerformanceMetrics): void {
    const history = this.performanceHistory.get(model.id) || [];
    
    if (history.length < 10) return; // Need sufficient history
    
    // Check accuracy drift
    const recentAccuracy = metrics.metrics.accuracy;
    const baselineAccuracy = model.metadata.accuracy || 0.8;
    
    if (recentAccuracy < baselineAccuracy - 0.05) {
      console.warn(`[ModelRegistry] Performance drift detected for model ${model.id}: accuracy dropped from ${baselineAccuracy} to ${recentAccuracy}`);
      
      // Auto-schedule retraining if drift is significant
      if (recentAccuracy < baselineAccuracy - 0.1) {
        this.scheduleRetraining(model.id, 'Significant accuracy degradation detected');
      }
    }
    
    // Check latency drift
    if (metrics.metrics.latency > model.performance.latency * 2) {
      console.warn(`[ModelRegistry] Latency spike detected for model ${model.id}: ${metrics.metrics.latency}ms`);
    }
  }

  private initializeDefaultModels(): void {
    const defaultModels: MLModel[] = [
      {
        id: 'churn_prediction_v1',
        name: 'Customer Churn Prediction',
        version: '1.0.0',
        type: 'classification',
        purpose: 'churn_prediction',
        status: 'deployed',
        metadata: {
          description: 'Predicts likelihood of customer churn using historical behavior data',
          createdAt: new Date('2024-01-15'),
          lastTrained: new Date('2024-07-01'),
          accuracy: 0.87,
          precision: 0.84,
          recall: 0.89,
          f1Score: 0.86,
          features: ['recency', 'frequency', 'monetary', 'engagement_score', 'support_tickets', 'last_login_days'],
          targetVariable: 'will_churn',
          algorithm: 'Gradient Boosting',
          hyperparameters: {
            n_estimators: 150,
            max_depth: 8,
            learning_rate: 0.1,
            subsample: 0.8
          }
        },
        performance: {
          accuracy: 0.87,
          latency: 28,
          throughput: 850,
          memoryUsage: 256,
          lastEvaluated: new Date()
        },
        deployment: {
          environment: 'production',
          endpoint: '/api/v1/models/churn-prediction/predict',
          scalingConfig: {
            minInstances: 3,
            maxInstances: 15,
            targetCPU: 75
          }
        }
      },
      {
        id: 'clv_forecasting_v1',
        name: 'Customer Lifetime Value Forecasting',
        version: '1.0.0',
        type: 'regression',
        purpose: 'clv_forecasting',
        status: 'deployed',
        metadata: {
          description: 'Predicts customer lifetime value over next 12 months',
          createdAt: new Date('2024-02-01'),
          lastTrained: new Date('2024-06-15'),
          accuracy: 0.82,
          features: ['total_purchases', 'avg_order_value', 'frequency', 'recency', 'customer_age', 'segment'],
          targetVariable: 'clv_12m',
          algorithm: 'Random Forest',
          hyperparameters: {
            n_estimators: 200,
            max_depth: 12,
            min_samples_split: 5
          }
        },
        performance: {
          accuracy: 0.82,
          latency: 35,
          throughput: 600,
          memoryUsage: 384,
          lastEvaluated: new Date()
        },
        deployment: {
          environment: 'production',
          endpoint: '/api/v1/models/clv-forecasting/predict',
          scalingConfig: {
            minInstances: 2,
            maxInstances: 10,
            targetCPU: 70
          }
        }
      },
      {
        id: 'propensity_scoring_v1',
        name: 'Purchase Propensity Scoring',
        version: '1.0.0',
        type: 'classification',
        purpose: 'propensity_scoring',
        status: 'deployed',
        metadata: {
          description: 'Scores customer propensity to purchase within next 30 days',
          createdAt: new Date('2024-03-01'),
          lastTrained: new Date('2024-07-10'),
          accuracy: 0.79,
          precision: 0.76,
          recall: 0.82,
          f1Score: 0.79,
          features: ['browsing_sessions', 'cart_additions', 'email_opens', 'time_since_last_purchase', 'season'],
          targetVariable: 'will_purchase_30d',
          algorithm: 'XGBoost',
          hyperparameters: {
            n_estimators: 100,
            max_depth: 6,
            learning_rate: 0.15
          }
        },
        performance: {
          accuracy: 0.79,
          latency: 22,
          throughput: 1200,
          memoryUsage: 192,
          lastEvaluated: new Date()
        },
        deployment: {
          environment: 'production',
          endpoint: '/api/v1/models/propensity-scoring/predict',
          scalingConfig: {
            minInstances: 2,
            maxInstances: 12,
            targetCPU: 80
          }
        }
      }
    ];

    // Register all default models
    defaultModels.forEach(model => {
      this.models.set(model.id, model);
      this.performanceHistory.set(model.id, []);
    });

    console.log(`[ModelRegistry] Initialized with ${defaultModels.length} default models`);
  }
}