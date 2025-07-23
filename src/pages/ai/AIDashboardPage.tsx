// File: src/pages/ai/AIDashboardPage.tsx
// AI & Machine Learning Dashboard - Central control center for AI operations
// Provides model monitoring, decision insights, and AI performance metrics

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { LineChart, BarChart, PieChart } from '@/components/ui/Charts';
import { AIDecisionDashboard } from '@/components/business/ai/AIDecisionDashboard';
import { useAIDecisions } from '@/hooks/business/useAIDecisions';
import { useModelRegistry } from '@/hooks/business/useModelRegistry';
import { ROUTES } from '@/constants/routes';
import { useNavigate } from 'react-router-dom';

interface AIModel {
  id: string;
  name: string;
  type: 'recommendation' | 'prediction' | 'classification' | 'optimization';
  status: 'active' | 'training' | 'inactive' | 'error';
  accuracy: number;
  lastUpdated: string;
  predictions24h: number;
  version: string;
}

interface DecisionMetric {
  id: string;
  name: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: string;
  description: string;
}

interface AIInsight {
  id: string;
  type: 'optimization' | 'alert' | 'recommendation' | 'trend';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  timestamp: string;
  actionable: boolean;
}

const AIDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [models, setModels] = useState<AIModel[]>([]);
  const [metrics, setMetrics] = useState<DecisionMetric[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [realTimeDecisions, setRealTimeDecisions] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);

  // Mock data - will be replaced with real AI service calls
  useEffect(() => {
    const loadAIDashboardData = async () => {
      try {
        setLoading(true);
        
        // Simulate AI data loading
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setModels([
          {
            id: 'rec-engine-v3',
            name: 'Recommendation Engine v3.2',
            type: 'recommendation',
            status: 'active',
            accuracy: 94.2,
            lastUpdated: '5 minutes ago',
            predictions24h: 15420,
            version: '3.2.1'
          },
          {
            id: 'churn-predictor',
            name: 'Churn Prediction Model',
            type: 'prediction',
            status: 'active',
            accuracy: 87.8,
            lastUpdated: '12 minutes ago',
            predictions24h: 8934,
            version: '2.1.0'
          },
          {
            id: 'segment-classifier',
            name: 'Customer Segment Classifier',
            type: 'classification',
            status: 'training',
            accuracy: 91.5,
            lastUpdated: '2 hours ago',
            predictions24h: 0,
            version: '1.8.3'
          },
          {
            id: 'campaign-optimizer',
            name: 'Campaign Optimization Engine',
            type: 'optimization',
            status: 'active',
            accuracy: 89.1,
            lastUpdated: '8 minutes ago',
            predictions24h: 3247,
            version: '4.0.2'
          }
        ]);

        setMetrics([
          {
            id: 'decisions-per-second',
            name: 'Decisions/Second',
            value: 127,
            change: 8.5,
            changeType: 'increase',
            icon: 'zap',
            description: 'Real-time decision throughput'
          },
          {
            id: 'model-accuracy',
            name: 'Avg Model Accuracy',
            value: '90.7%',
            change: 2.3,
            changeType: 'increase',
            icon: 'target',
            description: 'Weighted average across all models'
          },
          {
            id: 'ai-uplift',
            name: 'AI-driven Uplift',
            value: '+18.4%',
            change: 12.1,
            changeType: 'increase',
            icon: 'trending-up',
            description: 'Performance improvement vs. baseline'
          },
          {
            id: 'response-time',
            name: 'Avg Response Time',
            value: '23ms',
            change: -15.2,
            changeType: 'decrease',
            icon: 'clock',
            description: 'Model inference latency'
          }
        ]);

        setInsights([
          {
            id: 'campaign-optimization',
            type: 'optimization',
            title: 'Campaign Budget Reallocation Opportunity',
            description: 'Our models suggest reallocating 15% of budget from Display to Email for 23% better ROI.',
            impact: 'high',
            confidence: 94,
            timestamp: '10 minutes ago',
            actionable: true
          },
          {
            id: 'segment-drift',
            type: 'alert',
            title: 'Customer Segment Distribution Drift Detected',
            description: 'Segment composition has shifted by >15% in the last 7 days. Model retraining recommended.',
            impact: 'medium',
            confidence: 87,
            timestamp: '2 hours ago',
            actionable: true
          },
          {
            id: 'new-pattern',
            type: 'trend',
            title: 'Emerging Customer Behavior Pattern',
            description: 'Mobile engagement shows 40% increase during lunch hours. Consider timing optimization.',
            impact: 'medium',
            confidence: 78,
            timestamp: '4 hours ago',
            actionable: false
          }
        ]);

        setPerformanceData([
          { time: '00:00', accuracy: 89, throughput: 95, latency: 25 },
          { time: '04:00', accuracy: 91, throughput: 87, latency: 23 },
          { time: '08:00', accuracy: 93, throughput: 110, latency: 21 },
          { time: '12:00', accuracy: 92, throughput: 125, latency: 19 },
          { time: '16:00', accuracy: 94, throughput: 132, latency: 18 },
          { time: '20:00', accuracy: 90, throughput: 98, latency: 22 }
        ]);

        // Simulate real-time decisions
        setRealTimeDecisions([
          { id: 1, customer: 'C-7829', decision: 'Email Campaign A', confidence: 0.94, timestamp: Date.now() - 1000 },
          { id: 2, customer: 'C-5431', decision: 'Push Notification', confidence: 0.87, timestamp: Date.now() - 3000 },
          { id: 3, customer: 'C-9247', decision: 'SMS Campaign', confidence: 0.91, timestamp: Date.now() - 5000 }
        ]);

      } catch (error) {
        console.error('Failed to load AI dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAIDashboardData();
  }, []);

  const getModelStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string; icon: string }> = {
      'active': { color: 'bg-green-100 text-green-800', label: 'Active', icon: '🟢' },
      'training': { color: 'bg-yellow-100 text-yellow-800', label: 'Training', icon: '🔄' },
      'inactive': { color: 'bg-gray-100 text-gray-800', label: 'Inactive', icon: '⚪' },
      'error': { color: 'bg-red-100 text-red-800', label: 'Error', icon: '🔴' }
    };
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: 'Unknown', icon: '❓' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const getInsightIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      'optimization': '🎯',
      'alert': '⚠️',
      'recommendation': '💡',
      'trend': '📈'
    };
    return iconMap[type] || '📊';
  };

  const getImpactBadge = (impact: string) => {
    const impactConfig: Record<string, { color: string; label: string }> = {
      'high': { color: 'bg-red-100 text-red-800', label: 'High Impact' },
      'medium': { color: 'bg-yellow-100 text-yellow-800', label: 'Medium Impact' },
      'low': { color: 'bg-blue-100 text-blue-800', label: 'Low Impact' }
    };
    const config = impactConfig[impact] || { color: 'bg-gray-100 text-gray-800', label: 'Unknown' };
    return <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>{config.label}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center animate-pulse">
            <span className="text-white text-2xl">🧠</span>
          </div>
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading AI Dashboard...</p>
          <p className="text-sm text-gray-500 mt-1">Analyzing models and gathering insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                🧠 AI & Machine Learning Dashboard
              </h1>
              <p className="text-blue-100 mt-2">
                Monitor AI models, track decisions, and discover optimization opportunities
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="tertiary" 
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => navigate(ROUTES.AI.MODEL_REGISTRY)}
              >
                Model Registry
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                className="bg-white text-blue-600 hover:bg-blue-50"
                onClick={() => navigate(ROUTES.AI.DECISION_ENGINE)}
              >
                Decision Engine
              </Button>
            </div>
          </div>
        </div>

        {/* AI Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric) => (
            <Card key={metric.id} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                  </div>
                  <div className="text-2xl">
                    {metric.icon === 'zap' && '⚡'}
                    {metric.icon === 'target' && '🎯'}
                    {metric.icon === 'trending-up' && '📈'}
                    {metric.icon === 'clock' && '⏱️'}
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-gray-500">{metric.description}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm font-medium ${
                      metric.changeType === 'increase' ? 'text-green-600' : 
                      metric.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {metric.changeType === 'increase' ? '↗' : metric.changeType === 'decrease' ? '↘' : '→'} 
                      {Math.abs(metric.change)}%
                    </span>
                    <span className="text-sm text-gray-500 ml-2">vs yesterday</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* AI Models Status and Performance Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* AI Models Status */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="border-b border-gray-200 pb-4">
              <h2 className="text-xl font-semibold text-gray-900">AI Models Status</h2>
              <p className="text-gray-600">Real-time model health and performance</p>
            </CardHeader>
            <CardBody className="p-0">
              <div className="space-y-0">
                {models.map((model, index) => (
                  <div
                    key={model.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      index !== models.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                    onClick={() => navigate(`/ai/models/${model.id}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {model.name}
                      </h3>
                      {getModelStatusBadge(model.status)}
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Accuracy: {model.accuracy}%</span>
                      <span>v{model.version}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                      <span>{model.predictions24h.toLocaleString()} predictions/24h</span>
                      <span>{model.lastUpdated}</span>
                    </div>
                    {model.status === 'active' && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-green-500 h-1.5 rounded-full" 
                            style={{ width: `${model.accuracy}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardBody>
            <CardFooter className="border-t border-gray-200 pt-4">
              <Button 
                variant="tertiary" 
                size="sm" 
                className="w-full"
                onClick={() => navigate(ROUTES.AI.MODEL_REGISTRY)}
              >
                View All Models
              </Button>
            </CardFooter>
          </Card>

          {/* Performance Chart */}
          <Card className="lg:col-span-2 bg-white border-0 shadow-sm">
            <CardHeader className="border-b border-gray-200 pb-4">
              <h2 className="text-xl font-semibold text-gray-900">AI Performance Trends</h2>
              <p className="text-gray-600">Model accuracy, throughput, and latency over time</p>
            </CardHeader>
            <CardBody className="p-6">
              {performanceData.length > 0 ? (
                <LineChart 
                  data={performanceData}
                  height={300}
                  xAxisDataKey="time"
                  lines={[
                    { dataKey: 'accuracy', color: '#10B981', name: 'Accuracy %' },
                    { dataKey: 'throughput', color: '#3B82F6', name: 'Throughput' },
                    { dataKey: 'latency', color: '#F59E0B', name: 'Latency (ms)' }
                  ]}
                />
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  📊 Loading performance data...
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* AI Insights and Real-Time Decisions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* AI Insights */}
          <Card className="lg:col-span-2 bg-white border-0 shadow-sm">
            <CardHeader className="border-b border-gray-200 pb-4">
              <h2 className="text-xl font-semibold text-gray-900">AI Insights & Recommendations</h2>
              <p className="text-gray-600">Actionable insights from your AI models</p>
            </CardHeader>
            <CardBody className="p-0">
              <div className="space-y-0">
                {insights.map((insight, index) => (
                  <div
                    key={insight.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      index !== insights.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-xl mt-0.5">{getInsightIcon(insight.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-gray-900">{insight.title}</h3>
                          <div className="flex items-center space-x-2">
                            {getImpactBadge(insight.impact)}
                            {insight.actionable && (
                              <Badge className="bg-blue-100 text-blue-800 text-xs">
                                Actionable
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-xs text-gray-500">
                              Confidence: {insight.confidence}%
                            </span>
                            <span className="text-xs text-gray-500">{insight.timestamp}</span>
                          </div>
                          {insight.actionable && (
                            <Button variant="tertiary" size="sm" className="text-xs">
                              Take Action
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
            <CardFooter className="border-t border-gray-200 pt-4">
              <Button 
                variant="tertiary" 
                size="sm" 
                className="w-full"
                onClick={() => navigate(ROUTES.AI.INSIGHTS)}
              >
                View All Insights
              </Button>
            </CardFooter>
          </Card>

          {/* Real-Time Decisions */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="border-b border-gray-200 pb-4">
              <h2 className="text-xl font-semibold text-gray-900">Live Decisions</h2>
              <p className="text-gray-600">Real-time AI decision stream</p>
            </CardHeader>
            <CardBody className="p-4">
              <div className="space-y-3">
                {realTimeDecisions.map((decision) => (
                  <div key={decision.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{decision.customer}</p>
                      <p className="text-xs text-gray-600">{decision.decision}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">
                        {Math.round(decision.confidence * 100)}%
                      </p>
                      <p className="text-xs text-gray-500">just now</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                  <span className="text-sm text-blue-800 font-medium">127 decisions/sec</span>
                </div>
              </div>
            </CardBody>
            <CardFooter className="border-t border-gray-200 pt-4">
              <Button 
                variant="tertiary" 
                size="sm" 
                className="w-full"
                onClick={() => navigate(ROUTES.AI.DECISION_ENGINE)}
              >
                View Decision Engine
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Quick Access Actions */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
          <CardBody className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button 
                variant="tertiary" 
                className="flex flex-col items-center p-4 h-auto"
                onClick={() => navigate(ROUTES.AI.EXPERIMENTS)}
              >
                <span className="text-2xl mb-2">🧪</span>
                <span className="text-sm">Run Experiment</span>
              </Button>
              <Button 
                variant="tertiary" 
                className="flex flex-col items-center p-4 h-auto"
                onClick={() => navigate(ROUTES.AI.FEATURE_STORE)}
              >
                <span className="text-2xl mb-2">🗄️</span>
                <span className="text-sm">Feature Store</span>
              </Button>
              <Button 
                variant="tertiary" 
                className="flex flex-col items-center p-4 h-auto"
                onClick={() => navigate(ROUTES.AI.RULE_BUILDER)}
              >
                <span className="text-2xl mb-2">🎛️</span>
                <span className="text-sm">Rule Builder</span>
              </Button>
              <Button 
                variant="tertiary" 
                className="flex flex-col items-center p-4 h-auto"
                onClick={() => navigate('/ai/training')}
              >
                <span className="text-2xl mb-2">🎓</span>
                <span className="text-sm">Model Training</span>
              </Button>
            </div>
          </CardBody>
        </Card>

      </div>
    </div>
  );
};

export default AIDashboardPage;