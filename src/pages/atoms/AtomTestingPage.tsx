// src/pages/atoms/AtomTestingPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  BeakerIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TrophyIcon,
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  AdjustmentsHorizontalIcon,
  DocumentDuplicateIcon,
  PlusIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { LineChart, BarChart } from '@/components/business/analytics/Charts';
import { ROUTES } from '@/constants/routes';

interface TestVariant {
  id: string;
  name: string;
  description: string;
  rules: Array<{
    field: string;
    operator: string;
    value: string | number;
  }>;
  trafficAllocation: number;
  metrics: {
    evaluations: number;
    accuracy: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
  };
  isControl: boolean;
  isWinner?: boolean;
}

interface AtomTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'stopped';
  atomId: string;
  atomName: string;
  startDate?: string;
  endDate?: string;
  duration: number; // days
  targetTraffic: number;
  variants: TestVariant[];
  hypothesis: string;
  successMetric: 'accuracy' | 'conversions' | 'revenue' | 'conversionRate';
  confidenceLevel: number;
  significance?: {
    isSignificant: boolean;
    pValue: number;
    confidenceInterval: [number, number];
  };
  timeline: Array<{
    date: string;
    control: number;
    variant: number;
  }>;
}

export const AtomTestingPage: React.FC = () => {
  const { atomId } = useParams<{ atomId: string }>();
  const navigate = useNavigate();
  const [atom, setAtom] = useState<any>(null);
  const [tests, setTests] = useState<AtomTest[]>([]);
  const [activeTest, setActiveTest] = useState<AtomTest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'active' | 'history' | 'create'>('active');

  useEffect(() => {
    const fetchTestingData = async () => {
      setIsLoading(true);
      try {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock atom data
        setAtom({
          id: atomId,
          name: 'High-Value Customer',
          description: 'Identifies customers with lifetime value above $5,000',
          type: 'behavioral',
          status: 'active'
        });

        // Mock test data
        const mockTests: AtomTest[] = [
          {
            id: '1',
            name: 'Lifetime Value Threshold Optimization',
            description: 'Testing different LTV thresholds to improve accuracy',
            status: 'running',
            atomId: atomId || '1',
            atomName: 'High-Value Customer',
            startDate: '2024-01-20T00:00:00Z',
            duration: 14,
            targetTraffic: 10000,
            hypothesis: 'Increasing the LTV threshold from $5,000 to $7,500 will improve prediction accuracy by reducing false positives',
            successMetric: 'accuracy',
            confidenceLevel: 95,
            variants: [
              {
                id: 'control',
                name: 'Control ($5,000 threshold)',
                description: 'Current production version with $5,000 LTV threshold',
                rules: [
                  { field: 'lifetime_value', operator: '>', value: 5000 }
                ],
                trafficAllocation: 50,
                metrics: {
                  evaluations: 4823,
                  accuracy: 85.2,
                  conversions: 1247,
                  revenue: 89450,
                  conversionRate: 25.9
                },
                isControl: true
              },
              {
                id: 'variant',
                name: 'Variant ($7,500 threshold)',
                description: 'Testing higher LTV threshold for better precision',
                rules: [
                  { field: 'lifetime_value', operator: '>', value: 7500 }
                ],
                trafficAllocation: 50,
                metrics: {
                  evaluations: 4791,
                  accuracy: 89.7,
                  conversions: 1189,
                  revenue: 92340,
                  conversionRate: 24.8
                },
                isControl: false,
                isWinner: true
              }
            ],
            significance: {
              isSignificant: true,
              pValue: 0.032,
              confidenceInterval: [0.8, 6.2]
            },
            timeline: Array.from({ length: 10 }, (_, i) => ({
              date: new Date(Date.now() - (9 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              control: Math.random() * 5 + 83,
              variant: Math.random() * 5 + 87
            }))
          },
          {
            id: '2',
            name: 'Multi-Factor Segmentation Test',
            description: 'Testing additional behavioral factors for improved targeting',
            status: 'completed',
            atomId: atomId || '1',
            atomName: 'High-Value Customer',
            startDate: '2024-01-01T00:00:00Z',
            endDate: '2024-01-15T00:00:00Z',
            duration: 14,
            targetTraffic: 15000,
            hypothesis: 'Adding purchase frequency and recency factors will improve conversion rates',
            successMetric: 'conversionRate',
            confidenceLevel: 95,
            variants: [
              {
                id: 'control',
                name: 'Control (LTV only)',
                description: 'Original atom with only lifetime value criteria',
                rules: [
                  { field: 'lifetime_value', operator: '>', value: 5000 }
                ],
                trafficAllocation: 50,
                metrics: {
                  evaluations: 7456,
                  accuracy: 85.2,
                  conversions: 1834,
                  revenue: 134560,
                  conversionRate: 24.6
                },
                isControl: true
              },
              {
                id: 'variant',
                name: 'Variant (Multi-factor)',
                description: 'Enhanced atom with LTV, frequency, and recency',
                rules: [
                  { field: 'lifetime_value', operator: '>', value: 5000 },
                  { field: 'purchase_frequency', operator: '>=', value: 3 },
                  { field: 'last_purchase_days', operator: '<=', value: 30 }
                ],
                trafficAllocation: 50,
                metrics: {
                  evaluations: 7521,
                  accuracy: 91.4,
                  conversions: 2187,
                  revenue: 156780,
                  conversionRate: 29.1
                },
                isControl: false,
                isWinner: true
              }
            ],
            significance: {
              isSignificant: true,
              pValue: 0.001,
              confidenceInterval: [2.8, 6.2]
            },
            timeline: Array.from({ length: 14 }, (_, i) => ({
              date: new Date(new Date('2024-01-01').getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              control: Math.random() * 3 + 24,
              variant: Math.random() * 3 + 28
            }))
          }
        ];

        setTests(mockTests);
        setActiveTest(mockTests.find(test => test.status === 'running') || null);
      } catch (error) {
        console.error('Failed to fetch testing data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (atomId) {
      fetchTestingData();
    }
  }, [atomId]);

  const handleStartTest = async (testId: string) => {
    const test = tests.find(t => t.id === testId);
    if (test) {
      const updatedTest = { ...test, status: 'running' as const, startDate: new Date().toISOString() };
      setTests(tests.map(t => t.id === testId ? updatedTest : t));
      setActiveTest(updatedTest);
    }
  };

  const handlePauseTest = async (testId: string) => {
    setTests(tests.map(t => t.id === testId ? { ...t, status: 'paused' as const } : t));
  };

  const handleStopTest = async (testId: string) => {
    const test = tests.find(t => t.id === testId);
    if (test) {
      const updatedTest = { 
        ...test, 
        status: 'completed' as const, 
        endDate: new Date().toISOString() 
      };
      setTests(tests.map(t => t.id === testId ? updatedTest : t));
      setActiveTest(null);
      setShowStopModal(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'green';
      case 'paused': return 'yellow';
      case 'completed': return 'blue';
      case 'stopped': return 'red';
      case 'draft': return 'gray';
      default: return 'gray';
    }
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'accuracy': return ChartBarIcon;
      case 'conversions': return UsersIcon;
      case 'revenue': return CurrencyDollarIcon;
      case 'conversionRate': return TrophyIcon;
      default: return ChartBarIcon;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading testing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate(`/atoms/${atomId}`)}
                className="p-2"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  A/B Testing: {atom?.name}
                </h1>
                <p className="text-gray-600 mt-1">{atom?.description}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setShowCreateModal(true)}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Test
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8">
            {[
              { id: 'active', label: 'Active Tests', count: tests.filter(t => ['running', 'paused'].includes(t.status)).length },
              { id: 'history', label: 'Test History', count: tests.filter(t => ['completed', 'stopped'].includes(t.status)).length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="font-medium">{tab.label}</span>
                {tab.count > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {tab.count}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Active Tests Tab */}
        {selectedTab === 'active' && (
          <div className="space-y-8">
            {activeTest ? (
              <div>
                {/* Test Overview */}
                <Card className="mb-8">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-3">
                          <BeakerIcon className="h-6 w-6 text-blue-600" />
                          <h2 className="text-xl font-semibold">{activeTest.name}</h2>
                          <Badge variant={getStatusColor(activeTest.status)} className="capitalize">
                            {activeTest.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mt-1">{activeTest.description}</p>
                      </div>
                      <div className="flex space-x-2">
                        {activeTest.status === 'running' && (
                          <>
                            <Button
                              variant="secondary"
                              onClick={() => handlePauseTest(activeTest.id)}
                            >
                              <PauseIcon className="h-4 w-4 mr-2" />
                              Pause
                            </Button>
                            <Button
                              variant="danger"
                              onClick={() => setShowStopModal(true)}
                            >
                              <StopIcon className="h-4 w-4 mr-2" />
                              Stop Test
                            </Button>
                          </>
                        )}
                        {activeTest.status === 'paused' && (
                          <Button
                            onClick={() => handleStartTest(activeTest.id)}
                          >
                            <PlayIcon className="h-4 w-4 mr-2" />
                            Resume
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Test Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Duration:</span>
                            <span>{activeTest.duration} days</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Target Traffic:</span>
                            <span>{activeTest.targetTraffic.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Success Metric:</span>
                            <span className="capitalize">{activeTest.successMetric}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Confidence:</span>
                            <span>{activeTest.confidenceLevel}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Hypothesis</h4>
                        <p className="text-sm text-gray-600">{activeTest.hypothesis}</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Statistical Significance</h4>
                        {activeTest.significance && (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              {activeTest.significance.isSignificant ? (
                                <CheckCircleIcon className="h-4 w-4 text-green-600" />
                              ) : (
                                <ClockIcon className="h-4 w-4 text-yellow-600" />
                              )}
                              <span className="text-sm font-medium">
                                {activeTest.significance.isSignificant ? 'Significant' : 'Not yet significant'}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600">
                              <div>p-value: {activeTest.significance.pValue}</div>
                              <div>CI: [{activeTest.significance.confidenceInterval[0]}%, {activeTest.significance.confidenceInterval[1]}%]</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Variants Comparison */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {activeTest.variants.map((variant) => (
                    <Card key={variant.id} className={variant.isWinner ? 'ring-2 ring-green-500' : ''}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{variant.name}</h3>
                            {variant.isControl && (
                              <Badge variant="secondary">Control</Badge>
                            )}
                            {variant.isWinner && (
                              <Badge variant="green">
                                <TrophyIcon className="h-3 w-3 mr-1" />
                                Winner
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            {variant.trafficAllocation}% traffic
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{variant.description}</p>
                      </CardHeader>
                      <CardBody>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {variant.metrics.accuracy}%
                            </div>
                            <div className="text-xs text-gray-600">Accuracy</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {variant.metrics.conversionRate}%
                            </div>
                            <div className="text-xs text-gray-600">Conversion Rate</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-purple-600">
                              {variant.metrics.conversions.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-600">Conversions</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-emerald-600">
                              ${variant.metrics.revenue.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-600">Revenue</div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Rules:</h5>
                          <div className="space-y-1">
                            {variant.rules.map((rule, index) => (
                              <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                                {rule.field} {rule.operator} {rule.value}
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>

                {/* Performance Chart */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Performance Timeline</h3>
                    <p className="text-gray-600">Daily comparison of test variants</p>
                  </CardHeader>
                  <CardBody>
                    <LineChart
                      data={activeTest.timeline}
                      xKey="date"
                      lines={[
                        { key: 'control', color: '#6B7280', name: 'Control' },
                        { key: 'variant', color: '#3B82F6', name: 'Variant' }
                      ]}
                      height={300}
                    />
                  </CardBody>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <BeakerIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Tests</h3>
                <p className="text-gray-600 mb-4">
                  There are no active A/B tests running for this atom.
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Your First Test
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Test History Tab */}
        {selectedTab === 'history' && (
          <div className="space-y-6">
            {tests.filter(test => ['completed', 'stopped'].includes(test.status)).map((test) => (
              <Card key={test.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold">{test.name}</h3>
                        <Badge variant={getStatusColor(test.status)} className="capitalize">
                          {test.status}
                        </Badge>
                        {test.variants.some(v => v.isWinner) && (
                          <Badge variant="green">
                            <TrophyIcon className="h-3 w-3 mr-1" />
                            Winner Found
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mt-1">{test.description}</p>
                    </div>
                    <div className="text-sm text-gray-600">
                      {test.startDate && new Date(test.startDate).toLocaleDateString()} - {' '}
                      {test.endDate && new Date(test.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Results Summary</h4>
                      <div className="space-y-2 text-sm">
                        {test.variants.map((variant) => (
                          <div key={variant.id} className="flex items-center justify-between">
                            <span className={variant.isControl ? 'text-gray-600' : 'text-blue-600'}>
                              {variant.isControl ? 'Control' : 'Variant'}:
                            </span>
                            <span className="font-medium">
                              {variant.metrics[test.successMetric as keyof typeof variant.metrics]}
                              {test.successMetric.includes('Rate') || test.successMetric === 'accuracy' ? '%' : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Hypothesis</h4>
                      <p className="text-sm text-gray-600">{test.hypothesis}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Outcome</h4>
                      {test.significance && (
                        <div className="flex items-center space-x-2">
                          {test.significance.isSignificant ? (
                            <CheckCircleIcon className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircleIcon className="h-4 w-4 text-red-600" />
                          )}
                          <span className="text-sm">
                            {test.significance.isSignificant ? 'Statistically significant' : 'Not significant'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardBody>
                <CardFooter>
                  <div className="flex space-x-3">
                    <Button variant="secondary" size="sm">
                      <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                      Duplicate Test
                    </Button>
                    <Button variant="secondary" size="sm">
                      <ChartBarIcon className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}

            {tests.filter(test => ['completed', 'stopped'].includes(test.status)).length === 0 && (
              <div className="text-center py-12">
                <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Test History</h3>
                <p className="text-gray-600">
                  Completed tests will appear here once you finish running experiments.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Test Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create A/B Test"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <Input
              label="Test Name"
              placeholder="e.g., Threshold Optimization Test"
              className="w-full"
            />
          </div>

          <div>
            <TextArea
              label="Description"
              placeholder="Describe what you're testing and why..."
              rows={3}
              className="w-full"
            />
          </div>

          <div>
            <TextArea
              label="Hypothesis"
              placeholder="What do you expect to happen and why?"
              rows={3}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Success Metric
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="accuracy">Accuracy</option>
                <option value="conversionRate">Conversion Rate</option>
                <option value="conversions">Total Conversions</option>
                <option value="revenue">Revenue</option>
              </select>
            </div>
            <div>
              <Input
                label="Test Duration (days)"
                type="number"
                placeholder="14"
                min="1"
                max="90"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button>
              Create Test
            </Button>
          </div>
        </div>
      </Modal>

      {/* Stop Test Modal */}
      <Modal
        isOpen={showStopModal}
        onClose={() => setShowStopModal(false)}
        title="Stop Test"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mt-1" />
            <div>
              <p className="text-gray-900">
                Are you sure you want to stop this test? This action cannot be undone.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                The test will be marked as completed and you won't be able to resume it.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowStopModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => activeTest && handleStopTest(activeTest.id)}
            >
              Stop Test
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};