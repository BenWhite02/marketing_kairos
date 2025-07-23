// src/services/ai/InsightsGenerator.ts

import { AIInsight, DecisionResult, ModelPerformanceMetrics, CustomerContext } from '../../types/ai';

export class InsightsGenerator {
  private insights: Map<string, AIInsight> = new Map();
  private historicalData: Map<string, any[]> = new Map();
  private patterns: Map<string, any> = new Map();
  private anomalyDetectors: Map<string, any> = new Map();

  constructor() {
    this.initializeAnomalyDetectors();
  }

  /**
   * Generate insights from decision results and customer data
   */
  async generateInsights(
    decisionResults: DecisionResult[],
    performanceMetrics: ModelPerformanceMetrics[],
    customerContexts: CustomerContext[]
  ): Promise<AIInsight[]> {
    console.log(`[InsightsGenerator] Generating insights from ${decisionResults.length} decisions, ${performanceMetrics.length} metrics, ${customerContexts.length} customer contexts`);
    
    const insights: AIInsight[] = [];
    
    // 1. Performance anomaly insights
    const performanceInsights = await this.analyzePerformanceAnomalies(performanceMetrics);
    insights.push(...performanceInsights);
    
    // 2. Customer behavior trend insights
    const behaviorInsights = await this.analyzeBehaviorTrends(customerContexts);
    insights.push(...behaviorInsights);
    
    // 3. Decision effectiveness insights
    const decisionInsights = await this.analyzeDecisionEffectiveness(decisionResults);
    insights.push(...decisionInsights);
    
    // 4. Revenue opportunity insights
    const revenueInsights = await this.identifyRevenueOpportunities(decisionResults, customerContexts);
    insights.push(...revenueInsights);
    
    // 5. Model drift insights
    const driftInsights = await this.detectModelDrift(performanceMetrics);
    insights.push(...driftInsights);
    
    // Store insights for future reference
    insights.forEach(insight => {
      this.insights.set(insight.id, insight);
    });
    
    console.log(`[InsightsGenerator] Generated ${insights.length} insights`);
    return insights.sort((a, b) => {
      // Sort by severity and impact
      const severityWeight = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      const aSeverity = severityWeight[a.severity];
      const bSeverity = severityWeight[b.severity];
      
      if (aSeverity !== bSeverity) {
        return bSeverity - aSeverity;
      }
      
      return b.impact.estimated_revenue - a.impact.estimated_revenue;
    });
  }

  /**
   * Get existing insights with filtering
   */
  getInsights(filters?: {
    type?: AIInsight['type'];
    severity?: AIInsight['severity'];
    dismissed?: boolean;
    maxAge?: number; // hours
  }): AIInsight[] {
    let insights = Array.from(this.insights.values());
    
    if (filters) {
      if (filters.type) {
        insights = insights.filter(i => i.type === filters.type);
      }
      if (filters.severity) {
        insights = insights.filter(i => i.severity === filters.severity);
      }
      if (filters.dismissed !== undefined) {
        insights = insights.filter(i => Boolean(i.dismissed) === filters.dismissed);
      }
      if (filters.maxAge) {
        const cutoff = Date.now() - (filters.maxAge * 60 * 60 * 1000);
        insights = insights.filter(i => i.createdAt.getTime() > cutoff);
      }
    }
    
    return insights;
  }

  /**
   * Dismiss an insight
   */
  dismissInsight(insightId: string, reason?: string): void {
    const insight = this.insights.get(insightId);
    if (insight) {
      insight.dismissed = true;
      insight.actions_taken = insight.actions_taken || [];
      insight.actions_taken.push(`Dismissed: ${reason || 'No reason provided'}`);
      this.insights.set(insightId, insight);
    }
  }

  /**
   * Mark actions taken on an insight
   */
  recordActionTaken(insightId: string, action: string): void {
    const insight = this.insights.get(insightId);
    if (insight) {
      insight.actions_taken = insight.actions_taken || [];
      insight.actions_taken.push(action);
      this.insights.set(insightId, insight);
    }
  }

  /**
   * Get insight summary statistics
   */
  getInsightsSummary(): {
    total: number;
    byType: { [type: string]: number };
    bySeverity: { [severity: string]: number };
    dismissed: number;
    totalEstimatedRevenue: number;
  } {
    const insights = Array.from(this.insights.values());
    
    const byType: { [type: string]: number } = {};
    const bySeverity: { [severity: string]: number } = {};
    let dismissed = 0;
    let totalEstimatedRevenue = 0;
    
    insights.forEach(insight => {
      byType[insight.type] = (byType[insight.type] || 0) + 1;
      bySeverity[insight.severity] = (bySeverity[insight.severity] || 0) + 1;
      
      if (insight.dismissed) dismissed++;
      
      totalEstimatedRevenue += insight.impact.estimated_revenue;
    });
    
    return {
      total: insights.length,
      byType,
      bySeverity,
      dismissed,
      totalEstimatedRevenue
    };
  }

  /**
   * Private analysis methods
   */
  private async analyzePerformanceAnomalies(metrics: ModelPerformanceMetrics[]): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];
    
    if (metrics.length < 2) return insights;
    
    // Group metrics by model
    const metricsByModel: { [modelId: string]: ModelPerformanceMetrics[] } = {};
    metrics.forEach(metric => {
      if (!metricsByModel[metric.modelId]) {
        metricsByModel[metric.modelId] = [];
      }
      metricsByModel[metric.modelId].push(metric);
    });
    
    // Analyze each model for anomalies
    Object.entries(metricsByModel).forEach(([modelId, modelMetrics]) => {
      if (modelMetrics.length < 10) return; // Need sufficient history
      
      const sortedMetrics = modelMetrics.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      const recent = sortedMetrics.slice(-5);
      const baseline = sortedMetrics.slice(-20, -5);
      
      // Check accuracy degradation
      const recentAvgAccuracy = recent.reduce((sum, m) => sum + m.metrics.accuracy, 0) / recent.length;
      const baselineAvgAccuracy = baseline.reduce((sum, m) => sum + m.metrics.accuracy, 0) / baseline.length;
      
      if (recentAvgAccuracy < baselineAvgAccuracy - 0.05) { // 5% degradation
        insights.push({
          id: `accuracy_degradation_${modelId}_${Date.now()}`,
          type: 'anomaly',
          severity: recentAvgAccuracy < baselineAvgAccuracy - 0.1 ? 'critical' : 'high',
          title: `Model Accuracy Degradation Detected`,
          description: `Model ${modelId} accuracy has dropped from ${(baselineAvgAccuracy * 100).toFixed(1)}% to ${(recentAvgAccuracy * 100).toFixed(1)}%`,
          confidence: 0.9,
          impact: {
            estimated_revenue: -50000, // Estimated negative impact
            estimated_customers: 1000,
            timeline: 'immediate'
          },
          recommendations: [
            'Investigate data drift in model features',
            'Consider retraining the model with recent data',
            'Review model input data quality',
            'Implement automated model monitoring alerts'
          ],
          evidence: {
            data_points: recent.length + baseline.length,
            time_period: '2 weeks',
            statistical_significance: 0.95
          },
          createdAt: new Date()
        });
      }
      
      // Check latency spikes
      const recentAvgLatency = recent.reduce((sum, m) => sum + m.metrics.latency, 0) / recent.length;
      const baselineAvgLatency = baseline.reduce((sum, m) => sum + m.metrics.latency, 0) / baseline.length;
      
      if (recentAvgLatency > baselineAvgLatency * 2) { // 100% increase
        insights.push({
          id: `latency_spike_${modelId}_${Date.now()}`,
          type: 'anomaly',
          severity: 'high',
          title: `Model Latency Spike Detected`,
          description: `Model ${modelId} response time increased from ${baselineAvgLatency.toFixed(0)}ms to ${recentAvgLatency.toFixed(0)}ms`,
          confidence: 0.85,
          impact: {
            estimated_revenue: -10000,
            estimated_customers: 500,
            timeline: 'immediate'
          },
          recommendations: [
            'Check infrastructure resource utilization',
            'Optimize model inference performance',
            'Scale model serving infrastructure',
            'Review concurrent request patterns'
          ],
          evidence: {
            data_points: recent.length + baseline.length,
            time_period: '2 weeks',
            statistical_significance: 0.9
          },
          createdAt: new Date()
        });
      }
    });
    
    return insights;
  }

  private async analyzeBehaviorTrends(customerContexts: CustomerContext[]): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];
    
    if (customerContexts.length < 100) return insights; // Need sufficient data
    
    // Analyze engagement trends
    const engagementScores = customerContexts.map(ctx => ctx.behavioral.engagementScore);
    const avgEngagement = engagementScores.reduce((sum, score) => sum + score, 0) / engagementScores.length;
    
    if (avgEngagement < 50) {
      insights.push({
        id: `low_engagement_trend_${Date.now()}`,
        type: 'trend',
        severity: 'medium',
        title: 'Declining Customer Engagement Detected',
        description: `Average customer engagement score is ${avgEngagement.toFixed(1)}, below the healthy threshold of 50`,
        confidence: 0.8,
        impact: {
          estimated_revenue: -25000,
          estimated_customers: customerContexts.length,
          timeline: '1-2 months'
        },
        recommendations: [
          'Launch re-engagement campaigns for low-engagement customers',
          'Analyze content preferences and adjust strategy',
          'Implement personalized content recommendations',
          'Review communication frequency and timing'
        ],
        evidence: {
          data_points: customerContexts.length,
          time_period: 'current',
          statistical_significance: 0.85
        },
        createdAt: new Date()
      });
    }
    
    // Analyze churn risk distribution
    const churnRisks = customerContexts.map(ctx => ctx.behavioral.churnRisk);
    const highChurnRiskCount = churnRisks.filter(risk => risk > 0.7).length;
    const highChurnRiskPercent = (highChurnRiskCount / customerContexts.length) * 100;
    
    if (highChurnRiskPercent > 20) {
      insights.push({
        id: `high_churn_risk_trend_${Date.now()}`,
        type: 'risk',
        severity: 'high',
        title: 'High Churn Risk Trend Identified',
        description: `${highChurnRiskPercent.toFixed(1)}% of customers have high churn risk (>70%)`,
        confidence: 0.9,
        impact: {
          estimated_revenue: -100000,
          estimated_customers: highChurnRiskCount,
          timeline: '1-3 months'
        },
        recommendations: [
          'Implement targeted retention campaigns',
          'Offer special incentives to high-risk customers',
          'Increase customer support touchpoints',
          'Analyze common factors among high-risk customers'
        ],
        evidence: {
          data_points: customerContexts.length,
          time_period: 'current',
          statistical_significance: 0.95
        },
        createdAt: new Date()
      });
    }
    
    // Analyze device/channel trends
    const deviceTypes = customerContexts.map(ctx => ctx.contextual.deviceType);
    const deviceDistribution = this.calculateDistribution(deviceTypes);
    
    if (deviceDistribution['mobile'] > 0.7) {
      insights.push({
        id: `mobile_trend_${Date.now()}`,
        type: 'trend',
        severity: 'medium',
        title: 'Strong Mobile Usage Trend',
        description: `${(deviceDistribution['mobile'] * 100).toFixed(1)}% of interactions are on mobile devices`,
        confidence: 0.95,
        impact: {
          estimated_revenue: 15000,
          estimated_customers: Math.floor(customerContexts.length * deviceDistribution['mobile']),
          timeline: 'ongoing'
        },
        recommendations: [
          'Optimize mobile experience and interfaces',
          'Prioritize mobile-first campaign designs',
          'Implement mobile-specific personalization',
          'Consider mobile app push notifications'
        ],
        evidence: {
          data_points: customerContexts.length,
          time_period: 'current',
          statistical_significance: 0.98
        },
        createdAt: new Date()
      });
    }
    
    return insights;
  }

  private async analyzeDecisionEffectiveness(decisionResults: DecisionResult[]): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];
    
    if (decisionResults.length < 50) return insights;
    
    // Analyze recommendation confidence distribution
    const confidences = decisionResults.map(result => result.overallConfidence);
    const avgConfidence = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
    const lowConfidenceCount = confidences.filter(conf => conf < 0.5).length;
    const lowConfidencePercent = (lowConfidenceCount / decisionResults.length) * 100;
    
    if (lowConfidencePercent > 30) {
      insights.push({
        id: `low_confidence_decisions_${Date.now()}`,
        type: 'optimization',
        severity: 'medium',
        title: 'High Rate of Low-Confidence Decisions',
        description: `${lowConfidencePercent.toFixed(1)}% of decisions have low confidence (<50%)`,
        confidence: 0.85,
        impact: {
          estimated_revenue: -30000,
          estimated_customers: Math.floor(decisionResults.length * 0.3),
          timeline: 'ongoing'
        },
        recommendations: [
          'Improve feature quality and availability',
          'Retrain models with more diverse data',
          'Implement ensemble models for better predictions',
          'Review decision logic and fallback strategies'
        ],
        evidence: {
          data_points: decisionResults.length,
          time_period: 'recent',
          statistical_significance: 0.9
        },
        createdAt: new Date()
      });
    }
    
    // Analyze execution time performance
    const executionTimes = decisionResults.map(result => result.executionTimeMs);
    const avgExecutionTime = executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length;
    const slowDecisions = executionTimes.filter(time => time > 100).length; // >100ms
    const slowDecisionPercent = (slowDecisions / decisionResults.length) * 100;
    
    if (avgExecutionTime > 75 || slowDecisionPercent > 20) {
      insights.push({
        id: `slow_decision_performance_${Date.now()}`,
        type: 'optimization',
        severity: avgExecutionTime > 150 ? 'high' : 'medium',
        title: 'Decision Engine Performance Issues',
        description: `Average decision time is ${avgExecutionTime.toFixed(0)}ms, with ${slowDecisionPercent.toFixed(1)}% of decisions taking >100ms`,
        confidence: 0.9,
        impact: {
          estimated_revenue: -20000,
          estimated_customers: slowDecisions,
          timeline: 'immediate'
        },
        recommendations: [
          'Optimize feature computation and caching',
          'Implement parallel processing for model inference',
          'Review and optimize decision logic complexity',
          'Scale infrastructure resources'
        ],
        evidence: {
          data_points: decisionResults.length,
          time_period: 'recent',
          statistical_significance: 0.95
        },
        createdAt: new Date()
      });
    }
    
    return insights;
  }

  private async identifyRevenueOpportunities(
    decisionResults: DecisionResult[],
    customerContexts: CustomerContext[]
  ): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];
    
    // Analyze high-value customer segment
    const highValueCustomers = customerContexts.filter(ctx => ctx.behavioral.lifetimeValue > 1000);
    const highValuePercent = (highValueCustomers.length / customerContexts.length) * 100;
    
    if (highValuePercent < 10 && highValueCustomers.length > 0) {
      const avgHighValue = highValueCustomers.reduce((sum, ctx) => sum + ctx.behavioral.lifetimeValue, 0) / highValueCustomers.length;
      
      insights.push({
        id: `high_value_segment_opportunity_${Date.now()}`,
        type: 'opportunity',
        severity: 'high',
        title: 'High-Value Customer Segment Opportunity',
        description: `Only ${highValuePercent.toFixed(1)}% of customers are high-value (>$1000 LTV), but they average ${avgHighValue.toFixed(0)} LTV`,
        confidence: 0.8,
        impact: {
          estimated_revenue: 150000,
          estimated_customers: Math.floor(customerContexts.length * 0.05), // 5% conversion
          timeline: '3-6 months'
        },
        recommendations: [
          'Create targeted campaigns to identify potential high-value customers',
          'Develop premium product offerings and services',
          'Implement VIP customer experience programs',
          'Use lookalike modeling to find similar high-value prospects'
        ],
        evidence: {
          data_points: customerContexts.length,
          time_period: 'current',
          statistical_significance: 0.85
        },
        createdAt: new Date()
      });
    }
    
    // Analyze cross-sell opportunities
    const customersWithMultiplePurchases = customerContexts.filter(ctx => ctx.behavioral.totalPurchases > 1);
    const crossSellRate = (customersWithMultiplePurchases.length / customerContexts.length) * 100;
    
    if (crossSellRate < 30) {
      const potentialCrossSellCustomers = customerContexts.filter(ctx => 
        ctx.behavioral.totalPurchases === 1 && 
        ctx.behavioral.engagementScore > 60
      );
      
      insights.push({
        id: `cross_sell_opportunity_${Date.now()}`,
        type: 'opportunity',
        severity: 'medium',
        title: 'Cross-Sell Opportunity Identified',
        description: `Only ${crossSellRate.toFixed(1)}% of customers have made multiple purchases, with ${potentialCrossSellCustomers.length} engaged single-purchase customers`,
        confidence: 0.75,
        impact: {
          estimated_revenue: 75000,
          estimated_customers: potentialCrossSellCustomers.length,
          timeline: '1-3 months'
        },
        recommendations: [
          'Launch product recommendation campaigns for single-purchase customers',
          'Create bundled product offerings',
          'Implement post-purchase cross-sell email sequences',
          'Use collaborative filtering for product recommendations'
        ],
        evidence: {
          data_points: customerContexts.length,
          time_period: 'current',
          statistical_significance: 0.8
        },
        createdAt: new Date()
      });
    }
    
    // Analyze re-engagement opportunities
    const inactiveCustomers = customerContexts.filter(ctx => {
      const daysSinceLogin = ctx.behavioral.lastLoginDate ? 
        (Date.now() - ctx.behavioral.lastLoginDate.getTime()) / (1000 * 60 * 60 * 24) : 365;
      return daysSinceLogin > 30 && ctx.behavioral.lifetimeValue > 0;
    });
    
    if (inactiveCustomers.length > 0) {
      const inactivePercent = (inactiveCustomers.length / customerContexts.length) * 100;
      const avgInactiveValue = inactiveCustomers.reduce((sum, ctx) => sum + ctx.behavioral.lifetimeValue, 0) / inactiveCustomers.length;
      
      insights.push({
        id: `reengagement_opportunity_${Date.now()}`,
        type: 'opportunity',
        severity: 'medium',
        title: 'Customer Re-engagement Opportunity',
        description: `${inactivePercent.toFixed(1)}% of customers are inactive (>30 days) with average LTV of ${avgInactiveValue.toFixed(0)}`,
        confidence: 0.7,
        impact: {
          estimated_revenue: Math.floor(inactiveCustomers.length * avgInactiveValue * 0.15), // 15% win-back rate
          estimated_customers: inactiveCustomers.length,
          timeline: '2-4 months'
        },
        recommendations: [
          'Design win-back email campaigns with special offers',
          'Create personalized content based on past behavior',
          'Implement progressive discount strategies',
          'Use multiple channels for re-engagement (email, SMS, retargeting)'
        ],
        evidence: {
          data_points: inactiveCustomers.length,
          time_period: 'current',
          statistical_significance: 0.8
        },
        createdAt: new Date()
      });
    }
    
    return insights;
  }

  private async detectModelDrift(metrics: ModelPerformanceMetrics[]): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];
    
    if (metrics.length < 20) return insights; // Need sufficient history
    
    // Group by model and detect drift
    const metricsByModel: { [modelId: string]: ModelPerformanceMetrics[] } = {};
    metrics.forEach(metric => {
      if (!metricsByModel[metric.modelId]) {
        metricsByModel[metric.modelId] = [];
      }
      metricsByModel[metric.modelId].push(metric);
    });
    
    Object.entries(metricsByModel).forEach(([modelId, modelMetrics]) => {
      if (modelMetrics.length < 20) return;
      
      const sortedMetrics = modelMetrics.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      // Calculate drift score over time
      const driftScores = sortedMetrics.map(metric => metric.dataQuality.drift);
      const recentDrift = driftScores.slice(-5).reduce((sum, score) => sum + score, 0) / 5;
      const baselineDrift = driftScores.slice(0, 10).reduce((sum, score) => sum + score, 0) / 10;
      
      if (recentDrift > 0.3 || recentDrift > baselineDrift * 2) {
        insights.push({
          id: `model_drift_${modelId}_${Date.now()}`,
          type: 'risk',
          severity: recentDrift > 0.5 ? 'critical' : 'high',
          title: `Model Drift Detected`,
          description: `Model ${modelId} shows significant data drift (${(recentDrift * 100).toFixed(1)}%), indicating input data distribution has changed`,
          confidence: 0.9,
          impact: {
            estimated_revenue: -80000,
            estimated_customers: 2000,
            timeline: '1-2 weeks'
          },
          recommendations: [
            'Investigate changes in data sources and features',
            'Retrain model with recent representative data',
            'Implement data drift monitoring and alerts',
            'Review feature engineering pipeline for consistency'
          ],
          evidence: {
            data_points: modelMetrics.length,
            time_period: '4 weeks',
            statistical_significance: 0.95
          },
          createdAt: new Date()
        });
      }
    });
    
    return insights;
  }

  /**
   * Generate automatic recommendations based on patterns
   */
  async generateAutomaticRecommendations(): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];
    
    // Analyze historical patterns for recommendations
    const historicalInsights = Array.from(this.insights.values());
    
    // Pattern: If churn insights are frequent, recommend proactive retention
    const churnInsights = historicalInsights.filter(i => 
      i.type === 'risk' && i.description.toLowerCase().includes('churn')
    );
    
    if (churnInsights.length > 3) {
      insights.push({
        id: `proactive_retention_recommendation_${Date.now()}`,
        type: 'optimization',
        severity: 'medium',
        title: 'Implement Proactive Retention Strategy',
        description: 'Multiple churn-related insights detected over time, indicating need for systematic retention approach',
        confidence: 0.8,
        impact: {
          estimated_revenue: 200000,
          estimated_customers: 5000,
          timeline: '3-6 months'
        },
        recommendations: [
          'Develop automated churn prediction and intervention system',
          'Create customer health scoring methodology',
          'Implement lifecycle-based retention campaigns',
          'Establish customer success team and processes'
        ],
        evidence: {
          data_points: churnInsights.length,
          time_period: '3 months',
          statistical_significance: 0.85
        },
        createdAt: new Date()
      });
    }
    
    // Pattern: Performance insights suggest infrastructure scaling
    const performanceInsights = historicalInsights.filter(i => 
      i.description.toLowerCase().includes('latency') || 
      i.description.toLowerCase().includes('performance')
    );
    
    if (performanceInsights.length > 2) {
      insights.push({
        id: `infrastructure_scaling_recommendation_${Date.now()}`,
        type: 'optimization',
        severity: 'high',
        title: 'Scale Infrastructure for Performance',
        description: 'Recurring performance issues suggest need for infrastructure optimization',
        confidence: 0.85,
        impact: {
          estimated_revenue: 50000, // Prevented lost revenue
          estimated_customers: 10000,
          timeline: '1-2 months'
        },
        recommendations: [
          'Implement auto-scaling for decision engine services',
          'Optimize database queries and caching strategies',
          'Deploy CDN for global performance improvement',
          'Implement performance monitoring and alerting'
        ],
        evidence: {
          data_points: performanceInsights.length,
          time_period: '2 months',
          statistical_significance: 0.9
        },
        createdAt: new Date()
      });
    }
    
    return insights;
  }

  /**
   * Helper methods
   */
  private calculateDistribution(values: string[]): { [key: string]: number } {
    const counts: { [key: string]: number } = {};
    values.forEach(value => {
      counts[value] = (counts[value] || 0) + 1;
    });
    
    const total = values.length;
    const distribution: { [key: string]: number } = {};
    Object.entries(counts).forEach(([key, count]) => {
      distribution[key] = count / total;
    });
    
    return distribution;
  }

  private initializeAnomalyDetectors(): void {
    // Initialize anomaly detection algorithms
    this.anomalyDetectors.set('accuracy_detector', {
      threshold: 0.05, // 5% degradation
      lookbackPeriod: 20,
      sensitivity: 0.9
    });
    
    this.anomalyDetectors.set('latency_detector', {
      threshold: 2.0, // 100% increase
      lookbackPeriod: 20,
      sensitivity: 0.8
    });
    
    this.anomalyDetectors.set('drift_detector', {
      threshold: 0.3, // 30% drift
      lookbackPeriod: 50,
      sensitivity: 0.85
    });
    
    console.log('[InsightsGenerator] Initialized anomaly detectors');
  }

  /**
   * Clean up old insights to prevent memory issues
   */
  private cleanupOldInsights(): void {
    const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days
    const toDelete: string[] = [];
    
    this.insights.forEach((insight, id) => {
      if (insight.createdAt.getTime() < cutoff && insight.dismissed) {
        toDelete.push(id);
      }
    });
    
    toDelete.forEach(id => this.insights.delete(id));
    
    if (toDelete.length > 0) {
      console.log(`[InsightsGenerator] Cleaned up ${toDelete.length} old insights`);
    }
  }

  /**
   * Start periodic cleanup
   */
  startPeriodicCleanup(): void {
    // Clean up old insights every 24 hours
    setInterval(() => {
      this.cleanupOldInsights();
    }, 24 * 60 * 60 * 1000);
  }
}