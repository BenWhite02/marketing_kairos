// src/services/ai/DecisionEngine.ts

import { 
  DecisionRequest, 
  DecisionResult, 
  Recommendation, 
  CustomerContext,
  DecisionObjective,
  MLModel 
} from '../../types/ai';

export class DecisionEngine {
  private modelRegistry: Map<string, MLModel> = new Map();
  private featureStore: Map<string, any> = new Map();
  private experimentConfig: Map<string, any> = new Map();
  private performanceCache: Map<string, any> = new Map();

  constructor() {
    this.initializeDefaultModels();
  }

  /**
   * Core decision making method - Next Best Action
   */
  async makeDecision(request: DecisionRequest): Promise<DecisionResult> {
    const startTime = Date.now();
    
    try {
      console.log(`[DecisionEngine] Processing decision request: ${request.requestId}`);
      
      // 1. Validate request
      this.validateRequest(request);
      
      // 2. Get customer features
      const features = await this.extractFeatures(request.context);
      
      // 3. Get active experiments
      const experiments = await this.getActiveExperiments(request.customerId, request.tenantId);
      
      // 4. Generate recommendations
      const recommendations = await this.generateRecommendations(request, features);
      
      // 5. Apply business rules and constraints
      const filteredRecommendations = this.applyConstraints(recommendations, request);
      
      // 6. Rank and optimize
      const optimizedRecommendations = await this.optimizeRecommendations(
        filteredRecommendations, 
        request.objectives
      );
      
      // 7. Calculate overall confidence
      const overallConfidence = this.calculateOverallConfidence(optimizedRecommendations);
      
      const executionTime = Date.now() - startTime;
      
      const result: DecisionResult = {
        requestId: request.requestId,
        customerId: request.customerId,
        tenantId: request.tenantId,
        timestamp: new Date(),
        recommendations: optimizedRecommendations.slice(0, request.options?.maxRecommendations || 5),
        overallConfidence,
        executionTimeMs: executionTime,
        modelVersions: this.getActiveModelVersions(),
        experimentsApplied: experiments.map(e => e.id),
        debugInfo: request.options?.includeReasons ? {
          featureValues: features,
          modelScores: this.getModelScores(),
          rules_applied: this.getAppliedRules()
        } : undefined
      };

      // Log performance metrics
      this.logPerformanceMetrics(result);
      
      return result;
      
    } catch (error) {
      console.error('[DecisionEngine] Error processing decision:', error);
      return this.createFallbackResult(request, startTime, error as Error);
    }
  }

  /**
   * Generate recommendations using multiple models and strategies
   */
  private async generateRecommendations(
    request: DecisionRequest, 
    features: Record<string, any>
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    
    // 1. Churn Prevention Recommendations
    if (features.churnRisk > 0.7) {
      recommendations.push({
        id: `churn_prevention_${Date.now()}`,
        type: 'offer',
        title: 'Retention Offer - Special Discount',
        description: 'High-value customer at risk of churning - offer 20% discount',
        confidence: features.churnRisk,
        expectedValue: features.lifetimeValue * 0.6, // 60% retention probability
        priority: 9,
        metadata: {
          offerType: 'discount',
          discount: 20,
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          targetMetrics: {
            expectedConversionRate: 0.35,
            expectedRevenue: features.avgOrderValue * 0.8,
            expectedEngagement: 85
          }
        },
        reasons: [
          `High churn risk detected (${(features.churnRisk * 100).toFixed(1)}%)`,
          `Customer lifetime value: $${features.lifetimeValue.toFixed(2)}`,
          'Retention offers have 60% success rate for this segment'
        ]
      });
    }

    // 2. Upsell/Cross-sell Recommendations
    if (features.propensityToBuy > 0.6 && features.engagementScore > 70) {
      recommendations.push({
        id: `upsell_${Date.now()}`,
        type: 'product',
        title: 'Premium Product Recommendation',
        description: 'Customer shows high purchase intent for premium products',
        confidence: features.propensityToBuy,
        expectedValue: features.avgOrderValue * 1.4,
        priority: 7,
        metadata: {
          offerType: 'upsell',
          targetMetrics: {
            expectedConversionRate: 0.25,
            expectedRevenue: features.avgOrderValue * 1.4,
            expectedEngagement: 75
          }
        },
        reasons: [
          `High purchase propensity (${(features.propensityToBuy * 100).toFixed(1)}%)`,
          `Strong engagement score (${features.engagementScore})`,
          'Customer has purchased premium products before'
        ]
      });
    }

    // 3. Channel Optimization
    const optimalChannel = this.getOptimalChannel(features);
    if (optimalChannel.confidence > 0.5) {
      recommendations.push({
        id: `channel_opt_${Date.now()}`,
        type: 'channel',
        title: `Optimize for ${optimalChannel.channel}`,
        description: `Customer responds best to ${optimalChannel.channel} communications`,
        confidence: optimalChannel.confidence,
        expectedValue: features.avgOrderValue * optimalChannel.lift,
        priority: 6,
        metadata: {
          targetMetrics: {
            expectedConversionRate: optimalChannel.conversionRate,
            expectedRevenue: features.avgOrderValue * optimalChannel.lift,
            expectedEngagement: optimalChannel.engagement
          }
        },
        reasons: [
          `${optimalChannel.channel} shows ${((optimalChannel.lift - 1) * 100).toFixed(1)}% lift`,
          `Historical conversion rate: ${(optimalChannel.conversionRate * 100).toFixed(1)}%`
        ]
      });
    }

    // 4. Timing Optimization
    const optimalTiming = this.getOptimalTiming(features);
    recommendations.push({
      id: `timing_opt_${Date.now()}`,
      type: 'timing',
      title: `Send at ${optimalTiming.time}`,
      description: `Customer engagement peaks at ${optimalTiming.time} on ${optimalTiming.day}`,
      confidence: optimalTiming.confidence,
      expectedValue: features.avgOrderValue * optimalTiming.lift,
      priority: 5,
      metadata: {
        targetMetrics: {
          expectedConversionRate: optimalTiming.conversionRate,
          expectedRevenue: features.avgOrderValue * optimalTiming.lift,
          expectedEngagement: optimalTiming.engagement
        }
      },
      reasons: [
        `Peak engagement time based on historical data`,
        `${((optimalTiming.lift - 1) * 100).toFixed(1)}% higher response rate`
      ]
    });

    // 5. Content Personalization
    const personalizedContent = this.getPersonalizedContent(features);
    recommendations.push({
      id: `content_${Date.now()}`,
      type: 'content',
      title: personalizedContent.title,
      description: personalizedContent.description,
      confidence: personalizedContent.confidence,
      expectedValue: features.avgOrderValue * personalizedContent.lift,
      priority: 4,
      metadata: {
        targetMetrics: {
          expectedConversionRate: personalizedContent.conversionRate,
          expectedRevenue: features.avgOrderValue * personalizedContent.lift,
          expectedEngagement: personalizedContent.engagement
        }
      },
      reasons: personalizedContent.reasons
    });

    return recommendations.filter(r => r.confidence > 0.3); // Filter low confidence recommendations
  }

  /**
   * Extract features from customer context
   */
  private async extractFeatures(context: CustomerContext): Promise<Record<string, any>> {
    const features = {
      // Demographic features
      age: context.demographics.age || 35,
      location: context.demographics.location?.country || 'US',
      segment: context.demographics.segment || 'standard',
      
      // Behavioral features
      totalPurchases: context.behavioral.totalPurchases,
      avgOrderValue: context.behavioral.avgOrderValue,
      lifetimeValue: context.behavioral.lifetimeValue,
      churnRisk: context.behavioral.churnRisk,
      engagementScore: context.behavioral.engagementScore,
      activityLevel: context.behavioral.activityLevel,
      
      // Contextual features
      deviceType: context.contextual.deviceType,
      timeOfDay: new Date().getHours(),
      dayOfWeek: new Date().getDay(),
      sessionDuration: context.contextual.sessionDuration,
      pageViews: context.contextual.pageViews,
      
      // Computed features
      propensityToBuy: this.calculatePropensityToBuy(context),
      preferredChannel: context.behavioral.preferredChannels[0] || 'email',
      recency: this.calculateRecency(context.behavioral.lastLoginDate),
      frequency: this.calculateFrequency(context.behavioral.totalPurchases),
      monetary: context.behavioral.avgOrderValue
    };

    return features;
  }

  /**
   * Calculate propensity to buy score
   */
  private calculatePropensityToBuy(context: CustomerContext): number {
    const { behavioral, contextual } = context;
    
    // Simple propensity model - in production this would use ML
    let score = 0.3; // base score
    
    // Engagement factor
    score += (behavioral.engagementScore / 100) * 0.3;
    
    // Activity level factor
    const activityMultiplier = {
      'low': 0.1,
      'medium': 0.2,
      'high': 0.3
    };
    score += activityMultiplier[behavioral.activityLevel] || 0.1;
    
    // Session engagement factor
    if (contextual.sessionDuration > 300) score += 0.1; // 5+ minutes
    if (contextual.pageViews > 3) score += 0.1;
    
    // Purchase history factor
    if (behavioral.totalPurchases > 5) score += 0.1;
    if (behavioral.avgOrderValue > 100) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  /**
   * Get optimal channel for customer
   */
  private getOptimalChannel(features: Record<string, any>): {
    channel: string;
    confidence: number;
    lift: number;
    conversionRate: number;
    engagement: number;
  } {
    // Simplified channel optimization - in production would use ML model
    const preferredChannel = features.preferredChannel;
    
    const channelData = {
      'email': { confidence: 0.8, lift: 1.2, conversionRate: 0.15, engagement: 75 },
      'sms': { confidence: 0.9, lift: 1.4, conversionRate: 0.22, engagement: 85 },
      'push': { confidence: 0.7, lift: 1.1, conversionRate: 0.12, engagement: 65 },
      'web': { confidence: 0.6, lift: 1.0, conversionRate: 0.08, engagement: 55 }
    };

    return {
      channel: preferredChannel,
      ...channelData[preferredChannel as keyof typeof channelData] || channelData.email
    };
  }

  /**
   * Get optimal timing for customer
   */
  private getOptimalTiming(features: Record<string, any>): {
    time: string;
    day: string;
    confidence: number;
    lift: number;
    conversionRate: number;
    engagement: number;
  } {
    // Simplified timing optimization - in production would use ML model
    const hour = features.timeOfDay;
    const dayOfWeek = features.dayOfWeek;
    
    // Peak engagement times based on general patterns
    let optimalHour = 10; // 10 AM default
    let confidence = 0.6;
    
    if (hour >= 9 && hour <= 11) {
      optimalHour = hour;
      confidence = 0.8;
    } else if (hour >= 14 && hour <= 16) {
      optimalHour = hour;
      confidence = 0.7;
    }
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const optimalDay = dayOfWeek >= 1 && dayOfWeek <= 4 ? days[dayOfWeek] : 'Tuesday';
    
    return {
      time: `${optimalHour}:00`,
      day: optimalDay,
      confidence,
      lift: 1.15,
      conversionRate: 0.18,
      engagement: 80
    };
  }

  /**
   * Get personalized content recommendation
   */
  private getPersonalizedContent(features: Record<string, any>): {
    title: string;
    description: string;
    confidence: number;
    lift: number;
    conversionRate: number;
    engagement: number;
    reasons: string[];
  } {
    const engagementScore = features.engagementScore;
    const segment = features.segment;
    const lifetimeValue = features.lifetimeValue;
    
    if (lifetimeValue > 1000 && engagementScore > 80) {
      return {
        title: 'VIP Exclusive Content',
        description: 'Premium content tailored for high-value customers',
        confidence: 0.85,
        lift: 1.3,
        conversionRate: 0.25,
        engagement: 90,
        reasons: [
          'High lifetime value customer',
          'Strong engagement history',
          'VIP content shows 30% higher conversion'
        ]
      };
    } else if (engagementScore > 60) {
      return {
        title: 'Personalized Recommendations',
        description: 'Content based on browsing and purchase history',
        confidence: 0.7,
        lift: 1.15,
        conversionRate: 0.18,
        engagement: 75,
        reasons: [
          'Good engagement history',
          'Personalization improves relevance',
          'Content matches customer interests'
        ]
      };
    } else {
      return {
        title: 'Re-engagement Content',
        description: 'Educational content to rebuild engagement',
        confidence: 0.5,
        lift: 1.05,
        conversionRate: 0.10,
        engagement: 60,
        reasons: [
          'Low engagement detected',
          'Educational content builds trust',
          'Gradual re-engagement strategy'
        ]
      };
    }
  }

  /**
   * Apply business constraints to filter recommendations
   */
  private applyConstraints(
    recommendations: Recommendation[], 
    request: DecisionRequest
  ): Recommendation[] {
    if (!request.constraints || request.constraints.length === 0) {
      return recommendations;
    }

    return recommendations.filter(rec => {
      return request.constraints!.every(constraint => {
        switch (constraint.type) {
          case 'budget':
            return rec.expectedValue <= constraint.value;
          case 'frequency':
            // Check if customer hasn't been contacted recently
            return true; // Simplified - would check actual contact history
          case 'inventory':
            // Check product availability
            return true; // Simplified - would check actual inventory
          case 'compliance':
            // Check compliance rules
            return true; // Simplified - would check actual compliance
          default:
            return true;
        }
      });
    });
  }

  /**
   * Optimize recommendations based on objectives
   */
  private async optimizeRecommendations(
    recommendations: Recommendation[],
    objectives: DecisionObjective[]
  ): Promise<Recommendation[]> {
    // Calculate weighted scores for each recommendation
    const scoredRecommendations = recommendations.map(rec => {
      let weightedScore = 0;
      
      objectives.forEach(objective => {
        let objectiveScore = 0;
        
        switch (objective.type) {
          case 'revenue':
            objectiveScore = rec.expectedValue / 1000; // Normalize
            break;
          case 'engagement':
            objectiveScore = rec.metadata.targetMetrics.expectedEngagement / 100;
            break;
          case 'retention':
            objectiveScore = rec.confidence;
            break;
          case 'conversion':
            objectiveScore = rec.metadata.targetMetrics.expectedConversionRate;
            break;
          default:
            objectiveScore = rec.confidence;
        }
        
        weightedScore += objectiveScore * objective.weight;
      });
      
      return {
        ...rec,
        weightedScore
      };
    });
    
    // Sort by weighted score and return
    return scoredRecommendations
      .sort((a, b) => b.weightedScore - a.weightedScore)
      .map(({ weightedScore, ...rec }) => rec);
  }

  /**
   * Calculate overall confidence across all recommendations
   */
  private calculateOverallConfidence(recommendations: Recommendation[]): number {
    if (recommendations.length === 0) return 0;
    
    const avgConfidence = recommendations.reduce((sum, rec) => sum + rec.confidence, 0) / recommendations.length;
    const diversityBonus = Math.min(recommendations.length / 5, 0.2); // Bonus for diversity
    
    return Math.min(avgConfidence + diversityBonus, 1.0);
  }

  /**
   * Helper methods
   */
  private validateRequest(request: DecisionRequest): void {
    if (!request.customerId) throw new Error('Customer ID is required');
    if (!request.tenantId) throw new Error('Tenant ID is required');
    if (!request.decisionType) throw new Error('Decision type is required');
    if (!request.objectives || request.objectives.length === 0) {
      throw new Error('At least one objective is required');
    }
    
    const totalWeight = request.objectives.reduce((sum, obj) => sum + obj.weight, 0);
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      throw new Error('Objective weights must sum to 1.0');
    }
  }

  private async getActiveExperiments(customerId: string, tenantId: string): Promise<any[]> {
    // Simplified - would query actual experiment service
    return [];
  }

  private getActiveModelVersions(): { [modelName: string]: string } {
    const versions: { [modelName: string]: string } = {};
    this.modelRegistry.forEach((model, name) => {
      if (model.status === 'deployed') {
        versions[name] = model.version;
      }
    });
    return versions;
  }

  private getModelScores(): { [modelName: string]: number } {
    // Simplified - would return actual model prediction scores
    return {
      'churn_prediction': 0.75,
      'propensity_scoring': 0.68,
      'recommendation_engine': 0.82
    };
  }

  private getAppliedRules(): string[] {
    return [
      'high_value_customer_rule',
      'churn_prevention_rule',
      'engagement_optimization_rule'
    ];
  }

  private calculateRecency(lastLogin?: Date): number {
    if (!lastLogin) return 0;
    const daysSince = (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, 1 - daysSince / 30); // 0-1 score, decays over 30 days
  }

  private calculateFrequency(totalPurchases: number): number {
    return Math.min(totalPurchases / 10, 1); // 0-1 score, normalized to 10 purchases
  }

  private createFallbackResult(request: DecisionRequest, startTime: number, error: Error): DecisionResult {
    return {
      requestId: request.requestId,
      customerId: request.customerId,
      tenantId: request.tenantId,
      timestamp: new Date(),
      recommendations: [{
        id: 'fallback_recommendation',
        type: 'content',
        title: 'Default Recommendation',
        description: 'Fallback recommendation due to processing error',
        confidence: 0.3,
        expectedValue: 0,
        priority: 1,
        metadata: {
          targetMetrics: {
            expectedConversionRate: 0.05,
            expectedRevenue: 0,
            expectedEngagement: 30
          }
        },
        reasons: ['Fallback due to system error']
      }],
      overallConfidence: 0.3,
      executionTimeMs: Date.now() - startTime,
      modelVersions: {},
      experimentsApplied: [],
      fallbackReason: error.message
    };
  }

  private initializeDefaultModels(): void {
    // Initialize with basic model definitions
    const churnModel: MLModel = {
      id: 'churn_model_v1',
      name: 'Churn Prediction Model',
      version: '1.0.0',
      type: 'classification',
      purpose: 'churn_prediction',
      status: 'deployed',
      metadata: {
        description: 'Predicts customer churn probability',
        createdAt: new Date(),
        lastTrained: new Date(),
        accuracy: 0.85,
        features: ['recency', 'frequency', 'monetary', 'engagement_score'],
        algorithm: 'Random Forest',
        hyperparameters: { n_estimators: 100, max_depth: 10 }
      },
      performance: {
        accuracy: 0.85,
        latency: 25,
        throughput: 1000,
        memoryUsage: 128,
        lastEvaluated: new Date()
      },
      deployment: {
        environment: 'production',
        scalingConfig: {
          minInstances: 2,
          maxInstances: 10,
          targetCPU: 70
        }
      }
    };

    this.modelRegistry.set('churn_prediction', churnModel);
  }

  private logPerformanceMetrics(result: DecisionResult): void {
    const metrics = {
      requestId: result.requestId,
      executionTime: result.executionTimeMs,
      recommendationCount: result.recommendations.length,
      overallConfidence: result.overallConfidence,
      timestamp: result.timestamp
    };
    
    console.log('[DecisionEngine] Performance:', metrics);
    
    // In production, this would send metrics to monitoring system
    this.performanceCache.set(result.requestId, metrics);
  }
}