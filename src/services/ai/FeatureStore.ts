// src/services/ai/FeatureStore.ts

import { FeatureDefinition, FeatureStore as FeatureStoreType, CustomerContext } from '../../types/ai';

export class FeatureStore {
  private featureDefinitions: Map<string, FeatureDefinition> = new Map();
  private customerFeatures: Map<string, FeatureStoreType> = new Map();
  private computedFeatureCache: Map<string, { value: any; timestamp: Date; ttl: number }> = new Map();
  private realTimeStreams: Map<string, any> = new Map();

  constructor() {
    this.initializeFeatureDefinitions();
    this.startCacheCleanup();
  }

  /**
   * Get features for a specific customer
   */
  async getCustomerFeatures(
    customerId: string, 
    tenantId: string, 
    featureNames?: string[]
  ): Promise<{ [featureName: string]: any }> {
    console.log(`[FeatureStore] Getting features for customer: ${customerId}`);
    
    const cacheKey = `${tenantId}:${customerId}`;
    let customerFeatureStore = this.customerFeatures.get(cacheKey);
    
    // If no cached features, create from context
    if (!customerFeatureStore) {
      customerFeatureStore = await this.createDefaultFeatureStore(customerId, tenantId);
      this.customerFeatures.set(cacheKey, customerFeatureStore);
    }
    
    const requestedFeatures = featureNames || Array.from(this.featureDefinitions.keys());
    const features: { [featureName: string]: any } = {};
    
    for (const featureName of requestedFeatures) {
      const featureDefinition = this.featureDefinitions.get(featureName);
      if (!featureDefinition) {
        console.warn(`[FeatureStore] Feature definition not found: ${featureName}`);
        continue;
      }
      
      // Get feature value based on source type
      const featureValue = await this.getFeatureValue(
        customerId,
        tenantId,
        featureName,
        featureDefinition,
        customerFeatureStore
      );
      
      features[featureName] = featureValue;
    }
    
    return features;
  }

  /**
   * Update features for a customer in real-time
   */
  async updateCustomerFeatures(
    customerId: string,
    tenantId: string,
    features: { [featureName: string]: any }
  ): Promise<void> {
    console.log(`[FeatureStore] Updating features for customer: ${customerId}`);
    
    const cacheKey = `${tenantId}:${customerId}`;
    let customerFeatureStore = this.customerFeatures.get(cacheKey);
    
    if (!customerFeatureStore) {
      customerFeatureStore = await this.createDefaultFeatureStore(customerId, tenantId);
    }
    
    // Validate and update features
    for (const [featureName, value] of Object.entries(features)) {
      const featureDefinition = this.featureDefinitions.get(featureName);
      if (!featureDefinition) {
        console.warn(`[FeatureStore] Unknown feature: ${featureName}`);
        continue;
      }
      
      // Validate feature value
      const validatedValue = this.validateFeatureValue(value, featureDefinition);
      if (validatedValue !== null) {
        customerFeatureStore.features[featureName] = validatedValue;
      }
    }
    
    customerFeatureStore.lastUpdated = new Date();
    customerFeatureStore.version = this.generateVersion();
    
    this.customerFeatures.set(cacheKey, customerFeatureStore);
    
    // Invalidate computed feature cache for this customer
    this.invalidateComputedFeatures(customerId, tenantId);
  }

  /**
   * Compute real-time features from customer context
   */
  async computeFeaturesFromContext(context: CustomerContext): Promise<{ [featureName: string]: any }> {
    const features: { [featureName: string]: any } = {};
    
    // Demographic features
    features['customer_age'] = context.demographics.age || 35;
    features['customer_location_country'] = context.demographics.location?.country || 'US';
    features['customer_location_city'] = context.demographics.location?.city || 'Unknown';
    features['customer_segment'] = context.demographics.segment || 'standard';
    
    // Behavioral features
    features['total_purchases'] = context.behavioral.totalPurchases;
    features['avg_order_value'] = context.behavioral.avgOrderValue;
    features['lifetime_value'] = context.behavioral.lifetimeValue;
    features['churn_risk_score'] = context.behavioral.churnRisk;
    features['engagement_score'] = context.behavioral.engagementScore;
    features['activity_level'] = context.behavioral.activityLevel;
    features['preferred_channel'] = context.behavioral.preferredChannels[0] || 'email';
    
    // Contextual features
    features['current_device_type'] = context.contextual.deviceType;
    features['session_duration'] = context.contextual.sessionDuration;
    features['page_views_session'] = context.contextual.pageViews;
    features['current_hour'] = new Date().getHours();
    features['current_day_of_week'] = new Date().getDay();
    features['current_month'] = new Date().getMonth() + 1;
    
    // Computed features
    features['recency_score'] = await this.computeRecencyScore(context);
    features['frequency_score'] = await this.computeFrequencyScore(context);
    features['monetary_score'] = await this.computeMonetaryScore(context);
    features['rfm_score'] = await this.computeRFMScore(context);
    features['engagement_velocity'] = await this.computeEngagementVelocity(context);
    features['purchase_propensity'] = await this.computePurchasePropensity(context);
    features['content_affinity'] = await this.computeContentAffinity(context);
    features['channel_preference_score'] = await this.computeChannelPreferenceScore(context);
    
    // Time-based features
    features['days_since_last_login'] = this.computeDaysSinceLastLogin(context.behavioral.lastLoginDate);
    features['is_weekend'] = this.isWeekend();
    features['is_business_hours'] = this.isBusinessHours();
    features['time_zone_offset'] = this.getTimezoneOffset(context.demographics.location?.timezone);
    
    return features;
  }

  /**
   * Get feature definitions
   */
  getFeatureDefinitions(purpose?: string): FeatureDefinition[] {
    let definitions = Array.from(this.featureDefinitions.values());
    
    if (purpose) {
      // Filter definitions by purpose/use case
      definitions = definitions.filter(def => 
        def.description.toLowerCase().includes(purpose.toLowerCase()) ||
        def.name.toLowerCase().includes(purpose.toLowerCase())
      );
    }
    
    return definitions;
  }

  /**
   * Register a new feature definition
   */
  registerFeatureDefinition(definition: FeatureDefinition): void {
    console.log(`[FeatureStore] Registering feature definition: ${definition.name}`);
    
    // Validate definition
    this.validateFeatureDefinition(definition);
    
    this.featureDefinitions.set(definition.name, definition);
  }

  /**
   * Get feature statistics and health metrics
   */
  getFeatureStats(): {
    totalFeatures: number;
    realtimeFeatures: number;
    computedFeatures: number;
    cacheHitRate: number;
    avgComputeTime: number;
  } {
    const totalFeatures = this.featureDefinitions.size;
    const realtimeFeatures = Array.from(this.featureDefinitions.values())
      .filter(def => def.source === 'realtime').length;
    const computedFeatures = Array.from(this.featureDefinitions.values())
      .filter(def => def.source === 'computed').length;
    
    // Simplified metrics - in production would track actual cache hits
    const cacheHitRate = 0.85;
    const avgComputeTime = 15; // ms
    
    return {
      totalFeatures,
      realtimeFeatures,
      computedFeatures,
      cacheHitRate,
      avgComputeTime
    };
  }

  /**
   * Private helper methods
   */
  private async getFeatureValue(
    customerId: string,
    tenantId: string,
    featureName: string,
    definition: FeatureDefinition,
    customerStore: FeatureStoreType
  ): Promise<any> {
    // Check if feature exists in customer store
    if (customerStore.features.hasOwnProperty(featureName)) {
      return customerStore.features[featureName];
    }
    
    // Handle different source types
    switch (definition.source) {
      case 'realtime':
        return await this.getRealTimeFeature(customerId, tenantId, featureName);
      
      case 'computed':
        return await this.getComputedFeature(customerId, tenantId, featureName, definition);
      
      case 'batch':
        return await this.getBatchFeature(customerId, tenantId, featureName);
      
      default:
        return definition.defaultValue;
    }
  }

  private async getRealTimeFeature(customerId: string, tenantId: string, featureName: string): Promise<any> {
    // In production, this would connect to real-time streams (Kafka, Kinesis, etc.)
    const streamKey = `${tenantId}:${featureName}`;
    const stream = this.realTimeStreams.get(streamKey);
    
    if (stream && stream[customerId]) {
      return stream[customerId];
    }
    
    // Return default if no real-time data
    const definition = this.featureDefinitions.get(featureName);
    return definition?.defaultValue;
  }

  private async getComputedFeature(
    customerId: string, 
    tenantId: string, 
    featureName: string,
    definition: FeatureDefinition
  ): Promise<any> {
    const cacheKey = `${tenantId}:${customerId}:${featureName}`;
    const cached = this.computedFeatureCache.get(cacheKey);
    
    // Check cache validity
    if (cached && Date.now() - cached.timestamp.getTime() < cached.ttl) {
      return cached.value;
    }
    
    // Compute feature value
    const computedValue = await this.executeFeatureComputation(customerId, tenantId, featureName, definition);
    
    // Cache the result
    const ttl = this.getTTLForFeature(definition);
    this.computedFeatureCache.set(cacheKey, {
      value: computedValue,
      timestamp: new Date(),
      ttl
    });
    
    return computedValue;
  }

  private async getBatchFeature(customerId: string, tenantId: string, featureName: string): Promise<any> {
    // In production, this would query batch data warehouse (Snowflake, BigQuery, etc.)
    const definition = this.featureDefinitions.get(featureName);
    return definition?.defaultValue;
  }

  private async executeFeatureComputation(
    customerId: string, 
    tenantId: string, 
    featureName: string,
    definition: FeatureDefinition
  ): Promise<any> {
    // Execute the computation logic defined in the feature definition
    if (!definition.computationLogic) {
      return definition.defaultValue;
    }
    
    try {
      // Simple computation logic evaluation
      // In production, this would use a proper expression engine or ML pipeline
      switch (featureName) {
        case 'rfm_score':
          return await this.computeRFMScoreForCustomer(customerId, tenantId);
        case 'engagement_velocity':
          return await this.computeEngagementVelocityForCustomer(customerId, tenantId);
        case 'purchase_propensity':
          return await this.computePurchasePropensityForCustomer(customerId, tenantId);
        default:
          return definition.defaultValue;
      }
    } catch (error) {
      console.error(`[FeatureStore] Error computing feature ${featureName}:`, error);
      return definition.defaultValue;
    }
  }

  private async computeRFMScoreForCustomer(customerId: string, tenantId: string): Promise<number> {
    // Get customer's behavioral data
    const cacheKey = `${tenantId}:${customerId}`;
    const customerStore = this.customerFeatures.get(cacheKey);
    
    if (!customerStore) return 3; // Default middle score
    
    const recency = customerStore.features['recency_score'] || 3;
    const frequency = customerStore.features['frequency_score'] || 3;
    const monetary = customerStore.features['monetary_score'] || 3;
    
    // Simple RFM scoring (1-5 scale)
    return Math.round((recency + frequency + monetary) / 3);
  }

  private async computeEngagementVelocityForCustomer(customerId: string, tenantId: string): Promise<number> {
    // Simplified engagement velocity calculation
    const cacheKey = `${tenantId}:${customerId}`;
    const customerStore = this.customerFeatures.get(cacheKey);
    
    if (!customerStore) return 0.5;
    
    const engagementScore = customerStore.features['engagement_score'] || 50;
    const sessionDuration = customerStore.features['session_duration'] || 180;
    const pageViews = customerStore.features['page_views_session'] || 3;
    
    // Calculate velocity as normalized engagement trend
    const velocity = (engagementScore / 100) * (sessionDuration / 300) * (pageViews / 5);
    return Math.min(velocity, 2.0); // Cap at 2x
  }

  private async computePurchasePropensityForCustomer(customerId: string, tenantId: string): Promise<number> {
    // Simplified propensity calculation
    const cacheKey = `${tenantId}:${customerId}`;
    const customerStore = this.customerFeatures.get(cacheKey);
    
    if (!customerStore) return 0.3;
    
    const totalPurchases = customerStore.features['total_purchases'] || 0;
    const avgOrderValue = customerStore.features['avg_order_value'] || 0;
    const engagementScore = customerStore.features['engagement_score'] || 50;
    const daysSinceLastLogin = customerStore.features['days_since_last_login'] || 30;
    
    let propensity = 0.2; // Base propensity
    
    // Purchase history influence
    if (totalPurchases > 0) propensity += 0.2;
    if (totalPurchases > 5) propensity += 0.1;
    if (avgOrderValue > 100) propensity += 0.1;
    
    // Engagement influence
    propensity += (engagementScore / 100) * 0.3;
    
    // Recency influence (negative impact if inactive)
    if (daysSinceLastLogin < 7) propensity += 0.1;
    else if (daysSinceLastLogin > 30) propensity -= 0.2;
    
    return Math.max(0, Math.min(propensity, 1.0));
  }

  private async computeRecencyScore(context: CustomerContext): Promise<number> {
    const lastLoginDate = context.behavioral.lastLoginDate;
    if (!lastLoginDate) return 1; // Lowest score for no login
    
    const daysSince = (Date.now() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSince <= 1) return 5;
    else if (daysSince <= 7) return 4;
    else if (daysSince <= 30) return 3;
    else if (daysSince <= 90) return 2;
    else return 1;
  }

  private async computeFrequencyScore(context: CustomerContext): Promise<number> {
    const totalPurchases = context.behavioral.totalPurchases;
    
    if (totalPurchases >= 20) return 5;
    else if (totalPurchases >= 10) return 4;
    else if (totalPurchases >= 5) return 3;
    else if (totalPurchases >= 2) return 2;
    else return 1;
  }

  private async computeMonetaryScore(context: CustomerContext): Promise<number> {
    const lifetimeValue = context.behavioral.lifetimeValue;
    
    if (lifetimeValue >= 5000) return 5;
    else if (lifetimeValue >= 2000) return 4;
    else if (lifetimeValue >= 1000) return 3;
    else if (lifetimeValue >= 500) return 2;
    else return 1;
  }

  private async computeRFMScore(context: CustomerContext): Promise<number> {
    const recency = await this.computeRecencyScore(context);
    const frequency = await this.computeFrequencyScore(context);
    const monetary = await this.computeMonetaryScore(context);
    
    return Math.round((recency + frequency + monetary) / 3);
  }

  private async computeEngagementVelocity(context: CustomerContext): Promise<number> {
    const engagementScore = context.behavioral.engagementScore;
    const sessionDuration = context.contextual.sessionDuration;
    const pageViews = context.contextual.pageViews;
    
    // Calculate engagement velocity
    const velocity = (engagementScore / 100) * (sessionDuration / 300) * (pageViews / 5);
    return Math.min(velocity, 2.0);
  }

  private async computePurchasePropensity(context: CustomerContext): Promise<number> {
    let propensity = 0.2; // Base propensity
    
    // Purchase history influence
    if (context.behavioral.totalPurchases > 0) propensity += 0.2;
    if (context.behavioral.totalPurchases > 5) propensity += 0.1;
    if (context.behavioral.avgOrderValue > 100) propensity += 0.1;
    
    // Engagement influence
    propensity += (context.behavioral.engagementScore / 100) * 0.3;
    
    // Activity level influence
    const activityMultiplier = { 'low': 0.1, 'medium': 0.2, 'high': 0.3 };
    propensity += activityMultiplier[context.behavioral.activityLevel] || 0.1;
    
    return Math.max(0, Math.min(propensity, 1.0));
  }

  private async computeContentAffinity(context: CustomerContext): Promise<{ [contentType: string]: number }> {
    const preferences = context.preferences.contentTypes;
    const affinity: { [contentType: string]: number } = {};
    
    // Default content affinities
    const defaultTypes = ['educational', 'promotional', 'entertainment', 'news', 'product'];
    
    defaultTypes.forEach(type => {
      affinity[type] = preferences.includes(type) ? 0.8 : 0.3;
    });
    
    return affinity;
  }

  private async computeChannelPreferenceScore(context: CustomerContext): Promise<{ [channel: string]: number }> {
    const preferredChannels = context.behavioral.preferredChannels;
    const optedOut = context.preferences.optedOutChannels;
    
    const channelScores: { [channel: string]: number } = {};
    const allChannels = ['email', 'sms', 'push', 'web', 'social'];
    
    allChannels.forEach(channel => {
      if (optedOut.includes(channel)) {
        channelScores[channel] = 0;
      } else if (preferredChannels.includes(channel)) {
        channelScores[channel] = 0.9;
      } else {
        channelScores[channel] = 0.5;
      }
    });
    
    return channelScores;
  }

  private computeDaysSinceLastLogin(lastLoginDate?: Date): number {
    if (!lastLoginDate) return 365; // Default to 1 year if no login
    return Math.floor((Date.now() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  private isWeekend(): boolean {
    const day = new Date().getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  }

  private isBusinessHours(): boolean {
    const hour = new Date().getHours();
    return hour >= 9 && hour <= 17;
  }

  private getTimezoneOffset(timezone?: string): number {
    if (!timezone) return 0;
    // Simplified timezone offset calculation
    // In production, would use proper timezone library
    return new Date().getTimezoneOffset();
  }

  private validateFeatureValue(value: any, definition: FeatureDefinition): any {
    const rules = definition.validationRules;
    
    // Check required
    if (rules.required && (value === null || value === undefined)) {
      console.warn(`[FeatureStore] Required feature ${definition.name} is missing`);
      return definition.defaultValue;
    }
    
    // Type validation
    switch (definition.type) {
      case 'numerical':
        const numValue = Number(value);
        if (isNaN(numValue)) return definition.defaultValue;
        if (rules.min !== undefined && numValue < rules.min) return rules.min;
        if (rules.max !== undefined && numValue > rules.max) return rules.max;
        return numValue;
        
      case 'categorical':
        if (rules.allowedValues && !rules.allowedValues.includes(value)) {
          return definition.defaultValue;
        }
        return value;
        
      case 'boolean':
        return Boolean(value);
        
      case 'datetime':
        const dateValue = value instanceof Date ? value : new Date(value);
        return isNaN(dateValue.getTime()) ? definition.defaultValue : dateValue;
        
      default:
        return value;
    }
  }

  private validateFeatureDefinition(definition: FeatureDefinition): void {
    if (!definition.name) throw new Error('Feature name is required');
    if (!definition.type) throw new Error('Feature type is required');
    if (!definition.source) throw new Error('Feature source is required');
    
    const validTypes = ['numerical', 'categorical', 'boolean', 'datetime', 'text'];
    if (!validTypes.includes(definition.type)) {
      throw new Error(`Invalid feature type: ${definition.type}`);
    }
    
    const validSources = ['realtime', 'batch', 'computed'];
    if (!validSources.includes(definition.source)) {
      throw new Error(`Invalid feature source: ${definition.source}`);
    }
  }

  private async createDefaultFeatureStore(customerId: string, tenantId: string): Promise<FeatureStoreType> {
    return {
      customerId,
      tenantId,
      features: {
        // Initialize with default values
        customer_age: 35,
        total_purchases: 0,
        avg_order_value: 0,
        lifetime_value: 0,
        engagement_score: 50,
        churn_risk_score: 0.3,
        activity_level: 'medium',
        preferred_channel: 'email',
        recency_score: 3,
        frequency_score: 1,
        monetary_score: 1,
        rfm_score: 2
      },
      lastUpdated: new Date(),
      version: this.generateVersion()
    };
  }

  private invalidateComputedFeatures(customerId: string, tenantId: string): void {
    const prefix = `${tenantId}:${customerId}:`;
    const keysToDelete: string[] = [];
    
    this.computedFeatureCache.forEach((_, key) => {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.computedFeatureCache.delete(key));
  }

  private getTTLForFeature(definition: FeatureDefinition): number {
    // Return TTL in milliseconds based on refresh frequency
    switch (definition.refreshFrequency) {
      case 'realtime': return 60 * 1000; // 1 minute
      case 'hourly': return 60 * 60 * 1000; // 1 hour
      case 'daily': return 24 * 60 * 60 * 1000; // 24 hours
      case 'weekly': return 7 * 24 * 60 * 60 * 1000; // 7 days
      default: return 60 * 60 * 1000; // Default 1 hour
    }
  }

  private generateVersion(): string {
    return `v${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private startCacheCleanup(): void {
    // Clean up expired cache entries every 5 minutes
    setInterval(() => {
      const now = Date.now();
      const expiredKeys: string[] = [];
      
      this.computedFeatureCache.forEach((cached, key) => {
        if (now - cached.timestamp.getTime() > cached.ttl) {
          expiredKeys.push(key);
        }
      });
      
      expiredKeys.forEach(key => this.computedFeatureCache.delete(key));
      
      if (expiredKeys.length > 0) {
        console.log(`[FeatureStore] Cleaned up ${expiredKeys.length} expired cache entries`);
      }
    }, 5 * 60 * 1000);
  }

  private initializeFeatureDefinitions(): void {
    const defaultFeatures: FeatureDefinition[] = [
      {
        name: 'customer_age',
        type: 'numerical',
        description: 'Customer age in years',
        source: 'batch',
        refreshFrequency: 'daily',
        defaultValue: 35,
        validationRules: {
          required: false,
          min: 13,
          max: 120
        }
      },
      {
        name: 'total_purchases',
        type: 'numerical',
        description: 'Total number of purchases made by customer',
        source: 'realtime',
        refreshFrequency: 'realtime',
        defaultValue: 0,
        validationRules: {
          required: true,
          min: 0
        }
      },
      {
        name: 'avg_order_value',
        type: 'numerical',
        description: 'Average order value across all purchases',
        source: 'computed',
        refreshFrequency: 'hourly',
        defaultValue: 0,
        computationLogic: 'SUM(order_value) / COUNT(orders)',
        validationRules: {
          required: false,
          min: 0
        }
      },
      {
        name: 'engagement_score',
        type: 'numerical',
        description: 'Customer engagement score (0-100)',
        source: 'computed',
        refreshFrequency: 'hourly',
        defaultValue: 50,
        computationLogic: 'weighted_engagement_calculation',
        validationRules: {
          required: false,
          min: 0,
          max: 100
        }
      },
      {
        name: 'churn_risk_score',
        type: 'numerical',
        description: 'Probability of customer churning (0-1)',
        source: 'computed',
        refreshFrequency: 'daily',
        defaultValue: 0.3,
        computationLogic: 'churn_prediction_model',
        validationRules: {
          required: false,
          min: 0,
          max: 1
        }
      },
      {
        name: 'preferred_channel',
        type: 'categorical',
        description: 'Customer preferred communication channel',
        source: 'batch',
        refreshFrequency: 'weekly',
        defaultValue: 'email',
        validationRules: {
          required: false,
          allowedValues: ['email', 'sms', 'push', 'web', 'social']
        }
      },
      {
        name: 'activity_level',
        type: 'categorical',
        description: 'Customer activity level classification',
        source: 'computed',
        refreshFrequency: 'daily',
        defaultValue: 'medium',
        computationLogic: 'activity_level_classification',
        validationRules: {
          required: false,
          allowedValues: ['low', 'medium', 'high']
        }
      },
      {
        name: 'rfm_score',
        type: 'numerical',
        description: 'RFM (Recency, Frequency, Monetary) composite score',
        source: 'computed',
        refreshFrequency: 'daily',
        defaultValue: 3,
        computationLogic: 'rfm_calculation',
        validationRules: {
          required: false,
          min: 1,
          max: 5
        }
      },
      {
        name: 'purchase_propensity',
        type: 'numerical',
        description: 'Propensity to make a purchase (0-1)',
        source: 'computed',
        refreshFrequency: 'hourly',
        defaultValue: 0.3,
        computationLogic: 'propensity_model_prediction',
        validationRules: {
          required: false,
          min: 0,
          max: 1
        }
      },
      {
        name: 'lifetime_value',
        type: 'numerical',
        description: 'Customer lifetime value in dollars',
        source: 'computed',
        refreshFrequency: 'daily',
        defaultValue: 0,
        computationLogic: 'clv_calculation',
        validationRules: {
          required: false,
          min: 0
        }
      }
    ];

    defaultFeatures.forEach(feature => {
      this.featureDefinitions.set(feature.name, feature);
    });

    console.log(`[FeatureStore] Initialized with ${defaultFeatures.length} feature definitions`);
  }
}