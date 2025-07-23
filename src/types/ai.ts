// src/types/ai.ts

export interface CustomerContext {
  customerId: string;
  tenantId: string;
  demographics: {
    age?: number;
    gender?: string;
    location?: {
      country: string;
      city: string;
      timezone: string;
    };
    segment?: string;
  };
  behavioral: {
    lastLoginDate?: Date;
    totalPurchases: number;
    avgOrderValue: number;
    lifetimeValue: number;
    churnRisk: number; // 0-1
    engagementScore: number; // 0-100
    preferredChannels: string[];
    activityLevel: 'low' | 'medium' | 'high';
  };
  contextual: {
    currentTime: Date;
    deviceType: 'mobile' | 'desktop' | 'tablet';
    sessionDuration: number;
    pageViews: number;
    currentPage?: string;
    referrer?: string;
  };
  preferences: {
    communicationFrequency: 'low' | 'medium' | 'high';
    contentTypes: string[];
    topics: string[];
    optedOutChannels: string[];
  };
}

export interface DecisionRequest {
  requestId: string;
  customerId: string;
  tenantId: string;
  decisionType: 'next_best_action' | 'content_recommendation' | 'channel_optimization' | 'timing_optimization';
  context: CustomerContext;
  objectives: DecisionObjective[];
  constraints?: DecisionConstraint[];
  options?: {
    maxRecommendations?: number;
    includeReasons?: boolean;
    includeConfidence?: boolean;
    timeout?: number; // milliseconds
  };
}

export interface DecisionObjective {
  type: 'revenue' | 'engagement' | 'retention' | 'conversion' | 'satisfaction';
  weight: number; // 0-1, should sum to 1 across all objectives
  target?: number; // optional target value
}

export interface DecisionConstraint {
  type: 'budget' | 'inventory' | 'frequency' | 'compliance' | 'business_rules';
  value: any;
  description: string;
}

export interface Recommendation {
  id: string;
  type: 'offer' | 'content' | 'channel' | 'timing' | 'product';
  title: string;
  description: string;
  confidence: number; // 0-1
  expectedValue: number; // predicted revenue/value
  priority: number; // 1-10
  metadata: {
    campaignId?: string;
    offerType?: string;
    discount?: number;
    validUntil?: Date;
    targetMetrics: {
      expectedConversionRate: number;
      expectedRevenue: number;
      expectedEngagement: number;
    };
  };
  reasons: string[];
  alternatives?: Recommendation[];
}

export interface DecisionResult {
  requestId: string;
  customerId: string;
  tenantId: string;
  timestamp: Date;
  recommendations: Recommendation[];
  overallConfidence: number; // 0-1
  executionTimeMs: number;
  modelVersions: { [modelName: string]: string };
  experimentsApplied: string[];
  fallbackReason?: string;
  debugInfo?: {
    featureValues: { [featureName: string]: any };
    modelScores: { [modelName: string]: number };
    rules_applied: string[];
  };
}

export interface MLModel {
  id: string;
  name: string;
  version: string;
  type: 'classification' | 'regression' | 'ranking' | 'clustering' | 'recommendation';
  purpose: 'churn_prediction' | 'clv_forecasting' | 'propensity_scoring' | 'recommendation' | 'content_optimization';
  status: 'training' | 'ready' | 'deployed' | 'deprecated' | 'error';
  metadata: {
    description: string;
    createdAt: Date;
    lastTrained: Date;
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    features: string[];
    targetVariable?: string;
    algorithm: string;
    hyperparameters: { [key: string]: any };
  };
  performance: {
    accuracy: number;
    latency: number; // milliseconds
    throughput: number; // predictions per second
    memoryUsage: number; // MB
    driftScore?: number; // 0-1, higher means more drift
    lastEvaluated: Date;
  };
  deployment: {
    environment: 'development' | 'staging' | 'production';
    endpoint?: string;
    scalingConfig: {
      minInstances: number;
      maxInstances: number;
      targetCPU: number;
    };
  };
}

export interface FeatureDefinition {
  name: string;
  type: 'numerical' | 'categorical' | 'boolean' | 'datetime' | 'text';
  description: string;
  source: 'realtime' | 'batch' | 'computed';
  computationLogic?: string;
  refreshFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  defaultValue?: any;
  validationRules: {
    required: boolean;
    min?: number;
    max?: number;
    allowedValues?: any[];
    regex?: string;
  };
}

export interface FeatureStore {
  customerId: string;
  tenantId: string;
  features: { [featureName: string]: any };
  lastUpdated: Date;
  version: string;
}

export interface Experiment {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'cancelled';
  type: 'ab_test' | 'multivariate' | 'bandit';
  startDate: Date;
  endDate?: Date;
  targetAudience: {
    criteria: string;
    size: number;
    allocation: { [variantId: string]: number }; // percentage allocation
  };
  variants: ExperimentVariant[];
  metrics: {
    primary: string;
    secondary: string[];
  };
  results?: ExperimentResults;
  configuration: {
    confidenceLevel: number; // 0.95, 0.99, etc.
    minimumDetectableEffect: number;
    trafficAllocation: number; // 0-1
    randomizationUnit: 'customer' | 'session' | 'device';
  };
}

export interface ExperimentVariant {
  id: string;
  name: string;
  description: string;
  allocation: number; // 0-1
  configuration: {
    modelId?: string;
    rules?: string[];
    parameters?: { [key: string]: any };
  };
}

export interface ExperimentResults {
  status: 'running' | 'completed' | 'inconclusive';
  winner?: string; // variant ID
  confidence: number; // statistical confidence
  results: {
    [variantId: string]: {
      participants: number;
      conversions: number;
      conversionRate: number;
      revenue: number;
      revenuePerUser: number;
      significance: number;
      confidenceInterval: [number, number];
    };
  };
  insights: string[];
  recommendations: string[];
}

export interface ModelPerformanceMetrics {
  modelId: string;
  timestamp: Date;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    auc?: number;
    rmse?: number;
    mae?: number;
    latency: number;
    throughput: number;
  };
  dataQuality: {
    missingValues: number;
    outliers: number;
    drift: number;
    bias: number;
  };
  businessMetrics: {
    conversionRate: number;
    revenue: number;
    customerSatisfaction: number;
    retention: number;
  };
}

export interface AIInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'opportunity' | 'risk' | 'optimization';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  confidence: number; // 0-1
  impact: {
    estimated_revenue: number;
    estimated_customers: number;
    timeline: string;
  };
  recommendations: string[];
  evidence: {
    data_points: number;
    time_period: string;
    statistical_significance: number;
  };
  createdAt: Date;
  dismissed?: boolean;
  actions_taken?: string[];
}