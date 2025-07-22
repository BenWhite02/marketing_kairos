// src/components/enterprise/Security/SecurityDashboard.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  KeyIcon,
  UserGroupIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  CogIcon,
  LockClosedIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardBody } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';

interface SecurityMetric {
  id: string;
  name: string;
  value: string | number;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface SecurityEvent {
  id: string;
  type: 'login_success' | 'login_failure' | 'mfa_challenge' | 'password_change' | 'permission_change' | 'suspicious_activity';
  user: {
    id: string;
    name: string;
    email: string;
  };
  timestamp: string;
  ip: string;
  location: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  details: string;
}

interface SecurityPolicy {
  id: string;
  name: string;
  enabled: boolean;
  compliance: number; // percentage
  lastUpdated: string;
  settings: Record<string, any>;
}

export const SecurityDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'events' | 'policies' | 'compliance'>('overview');
  const [metrics, setMetrics] = useState<SecurityMetric[]>([]);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [policies, setPolicies] = useState<SecurityPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSecurityData();
  }, [timeRange]);

  const loadSecurityData = async () => {
    setIsLoading(true);
    
    // Mock data - replace with actual API calls
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setMetrics([
      {
        id: 'active_sessions',
        name: 'Active Sessions',
        value: 142,
        status: 'good',
        trend: 'up',
        description: 'Current active user sessions',
      },
      {
        id: 'failed_logins',
        name: 'Failed Logins',
        value: 8,
        status: 'warning',
        trend: 'up',
        description: 'Failed login attempts in last 24h',
      },
      {
        id: 'mfa_adoption',
        name: 'MFA Adoption',
        value: '87%',
        status: 'good',
        trend: 'up',
        description: 'Users with MFA enabled',
      },
      {
        id: 'security_score',
        name: 'Security Score',
        value: 94,
        status: 'good',
        trend: 'stable',
        description: 'Overall security posture score',
      },
      {
        id: 'suspicious_activities',
        name: 'Suspicious Activities',
        value: 3,
        status: 'warning',
        trend: 'down',
        description: 'Flagged suspicious activities',
      },
      {
        id: 'compliance_score',
        name: 'Compliance Score',
        value: '96%',
        status: 'good',
        trend: 'stable',
        description: 'Overall compliance rating',
      },
    ]);

    setEvents([
      {
        id: 'event-1',
        type: 'suspicious_activity',
        user: { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
        timestamp: '2024-01-15T10:30:00Z',
        ip: '192.168.1.100',
        location: 'New York, US',
        riskLevel: 'high',
        details: 'Multiple failed login attempts from new device',
      },
      {
        id: 'event-2',
        type: 'login_success',
        user: { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com' },
        timestamp: '2024-01-15T10:25:00Z',
        ip: '10.0.0.15',
        location: 'San Francisco, US',
        riskLevel: 'low',
        details: 'Successful login with MFA verification',
      },
      {
        id: 'event-3',
        type: 'permission_change',
        user: { id: 'user-3', name: 'Admin User', email: 'admin@example.com' },
        timestamp: '2024-01-15T09:45:00Z',
        ip: '10.0.0.10',
        location: 'London, UK',
        riskLevel: 'medium',
        details: 'User role changed from User to Manager',
      },
      {
        id: 'event-4',
        type: 'mfa_challenge',
        user: { id: 'user-4', name: 'Bob Wilson', email: 'bob@example.com' },
        timestamp: '2024-01-15T09:30:00Z',
        ip: '203.0.113.10',
        location: 'Tokyo, JP',
        riskLevel: 'low',
        details: 'MFA challenge successfully completed',
      },
    ]);

    setPolicies([
      {
        id: 'password_policy',
        name: 'Password Policy',
        enabled: true,
        compliance: 94,
        lastUpdated: '2024-01-10T00:00:00Z',
        settings: {
          minLength: 12,
          requireUppercase: true,
          requireSpecialChars: true,
          maxAge: 90,
        },
      },
      {
        id: 'mfa_policy',
        name: 'Multi-Factor Authentication',
        enabled: true,
        compliance: 87,
        lastUpdated: '2024-01-08T00:00:00Z',
        settings: {
          required: false,
          methods: ['totp', 'sms'],
          gracePeriod: 30,
        },
      },
      {
        id: 'session_policy',
        name: 'Session Management',
        enabled: true,
        compliance: 98,
        lastUpdated: '2024-01-12T00:00:00Z',
        settings: {
          maxDuration: 480,
          idleTimeout: 60,
          concurrentSessions: 3,
        },
      },
      {
        id: 'ip_restrictions',
        name: 'IP Restrictions',
        enabled: false,
        compliance: 0,
        lastUpdated: '2024-01-01T00:00:00Z',
        settings: {
          allowedRanges: [],
          requireVpn: false,
        },
      },
    ]);

    setIsLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'critical':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <CheckCircleIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login_success':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'login_failure':
        return <XCircleIcon className="w-4 h-4 text-red-500" />;
      case 'mfa_challenge':
        return <ShieldCheckIcon className="w-4 h-4 text-blue-500" />;
      case 'password_change':
        return <KeyIcon className="w-4 h-4 text-purple-500" />;
      case 'permission_change':
        return <UserGroupIcon className="w-4 h-4 text-orange-500" />;
      case 'suspicious_activity':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />;
      default:
        return <EyeIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ShieldCheckIcon },
    { id: 'events', label: 'Security Events', icon: ClockIcon },
    { id: 'policies', label: 'Policies', icon: LockClosedIcon },
    { id: 'compliance', label: 'Compliance', icon: CheckCircleIcon },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading security dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <ShieldCheckIcon className="w-8 h-8 mr-3 text-blue-600" />
              Security Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Monitor and manage your organization's security posture
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            
            <Button variant="primary">
              <CogIcon className="w-4 h-4 mr-2" />
              Security Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <nav className="flex space-x-8 border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
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
      {selectedTab === 'overview' && (
        <div className="space-y-8">
          {/* Security Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.map((metric) => (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardBody className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                        <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        {getStatusIcon(metric.status)}
                        <Badge
                          variant={metric.trend === 'up' ? 'success' : metric.trend === 'down' ? 'error' : 'default'}
                          className="mt-2 text-xs"
                        >
                          {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'} {metric.trend}
                        </Badge>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Recent Security Events */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recent Security Events</h3>
                <Button variant="outline" size="sm">
                  <EyeIcon className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {events.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">{event.user.name}</p>
                        <Badge className={`text-xs ${getRiskBadgeColor(event.riskLevel)}`}>
                          {event.riskLevel}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{event.details}</p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span>{formatTimestamp(event.timestamp)}</span>
                        <span>•</span>
                        <span>{event.ip}</span>
                        <span>•</span>
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {selectedTab === 'events' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Security Events</h3>
            <p className="text-gray-600">Detailed view of all security-related events</p>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">{event.user.name}</p>
                        <span className="text-sm text-gray-500">({event.user.email})</span>
                        <Badge className={`text-xs ${getRiskBadgeColor(event.riskLevel)}`}>
                          {event.riskLevel}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500">{formatTimestamp(event.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{event.details}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center">
                        <GlobeAltIcon className="w-3 h-3 mr-1" />
                        {event.ip}
                      </span>
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {selectedTab === 'policies' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {policies.map((policy) => (
            <motion.div
              key={policy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardBody className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <LockClosedIcon className="w-5 h-5 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-900">{policy.name}</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={policy.enabled ? 'success' : 'secondary'}>
                        {policy.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Compliance</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${policy.compliance}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{policy.compliance}%</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Last updated: {formatTimestamp(policy.lastUpdated)}
                    </div>
                    
                    <div className="pt-2 border-t border-gray-100">
                      <Button variant="outline" size="sm" className="w-full">
                        <CogIcon className="w-4 h-4 mr-2" />
                        Configure Policy
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {selectedTab === 'compliance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardBody className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">GDPR Compliance</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">96%</p>
                <p className="text-sm text-gray-600 mt-1">Compliant</p>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">SOC 2 Type II</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">98%</p>
                <p className="text-sm text-gray-600 mt-1">Compliant</p>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LockClosedIcon className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">ISO 27001</h3>
                <p className="text-3xl font-bold text-purple-600 mt-2">94%</p>
                <p className="text-sm text-gray-600 mt-1">Compliant</p>
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Compliance Requirements</h3>
              <p className="text-gray-600">Track compliance across different standards</p>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {[
                  { name: 'Data Encryption at Rest', status: 'compliant', framework: 'GDPR, SOC 2' },
                  { name: 'Access Control Management', status: 'compliant', framework: 'ISO 27001, SOC 2' },
                  { name: 'Audit Logging', status: 'compliant', framework: 'All Frameworks' },
                  { name: 'Data Retention Policies', status: 'partial', framework: 'GDPR' },
                  { name: 'Incident Response Plan', status: 'compliant', framework: 'ISO 27001, SOC 2' },
                ].map((requirement, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{requirement.name}</p>
                      <p className="text-xs text-gray-500">{requirement.framework}</p>
                    </div>
                    <Badge
                      variant={requirement.status === 'compliant' ? 'success' : 'warning'}
                      className="capitalize"
                    >
                      {requirement.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};