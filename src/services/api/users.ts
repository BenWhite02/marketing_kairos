// src/services/api/users.ts
// NEW: Users API Service with HADES Integration
// Handles all user management API calls to HADES backend

import { useAuthStore } from '@/stores/auth/authStore';

// HADES User API types (based on successful test results)
interface HadesUser {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash?: string; // Not returned in responses
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
  version: number;
}

interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  tenantId?: string;
  password?: string;
}

interface HadesApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: any;
  timestamp?: string;
}

interface UserHealthCheck {
  status: string;
  application: string;
  userCount: number;
  timestamp: number;
}

class HadesUserApiClient {
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

    // Add auth token if available (skip for mock tokens)
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
    
    // Handle different HADES response formats
    // Some endpoints return direct data, others return wrapped responses
    if (data.success === false) {
      throw new Error(data.message || 'HADES API request failed');
    }

    return data;
  }

  // Get all users
  async getUsers(): Promise<HadesUser[]> {
    try {
      console.log('🔄 Fetching users from HADES');
      
      // Note: Based on test results, this endpoint returns direct array, not wrapped response
      const response = await this.hadesRequest<HadesUser[]>('/api/v1/users');
      
      // Handle both wrapped and direct array responses
      const users = Array.isArray(response) ? response : response.data || [];
      
      console.log(`✅ Retrieved ${users.length} users from HADES`);
      
      return users;
    } catch (error) {
      console.error('❌ Failed to fetch users from HADES:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUser(userId: string): Promise<HadesApiResponse<HadesUser>> {
    try {
      console.log(`🔄 Fetching user ${userId} from HADES`);
      
      const response = await this.hadesRequest<HadesApiResponse<HadesUser>>(
        `/api/v1/users/${userId}`
      );
      
      console.log(`✅ Retrieved user ${userId} from HADES`);
      
      return response;
    } catch (error) {
      console.error(`❌ Failed to fetch user ${userId} from HADES:`, error);
      throw error;
    }
  }

  // Create new user
  async createUser(userData: CreateUserRequest): Promise<HadesApiResponse<HadesUser>> {
    try {
      console.log('🔄 Creating user in HADES:', { ...userData, password: '[HIDDEN]' });
      
      const response = await this.hadesRequest<HadesApiResponse<HadesUser>>(
        '/api/v1/users',
        {
          method: 'POST',
          body: JSON.stringify({
            ...userData,
            tenantId: userData.tenantId || 'default', // Default tenant
          }),
        }
      );
      
      console.log('✅ User created in HADES:', response.data?.id);
      
      return response;
    } catch (error) {
      console.error('❌ Failed to create user in HADES:', error);
      throw error;
    }
  }

  // Update user (if endpoint exists)
  async updateUser(
    userId: string,
    userData: Partial<CreateUserRequest>
  ): Promise<HadesApiResponse<HadesUser>> {
    try {
      console.log(`🔄 Updating user ${userId} in HADES:`, userData);
      
      const response = await this.hadesRequest<HadesApiResponse<HadesUser>>(
        `/api/v1/users/${userId}`,
        {
          method: 'PUT',
          body: JSON.stringify(userData),
        }
      );
      
      console.log(`✅ User ${userId} updated in HADES`);
      
      return response;
    } catch (error) {
      console.error(`❌ Failed to update user ${userId} in HADES:`, error);
      throw error;
    }
  }

  // Delete user (if endpoint exists)
  async deleteUser(userId: string): Promise<void> {
    try {
      console.log(`🔄 Deleting user ${userId} from HADES`);
      
      await this.hadesRequest<void>(`/api/v1/users/${userId}`, {
        method: 'DELETE',
      });
      
      console.log(`✅ User ${userId} deleted from HADES`);
    } catch (error) {
      console.error(`❌ Failed to delete user ${userId} from HADES:`, error);
      throw error;
    }
  }

  // Get current user profile (from auth/me endpoint)
  async getCurrentUser(): Promise<HadesApiResponse<HadesUser>> {
    try {
      console.log('🔄 Fetching current user from HADES');
      
      const response = await this.hadesRequest<HadesApiResponse<HadesUser>>(
        '/api/v1/auth/me'
      );
      
      console.log('✅ Retrieved current user from HADES');
      
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch current user from HADES:', error);
      throw error;
    }
  }

  // Health check for user service
  async healthCheck(): Promise<UserHealthCheck> {
    try {
      console.log('🔄 Checking HADES user service health');
      
      const response = await this.hadesRequest<UserHealthCheck>(
        '/api/v1/users/health'
      );
      
      console.log('✅ HADES user service health check completed');
      
      return response;
    } catch (error) {
      console.error('❌ HADES user service health check failed:', error);
      throw error;
    }
  }

  // Transform HADES user to Kairos format
  transformToKairosFormat(hadesUser: HadesUser) {
    return {
      id: hadesUser.id,
      email: hadesUser.email,
      firstName: hadesUser.firstName,
      lastName: hadesUser.lastName,
      role: 'user', // Default role, would need separate role system
      avatar: undefined,
      lastLogin: hadesUser.updatedAt, // Approximate
      isActive: hadesUser.status === 'ACTIVE',
      permissions: [], // Would need separate permissions system
      tenantId: hadesUser.tenantId,
      status: hadesUser.status,
      createdAt: hadesUser.createdAt,
      updatedAt: hadesUser.updatedAt,
      version: hadesUser.version,
      // Keep original HADES data for reference
      _hadesData: hadesUser,
    };
  }

  // Get users with Kairos format transformation
  async getUsersKairosFormat() {
    try {
      const hadesUsers = await this.getUsers();
      return hadesUsers.map(user => this.transformToKairosFormat(user));
    } catch (error) {
      console.error('❌ Failed to get users in Kairos format:', error);
      throw error;
    }
  }

  // Verify user exists by email
  async verifyUserByEmail(email: string): Promise<boolean> {
    try {
      const users = await this.getUsers();
      return users.some(user => user.email.toLowerCase() === email.toLowerCase());
    } catch (error) {
      console.error('❌ Failed to verify user by email:', error);
      return false;
    }
  }

  // Get active users count
  async getActiveUsersCount(): Promise<number> {
    try {
      const users = await this.getUsers();
      return users.filter(user => user.status === 'ACTIVE').length;
    } catch (error) {
      console.error('❌ Failed to get active users count:', error);
      return 0;
    }
  }

  // Check if current user has admin privileges
  async isCurrentUserAdmin(): Promise<boolean> {
    try {
      const currentUser = await this.getCurrentUser();
      // Simple admin check - could be enhanced with proper role system
      return currentUser.data.email.includes('admin') || 
             currentUser.data.email.includes('hades');
    } catch (error) {
      console.error('❌ Failed to check admin status:', error);
      return false;
    }
  }
}

// Create and export singleton instance
export const hadesUserApi = new HadesUserApiClient();

// Export individual methods for convenience
export const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getCurrentUser,
  healthCheck: userHealthCheck,
  getUsersKairosFormat,
  verifyUserByEmail,
  getActiveUsersCount,
  isCurrentUserAdmin,
} = hadesUserApi;

// Backward compatibility
export const usersApi = hadesUserApi;