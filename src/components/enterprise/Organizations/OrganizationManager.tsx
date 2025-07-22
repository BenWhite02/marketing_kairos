// src/components/enterprise/Organizations/OrganizationManager.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  CogIcon,
  ChartBarIcon,
  CreditCardIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardBody } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Input, TextArea, Select } from '../../ui/Input';
import { Modal } from '../../ui/Modal';
import { Organization, User, Role } from '../../../types/enterprise';

interface OrganizationManagerProps {
  currentOrganization?: Organization;
  onOrganizationChange?: (org: Organization) => void;
}

export const OrganizationManager: React.FC<OrganizationManagerProps> = ({
  currentOrganization,
  onOrganizationChange,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'hierarchy' | 'users' | 'roles' | 'billing' | 'settings'>('overview');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadOrganizationData();
  }, []);

  const loadOrganizationData = async () => {
    setIsLoading(true);
    
    // Mock data - replace with actual API calls
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setOrganizations([
      {
        id: 'org-1',
        name: 'acme-corp',
        displayName: 'Acme Corporation',
        description: 'Leading technology company focused on innovative solutions',
        type: 'enterprise',
        status: 'active',
        subscription: {
          plan: 'enterprise',
          features: ['advanced_analytics', 'sso', 'api_access', 'white_label', 'priority_support'],
          limits: {
            users: 1000,
            campaigns: 500,
            atoms: 1000,
            moments: 2000,
            apiCalls: 1000000,
            storage: 1000,
          },
          billing: {
            interval: 'yearly',
            amount: 24000,
            currency: 'USD',
            nextBillingDate: '2024-12-01T00:00:00Z',
            paymentMethod: 'credit_card',
          },
        },
        contact: {
          primaryEmail: 'admin@acme.com',
          billingEmail: 'billing@acme.com',
          supportEmail: 'support@acme.com',
          phone: '+1-555-0123',
          address: {
            street: '123 Business Ave',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94105',
            country: 'US',
          },
        },
        settings: {
          timezone: 'America/Los_Angeles',
          dateFormat: 'MM/DD/YYYY',
          currency: 'USD',
          language: 'en',
          dataResidency: 'US',
        },
        childOrganizations: ['org-2', 'org-3'],
        createdAt: '2023-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
        createdBy: 'system',
      },
      {
        id: 'org-2',
        name: 'acme-marketing',
        displayName: 'Acme Marketing Division',
        description: 'Marketing department of Acme Corporation',
        type: 'business',
        status: 'active',
        subscription: {
          plan: 'professional',
          features: ['analytics', 'automation', 'api_access'],
          limits: {
            users: 50,
            campaigns: 100,
            atoms: 200,
            moments: 500,
            apiCalls: 100000,
            storage: 100,
          },
          billing: {
            interval: 'monthly',
            amount: 499,
            currency: 'USD',
            nextBillingDate: '2024-02-01T00:00:00Z',
            paymentMethod: 'invoice',
          },
        },
        contact: {
          primaryEmail: 'marketing@acme.com',
          billingEmail: 'billing@acme.com',
          supportEmail: 'marketing@acme.com',
          phone: '+1-555-0124',
          address: {
            street: '123 Business Ave',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94105',
            country: 'US',
          },
        },
        settings: {
          timezone: 'America/Los_Angeles',
          dateFormat: 'MM/DD/YYYY',
          currency: 'USD',
          language: 'en',
          dataResidency: 'US',
        },
        parentOrganizationId: 'org-1',
        childOrganizations: [],
        createdAt: '2023-02-01T00:00:00Z',
        updatedAt: '2024-01-10T00:00:00Z',
        createdBy: 'user-admin',
      },
      {
        id: 'org-3',
        name: 'acme-sales',
        displayName: 'Acme Sales Division',
        description: 'Sales department of Acme Corporation',
        type: 'business',
        status: 'active',
        subscription: {
          plan: 'professional',
          features: ['analytics', 'automation', 'integrations'],
          limits: {
            users: 30,
            campaigns: 75,
            atoms: 150,
            moments: 300,
            apiCalls: 75000,
            storage: 75,
          },
          billing: {
            interval: 'monthly',
            amount: 299,
            currency: 'USD',
            nextBillingDate: '2024-02-01T00:00:00Z',
            paymentMethod: 'credit_card',
          },
        },
        contact: {
          primaryEmail: 'sales@acme.com',
          billingEmail: 'billing@acme.com',
          supportEmail: 'sales@acme.com',
          phone: '+1-555-0125',
          address: {
            street: '123 Business Ave',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94105',
            country: 'US',
          },
        },
        settings: {
          timezone: 'America/Los_Angeles',
          dateFormat: 'MM/DD/YYYY',
          currency: 'USD',
          language: 'en',
          dataResidency: 'US',
        },
        parentOrganizationId: 'org-1',
        childOrganizations: [],
        createdAt: '2023-02-15T00:00:00Z',
        updatedAt: '2024-01-08T00:00:00Z',
        createdBy: 'user-admin',
      },
    ]);

    setUsers([
      {
        id: 'user-1',
        organizationId: 'org-1',
        email: 'admin@acme.com',
        firstName: 'John',
        lastName: 'Admin',
        displayName: 'John Admin',
        avatar: 'https://via.placeholder.com/40',
        status: 'active',
        emailVerified: true,
        mfaEnabled: true,
        lastLoginAt: '2024-01-15T09:00:00Z',
        passwordChangedAt: '2023-12-01T00:00:00Z',
        roles: ['admin'],
        customPermissions: {},
        preferences: {
          language: 'en',
          timezone: 'America/Los_Angeles',
          dateFormat: 'MM/DD/YYYY',
          emailNotifications: true,
          browserNotifications: true,
        },
        dataProcessingConsent: true,
        marketingConsent: false,
        consentDate: '2023-01-15T00:00:00Z',
        lastDataAccess: '2024-01-15T09:00:00Z',
        createdAt: '2023-01-15T00:00:00Z',
        updatedAt: '2024-01-15T09:00:00Z',
        createdBy: 'system',
      },
      {
        id: 'user-2',
        organizationId: 'org-1',
        email: 'manager@acme.com',
        firstName: 'Jane',
        lastName: 'Manager',
        displayName: 'Jane Manager',
        status: 'active',
        emailVerified: true,
        mfaEnabled: false,
        lastLoginAt: '2024-01-14T16:30:00Z',
        passwordChangedAt: '2023-11-15T00:00:00Z',
        roles: ['manager'],
        customPermissions: {},
        preferences: {
          language: 'en',
          timezone: 'America/Los_Angeles',
          dateFormat: 'MM/DD/YYYY',
          emailNotifications: true,
          browserNotifications: false,
        },
        dataProcessingConsent: true,
        marketingConsent: true,
        consentDate: '2023-02-01T00:00:00Z',
        lastDataAccess: '2024-01-14T16:30:00Z',
        createdAt: '2023-02-01T00:00:00Z',
        updatedAt: '2024-01-14T16:30:00Z',
        createdBy: 'user-1',
      },
    ]);

    setRoles([
      {
        id: 'admin',
        organizationId: 'org-1',
        name: 'admin',
        displayName: 'Administrator',
        description: 'Full system access with all permissions',
        type: 'system',
        permissions: {
          users: { create: true, read: true, update: true, delete: true, admin: true },
          campaigns: { create: true, read: true, update: true, delete: true, admin: true },
          analytics: { create: true, read: true, update: true, delete: true, admin: true },
          settings: { create: true, read: true, update: true, delete: true, admin: true },
        },
        restrictions: {
          ipRestrictions: [],
          timeRestrictions: {
            allowedHours: [],
            allowedDays: [],
            timezone: 'UTC',
          },
          dataRestrictions: {
            regions: [],
            classifications: [],
          },
        },
        userCount: 1,
        isDefault: false,
        createdAt: '2023-01-15T00:00:00Z',
        updatedAt: '2023-01-15T00:00:00Z',
      },
      {
        id: 'manager',
        organizationId: 'org-1',
        name: 'manager',
        displayName: 'Manager',
        description: 'Management access with limited administrative permissions',
        type: 'custom',
        permissions: {
          users: { create: true, read: true, update: true, delete: false, admin: false },
          campaigns: { create: true, read: true, update: true, delete: true, admin: false },
          analytics: { create: false, read: true, update: false, delete: false, admin: false },
          settings: { create: false, read: true, update: false, delete: false, admin: false },
        },
        restrictions: {
          ipRestrictions: [],
          timeRestrictions: {
            allowedHours: [{ start: '09:00', end: '17:00' }],
            allowedDays: [1, 2, 3, 4, 5],
            timezone: 'America/Los_Angeles',
          },
          dataRestrictions: {
            regions: ['US'],
            classifications: ['public', 'internal'],
          },
        },
        userCount: 1,
        isDefault: false,
        createdAt: '2023-02-01T00:00:00Z',
        updatedAt: '2023-02-01T00:00:00Z',
      },
    ]);

    setIsLoading(false);
  };

  const handleCreateOrganization = (orgData: Partial<Organization>) => {
    const newOrg: Organization = {
      ...orgData,
      id: `org-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user',
      childOrganizations: [],
    } as Organization;

    setOrganizations(prev => [...prev, newOrg]);
    setShowCreateModal(false);
  };

  const handleEditOrganization = (orgData: Partial<Organization>) => {
    if (!selectedOrg) return;

    setOrganizations(prev => prev.map(org => 
      org.id === selectedOrg.id 
        ? { ...org, ...orgData, updatedAt: new Date().toISOString() }
        : org
    ));
    setShowEditModal(false);
    setSelectedOrg(null);
  };

  const handleDeleteOrganization = (orgId: string) => {
    if (window.confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      setOrganizations(prev => prev.filter(org => org.id !== orgId));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'suspended':
        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />;
      case 'trial':
        return <ClockIcon className="w-4 h-4 text-blue-500" />;
      case 'expired':
        return <XCircleIcon className="w-4 h-4 text-red-500" />;
      default:
        return <CheckCircleIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return <Badge variant="success">Enterprise</Badge>;
      case 'professional':
        return <Badge variant="info">Professional</Badge>;
      case 'starter':
        return <Badge variant="warning">Starter</Badge>;
      case 'custom':
        return <Badge variant="primary">Custom</Badge>;
      default:
        return <Badge variant="default">{plan}</Badge>;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BuildingOfficeIcon },
    { id: 'hierarchy', label: 'Hierarchy', icon: ArrowTopRightOnSquareIcon },
    { id: 'users', label: 'Users', icon: UserGroupIcon },
    { id: 'roles', label: 'Roles', icon: CogIcon },
    { id: 'billing', label: 'Billing', icon: CreditCardIcon },
    { id: 'settings', label: 'Settings', icon: CogIcon },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organization data...</p>
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
              <BuildingOfficeIcon className="w-8 h-8 mr-3 text-blue-600" />
              Organization Management
            </h1>
            <p className="mt-2 text-gray-600">
              Manage organizations, users, roles, and billing
            </p>
          </div>
          
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Organization
          </Button>
        </div>
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
            <div className="space-y-6">
              {/* Search */}
              <Card>
                <CardBody className="p-4">
                  <Input
                    placeholder="Search organizations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </CardBody>
              </Card>

              {/* Organizations Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {organizations
                  .filter(org => 
                    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    org.displayName.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((org) => (
                    <Card key={org.id} className="hover:shadow-lg transition-shadow">
                      <CardBody className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(org.status)}
                            <h3 className="text-lg font-semibold text-gray-900">{org.displayName}</h3>
                          </div>
                          {getPlanBadge(org.subscription.plan)}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4">{org.description}</p>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Type:</span>
                            <span className="font-medium capitalize">{org.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Users:</span>
                            <span className="font-medium">{users.filter(u => u.organizationId === org.id).length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Billing:</span>
                            <span className="font-medium">
                              {formatCurrency(org.subscription.billing.amount, org.subscription.billing.currency)}
                              /{org.subscription.billing.interval}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Created:</span>
                            <span className="font-medium">{formatDate(org.createdAt)}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedOrg(org);
                                setShowEditModal(true);
                              }}
                            >
                              <PencilIcon className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteOrganization(org.id)}
                            >
                              <TrashIcon className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onOrganizationChange?.(org)}
                          >
                            <EyeIcon className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Users</h3>
                  <Button variant="primary" size="sm">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Invite User
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.displayName}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-gray-600" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.displayName}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            {user.roles.map((roleId) => {
                              const role = roles.find(r => r.id === roleId);
                              return role ? (
                                <Badge key={roleId} variant="secondary" className="text-xs">
                                  {role.displayName}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="text-xs text-gray-500">
                          {user.lastLoginAt ? (
                            <span>Last login: {formatDate(user.lastLoginAt)}</span>
                          ) : (
                            <span>Never logged in</span>
                          )}
                        </div>
                        {getStatusIcon(user.status)}
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'roles' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Roles & Permissions</h3>
                  <Button variant="primary" size="sm">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Create Role
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {roles.map((role) => (
                    <div key={role.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-md font-semibold text-gray-900">{role.displayName}</h4>
                          <p className="text-xs text-gray-500">{role.description}</p>
                        </div>
                        <Badge variant={role.type === 'system' ? 'primary' : 'secondary'}>
                          {role.type}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {Object.entries(role.permissions).map(([resource, permissions]) => (
                          <div key={resource} className="text-xs">
                            <span className="font-medium capitalize text-gray-700">{resource}:</span>
                            <div className="flex space-x-1 mt-1">
                              {Object.entries(permissions).map(([action, allowed]) => (
                                <Badge
                                  key={action}
                                  variant={allowed ? 'success' : 'default'}
                                  className="text-xs"
                                >
                                  {action}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{role.userCount} users</span>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm">Edit</Button>
                          {role.type === 'custom' && (
                            <Button variant="outline" size="sm">Delete</Button>
                          )}
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

      {/* Create Organization Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Organization"
      >
        <OrganizationForm
          onSubmit={handleCreateOrganization}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Edit Organization Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Organization"
      >
        {selectedOrg && (
          <OrganizationForm
            organization={selectedOrg}
            onSubmit={handleEditOrganization}
            onCancel={() => setShowEditModal(false)}
          />
        )}
      </Modal>
    </div>
  );
};

// Organization Form Component
interface OrganizationFormProps {
  organization?: Organization;
  onSubmit: (data: Partial<Organization>) => void;
  onCancel: () => void;
}

const OrganizationForm: React.FC<OrganizationFormProps> = ({
  organization,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: organization?.name || '',
    displayName: organization?.displayName || '',
    description: organization?.description || '',
    type: organization?.type || 'business',
    contact: {
      primaryEmail: organization?.contact?.primaryEmail || '',
      phone: organization?.contact?.phone || '',
      address: {
        street: organization?.contact?.address?.street || '',
        city: organization?.contact?.address?.city || '',
        state: organization?.contact?.address?.state || '',
        zipCode: organization?.contact?.address?.zipCode || '',
        country: organization?.contact?.address?.country || 'US',
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Organization Name *"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="acme-corp"
          required
        />
        <Input
          label="Display Name *"
          value={formData.displayName}
          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
          placeholder="Acme Corporation"
          required
        />
      </div>

      <TextArea
        label="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Brief description of the organization"
        rows={3}
      />

      <Select
        label="Organization Type"
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
        options={[
          { value: 'enterprise', label: 'Enterprise' },
          { value: 'business', label: 'Business' },
          { value: 'startup', label: 'Startup' },
          { value: 'agency', label: 'Agency' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Primary Email *"
          type="email"
          value={formData.contact.primaryEmail}
          onChange={(e) => setFormData({
            ...formData,
            contact: { ...formData.contact, primaryEmail: e.target.value }
          })}
          placeholder="admin@acme.com"
          required
        />
        <Input
          label="Phone"
          value={formData.contact.phone}
          onChange={(e) => setFormData({
            ...formData,
            contact: { ...formData.contact, phone: e.target.value }
          })}
          placeholder="+1-555-0123"
        />
      </div>

      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Address</h4>
        <Input
          label="Street Address"
          value={formData.contact.address.street}
          onChange={(e) => setFormData({
            ...formData,
            contact: {
              ...formData.contact,
              address: { ...formData.contact.address, street: e.target.value }
            }
          })}
          placeholder="123 Business Ave"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Input
            label="City"
            value={formData.contact.address.city}
            onChange={(e) => setFormData({
              ...formData,
              contact: {
                ...formData.contact,
                address: { ...formData.contact.address, city: e.target.value }
              }
            })}
            placeholder="San Francisco"
          />
          <Input
            label="State"
            value={formData.contact.address.state}
            onChange={(e) => setFormData({
              ...formData,
              contact: {
                ...formData.contact,
                address: { ...formData.contact.address, state: e.target.value }
              }
            })}
            placeholder="CA"
          />
          <Input
            label="ZIP Code"
            value={formData.contact.address.zipCode}
            onChange={(e) => setFormData({
              ...formData,
              contact: {
                ...formData.contact,
                address: { ...formData.contact.address, zipCode: e.target.value }
              }
            })}
            placeholder="94105"
          />
          <Select
            label="Country"
            value={formData.contact.address.country}
            onChange={(e) => setFormData({
              ...formData,
              contact: {
                ...formData.contact,
                address: { ...formData.contact.address, country: e.target.value }
              }
            })}
            options={[
              { value: 'US', label: 'United States' },
              { value: 'CA', label: 'Canada' },
              { value: 'GB', label: 'United Kingdom' },
              { value: 'DE', label: 'Germany' },
              { value: 'FR', label: 'France' },
            ]}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" type="submit">
          {organization ? 'Update' : 'Create'} Organization
        </Button>
      </div>
    </form>
  );
};