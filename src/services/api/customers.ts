// src/services/api/customers.ts
// NEW: Customer API Service with HADES Integration
// Handles all customer-related API calls to HADES backend

import { useAuthStore } from '@/stores/auth/authStore';

// HADES Customer API response types
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

interface HadesApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: any;
  timestamp?: string;
}

interface CustomerAnalytics {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersToday: number;
  churnRate: number;
  averageLTV: number;
  engagementRate: number;
}

interface CustomerSearchParams {
  query?: string;
  type?: string;
  industry?: string;
  status?: string;
  tier?: string;
  page?: number;
  size?: number;
}

class HadesCustomerApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_HADES_API_URL || 'http://localhost:8080';
  }

  // Get auth token from store
  private getAuthToken(): string | null {
    const { accessToken } = useAuthStore.getState();
    return accessToken;
  }

  // Enhanced fetch with auth and error handling
  private async hadesRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token if available
    if (token && token !== 'mock-jwt-token') {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HADES API Error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    
    // Handle HADES response format
    if (data.success === false) {
      throw new Error(data.message || 'HADES API request failed');
    }

    return data;
  }

  // Get all customers
  async getCustomers(params?: CustomerSearchParams): Promise<HadesApiResponse<HadesCustomer[]>> {
    try {
      let endpoint = '/api/v1/customers';
      
      // Add query parameters if provided
      if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString());
          }
        });
        
        if (searchParams.toString()) {
          endpoint += `?${searchParams.toString()}`;
        }
      }

      console.log(`🔄 Fetching customers from HADES: ${endpoint}`);
      
      const response = await this.hadesRequest<HadesApiResponse<HadesCustomer[]>>(endpoint);
      
      console.log(`✅ Retrieved ${response.data?.length || 0} customers from HADES`);
      
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch customers from HADES:', error);
      throw error;
    }
  }

  // Get customer by ID
  async getCustomer(customerId: string): Promise<HadesApiResponse<HadesCustomer>> {
    try {
      console.log(`🔄 Fetching customer ${customerId} from HADES`);
      
      const response = await this.hadesRequest<HadesApiResponse<HadesCustomer>>(
        `/api/v1/customers/${customerId}`
      );
      
      console.log(`✅ Retrieved customer ${customerId} from HADES`);
      
      return response;
    } catch (error) {
      console.error(`❌ Failed to fetch customer ${customerId} from HADES:`, error);
      throw error;
    }
  }

  // Create new customer
  async createCustomer(customerData: Partial<HadesCustomer>): Promise<HadesApiResponse<HadesCustomer>> {
    try {
      console.log('🔄 Creating customer in HADES:', customerData);
      
      const response = await this.hadesRequest<HadesApiResponse<HadesCustomer>>(
        '/api/v1/customers',
        {
          method: 'POST',
          body: JSON.stringify(customerData),
        }
      );
      
      console.log('✅ Customer created in HADES:', response.data?.id);
      
      return response;
    } catch (error) {
      console.error('❌ Failed to create customer in HADES:', error);
      throw error;
    }
  }

  // Update customer
  async updateCustomer(
    customerId: string,
    customerData: Partial<HadesCustomer>
  ): Promise<HadesApiResponse<HadesCustomer>> {
    try {
      console.log(`🔄 Updating customer ${customerId} in HADES:`, customerData);
      
      const response = await this.hadesRequest<HadesApiResponse<HadesCustomer>>(
        `/api/v1/customers/${customerId}`,
        {
          method: 'PUT',
          body: JSON.stringify(customerData),
        }
      );
      
      console.log(`✅ Customer ${customerId} updated in HADES`);
      
      return response;
    } catch (error) {
      console.error(`❌ Failed to update customer ${customerId} in HADES:`, error);
      throw error;
    }
  }

  // Delete customer
  async deleteCustomer(customerId: string): Promise<void> {
    try {
      console.log(`🔄 Deleting customer ${customerId} from HADES`);
      
      await this.hadesRequest<void>(`/api/v1/customers/${customerId}`, {
        method: 'DELETE',
      });
      
      console.log(`✅ Customer ${customerId} deleted from HADES`);
    } catch (error) {
      console.error(`❌ Failed to delete customer ${customerId} from HADES:`, error);
      throw error;
    }
  }

  // Search customers
  async searchCustomers(query: string): Promise<HadesApiResponse<HadesCustomer[]>> {
    try {
      console.log(`🔄 Searching customers in HADES: "${query}"`);
      
      const response = await this.hadesRequest<HadesApiResponse<HadesCustomer[]>>(
        `/api/v1/customers/search?q=${encodeURIComponent(query)}`
      );
      
      console.log(`✅ Found ${response.data?.length || 0} customers matching "${query}"`);
      
      return response;
    } catch (error) {
      console.error(`❌ Failed to search customers in HADES:`, error);
      throw error;
    }
  }

  // Get high-value customers
  async getHighValueCustomers(): Promise<HadesApiResponse<HadesCustomer[]>> {
    try {
      console.log('🔄 Fetching high-value customers from HADES');
      
      const response = await this.hadesRequest<HadesApiResponse<HadesCustomer[]>>(
        '/api/v1/customers/high-value'
      );
      
      console.log(`✅ Retrieved ${response.data?.length || 0} high-value customers`);
      
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch high-value customers from HADES:', error);
      throw error;
    }
  }

  // Get customers by type
  async getCustomersByType(type: string): Promise<HadesApiResponse<HadesCustomer[]>> {
    try {
      console.log(`🔄 Fetching customers by type "${type}" from HADES`);
      
      const response = await this.hadesRequest<HadesApiResponse<HadesCustomer[]>>(
        `/api/v1/customers/by-type/${encodeURIComponent(type)}`
      );
      
      console.log(`✅ Retrieved ${response.data?.length || 0} customers of type "${type}"`);
      
      return response;
    } catch (error) {
      console.error(`❌ Failed to fetch customers by type from HADES:`, error);
      throw error;
    }
  }

  // Get customers by industry
  async getCustomersByIndustry(industry: string): Promise<HadesApiResponse<HadesCustomer[]>> {
    try {
      console.log(`🔄 Fetching customers by industry "${industry}" from HADES`);
      
      const response = await this.hadesRequest<HadesApiResponse<HadesCustomer[]>>(
        `/api/v1/customers/by-industry/${encodeURIComponent(industry)}`
      );
      
      console.log(`✅ Retrieved ${response.data?.length || 0} customers in "${industry}" industry`);
      
      return response;
    } catch (error) {
      console.error(`❌ Failed to fetch customers by industry from HADES:`, error);
      throw error;
    }
  }

  // Get customer analytics
  async getCustomerAnalytics(): Promise<HadesApiResponse<CustomerAnalytics>> {
    try {
      console.log('🔄 Fetching customer analytics from HADES');
      
      const response = await this.hadesRequest<HadesApiResponse<CustomerAnalytics>>(
        '/api/v1/customers/analytics'
      );
      
      console.log('✅ Retrieved customer analytics from HADES');
      
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch customer analytics from HADES:', error);
      throw error;
    }
  }

  // Export customers
  async exportCustomers(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    try {
      console.log(`🔄 Exporting customers in ${format} format from HADES`);
      
      const response = await fetch(`${this.baseURL}/api/v1/customers/export?format=${format}`, {
        headers: this.getAuthToken() ? {
          'Authorization': `Bearer ${this.getAuthToken()}`
        } : {},
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      
      console.log('✅ Customer export completed');
      
      return blob;
    } catch (error) {
      console.error('❌ Failed to export customers from HADES:', error);
      throw error;
    }
  }

  // Health check for customer service
  async healthCheck(): Promise<HadesApiResponse<{ status: string; customerCount: number }>> {
    try {
      const response = await this.hadesRequest<HadesApiResponse<{ status: string; customerCount: number }>>(
        '/api/v1/customers/health'
      );
      
      return response;
    } catch (error) {
      console.error('❌ Customer service health check failed:', error);
      throw error;
    }
  }

  // Transform HADES customer to Kairos format
  transformToKairosFormat(hadesCustomer: HadesCustomer) {
    return {
      id: hadesCustomer.id,
      name: hadesCustomer.displayName || `${hadesCustomer.firstName} ${hadesCustomer.lastName}`,
      email: hadesCustomer.email,
      segment: this.mapTierToSegment(hadesCustomer.tier),
      lifetimeValue: hadesCustomer.totalValue,
      totalOrders: 0, // Not available in HADES, would need separate call
      lastActivity: 'Unknown', // Not available, would need activity tracking
      status: this.mapHadesStatus(hadesCustomer.status),
      joinDate: hadesCustomer.createdAt,
      preferredChannel: 'Email', // Default, would need preferences endpoint
      location: 'Unknown', // Not available in HADES customer data
      engagementScore: Math.floor(Math.random() * 100), // Would need calculation
      riskScore: Math.floor(Math.random() * 100), // Would need risk model
      // Keep original HADES data for reference
      _hadesData: hadesCustomer,
    };
  }

  private mapTierToSegment(tier: string): string {
    const tierMap: Record<string, string> = {
      'DIAMOND': 'High-Value Customers',
      'GOLD': 'High-Value Customers',
      'SILVER': 'Regular Customers',
      'BRONZE': 'Regular Customers',
    };
    return tierMap[tier] || 'Regular Customers';
  }

  private mapHadesStatus(status: string): 'active' | 'inactive' | 'prospect' | 'churned' {
    const statusMap: Record<string, 'active' | 'inactive' | 'prospect' | 'churned'> = {
      'ACTIVE': 'active',
      'INACTIVE': 'inactive',
      'PROSPECT': 'prospect',
      'CHURNED': 'churned',
    };
    return statusMap[status] || 'active';
  }
}

// Create and export singleton instance
export const hadesCustomerApi = new HadesCustomerApiClient();

// Export individual methods for convenience
export const {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
  getHighValueCustomers,
  getCustomersByType,
  getCustomersByIndustry,
  getCustomerAnalytics,
  exportCustomers,
  healthCheck: customerHealthCheck,
} = hadesCustomerApi;

// Backward compatibility
export const customersApi = hadesCustomerApi;