// src/components/business/ai/AIDecisionDashboard.tsx

import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, Target, Zap, Activity, Clock, Users, Award, Settings } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { useAIDecisions } from '../../../hooks/business/useAIDecisions';
import { useModelRegistry } from '../../../hooks/business/useModelRegistry';
import { useExperimentation } from '../../../hooks/business/useExperimentation';
import { useAIStore } from '../../../stores/business/aiStore';
import { DecisionResult, AIInsight, MLModel } from '../../../types/ai';

export const AIDecisionDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'decisions' | 'models' | 'experiments' | 'insights'>('overview');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('customer_123');
  
  const { 
    makeDecision, 
    isProcessing, 
    lastDecision, 
    decisionHistory, 
    performanceSummary,
    canMakeDecision 
  } = useAIDecisions();
  
  const { 
    models, 
    stats: modelStats, 
    selectedModelPerformance,
    deployModel,
    canDeployModel 
  } = useModelRegistry();
  
  const { 
    experiments,
    stats: experimentStats,
    selectedExperimentResults,
    startExperiment,
    stopExperiment 
  } = useExperimentation();
  
  const { 
    insights,
    systemMetrics,
    generateInsights,
    dismissInsight,
    isInitialized 
  } = useAIStore();

  // Demo customer context
  const demoCustomerContext = {
    customerId: selectedCustomerId,
    tenantId: 'demo_tenant',
    demographics: {
      age: 32,
      gender: 'female',
      location: { country: 'US', city: 'San Francisco', timezone: 'America/Los_Angeles' },
      segment: 'premium'
    },
    behavioral: {
      totalPurchases: 8,
      avgOrderValue: 125.50,
      lifetimeValue: 1204.00,
      churnRisk: 0.25,
      engagementScore: 78,
      preferredChannels: ['email', 'push'],
      activityLevel: 'high' as const
    },
    contextual: {
      currentTime: new Date(),
      deviceType: 'mobile' as const,
      sessionDuration: 420,
      pageViews: 7,
      currentPage: '/products/premium-plan',
      referrer: 'google_ads'
    },
    preferences: {
      communicationFrequency: 'medium' as const,
      contentTypes: ['educational', 'promotional'],
      topics: ['technology', 'productivity'],
      optedOutChannels: []
    }
  };

  const handleMakeDecision = async () => {
    await makeDecision(
      selectedCustomerId,
      'demo_tenant',
      demoCustomerContext,
      'next_best_action'
    );
  };

  const handleGenerateInsights = async () => {
    await generateInsights();
  };

  // Status indicator component
  const StatusIndicator: React.FC<{ status: 'healthy' | 'warning' | 'critical' }> = ({ status }) => {
    const colors = {
      healthy: 'bg-green-500',
      warning: 'bg-yellow-500',
      critical: 'bg-red-500'
    };
    
    return (
      <div className={`w-3 h-3 rounded-full ${colors[status]} animate-pulse`} />
    );
  };

  // Overview Tab Component
  const OverviewTab: React.FC = () => (
    <div className="space-y-6">
      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">System Health</p>
                <div className="flex items-center gap-2 mt-1">
                  <StatusIndicator status={systemMetrics.systemHealth} />
                  <span className="text-sm font-medium capitalize">{systemMetrics.systemHealth}</span>
                </div>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Decisions</p>
                <p className="text-2xl font-bold">{performanceSummary.totalDecisions.toLocaleString()}</p>
              </div>
              <Brain className="w-8 h-8 text-purple-500" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold">{performanceSummary.avgDecisionTime.toFixed(0)}ms</p>
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Confidence</p>
                <p className="text-2xl font-bold">{(performanceSummary.avgConfidence * 100).toFixed(1)}%</p>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Quick Decision Test */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Quick Decision Test
          </h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer ID
              </label>
              <input
                type="text"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter customer ID"
              />
            </div>
            <div className="pt-6">
              <Button
                onClick={handleMakeDecision}
                disabled={!canMakeDecision || isProcessing}
                className="flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    Make Decision
                  </>
                )}
              </Button>
            </div>
          </div>

          {lastDecision && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Latest Decision Result</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Decision ID:</span>
                  <span className="font-mono">{lastDecision.requestId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Confidence:</span>
                  <span className="font-medium">{(lastDecision.overallConfidence * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Execution Time:</span>
                  <span>{lastDecision.executionTimeMs}ms</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Recommendations:</span>
                  <span>{lastDecision.recommendations.length}</span>
                </div>
              </div>
              
              {lastDecision.recommendations.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Top Recommendation:</p>
                  <div className="bg-white rounded p-3 border">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{lastDecision.recommendations[0].title}</p>
                        <p className="text-sm text-gray-600">{lastDecision.recommendations[0].description}</p>
                      </div>
                      <Badge variant="secondary">
                        {(lastDecision.recommendations[0].confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Models Overview */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Models Status
          </h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{modelStats.totalModels}</p>
              <p className="text-sm text-gray-600">Total Models</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{modelStats.deployedModels}</p>
              <p className="text-sm text-gray-600">Deployed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{modelStats.trainingModels}</p>
              <p className="text-sm text-gray-600">Training</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{modelStats.errorModels}</p>
              <p className="text-sm text-gray-600">Errors</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  // Decisions Tab Component
  const DecisionsTab: React.FC = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Recent Decisions</h3>
        </CardHeader>
        <CardBody>
          {decisionHistory.length > 0 ? (
            <div className="space-y-4">
              {decisionHistory.slice(0, 10).map((decision) => (
                <div key={decision.requestId} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-mono text-sm text-gray-600">{decision.requestId}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(decision.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={decision.overallConfidence > 0.7 ? 'default' : 'secondary'}>
                        {(decision.overallConfidence * 100).toFixed(1)}% confidence
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">{decision.executionTimeMs}ms</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {decision.recommendations.slice(0, 2).map((rec, idx) => (
                      <div key={rec.id} className="bg-gray-50 rounded p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{rec.title}</p>
                            <p className="text-sm text-gray-600">{rec.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">${rec.expectedValue.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">Priority {rec.priority}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No decisions made yet. Try the quick test above!</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );

  // Models Tab Component
  const ModelsTab: React.FC = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {models.map((model) => (
          <Card key={model.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{model.name}</h3>
                  <p className="text-sm text-gray-600">v{model.version}</p>
                </div>
                <Badge variant={
                  model.status === 'deployed' ? 'default' :
                  model.status === 'training' ? 'secondary' :
                  model.status === 'error' ? 'destructive' : 'outline'
                }>
                  {model.status}
                </Badge>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              <p className="text-sm text-gray-600">{model.metadata.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Accuracy:</span>
                  <span className="font-medium">{(model.performance.accuracy * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Latency:</span>
                  <span className="font-medium">{model.performance.latency}ms</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Purpose:</span>
                  <span className="font-medium capitalize">{model.purpose.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Trained:</span>
                  <span className="font-medium">
                    {new Date(model.metadata.lastTrained).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {canDeployModel(model.id) && (
                <Button
                  onClick={() => deployModel(model.id)}
                  className="w-full mt-3"
                  size="sm"
                >
                  Deploy Model
                </Button>
              )}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );

  // Experiments Tab Component
  const ExperimentsTab: React.FC = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Experiment Overview</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{experimentStats.totalExperiments}</p>
              <p className="text-sm text-gray-600">Total Experiments</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{experimentStats.runningExperiments}</p>
              <p className="text-sm text-gray-600">Running</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{experimentStats.completedExperiments}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{experimentStats.significantResults}</p>
              <p className="text-sm text-gray-600">Significant Results</p>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {experiments.map((experiment) => (
          <Card key={experiment.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{experiment.name}</h3>
                  <p className="text-sm text-gray-600">{experiment.description}</p>
                </div>
                <Badge variant={
                  experiment.status === 'running' ? 'default' :
                  experiment.status === 'completed' ? 'secondary' :
                  'outline'
                }>
                  {experiment.status}
                </Badge>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium capitalize">{experiment.type.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Variants:</span>
                  <span className="font-medium">{experiment.variants.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Target Size:</span>
                  <span className="font-medium">{experiment.targetAudience.size.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Primary Metric:</span>
                  <span className="font-medium">{experiment.metrics.primary}</span>
                </div>
              </div>

              <div className="flex gap-2">
                {experiment.status === 'draft' && (
                  <Button
                    onClick={() => startExperiment(experiment.id)}
                    size="sm"
                    className="flex-1"
                  >
                    Start Experiment
                  </Button>
                )}
                {experiment.status === 'running' && (
                  <Button
                    onClick={() => stopExperiment(experiment.id)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Stop Experiment
                  </Button>
                )}
              </div>

              {experiment.results && (
                <div className="bg-gray-50 rounded p-3 mt-3">
                  <p className="text-sm font-medium mb-2">Results Summary</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Confidence:</span>
                      <span className="font-medium">{(experiment.results.confidence * 100).toFixed(1)}%</span>
                    </div>
                    {experiment.results.winner && (
                      <div className="flex justify-between text-sm">
                        <span>Winner:</span>
                        <span className="font-medium text-green-600">{experiment.results.winner}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>Status:</span>
                      <span className="font-medium capitalize">{experiment.results.status}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );

  // Insights Tab Component
  const InsightsTab: React.FC = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">AI-Generated Insights</h3>
        <Button onClick={handleGenerateInsights} className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Generate New Insights
        </Button>
      </div>

      {insights.length > 0 ? (
        <div className="space-y-4">
          {insights.filter(insight => !insight.dismissed).map((insight) => (
            <Card key={insight.id}>
              <CardBody className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      insight.severity === 'critical' ? 'bg-red-100 text-red-600' :
                      insight.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                      insight.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {insight.type === 'anomaly' ? <AlertTriangle className="w-5 h-5" /> :
                       insight.type === 'opportunity' ? <Target className="w-5 h-5" /> :
                       insight.type === 'trend' ? <TrendingUp className="w-5 h-5" /> :
                       <Activity className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      insight.severity === 'critical' ? 'destructive' :
                      insight.severity === 'high' ? 'destructive' :
                      insight.severity === 'medium' ? 'secondary' :
                      'outline'
                    }>
                      {insight.severity}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => dismissInsight(insight.id, 'Reviewed by user')}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-sm text-gray-600">Estimated Revenue Impact</p>
                    <p className="text-lg font-semibold text-green-600">
                      ${insight.impact.estimated_revenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-sm text-gray-600">Affected Customers</p>
                    <p className="text-lg font-semibold">
                      {insight.impact.estimated_customers.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-sm text-gray-600">Confidence</p>
                    <p className="text-lg font-semibold">
                      {(insight.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Recommendations:</p>
                  <ul className="space-y-1">
                    {insight.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardBody className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No insights available. Click "Generate New Insights" to analyze recent data.</p>
          </CardBody>
        </Card>
      )}
    </div>
  );

  // Initialize AI services on mount
  useEffect(() => {
    if (!isInitialized) {
      console.log('[AIDecisionDashboard] AI services not initialized, waiting...');
    }
  }, [isInitialized]);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing AI services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Brain className="w-8 h-8 text-blue-600" />
          AI Decision Engine
        </h1>
        <p className="text-gray-600 mt-1">
          Real-time customer decisioning powered by machine learning
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'decisions', label: 'Decisions', icon: Brain },
            { id: 'models', label: 'Models', icon: Settings },
            { id: 'experiments', label: 'Experiments', icon: Users },
            { id: 'insights', label: 'Insights', icon: TrendingUp }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'decisions' && <DecisionsTab />}
        {activeTab === 'models' && <ModelsTab />}
        {activeTab === 'experiments' && <ExperimentsTab />}
        {activeTab === 'insights' && <InsightsTab />}
      </div>
    </div>
  );
};