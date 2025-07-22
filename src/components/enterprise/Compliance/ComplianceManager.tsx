// src/components/enterprise/Compliance/ComplianceManager.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheckIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  DownloadIcon,
  EyeIcon,
  TrashIcon,
  UserIcon,
  KeyIcon,
  LockClosedIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardBody } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Input } from '../../ui/Input';
import { ComplianceConfiguration } from '../../../types/enterprise';

interface ComplianceRequest {
  id: string;
  type: 'data_export' | 'data_deletion' | 'consent_withdrawal' | 'access_request';
  userId: string;
  userEmail: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  requestDate: string;
  completionDate?: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface AuditRecord {
  id: string;
  event: string;
  userId: string;
  userEmail: string;
  timestamp: string;
  details: string;
  complianceFramework: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

interface ComplianceManagerProps {
  configuration?: ComplianceConfiguration;
  onConfigurationChange?: (config: Partial<ComplianceConfiguration>) => void;
}

export const ComplianceManager: React.FC<ComplianceManagerProps> = ({
  configuration,
  onConfigurationChange,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'gdpr' | 'sox' | 'hipaa' | 'requests' | 'audit'>('overview');
  const [requests, setRequests] = useState<ComplianceRequest[]>([]);
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    setIsLoading(true);
    
    // Mock data - replace with actual API calls
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setRequests([
      {
        id: 'req-1',
        type: 'data_export',
        userId: 'user-1',
        userEmail: 'john.doe@example.com',
        status: 'pending',
        requestDate: '2024-01-15T10:00:00Z',
        description: 'GDPR Article 20 - Data Portability Request',
        priority: 'medium',
      },
      {
        id: 'req-2',
        type: 'data_deletion',
        userId: 'user-2',
        userEmail: 'jane.smith@example.com',
        status: 'in_progress',
        requestDate: '2024-01-14T14:30:00Z',
        description: 'GDPR Article 17 - Right to Erasure Request',
        priority: 'high',
      },
      {
        id: 'req-3',
        type: 'consent_withdrawal',
        userId: 'user-3',
        userEmail: 'bob.wilson@example.com',
        status: 'completed',
        requestDate: '2024-01-13T09:15:00Z',
        completionDate: '2024-01-14T16:45:00Z',
        description: 'Marketing consent withdrawal',
        priority: 'medium',
      },
    ]);

    setAuditRecords([
      {
        id: 'audit-1',
        event: 'Personal data accessed',
        userId: 'user-admin',
        userEmail: 'admin@example.com',
        timestamp: '2024-01-15T11:30:00Z',
        details: 'Accessed customer profile data for support request',
        complianceFramework: ['GDPR', 'HIPAA'],
        riskLevel: 'low',
      },
      {
        id: 'audit-2',
        event: 'Bulk data export',
        userId: 'user-manager',
        userEmail: 'manager@example.com',
        timestamp: '2024-01-15T10:00:00Z',
        details: 'Exported customer data for analytics (anonymized)',
        complianceFramework: ['GDPR', 'SOX'],
        riskLevel: 'medium',
      },
      {
        id: 'audit-3',
        event: 'Data retention policy applied',
        userId: 'system',
        userEmail: 'system@kairos.app',
        timestamp: '2024-01-15T02:00:00Z',
        details: 'Automatically deleted data older than 7 years',
        complianceFramework: ['GDPR', 'SOX'],
        riskLevel: 'low',
      },
    ]);

    setIsLoading(false);
  };

  const handleRequestAction = (requestId: string, action: 'approve' | 'reject' | 'complete') => {
    setRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { 
            ...req, 
            status: action === 'approve' ? 'in_progress' : action === 'reject' ? 'rejected' : 'completed',
            completionDate: action === 'complete' ? new Date().toISOString() : req.completionDate
          }
        : req
    ));
  };

  const getRequestIcon = (type: string) => {
    switch (type) {
      case 'data_export':
        return <DownloadIcon className="w-4 h-4" />;
      case 'data_deletion':
        return <TrashIcon className="w-4 h-4" />;
      case 'consent_withdrawal':
        return <XMarkIcon className="w-4 h-4" />;
      case 'access_request':
        return <EyeIcon className="w-4 h-4" />;
      default:
        return <DocumentTextIcon className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="info">In Progress</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="error">Urgent</Badge>;
      case 'high':
        return <Badge variant="warning">High</Badge>;
      case 'medium':
        return <Badge variant="info">Medium</Badge>;
      case 'low':
        return <Badge variant="default">Low</Badge>;
      default:
        return <Badge variant="default">{priority}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ShieldCheckIcon },
    { id: 'gdpr', label: 'GDPR', icon: GlobeAltIcon },
    { id: 'sox', label: 'SOX', icon: DocumentTextIcon },
    { id: 'hipaa', label: 'HIPAA', icon: LockClosedIcon },
    { id: 'requests', label: 'Data Requests', icon: UserIcon },
    { id: 'audit', label: 'Audit Trail', icon: ClockIcon },
  ];

  const complianceMetrics = [
    {
      name: 'GDPR Compliance',
      score: 96,
      status: 'compliant',
      lastAssessment: '2024-01-10',
      nextAssessment: '2024-04-10',
    },
    {
      name: 'SOX Compliance',
      score: 94,
      status: 'compliant',
      lastAssessment: '2024-01-08',
      nextAssessment: '2024-04-08',
    },
    {
      name: 'HIPAA Compliance',
      score: 98,
      status: 'compliant',
      lastAssessment: '2024-01-12',
      nextAssessment: '2024-04-12',
    },
    {
      name: 'ISO 27001',
      score: 92,
      status: 'needs_attention',
      lastAssessment: '2024-01-05',
      nextAssessment: '2024-04-05',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading compliance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <ShieldCheckIcon className="w-8 h-8 mr-3 text-blue-600" />
          Compliance Management
        </h1>
        <p className="mt-2 text-gray-600">
          Manage data protection, privacy, and regulatory compliance
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <nav className="flex space-x-8 border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Compliance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {complianceMetrics.map((metric) => (
                  <Card key={metric.name}>
                    <CardBody className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{metric.name}</h3>
                        {metric.status === 'compliant' ? (
                          <CheckCircleIcon className="w-6 h-6 text-green-500" />
                        ) : (
                          <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Score</span>
                          <span className="text-2xl font-bold text-gray-900">{metric.score}%</span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              metric.score >= 95 ? 'bg-green-500' : 
                              metric.score >= 85 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${metric.score}%` }}
                          />
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          <p>Last: {formatDate(metric.lastAssessment)}</p>
                          <p>Next: {formatDate(metric.nextAssessment)}</p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Recent Data Requests</h3>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-3">
                      {requests.slice(0, 3).map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getRequestIcon(request.type)}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{request.userEmail}</p>
                              <p className="text-xs text-gray-500">{request.description}</p>
                            </div>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Recent Audit Events</h3>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-3">
                      {auditRecords.slice(0, 3).map((record) => (
                        <div key={record.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-900">{record.event}</p>
                            <Badge variant={
                              record.riskLevel === 'high' ? 'error' :
                              record.riskLevel === 'medium' ? 'warning' : 'default'
                            }>
                              {record.riskLevel}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">{record.details}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">{record.userEmail}</span>
                            <span className="text-xs text-gray-500">{formatDate(record.timestamp)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'gdpr' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">GDPR Configuration</h3>
                  <p className="text-gray-600">General Data Protection Regulation compliance settings</p>
                </CardHeader>
                <CardBody className="space-y-6">
                  {/* Data Controller Info */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Data Controller Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Controller Name"
                        value={configuration?.gdpr?.dataController?.name || ''}
                        placeholder="Your Organization Name"
                        onChange={(e) => onConfigurationChange?.({
                          gdpr: {
                            ...configuration?.gdpr,
                            dataController: {
                              ...configuration?.gdpr?.dataController,
                              name: e.target.value,
                            }
                          }
                        })}
                      />
                      <Input
                        label="Controller Email"
                        value={configuration?.gdpr?.dataController?.email || ''}
                        placeholder="dpo@yourcompany.com"
                        onChange={(e) => onConfigurationChange?.({
                          gdpr: {
                            ...configuration?.gdpr,
                            dataController: {
                              ...configuration?.gdpr?.dataController,
                              email: e.target.value,
                            }
                          }
                        })}
                      />
                    </div>
                  </div>

                  {/* Data Retention */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Data Retention Policies</h4>
                    <div className="space-y-3">
                      {[
                        { category: 'Customer Data', defaultPeriod: 2555 }, // ~7 years
                        { category: 'Marketing Data', defaultPeriod: 1095 }, // 3 years
                        { category: 'Analytics Data', defaultPeriod: 730 }, // 2 years
                        { category: 'Support Tickets', defaultPeriod: 1825 }, // 5 years
                      ].map((item) => (
                        <div key={item.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-900">{item.category}</span>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              value={item.defaultPeriod}
                              className="w-20 text-center"
                              min="1"
                            />
                            <span className="text-sm text-gray-600">days</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Consent Management */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Consent Management</h4>
                    <div className="space-y-3">
                      {[
                        { id: 'explicitConsent', label: 'Require Explicit Consent', description: 'Users must actively opt-in' },
                        { id: 'granularConsent', label: 'Granular Consent', description: 'Separate consent for different purposes' },
                        { id: 'consentWithdrawal', label: 'Easy Consent Withdrawal', description: 'Users can easily withdraw consent' },
                        { id: 'consentLogging', label: 'Consent Logging', description: 'Track all consent changes' },
                      ].map((setting) => (
                        <div key={setting.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{setting.label}</p>
                            <p className="text-xs text-gray-600">{setting.description}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={configuration?.gdpr?.consentManagement?.[setting.id] || false}
                              onChange={(e) => onConfigurationChange?.({
                                gdpr: {
                                  ...configuration?.gdpr,
                                  consentManagement: {
                                    ...configuration?.gdpr?.consentManagement,
                                    [setting.id]: e.target.checked,
                                  }
                                }
                              })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Data Subject Rights */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Data Subject Rights</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { id: 'portability', label: 'Data Portability (Article 20)' },
                        { id: 'erasure', label: 'Right to Erasure (Article 17)' },
                        { id: 'rectification', label: 'Right to Rectification (Article 16)' },
                        { id: 'restriction', label: 'Right to Restriction (Article 18)' },
                        { id: 'objection', label: 'Right to Object (Article 21)' },
                        { id: 'automatedDecisionMaking', label: 'Automated Decision Making (Article 22)' },
                      ].map((right) => (
                        <div key={right.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-900">{right.label}</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={configuration?.gdpr?.dataSubjectRights?.[right.id] || false}
                              onChange={(e) => onConfigurationChange?.({
                                gdpr: {
                                  ...configuration?.gdpr,
                                  dataSubjectRights: {
                                    ...configuration?.gdpr?.dataSubjectRights,
                                    [right.id]: e.target.checked,
                                  }
                                }
                              })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <Card>
                <CardBody className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search requests by email or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button variant="primary">
                      Export Report
                    </Button>
                  </div>
                </CardBody>
              </Card>

              {/* Requests List */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Data Subject Requests</h3>
                  <p className="text-gray-600">Manage GDPR and privacy-related data requests</p>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {requests
                      .filter(req => 
                        req.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        req.description.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((request) => (
                        <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              {getRequestIcon(request.type)}
                              <div>
                                <p className="text-sm font-medium text-gray-900">{request.userEmail}</p>
                                <p className="text-xs text-gray-500">Request ID: {request.id}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getPriorityBadge(request.priority)}
                              {getStatusBadge(request.status)}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-700 mb-3">{request.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              <p>Requested: {formatDate(request.requestDate)}</p>
                              {request.completionDate && (
                                <p>Completed: {formatDate(request.completionDate)}</p>
                              )}
                            </div>
                            
                            {request.status === 'pending' && (
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRequestAction(request.id, 'reject')}
                                >
                                  Reject
                                </Button>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleRequestAction(request.id, 'approve')}
                                >
                                  Approve
                                </Button>
                              </div>
                            )}
                            
                            {request.status === 'in_progress' && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleRequestAction(request.id, 'complete')}
                              >
                                Mark Complete
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {activeTab === 'audit' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Compliance Audit Trail</h3>
                <p className="text-gray-600">Track all compliance-related activities and data access</p>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {auditRecords.map((record) => (
                    <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <ClockIcon className="w-4 h-4 text-gray-500" />
                          <p className="text-sm font-medium text-gray-900">{record.event}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            record.riskLevel === 'high' ? 'error' :
                            record.riskLevel === 'medium' ? 'warning' : 'default'
                          }>
                            {record.riskLevel} risk
                          </Badge>
                          <span className="text-xs text-gray-500">{formatDate(record.timestamp)}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-2">{record.details}</p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>User: {record.userEmail}</span>
                        <div className="flex space-x-2">
                          {record.complianceFramework.map((framework) => (
                            <Badge key={framework} variant="secondary" className="text-xs">
                              {framework}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};