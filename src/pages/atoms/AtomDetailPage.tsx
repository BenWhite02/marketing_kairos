// src/pages/atoms/AtomDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PencilIcon,
  PlayIcon,
  PauseIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  CogIcon,
  EyeIcon,
  ArrowLeftIcon,
  ShareIcon,
  BookmarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useAtomComposition } from '@/hooks/business/useAtomComposition';
import { ROUTES } from '@/constants/routes';

interface AtomRule {
  id: string;
  field: string;
  operator: string;
  value: string | number;
  logicOperator?: 'AND' | 'OR';
}

interface AtomVersion {
  id: string;
  version: string;
  createdAt: string;
  createdBy: string;
  changes: string;
  isActive: boolean;
}

interface AtomDetail {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'demographic' | 'behavioral' | 'transactional' | 'contextual';
  status: 'active' | 'inactive' | 'draft' | 'testing';
  rules: AtomRule[];
  performance: {
    accuracy: number;
    usage: number;
    conversions: number;
    revenue: number;
  };
  metadata: {
    createdAt: string;
    createdBy: string;
    lastModified: string;
    modifiedBy: string;
    version: string;
    tags: string[];
  };
  versions: AtomVersion[];
}

export const AtomDetailPage: React.FC = () => {
  const { atomId } = useParams<{ atomId: string }>();
  const navigate = useNavigate();
  const [atom, setAtom] = useState<AtomDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'rules' | 'performance' | 'versions'>('overview');

  // Mock data - in real app, fetch from API
  useEffect(() => {
    const fetchAtomDetail = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockAtom: AtomDetail = {
          id: atomId || '1',
          name: 'High-Value Customer',
          description: 'Identifies customers with lifetime value above $5,000 and recent purchase activity',
          category: 'Customer Segmentation',
          type: 'behavioral',
          status: 'active',
          rules: [
            { id: '1', field: 'lifetime_value', operator: '>', value: 5000, logicOperator: 'AND' },
            { id: '2', field: 'last_purchase_days', operator: '<=', value: 30, logicOperator: 'AND' },
            { id: '3', field: 'purchase_frequency', operator: '>=', value: 3 }
          ],
          performance: {
            accuracy: 87.5,
            usage: 1247,
            conversions: 342,
            revenue: 125000
          },
          metadata: {
            createdAt: '2024-01-15T10:30:00Z',
            createdBy: 'Sarah Johnson',
            lastModified: '2024-01-22T14:15:00Z',
            modifiedBy: 'Mike Chen',
            version: '2.1',
            tags: ['high-value', 'segmentation', 'revenue']
          },
          versions: [
            {
              id: '1',
              version: '2.1',
              createdAt: '2024-01-22T14:15:00Z',
              createdBy: 'Mike Chen',
              changes: 'Updated lifetime value threshold from $3,000 to $5,000',
              isActive: true
            },
            {
              id: '2',
              version: '2.0',
              createdAt: '2024-01-18T09:20:00Z',
              createdBy: 'Sarah Johnson',
              changes: 'Added purchase frequency condition',
              isActive: false
            },
            {
              id: '3',
              version: '1.0',
              createdAt: '2024-01-15T10:30:00Z',
              createdBy: 'Sarah Johnson',
              changes: 'Initial creation',
              isActive: false
            }
          ]
        };
        
        setAtom(mockAtom);
      } catch (error) {
        console.error('Failed to fetch atom details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (atomId) {
      fetchAtomDetail();
    }
  }, [atomId]);

  const handleStatusToggle = async () => {
    if (!atom) return;
    
    const newStatus = atom.status === 'active' ? 'inactive' : 'active';
    setAtom({ ...atom, status: newStatus });
    
    // In real app, call API to update status
    console.log(`Toggling atom status to: ${newStatus}`);
  };

  const handleTestAtom = async () => {
    setIsTesting(true);
    try {
      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Testing atom:', atom?.id);
    } finally {
      setIsTesting(false);
    }
  };

  const handleDuplicateAtom = () => {
    navigate('/atoms/composer', { 
      state: { duplicateFrom: atom?.id } 
    });
  };

  const handleDeleteAtom = async () => {
    try {
      // Simulate delete API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Deleting atom:', atom?.id);
      navigate(ROUTES.ATOMS.LIST);
    } catch (error) {
      console.error('Failed to delete atom:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'gray';
      case 'draft': return 'yellow';
      case 'testing': return 'blue';
      default: return 'gray';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'demographic': return '👥';
      case 'behavioral': return '🎯';
      case 'transactional': return '💳';
      case 'contextual': return '📍';
      default: return '⚛️';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading atom details...</p>
        </div>
      </div>
    );
  }

  if (!atom) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Atom Not Found</h2>
          <p className="text-gray-600 mb-4">The atom you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => navigate(ROUTES.ATOMS.LIST)}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Atoms
          </Button>
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
                onClick={() => navigate(ROUTES.ATOMS.LIST)}
                className="p-2"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
              
              <div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getTypeIcon(atom.type)}</span>
                  <h1 className="text-2xl font-bold text-gray-900">{atom.name}</h1>
                  <Badge variant={getStatusColor(atom.status)} className="capitalize">
                    {atom.status}
                  </Badge>
                </div>
                <p className="text-gray-600 mt-1">{atom.description}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={() => setShowVersionModal(true)}
              >
                <ClockIcon className="h-4 w-4 mr-2" />
                v{atom.metadata.version}
              </Button>

              <Button
                variant="secondary"
                onClick={handleTestAtom}
                loading={isTesting}
              >
                <PlayIcon className="h-4 w-4 mr-2" />
                Test
              </Button>

              <Button
                variant="secondary"
                onClick={handleDuplicateAtom}
              >
                <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                Duplicate
              </Button>

              <Button
                variant="secondary"
                onClick={handleStatusToggle}
              >
                {atom.status === 'active' ? (
                  <>
                    <PauseIcon className="h-4 w-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </Button>

              <Button
                onClick={() => setIsEditing(true)}
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: EyeIcon },
              { id: 'rules', label: 'Rules', icon: CogIcon },
              { id: 'performance', label: 'Performance', icon: ChartBarIcon },
              { id: 'versions', label: 'Versions', icon: ClockIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Performance Overview</h3>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {atom.performance.accuracy}%
                      </div>
                      <div className="text-sm text-gray-600">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {atom.performance.usage.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Usage</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {atom.performance.conversions.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Conversions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-600">
                        ${atom.performance.revenue.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Revenue</div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Rules Preview */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Rule Configuration</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    {atom.rules.map((rule, index) => (
                      <div key={rule.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        {index > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {rule.logicOperator}
                          </Badge>
                        )}
                        <span className="font-medium">{rule.field}</span>
                        <span className="text-gray-600">{rule.operator}</span>
                        <span className="font-medium text-blue-600">{rule.value}</span>
                      </div>
                    ))}
                  </div>
                </CardBody>
                <CardFooter>
                  <Button
                    variant="ghost"
                    onClick={() => setActiveTab('rules')}
                    className="w-full"
                  >
                    View Full Rules Configuration
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Metadata */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Details</h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Category</label>
                    <p className="text-gray-900">{atom.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Type</label>
                    <p className="text-gray-900 capitalize">{atom.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Created</label>
                    <p className="text-gray-900">
                      {new Date(atom.metadata.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">by {atom.metadata.createdBy}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Last Modified</label>
                    <p className="text-gray-900">
                      {new Date(atom.metadata.lastModified).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">by {atom.metadata.modifiedBy}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tags</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {atom.metadata.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Actions</h3>
                </CardHeader>
                <CardBody className="space-y-3">
                  <Button variant="secondary" className="w-full justify-start">
                    <ShareIcon className="h-4 w-4 mr-3" />
                    Share Atom
                  </Button>
                  <Button variant="secondary" className="w-full justify-start">
                    <BookmarkIcon className="h-4 w-4 mr-3" />
                    Add to Favorites
                  </Button>
                  <Button variant="secondary" className="w-full justify-start">
                    <ChartBarIcon className="h-4 w-4 mr-3" />
                    View Analytics
                  </Button>
                  <Button
                    variant="danger"
                    className="w-full justify-start"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <TrashIcon className="h-4 w-4 mr-3" />
                    Delete Atom
                  </Button>
                </CardBody>
              </Card>
            </div>
          </div>
        )}

        {/* Rules Tab */}
        {activeTab === 'rules' && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Rule Configuration</h3>
              <p className="text-gray-600">Define the logic that determines when this atom applies</p>
            </CardHeader>
            <CardBody>
              <div className="space-y-6">
                {atom.rules.map((rule, index) => (
                  <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Rule {index + 1}</h4>
                      {index > 0 && (
                        <Badge variant="secondary">
                          {rule.logicOperator} operator
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Field
                        </label>
                        <Input value={rule.field} readOnly />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Operator
                        </label>
                        <Input value={rule.operator} readOnly />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Value
                        </label>
                        <Input value={rule.value.toString()} readOnly />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
            <CardFooter>
              <Button>
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Rules
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Performance Analytics</h3>
              </CardHeader>
              <CardBody>
                <div className="text-center py-12">
                  <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Performance Charts Coming Soon
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Detailed analytics and performance metrics will be available here.
                  </p>
                  <Button onClick={() => navigate(`/atoms/${atom.id}/analytics`)}>
                    View Full Analytics
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Versions Tab */}
        {activeTab === 'versions' && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Version History</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {atom.versions.map((version) => (
                  <div
                    key={version.id}
                    className={`border rounded-lg p-4 ${
                      version.isActive ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <Badge variant={version.isActive ? 'primary' : 'secondary'}>
                          v{version.version}
                        </Badge>
                        {version.isActive && (
                          <Badge variant="green">
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(version.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <p className="text-gray-900 mb-2">{version.changes}</p>
                    <div className="flex items-center text-sm text-gray-600">
                      <UserIcon className="h-4 w-4 mr-1" />
                      {version.createdBy}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Atom"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mt-1" />
            <div>
              <p className="text-gray-900">
                Are you sure you want to delete "{atom.name}"? This action cannot be undone.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                This atom is currently being used in {atom.performance.usage} active moments.
                Deleting it will affect those moments.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAtom}
            >
              Delete Atom
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};