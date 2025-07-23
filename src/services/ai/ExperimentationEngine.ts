// src/services/ai/ExperimentationEngine.ts

import { Experiment, ExperimentVariant, ExperimentResults, DecisionRequest, DecisionResult } from '../../types/ai';

export class ExperimentationEngine {
  private experiments: Map<string, Experiment> = new Map();
  private variantAssignments: Map<string, { [experimentId: string]: string }> = new Map();
  private experimentResults: Map<string, any[]> = new Map();
  private statisticalTests: Map<string, any> = new Map();

  constructor() {
    this.initializeDefaultExperiments();
  }

  /**
   * Create a new A/B test experiment
   */
  async createExperiment(experiment: Experiment): Promise<void> {
    console.log(`[ExperimentationEngine] Creating experiment: ${experiment.name}`);
    
    // Validate experiment configuration
    this.validateExperiment(experiment);
    
    // Initialize experiment
    experiment.status = 'draft';
    this.experiments.set(experiment.id, experiment);
    this.experimentResults.set(experiment.id, []);
    
    console.log(`[ExperimentationEngine] Experiment created: ${experiment.id}`);
  }

  /**
   * Start an experiment
   */
  async startExperiment(experimentId: string): Promise<void> {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment not found: ${experimentId}`);
    }
    
    if (experiment.status !== 'draft') {
      throw new Error(`Cannot start experiment in status: ${experiment.status}`);
    }
    
    console.log(`[ExperimentationEngine] Starting experiment: ${experiment.name}`);
    
    experiment.status = 'running';
    experiment.startDate = new Date();
    
    this.experiments.set(experimentId, experiment);
    
    // Initialize statistical tracking
    this.initializeStatisticalTracking(experiment);
  }

  /**
   * Get variant assignment for a customer
   */
  async getVariantAssignment(
    experimentId: string, 
    customerId: string, 
    tenantId: string
  ): Promise<string | null> {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'running') {
      return null;
    }
    
    const customerKey = `${tenantId}:${customerId}`;
    let assignments = this.variantAssignments.get(customerKey);
    
    if (!assignments) {
      assignments = {};
      this.variantAssignments.set(customerKey, assignments);
    }
    
    // Check if customer already has assignment
    if (assignments[experimentId]) {
      return assignments[experimentId];
    }
    
    // Check if customer is eligible for experiment
    const isEligible = await this.isCustomerEligible(experiment, customerId, tenantId);
    if (!isEligible) {
      return null;
    }
    
    // Assign variant using deterministic hash
    const variantId = this.assignVariant(experiment, customerId);
    assignments[experimentId] = variantId;
    
    this.variantAssignments.set(customerKey, assignments);
    
    console.log(`[ExperimentationEngine] Assigned customer ${customerId} to variant ${variantId} in experiment ${experimentId}`);
    
    return variantId;
  }

  /**
   * Apply experimentation to decision request
   */
  async applyExperiments(request: DecisionRequest): Promise<{
    request: DecisionRequest;
    experimentsApplied: string[];
  }> {
    const experimentsApplied: string[] = [];
    let modifiedRequest = { ...request };
    
    // Get active experiments
    const activeExperiments = this.getActiveExperiments();
    
    for (const experiment of activeExperiments) {
      const variantId = await this.getVariantAssignment(
        experiment.id, 
        request.customerId, 
        request.tenantId
      );
      
      if (variantId) {
        const variant = experiment.variants.find(v => v.id === variantId);
        if (variant) {
          // Apply variant configuration to request
          modifiedRequest = this.applyVariantConfiguration(modifiedRequest, variant);
          experimentsApplied.push(experiment.id);
        }
      }
    }
    
    return {
      request: modifiedRequest,
      experimentsApplied
    };
  }

  /**
   * Track experiment conversion event
   */
  async trackConversion(
    experimentId: string,
    customerId: string,
    tenantId: string,
    metric: string,
    value: number,
    metadata?: { [key: string]: any }
  ): Promise<void> {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'running') {
      return;
    }
    
    const customerKey = `${tenantId}:${customerId}`;
    const assignments = this.variantAssignments.get(customerKey);
    
    if (!assignments || !assignments[experimentId]) {
      return; // Customer not in experiment
    }
    
    const variantId = assignments[experimentId];
    const conversionEvent = {
      experimentId,
      customerId,
      tenantId,
      variantId,
      metric,
      value,
      timestamp: new Date(),
      metadata: metadata || {}
    };
    
    // Store conversion event
    const results = this.experimentResults.get(experimentId) || [];
    results.push(conversionEvent);
    this.experimentResults.set(experimentId, results);
    
    console.log(`[ExperimentationEngine] Tracked conversion for experiment ${experimentId}, variant ${variantId}: ${metric} = ${value}`);
    
    // Update experiment statistics
    await this.updateExperimentStatistics(experimentId);
  }

  /**
   * Get experiment results and statistical analysis
   */
  async getExperimentResults(experimentId: string): Promise<ExperimentResults | null> {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      return null;
    }
    
    const events = this.experimentResults.get(experimentId) || [];
    if (events.length === 0) {
      return {
        status: 'running',
        results: {},
        insights: ['No data collected yet'],
        recommendations: ['Wait for more data before drawing conclusions'],
        confidence: 0
      };
    }
    
    // Calculate results for each variant
    const variantResults: { [variantId: string]: any } = {};
    
    for (const variant of experiment.variants) {
      const variantEvents = events.filter(e => e.variantId === variant.id);
      const participants = new Set(variantEvents.map(e => e.customerId)).size;
      
      // Calculate primary metric
      const primaryMetricEvents = variantEvents.filter(e => e.metric === experiment.metrics.primary);
      const conversions = primaryMetricEvents.length;
      const conversionRate = participants > 0 ? conversions / participants : 0;
      const revenue = primaryMetricEvents.reduce((sum, e) => sum + e.value, 0);
      const revenuePerUser = participants > 0 ? revenue / participants : 0;
      
      variantResults[variant.id] = {
        participants,
        conversions,
        conversionRate,
        revenue,
        revenuePerUser,
        significance: 0, // Will be calculated below
        confidenceInterval: [conversionRate * 0.9, conversionRate * 1.1] as [number, number]
      };
    }
    
    // Statistical significance testing
    const { winner, confidence, significance } = this.calculateStatisticalSignificance(
      experiment,
      variantResults
    );
    
    // Update significance in results
    Object.keys(variantResults).forEach(variantId => {
      variantResults[variantId].significance = significance[variantId] || 0;
    });
    
    // Generate insights and recommendations
    const insights = this.generateInsights(experiment, variantResults);
    const recommendations = this.generateRecommendations(experiment, variantResults, confidence);
    
    const results: ExperimentResults = {
      status: confidence > 0.95 ? 'completed' : 'running',
      winner: confidence > 0.95 ? winner : undefined,
      confidence,
      results: variantResults,
      insights,
      recommendations
    };
    
    // Update experiment with results
    experiment.results = results;
    this.experiments.set(experimentId, experiment);
    
    return results;
  }

  /**
   * Stop an experiment
   */
  async stopExperiment(experimentId: string, reason: string = 'Manual stop'): Promise<void> {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment not found: ${experimentId}`);
    }
    
    console.log(`[ExperimentationEngine] Stopping experiment: ${experiment.name}, Reason: ${reason}`);
    
    experiment.status = 'completed';
    experiment.endDate = new Date();
    
    // Get final results
    const finalResults = await this.getExperimentResults(experimentId);
    experiment.results = finalResults || undefined;
    
    this.experiments.set(experimentId, experiment);
  }

  /**
   * Get list of experiments with filtering
   */
  getExperiments(filters?: {
    status?: Experiment['status'];
    type?: Experiment['type'];
  }): Experiment[] {
    let experiments = Array.from(this.experiments.values());
    
    if (filters) {
      if (filters.status) {
        experiments = experiments.filter(e => e.status === filters.status);
      }
      if (filters.type) {
        experiments = experiments.filter(e => e.type === filters.type);
      }
    }
    
    return experiments;
  }

  /**
   * Get active experiments that are currently running
   */
  getActiveExperiments(): Experiment[] {
    return this.getExperiments({ status: 'running' });
  }

  /**
   * Multi-Armed Bandit optimization
   */
  async optimizeWithBandit(
    experimentId: string,
    customerId: string,
    tenantId: string
  ): Promise<string | null> {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.type !== 'bandit') {
      return null;
    }
    
    const results = await this.getExperimentResults(experimentId);
    if (!results) {
      // No data yet, use random assignment
      return this.assignVariant(experiment, customerId);
    }
    
    // Use Thompson Sampling for bandit optimization
    const selectedVariant = this.thompsonSampling(experiment, results);
    
    // Track the assignment
    const customerKey = `${tenantId}:${customerId}`;
    let assignments = this.variantAssignments.get(customerKey) || {};
    assignments[experimentId] = selectedVariant;
    this.variantAssignments.set(customerKey, assignments);
    
    return selectedVariant;
  }

  /**
   * Private helper methods
   */
  private validateExperiment(experiment: Experiment): void {
    if (!experiment.id) throw new Error('Experiment ID is required');
    if (!experiment.name) throw new Error('Experiment name is required');
    if (!experiment.variants || experiment.variants.length < 2) {
      throw new Error('At least 2 variants are required');
    }
    
    // Validate allocation percentages sum to 1
    const totalAllocation = experiment.variants.reduce((sum, v) => sum + v.allocation, 0);
    if (Math.abs(totalAllocation - 1) > 0.01) {
      throw new Error('Variant allocations must sum to 1.0');
    }
    
    // Validate target audience size
    if (experiment.targetAudience.size <= 0) {
      throw new Error('Target audience size must be positive');
    }
  }

  private async isCustomerEligible(
    experiment: Experiment,
    customerId: string,
    tenantId: string
  ): Promise<boolean> {
    // In production, this would evaluate the experiment's target audience criteria
    // For now, use random sampling based on traffic allocation
    const hash = this.hashString(`${tenantId}:${customerId}:${experiment.id}`);
    const randomValue = (hash % 10000) / 10000; // 0-1
    
    return randomValue < experiment.configuration.trafficAllocation;
  }

  private assignVariant(experiment: Experiment, customerId: string): string {
    // Use deterministic hash-based assignment for consistency
    const hash = this.hashString(`${customerId}:${experiment.id}`);
    const randomValue = (hash % 10000) / 10000; // 0-1
    
    let cumulativeAllocation = 0;
    for (const variant of experiment.variants) {
      cumulativeAllocation += variant.allocation;
      if (randomValue <= cumulativeAllocation) {
        return variant.id;
      }
    }
    
    // Fallback to first variant
    return experiment.variants[0].id;
  }

  private applyVariantConfiguration(
    request: DecisionRequest,
    variant: ExperimentVariant
  ): DecisionRequest {
    const modifiedRequest = { ...request };
    
    // Apply variant-specific configurations
    if (variant.configuration.parameters) {
      // Modify request parameters based on variant config
      modifiedRequest.options = {
        ...modifiedRequest.options,
        ...variant.configuration.parameters
      };
    }
    
    if (variant.configuration.modelId) {
      // Could influence model selection (implementation specific)
      modifiedRequest.options = {
        ...modifiedRequest.options,
        preferredModelId: variant.configuration.modelId
      };
    }
    
    return modifiedRequest;
  }

  private initializeStatisticalTracking(experiment: Experiment): void {
    const tracking = {
      startTime: Date.now(),
      totalAssignments: 0,
      variantAssignments: {} as { [variantId: string]: number },
      conversionsByVariant: {} as { [variantId: string]: number }
    };
    
    // Initialize variant tracking
    experiment.variants.forEach(variant => {
      tracking.variantAssignments[variant.id] = 0;
      tracking.conversionsByVariant[variant.id] = 0;
    });
    
    this.statisticalTests.set(experiment.id, tracking);
  }

  private async updateExperimentStatistics(experimentId: string): Promise<void> {
    const tracking = this.statisticalTests.get(experimentId);
    if (!tracking) return;
    
    const events = this.experimentResults.get(experimentId) || [];
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return;
    
    // Update assignment counts
    const assignmentCounts: { [variantId: string]: Set<string> } = {};
    experiment.variants.forEach(variant => {
      assignmentCounts[variant.id] = new Set();
    });
    
    events.forEach(event => {
      assignmentCounts[event.variantId]?.add(event.customerId);
    });
    
    // Update tracking data
    experiment.variants.forEach(variant => {
      tracking.variantAssignments[variant.id] = assignmentCounts[variant.id]?.size || 0;
      tracking.conversionsByVariant[variant.id] = events.filter(
        e => e.variantId === variant.id && e.metric === experiment.metrics.primary
      ).length;
    });
    
    tracking.totalAssignments = Object.values(tracking.variantAssignments).reduce((sum, count) => sum + count, 0);
    
    this.statisticalTests.set(experimentId, tracking);
  }

  private calculateStatisticalSignificance(
    experiment: Experiment,
    variantResults: { [variantId: string]: any }
  ): {
    winner: string | null;
    confidence: number;
    significance: { [variantId: string]: number };
  } {
    const variantIds = Object.keys(variantResults);
    if (variantIds.length < 2) {
      return { winner: null, confidence: 0, significance: {} };
    }
    
    // Find control variant (first one) and treatment variants
    const controlId = variantIds[0];
    const controlResult = variantResults[controlId];
    
    let bestVariantId = controlId;
    let bestConversionRate = controlResult.conversionRate;
    let maxConfidence = 0;
    const significance: { [variantId: string]: number } = {};
    
    // Compare each variant against control
    for (let i = 1; i < variantIds.length; i++) {
      const variantId = variantIds[i];
      const variantResult = variantResults[variantId];
      
      // Simple z-test for conversion rates (simplified statistical test)
      const pControl = controlResult.conversionRate;
      const pVariant = variantResult.conversionRate;
      const nControl = controlResult.participants;
      const nVariant = variantResult.participants;
      
      if (nControl > 30 && nVariant > 30) { // Minimum sample size
        const pPooled = ((pControl * nControl) + (pVariant * nVariant)) / (nControl + nVariant);
        const se = Math.sqrt(pPooled * (1 - pPooled) * (1/nControl + 1/nVariant));
        
        if (se > 0) {
          const zScore = Math.abs(pVariant - pControl) / se;
          const pValue = this.calculatePValue(zScore);
          const confidence = 1 - pValue;
          
          significance[variantId] = confidence;
          
          if (pVariant > bestConversionRate && confidence > maxConfidence) {
            bestVariantId = variantId;
            bestConversionRate = pVariant;
            maxConfidence = confidence;
          }
        }
      }
    }
    
    // Set control significance
    significance[controlId] = 0.5; // Baseline
    
    return {
      winner: maxConfidence > 0.95 ? bestVariantId : null,
      confidence: maxConfidence,
      significance
    };
  }

  private calculatePValue(zScore: number): number {
    // Simplified p-value calculation for normal distribution
    // In production, would use proper statistical library
    const t = 1 / (1 + 0.2316419 * Math.abs(zScore));
    const d = 0.3989423 * Math.exp(-zScore * zScore / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    
    return zScore > 0 ? p : 1 - p;
  }

  private thompsonSampling(experiment: Experiment, results: ExperimentResults): string {
    // Thompson Sampling for Multi-Armed Bandit
    const variantScores: { [variantId: string]: number } = {};
    
    for (const variant of experiment.variants) {
      const result = results.results[variant.id];
      if (result) {
        // Beta distribution sampling
        const alpha = result.conversions + 1; // Successes + 1
        const beta = (result.participants - result.conversions) + 1; // Failures + 1
        
        // Simplified beta sampling (would use proper random beta distribution)
        const score = this.betaSample(alpha, beta);
        variantScores[variant.id] = score;
      } else {
        // No data, use neutral score
        variantScores[variant.id] = 0.5;
      }
    }
    
    // Select variant with highest score
    let bestVariant = experiment.variants[0].id;
    let bestScore = variantScores[bestVariant] || 0;
    
    Object.entries(variantScores).forEach(([variantId, score]) => {
      if (score > bestScore) {
        bestVariant = variantId;
        bestScore = score;
      }
    });
    
    return bestVariant;
  }

  private betaSample(alpha: number, beta: number): number {
    // Simplified beta distribution sampling
    // In production, would use proper statistical library
    const gamma1 = this.gammaSample(alpha);
    const gamma2 = this.gammaSample(beta);
    return gamma1 / (gamma1 + gamma2);
  }

  private gammaSample(shape: number): number {
    // Very simplified gamma sampling
    // In production, would use proper implementation
    return Math.random() * shape;
  }

  private generateInsights(
    experiment: Experiment,
    variantResults: { [variantId: string]: any }
  ): string[] {
    const insights: string[] = [];
    const variantIds = Object.keys(variantResults);
    
    if (variantIds.length >= 2) {
      const controlId = variantIds[0];
      const controlResult = variantResults[controlId];
      
      // Find best performing variant
      let bestVariantId = controlId;
      let bestConversionRate = controlResult.conversionRate;
      
      variantIds.forEach(variantId => {
        const result = variantResults[variantId];
        if (result.conversionRate > bestConversionRate) {
          bestVariantId = variantId;
          bestConversionRate = result.conversionRate;
        }
      });
      
      if (bestVariantId !== controlId) {
        const improvement = ((bestConversionRate - controlResult.conversionRate) / controlResult.conversionRate) * 100;
        insights.push(`Variant ${bestVariantId} shows ${improvement.toFixed(1)}% improvement over control`);
      }
      
      // Sample size insights
      const totalParticipants = variantIds.reduce((sum, id) => sum + variantResults[id].participants, 0);
      if (totalParticipants < 1000) {
        insights.push('Small sample size - results may not be statistically reliable');
      }
      
      // Revenue insights
      const controlRevenue = controlResult.revenuePerUser;
      const bestRevenue = variantResults[bestVariantId].revenuePerUser;
      if (bestRevenue > controlRevenue * 1.1) {
        insights.push(`Revenue per user increased by ${((bestRevenue - controlRevenue) / controlRevenue * 100).toFixed(1)}%`);
      }
    }
    
    return insights;
  }

  private generateRecommendations(
    experiment: Experiment,
    variantResults: { [variantId: string]: any },
    confidence: number
  ): string[] {
    const recommendations: string[] = [];
    
    if (confidence > 0.95) {
      recommendations.push('Experiment has reached statistical significance - consider implementing the winning variant');
    } else if (confidence > 0.8) {
      recommendations.push('Strong trend detected - continue running for higher confidence');
    } else {
      recommendations.push('Continue running experiment to gather more data');
    }
    
    const totalParticipants = Object.values(variantResults).reduce((sum: number, result: any) => sum + result.participants, 0);
    if (totalParticipants < 1000) {
      recommendations.push('Increase traffic allocation to reach minimum sample size faster');
    }
    
    return recommendations;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private initializeDefaultExperiments(): void {
    const defaultExperiment: Experiment = {
      id: 'email_subject_test_1',
      name: 'Email Subject Line A/B Test',
      description: 'Testing different subject line approaches for email campaigns',
      status: 'draft',
      type: 'ab_test',
      startDate: new Date(),
      targetAudience: {
        criteria: 'active_users_last_30_days',
        size: 10000,
        allocation: {
          'control': 0.5,
          'treatment': 0.5
        }
      },
      variants: [
        {
          id: 'control',
          name: 'Control - Standard Subject',
          description: 'Current subject line format',
          allocation: 0.5,
          configuration: {
            parameters: {
              subjectLineType: 'standard'
            }
          }
        },
        {
          id: 'treatment',
          name: 'Treatment - Personalized Subject',
          description: 'Personalized subject line with customer name',
          allocation: 0.5,
          configuration: {
            parameters: {
              subjectLineType: 'personalized'
            }
          }
        }
      ],
      metrics: {
        primary: 'email_open_rate',
        secondary: ['click_through_rate', 'conversion_rate']
      },
      configuration: {
        confidenceLevel: 0.95,
        minimumDetectableEffect: 0.05,
        trafficAllocation: 0.2,
        randomizationUnit: 'customer'
      }
    };

    this.experiments.set(defaultExperiment.id, defaultExperiment);
    this.experimentResults.set(defaultExperiment.id, []);

    console.log('[ExperimentationEngine] Initialized with default experiment');
  }
}