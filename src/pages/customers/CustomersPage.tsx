// src/pages/customers/CustomersPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  UserPlusIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  EllipsisVerticalIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  UserGroupIcon,
  CalendarIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ArrowDownTrayIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { StarIcon, FlagIcon } from '@heroicons/react/24/solid';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { hadesCustomerApi } from '@/services/api/customers';

// Import HADES types from the API service
interface HadesCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  phoneNumber?: string;
  companyName?: string;
  customerType: string;
  industry?: string;
  totalValue: number;
  tier: string;
  status: string;
  age?: number;
  isBusinessCustomer: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CustomerAnalytics {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersToday: number;
  churnRate: number;
  averageLTV: number;
  engagementRate: number;
}

interface CustomerMetrics {
  totalCustomers: number;
  activeCustomers: number;
  newCustomers: number;
  avgLifetimeValue: number;
  churnRate: number;
  totalRevenue: number;
  growthRate: number;
}

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<HadesCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [metrics, setMetrics] = useState<CustomerMetrics>({
    totalCustomers: 0,
    activeCustomers: 0,
    newCustomers: 0,
    avgLifetimeValue: 0,
    churnRate: 0,
    totalRevenue: 0,
    growthRate: 0
  });
  const [error, setError] = useState<string | null>(null);

  // Load customer data from HADES
  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Loading customer data from HADES...');
        
        // Fetch customers and analytics in parallel
        const [customersResponse, analyticsResponse] = await Promise.all([
          hadesCustomerApi.getCustomers(),
          hadesCustomerApi.getCustomerAnalytics()
        ]);
        
        if (customersResponse.success) {
          console.log(`✅ Loaded ${customersResponse.data.length} customers from HADES`);
          setCustomers(customersResponse.data);
          
          // Calculate metrics from customer data
          const totalRevenue = customersResponse.data.reduce((sum, customer) => sum + (customer.totalValue || 0), 0);
          const activeCount = customersResponse.data.filter(c => c.status === 'ACTIVE').length;
          
          setMetrics({
            totalCustomers: customersResponse.data.length,
            activeCustomers: activeCount,
            newCustomers: analyticsResponse.success ? (analyticsResponse.data.newCustomersToday || 0) : 0,
            avgLifetimeValue: analyticsResponse.success ? (analyticsResponse.data.averageLTV || 0) : 0,
            churnRate: analyticsResponse.success ? (analyticsResponse.data.churnRate || 0) : 0,
            totalRevenue,
            growthRate: 12.5 // Would need historical data for actual calculation
          });
        } else {
          throw new Error('Failed to load customers from HADES');
        }
        
      } catch (error) {
        console.error('❌ Failed to load customer data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load customer data');
        
        // Show fallback message but don't crash
        setCustomers([]);
        setMetrics({
          totalCustomers: 0,
          activeCustomers: 0,
          newCustomers: 0,
          avgLifetimeValue: 0,
          churnRate: 0,
          totalRevenue: 0,
          growthRate: 0
        });
      } finally {
        setLoading(false);
      }
    };

    loadCustomerData();
  }, []);

  // Filter and sort customers
  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = customers.filter(customer => {
      const matchesSearch = searchTerm === '' || 
        customer.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === 'all' || customer.status.toLowerCase() === selectedStatus.toLowerCase();
      const matchesTier = selectedTier === 'all' || customer.tier.toLowerCase() === selectedTier.toLowerCase();
      const matchesType = selectedType === 'all' || customer.customerType.toLowerCase() === selectedType.toLowerCase();
      
      return matchesSearch && matchesStatus && matchesTier && matchesType;
    });

    // Sort customers
    filtered.sort((a, b) => {
      let aValue: any = a[sortField as keyof HadesCustomer];
      let bValue: any = b[sortField as keyof HadesCustomer];
      
      if (sortField === 'displayName') {
        aValue = a.displayName || `${a.firstName} ${a.lastName}`;
        bValue = b.displayName || `${b.firstName} ${b.lastName}`;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

    return filtered;
  }, [customers, searchTerm, selectedStatus, selectedTier, selectedType, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleExport = async () => {
    try {
      console.log('🔄 Exporting customers...');
      const blob = await hadesCustomerApi.exportCustomers('csv');
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `customers-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Customer export completed');
    } catch (error) {
      console.error('❌ Export failed:', error);
      setError('Failed to export customers');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'prospect': return 'info';
      case 'churned': return 'error';
      default: return 'default';
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'diamond': return 'success';
      case 'gold': return 'warning';
      case 'silver': return 'info';
      case 'bronze': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg border">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg border p-6">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customer Data Platform</h1>
              <p className="text-gray-600 mt-1">360° customer profiles and analytics</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={handleExport}>
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button>
                <UserPlusIcon className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Customers</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metrics.totalCustomers.toLocaleString()}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <UserGroupIcon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">{metrics.growthRate}%</span>
                  <span className="text-gray-600 ml-1">vs last month</span>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Customers</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metrics.activeCustomers.toLocaleString()}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <StarIcon className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-gray-600">
                    {((metrics.activeCustomers / Math.max(metrics.totalCustomers, 1)) * 100).toFixed(1)}% of total
                  </span>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Lifetime Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(metrics.avgLifetimeValue)}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">8.2%</span>
                  <span className="text-gray-600 ml-1">vs last month</span>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Churn Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(metrics.churnRate || 0).toFixed(1)}%
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <ChartBarIcon className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowDownIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">2.1%</span>
                  <span className="text-gray-600 ml-1">vs last month</span>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardBody className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="prospect">Prospect</option>
                  <option value="churned">Churned</option>
                </select>

                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Tiers</option>
                  <option value="diamond">Diamond</option>
                  <option value="gold">Gold</option>
                  <option value="silver">Silver</option>
                  <option value="bronze">Bronze</option>
                </select>

                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="b2c">B2C</option>
                  <option value="b2b">B2B</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {filteredAndSortedCustomers.length} of {customers.length} customers
                </span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Customer Table */}
        <Card>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('displayName')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Customer</span>
                        {sortField === 'displayName' && (
                          sortDirection === 'asc' ? 
                            <ArrowUpIcon className="h-4 w-4" /> : 
                            <ArrowDownIcon className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tier
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('totalValue')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Lifetime Value</span>
                        {sortField === 'totalValue' && (
                          sortDirection === 'asc' ? 
                            <ArrowUpIcon className="h-4 w-4" /> : 
                            <ArrowDownIcon className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Join Date</span>
                        {sortField === 'createdAt' && (
                          sortDirection === 'asc' ? 
                            <ArrowUpIcon className="h-4 w-4" /> : 
                            <ArrowDownIcon className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-800">
                                {customer.firstName?.charAt(0) || '?'}{customer.lastName?.charAt(0) || ''}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.displayName || `${customer.firstName} ${customer.lastName}`}
                            </div>
                            <div className="text-sm text-gray-500">{customer.email}</div>
                            {customer.companyName && (
                              <div className="text-xs text-gray-400">{customer.companyName}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusBadgeColor(customer.status)}>
                          {customer.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getTierBadgeColor(customer.tier)}>
                          {customer.tier}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(customer.totalValue || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          {customer.isBusinessCustomer ? (
                            <BuildingOfficeIcon className="h-4 w-4 mr-1 text-gray-400" />
                          ) : (
                            <UserGroupIcon className="h-4 w-4 mr-1 text-gray-400" />
                          )}
                          {customer.customerType}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(customer.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="sm">
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <EllipsisVerticalIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredAndSortedCustomers.length === 0 && !loading && (
              <div className="text-center py-12">
                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || selectedStatus !== 'all' || selectedTier !== 'all' || selectedType !== 'all' 
                    ? 'Try adjusting your search or filters.' 
                    : 'Get started by adding your first customer.'}
                </p>
                {!(searchTerm || selectedStatus !== 'all' || selectedTier !== 'all' || selectedType !== 'all') && (
                  <div className="mt-6">
                    <Button>
                      <UserPlusIcon className="h-4 w-4 mr-2" />
                      Add Customer
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default CustomersPage;