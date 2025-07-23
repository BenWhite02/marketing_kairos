// File: src/pages/ai/DecisionEnginePage.tsx
// Real-time AI Decision Engine - Core decisioning platform for customer interactions
// Provides real-time decision monitoring, rule management, and performance analytics

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { LineChart, BarChart } from '@/components/ui/Charts';
import { useAIDecisions } from '@/hooks/business/useAIDecisions';
import { ROUTES } from '@/constants/routes';
import { useNavigate } from 'react-router-dom';

interface DecisionRule {
  id: string;
  name: string;
  type: 'eligibility' | 'optimization' | 'personalization' | 'frequency';
  status: 'active' | 'inactive' | 'testing';
  priority: number;
  successRate: number;
  executionsToday: number;
  lastModified: string;
  description: string;
}

interface LiveDecision {
  id: string;
  customerId: string;
  timestamp: number;
  decisionType: string;
  outcome: string;
  confidence: number;
  processingTime: number;
  rulesApplied: string[];
  context: Record<string, any>;
}

interface DecisionMetrics {
  totalDecisions: number;
  decisionsPerSecond: number;
  averageLatency: number;
  successRate: number;
  errorRate: number;
  uptime: number;
}

interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
}

const DecisionEnginePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isEngineRunning, setIsEngineRunning] = useState(true);
  const [decisionRules, setDecisionRules] = useState<DecisionRule[]>([]);
  const [liveDecisions, setLiveDecisions] = useState<LiveDecision[]>([]);
  const [metrics, setMetrics] = useState<DecisionMetrics | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const decisionsRef = useRef<HTMLDivElement>(null);

  // Simulate real-time updates
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        setDecisionRules([
          {
            id: 'rule-001',
            name: 'Email Frequency Cap',
            type: 'frequency',
            status: 'active',
            priority: 1,
            successRate: 97.3,
            executionsToday: 45230,
            lastModified: '2 hours ago',
            description: 'Prevents sending more than 3 emails per week to any customer'
          },
          {
            id: 'rule-002',
            name: 'High-Value Customer Prioritization',
            type: 'eligibility',
            status: 'active',
            priority: 2,
            successRate: 94.1,
            executionsToday: 23847,
            lastModified: '1 day ago',
            description: 'Prioritizes campaigns for customers with LTV > $1000'
          },
          {
            id: 'rule-003',
            name: 'Channel Preference Optimization',
            type: 'personalization',
            status: 'active',
            priority: 3,
            successRate: 89.7,
            executionsToday: 67439,
            lastModified: '3 hours ago',
            description: 'Routes communications through customer preferred channels'
          },
          {
            id: 'rule-004',
            name: 'A/B Testing Allocation',
            type: 'optimization',
            status: 'testing',
            priority: 4,
            successRate: 92.5,
            executionsToday: 15672,
            lastModified: '30 minutes ago',
            description: 'Manages traffic allocation for active A/B tests'
          }
        ]);

        setMetrics({
          totalDecisions: 2847293,
          decisionsPerSecond: 127,
          averageLatency: 23,
          successRate: 98.7,
          errorRate: 0.3,
          uptime: 99.97
        });

        setAlerts([
          {
            id: 'alert-001',
            type: 'warning',
            message: 'Elevated latency detected in personalization rules',
            timestamp: '5 minutes ago',
            resolved: false
          },
          {
            id: 'alert-002',
            type: 'info',
            message: 'Rule A/B Testing Allocation was updated',
            timestamp: '30 minutes ago',
            resolved: true
          }
        ]);

        setPerformanceData([
          { time: '12:00', decisions: 125, latency: 22, success: 98.9 },
          { time: '12:15', decisions: 132, latency: 25, success: 98.7 },
          { time: '12:30', decisions: 127, latency: 23, success: 98.8 },
          { time: '12:45', decisions: 145, latency: 21, success: 99.1 },
          { time: '13:00', decisions: 138, latency: 24, success: 98.6 },
          { time: '13:15', decisions: 142, latency: 20, success: 99.2 }
        ]);

      } catch (error) {
        console.error('Failed to load decision engine data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Simulate real-time decision stream
  useEffect(() => {
    if (!isEngineRunning) return;

    const interval = setInterval(() => {
      const newDecision: LiveDecision = {
        id: `decision-${Date.now()}`,
        customerId: `C-${Math.floor(Math.random() * 10000)}`,
        timestamp: Date.now(),
        decisionType: ['Email Campaign', 'Push Notification', 'SMS', 'In-App Message'][Math.floor(Math.random() * 4)],
        outcome: ['Eligible', 'Not Eligible', 'Optimized', 'Personalized'][Math.floor(Math.random() * 4)],
        confidence: 0.7 + Math.random() * 0.3,
        processingTime: 15 + Math.random() * 20,
        rulesApplied: [`rule-00${Math.floor(Math.random() * 4) + 1}`],
        context: {
          channel: ['email', 'push', 'sms'][Math.floor(Math.random() * 3)],
          segment: ['high-value', 'regular', 'new'][Math.floor(Math.random() * 3)]
        }
      };

      setLiveDecisions(prev => [newDecision, ...prev.slice(0, 19)]); // Keep last 20 decisions
    }, 800 + Math.random() * 1200); // Random interval between 0.8-2.0 seconds

    return () => clearInterval(interval);
  }, [isEngineRunning]);

  // Auto-scroll to new decisions
  useEffect(() => {
    if (decisionsRef.current) {
      decisionsRef.current.scrollTop = 0;
    }
  }, [liveDecisions]);

  const toggleEngine = () => {
    setIsEngineRunning(!isEngineRunning);
  };

  const getRuleStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string; icon: string }> = {
      'active': { color: 'bg-green-100 text-green-800', label: 'Active', icon: '🟢' },
      'inactive': { color: 'bg-gray-100 text-gray-800', label: 'Inactive', icon: '⚪' },
      'testing': { color: 'bg-yellow-100 text-yellow-800', label: 'Testing', icon: '🟡' }
    };
    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const getAlertIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      'warning': '⚠️',
      'error': '🚨',
      'info': 'ℹ️'
    };
    return iconMap[type] || '📋';
  };

  const formatDecisionTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour12: false });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center animate-pulse">
            <span className="text-white text-2xl">⚡</span>
          </div>
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Initializing Decision Engine...</p>
          <p className="text-sm text-gray-500 mt-1">Loading rules and performance data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                ⚡ AI Decision Engine
                <div className={`ml-4 w-3 h-3 rounded-full ${isEngineRunning ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              </h1>
              <p className="text-green-100 mt-2">
                Real-time customer decisioning with {metrics?.decisionsPerSecond || 0} decisions/second
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant={isEngineRunning ? 'tertiary' : 'primary'}
                size="sm"
                className={isEngineRunning 
                  ? "bg-red-500/20 border-red-400/30 text-white hover:bg-red-500/30" 
                  : "bg-green-500 text-white hover:bg-green-600"
                }
                onClick={toggleEngine}
              >
                {isEngineRunning ? '⏸️ Pause Engine' : '▶️ Start Engine'}
              </Button>
              <Button 
                variant="tertiary" 
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => navigate(ROUTES.AI.RULE_BUILDER)}
              >
                Rule Builder
              </Button>
            </div>
          </div>
        </div>

        {/* Engine Status and Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <Card className="bg-white border-0 shadow-sm">
              <CardBody className="p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{metrics.errorRate}%</p>
                <p className="text-sm text-gray-600">Error Rate</p>
              </CardBody>
            </Card>
            <Card className="bg-white border-0 shadow-sm">
              <CardBody className="p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">{metrics.uptime}%</p>
                <p className="text-sm text-gray-600">Uptime</p>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Alerts Banner */}
        {alerts.filter(alert => !alert.resolved).length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-yellow-600 text-lg mr-3">⚠️</span>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Active Alerts</h3>
                <div className="mt-1 space-y-1">
                  {alerts.filter(alert => !alert.resolved).map(alert => (
                    <p key={alert.id} className="text-sm text-yellow-700">
                      {alert.message} • {alert.timestamp}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Decision Rules */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Decision Rules</h2>
                  <p className="text-gray-600">Active decisioning logic</p>
                </div>
                <Button 
                  variant="tertiary" 
                  size="sm"
                  onClick={() => navigate(ROUTES.AI.RULE_BUILDER)}
                >
                  Add Rule
                </Button>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <div className="space-y-0">
                {decisionRules.map((rule, index) => (
                  <div
                    key={rule.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      index !== decisionRules.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                    onClick={() => navigate(`/ai/rules/${rule.id}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900">{rule.name}</h3>
                      {getRuleStatusBadge(rule.status)}
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{rule.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                      <div>
                        <span className="font-medium">Success Rate:</span> {rule.successRate}%
                      </div>
                      <div>
                        <span className="font-medium">Priority:</span> {rule.priority}
                      </div>
                      <div>
                        <span className="font-medium">Executions:</span> {rule.executionsToday.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Updated:</span> {rule.lastModified}
                      </div>
                    </div>
                    {rule.status === 'active' && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-green-500 h-1 rounded-full" 
                            style={{ width: `${rule.successRate}%` }}
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
                onClick={() => navigate('/ai/rules')}
              >
                Manage All Rules
              </Button>
            </CardFooter>
          </Card>

          {/* Live Decision Stream */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    Live Decisions
                    {isEngineRunning && <div className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
                  </h2>
                  <p className="text-gray-600">Real-time decision stream</p>
                </div>
                <Badge className={`${isEngineRunning ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {isEngineRunning ? 'Live' : 'Paused'}
                </Badge>
              </div>
            </CardHeader>
            <CardBody className="p-0 h-96 overflow-hidden">
              <div 
                ref={decisionsRef}
                className="h-full overflow-y-auto space-y-0"
              >
                {liveDecisions.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    {isEngineRunning ? '⏳ Waiting for decisions...' : '⏸️ Engine paused'}
                  </div>
                ) : (
                  liveDecisions.map((decision, index) => (
                    <div
                      key={decision.id}
                      className={`p-3 hover:bg-gray-50 transition-colors ${
                        index !== liveDecisions.length - 1 ? 'border-b border-gray-100' : ''
                      } ${index === 0 ? 'bg-blue-50 border-blue-200' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {decision.customerId}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDecisionTime(decision.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">{decision.decisionType}</span>
                        <span className={`text-xs font-medium ${
                          decision.outcome === 'Eligible' ? 'text-green-600' : 
                          decision.outcome === 'Not Eligible' ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {decision.outcome}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Confidence: {Math.round(decision.confidence * 100)}%</span>
                        <span>{Math.round(decision.processingTime)}ms</span>
                      </div>
                      <div className="mt-1">
                        <div className="flex flex-wrap gap-1">
                          {decision.rulesApplied.map(rule => (
                            <span 
                              key={rule}
                              className="inline-block px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                            >
                              {rule}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardBody>
            <CardFooter className="border-t border-gray-200 pt-4">
              <Button 
                variant="tertiary" 
                size="sm" 
                className="w-full"
                onClick={() => navigate('/ai/decisions/history')}
              >
                View Decision History
              </Button>
            </CardFooter>
          </Card>

          {/* Performance Chart */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="border-b border-gray-200 pb-4">
              <h2 className="text-xl font-semibold text-gray-900">Performance Metrics</h2>
              <div className="flex items-center space-x-2 mt-2">
                {['15m', '1h', '6h', '24h'].map(range => (
                  <button
                    key={range}
                    onClick={() => setSelectedTimeRange(range)}
                    className={`px-2 py-1 text-xs rounded ${
                      selectedTimeRange === range 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardBody className="p-4">
              {performanceData.length > 0 ? (
                <LineChart 
                  data={performanceData}
                  height={240}
                  xAxisDataKey="time"
                  lines={[
                    { dataKey: 'decisions', color: '#3B82F6', name: 'Decisions/sec' },
                    { dataKey: 'latency', color: '#F59E0B', name: 'Latency (ms)' },
                    { dataKey: 'success', color: '#10B981', name: 'Success Rate %' }
                  ]}
                />
              ) : (
                <div className="h-60 flex items-center justify-center text-gray-500">
                  📊 Loading performance data...
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Alerts and System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* System Alerts */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="border-b border-gray-200 pb-4">
              <h2 className="text-xl font-semibold text-gray-900">System Alerts</h2>
              <p className="text-gray-600">Performance and operational alerts</p>
            </CardHeader>
            <CardBody className="p-0">
              {alerts.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  ✅ No active alerts - system running smoothly
                </div>
              ) : (
                <div className="space-y-0">
                  {alerts.map((alert, index) => (
                    <div
                      key={alert.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        index !== alerts.length - 1 ? 'border-b border-gray-100' : ''
                      } ${alert.resolved ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-lg mt-0.5">{getAlertIcon(alert.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                            {alert.resolved && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                Resolved
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{alert.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
            <CardHeader className="border-b border-blue-200 pb-4">
              <h2 className="text-xl font-semibold text-gray-900">Decision Engine Actions</h2>
              <p className="text-gray-600">Quick access to common tasks</p>
            </CardHeader>
            <CardBody className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="tertiary" 
                  className="flex flex-col items-center p-4 h-auto hover:bg-blue-100"
                  onClick={() => navigate(ROUTES.AI.RULE_BUILDER)}
                >
                  <span className="text-2xl mb-2">🎛️</span>
                  <span className="text-sm text-center">Create Rule</span>
                </Button>
                <Button 
                  variant="tertiary" 
                  className="flex flex-col items-center p-4 h-auto hover:bg-blue-100"
                  onClick={() => navigate('/ai/decisions/test')}
                >
                  <span className="text-2xl mb-2">🧪</span>
                  <span className="text-sm text-center">Test Decision</span>
                </Button>
                <Button 
                  variant="tertiary" 
                  className="flex flex-col items-center p-4 h-auto hover:bg-blue-100"
                  onClick={() => navigate('/ai/decisions/export')}
                >
                  <span className="text-2xl mb-2">📊</span>
                  <span className="text-sm text-center">Export Data</span>
                </Button>
                <Button 
                  variant="tertiary" 
                  className="flex flex-col items-center p-4 h-auto hover:bg-blue-100"
                  onClick={() => navigate('/ai/decisions/settings')}
                >
                  <span className="text-2xl mb-2">⚙️</span>
                  <span className="text-sm text-center">Engine Settings</span>
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Engine Status Footer */}
        <Card className="bg-gray-900 text-white border-0">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isEngineRunning ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span className="text-sm font-medium">
                    Engine {isEngineRunning ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="text-sm text-gray-300">
                  Uptime: {metrics?.uptime}% • Last Restart: 3 days ago
                </div>
              </div>
              <div className="text-sm text-gray-300">
                Version 4.2.1 • Build: 2024.07.22
              </div>
            </div>
          </CardBody>
        </Card>

      </div>
    </div>
  );
};

export default DecisionEnginePage;-center">
                <p className="text-2xl font-bold text-blue-600">{metrics.totalDecisions.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Decisions</p>
              </CardBody>
            </Card>
            <Card className="bg-white border-0 shadow-sm">
              <CardBody className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{metrics.decisionsPerSecond}</p>
                <p className="text-sm text-gray-600">Decisions/Sec</p>
              </CardBody>
            </Card>
            <Card className="bg-white border-0 shadow-sm">
              <CardBody className="p-4 text-center">
                <p className="text-2xl font-bold text-yellow-600">{metrics.averageLatency}ms</p>
                <p className="text-sm text-gray-600">Avg Latency</p>
              </CardBody>
            </Card>
            <Card className="bg-white border-0 shadow-sm">
              <CardBody className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{metrics.successRate}%</p>
                <p className="text-sm text-gray-600">Success Rate</p>
              </CardBody>
            </Card>
            <Card className="bg-white border-0 shadow-sm">
              <CardBody className="p-4 text