// src/services/api/auth.ts
// UPDATED: Authentication API Service with HADES Integration + COMPREHENSIVE DEBUG STATEMENTS
// Handles all authentication-related API calls to HADES backend

import type { 
  LoginCredentials, 
  LoginResponse, 
  RefreshTokenRequest, 
  RefreshTokenResponse,
  AuthApiResponse 
} from '@/types/auth';

console.log('🔄 HadesAuthApi: Module loading...');

// Enhanced fetch wrapper with better error handling
class ApiError extends Error {
  public status: number;
  public data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// HADES-integrated auth API client
class HadesAuthApiClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    // UPDATED: Point directly to HADES backend
    this.baseURL = import.meta.env.VITE_HADES_API_URL || 'http://localhost:8080';
    this.timeout = 10000; // 10 seconds
    
    console.log('🔄 HadesAuthApi: Client initialized', {
      baseURL: this.baseURL,
      timeout: this.timeout,
      environment: import.meta.env.NODE_ENV || 'unknown'
    });
  }

  // Enhanced fetch method with timeout and error handling + DEBUG
  private async enhancedFetch(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    console.log('🔄 HadesAuthApi: ===== ENHANCED FETCH STARTED =====');
    console.log('🔄 HadesAuthApi: Fetch request details:', {
      endpoint,
      method: options.method || 'GET',
      baseURL: this.baseURL,
      fullURL: `${this.baseURL}${endpoint}`,
      timeout: this.timeout,
      hasBody: !!options.body,
      bodyLength: options.body ? String(options.body).length : 0
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.error(`❌ HadesAuthApi: Request timeout after ${this.timeout}ms`);
      controller.abort();
    }, this.timeout);

    const url = `${this.baseURL}${endpoint}`;
    const startTime = Date.now();

    try {
      console.log('🔄 HadesAuthApi: Making fetch request...');
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // Log response time in development
      const duration = Date.now() - startTime;
      console.log(`✅ HadesAuthApi: Fetch completed in ${duration}ms`);
      console.log('🔄 HadesAuthApi: Response details:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      });

      if (import.meta.env.DEV) {
        console.log(`🔄 HadesAuthApi: ${options.method || 'GET'} ${endpoint} - ${duration}ms - ${response.status}`);
      }

      console.log('✅ HadesAuthApi: ===== ENHANCED FETCH COMPLETED =====');
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ HadesAuthApi: Fetch failed after ${duration}ms`);
      console.error('❌ HadesAuthApi: Fetch error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

      if (error instanceof Error && error.name === 'AbortError') {
        console.error('❌ HadesAuthApi: Request aborted due to timeout');
        throw new ApiError('Request timeout', 408);
      }
      
      console.error('❌ HadesAuthApi: ===== ENHANCED FETCH FAILED =====');
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Process HADES API response format + DEBUG
  private async processHadesResponse<T>(response: Response): Promise<T> {
    console.log('🔄 HadesAuthApi: ===== PROCESSING HADES RESPONSE =====');
    console.log('🔄 HadesAuthApi: Response processing started', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      hasBody: response.body !== null
    });

    let data: any;
    const processStartTime = Date.now();
    
    try {
      console.log('🔄 HadesAuthApi: Reading response text...');
      const text = await response.text();
      const textReadDuration = Date.now() - processStartTime;
      
      console.log(`✅ HadesAuthApi: Response text read in ${textReadDuration}ms`, {
        hasText: !!text,
        textLength: text.length,
        textPreview: text.substring(0, 200) + (text.length > 200 ? '...' : '')
      });

      console.log('🔄 HadesAuthApi: Parsing JSON...');
      const parseStartTime = Date.now();
      data = text ? JSON.parse(text) : {};
      const parseDuration = Date.now() - parseStartTime;
      
      console.log(`✅ HadesAuthApi: JSON parsed in ${parseDuration}ms`, {
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
        success: data?.success,
        hasMessage: !!data?.message
      });
      
    } catch (error) {
      console.error('❌ HadesAuthApi: JSON parsing failed:', error);
      throw new ApiError('Invalid JSON response', response.status);
    }

    if (!response.ok) {
      const message = data?.message || `HTTP ${response.status}: ${response.statusText}`;
      console.error('❌ HadesAuthApi: HTTP error response:', {
        status: response.status,
        message,
        data
      });
      throw new ApiError(message, response.status, data);
    }

    // UPDATED: Handle HADES response format
    if (!data.success) {
      console.error('❌ HadesAuthApi: HADES API error:', {
        success: data.success,
        message: data.message,
        data
      });
      throw new ApiError(data.message || 'API request failed', response.status, data);
    }

    const totalProcessDuration = Date.now() - processStartTime;
    console.log(`✅ HadesAuthApi: Response processing completed in ${totalProcessDuration}ms`);
    console.log('✅ HadesAuthApi: ===== PROCESSING HADES RESPONSE COMPLETED =====');

    return data;
  }

  // UPDATED: Login using HADES format + DEBUG
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    console.log('🔄 HadesAuthApi: ===== LOGIN API CALL STARTED =====');
    console.log('🔄 HadesAuthApi: Login request initiated', {
      email: credentials.email,
      passwordLength: credentials.password?.length || 0,
      baseURL: this.baseURL,
      endpoint: '/api/v1/auth/login'
    });

    const loginStartTime = Date.now();

    try {
      console.log('🔄 HadesAuthApi: Preparing login request...');
      const requestBody = {
        email: credentials.email,
        password: credentials.password
      };
      
      console.log('🔄 HadesAuthApi: Request body prepared:', {
        email: requestBody.email,
        hasPassword: !!requestBody.password
      });

      console.log('🔄 HadesAuthApi: Making login fetch request...');
      const fetchStartTime = Date.now();
      
      const response = await this.enhancedFetch('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const fetchDuration = Date.now() - fetchStartTime;
      console.log(`✅ HadesAuthApi: Login fetch completed in ${fetchDuration}ms`);

      console.log('🔄 HadesAuthApi: Processing HADES login response...');
      const processStartTime = Date.now();
      
      const hadesResponse = await this.processHadesResponse<{
        success: boolean;
        data: {
          token: string;
          user: any;
        };
        message: string;
        timestamp: string;
      }>(response);

      const processDuration = Date.now() - processStartTime;
      console.log(`✅ HadesAuthApi: HADES response processed in ${processDuration}ms`);
      
      console.log('🔄 HadesAuthApi: HADES login response details:', {
        success: hadesResponse.success,
        hasToken: !!hadesResponse.data?.token,
        tokenLength: hadesResponse.data?.token?.length || 0,
        hasUser: !!hadesResponse.data?.user,
        userEmail: hadesResponse.data?.user?.email,
        message: hadesResponse.message,
        timestamp: hadesResponse.timestamp
      });

      console.log('🔄 HadesAuthApi: Transforming HADES response to Kairos format...');
      const transformStartTime = Date.now();
      
      // Transform HADES response to Kairos format
      const kairosResponse: LoginResponse = {
        success: hadesResponse.success,
        data: {
          token: hadesResponse.data.token,
          refreshToken: hadesResponse.data.token, // HADES might not have separate refresh token
          user: {
            id: hadesResponse.data.user?.id || 'unknown',
            email: hadesResponse.data.user?.email || credentials.email,
            firstName: hadesResponse.data.user?.firstName || 'HADES',
            lastName: hadesResponse.data.user?.lastName || 'User',
            role: 'admin', // Default role
            avatar: undefined,
            lastLogin: new Date().toISOString(),
            isActive: true,
            permissions: ['*'], // Full access for now
          },
          expiresIn: 24 * 60 * 60, // 24 hours in seconds
        },
        message: hadesResponse.message,
        timestamp: hadesResponse.timestamp,
      };

      const transformDuration = Date.now() - transformStartTime;
      console.log(`✅ HadesAuthApi: Response transformation completed in ${transformDuration}ms`);

      const totalDuration = Date.now() - loginStartTime;
      console.log(`✅ HadesAuthApi: Login API call completed successfully in ${totalDuration}ms`);
      console.log('🔄 HadesAuthApi: Final Kairos response:', {
        success: kairosResponse.success,
        hasToken: !!kairosResponse.data.token,
        hasUser: !!kairosResponse.data.user,
        userRole: kairosResponse.data.user.role,
        expiresIn: kairosResponse.data.expiresIn
      });
      console.log('✅ HadesAuthApi: ===== LOGIN API CALL COMPLETED =====');

      return kairosResponse;
    } catch (error) {
      const totalDuration = Date.now() - loginStartTime;
      console.error(`❌ HadesAuthApi: Login failed after ${totalDuration}ms`);
      
      if (error instanceof ApiError) {
        console.error('❌ HadesAuthApi: API Error details:', {
          message: error.message,
          status: error.status,
          data: error.data
        });
        throw error;
      }
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('❌ HadesAuthApi: Network error - cannot connect to HADES');
        throw new ApiError('Network error. Cannot connect to HADES backend.', 0);
      }
      
      console.error('❌ HadesAuthApi: Unexpected login error:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      console.error('❌ HadesAuthApi: ===== LOGIN API CALL FAILED =====');
      throw new ApiError('An unexpected error occurred during login', 500);
    }
  }

  // UPDATED: Refresh token using HADES + DEBUG
  async refresh(refreshToken: string): Promise<RefreshTokenResponse> {
    console.log('🔄 HadesAuthApi: ===== REFRESH TOKEN API CALL STARTED =====');
    console.log('🔄 HadesAuthApi: Refresh token request initiated', {
      hasRefreshToken: !!refreshToken,
      tokenLength: refreshToken?.length || 0,
      endpoint: '/api/v1/auth/refresh'
    });

    const refreshStartTime = Date.now();

    try {
      console.log('🔄 HadesAuthApi: Making refresh token fetch request...');
      const response = await this.enhancedFetch('/api/v1/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ 
          token: refreshToken // HADES expects 'token' not 'refreshToken'
        }),
      });

      console.log('🔄 HadesAuthApi: Processing HADES refresh response...');
      const hadesResponse = await this.processHadesResponse<{
        success: boolean;
        data: {
          token: string;
        };
        message: string;
      }>(response);

      console.log('🔄 HadesAuthApi: HADES refresh response details:', {
        success: hadesResponse.success,
        hasToken: !!hadesResponse.data?.token,
        tokenLength: hadesResponse.data?.token?.length || 0,
        message: hadesResponse.message
      });

      const kairosResponse: RefreshTokenResponse = {
        success: hadesResponse.success,
        data: {
          token: hadesResponse.data.token,
          refreshToken: hadesResponse.data.token,
          expiresIn: 24 * 60 * 60, // 24 hours
        },
        message: hadesResponse.message,
      };

      const totalDuration = Date.now() - refreshStartTime;
      console.log(`✅ HadesAuthApi: Refresh token completed in ${totalDuration}ms`);
      console.log('✅ HadesAuthApi: ===== REFRESH TOKEN API CALL COMPLETED =====');

      return kairosResponse;
    } catch (error) {
      const totalDuration = Date.now() - refreshStartTime;
      console.error(`❌ HadesAuthApi: Refresh token failed after ${totalDuration}ms`);
      
      if (error instanceof ApiError) {
        console.error('❌ HadesAuthApi: Refresh API Error:', error);
        throw error;
      }
      
      console.error('❌ HadesAuthApi: Unexpected refresh error:', error);
      console.error('❌ HadesAuthApi: ===== REFRESH TOKEN API CALL FAILED =====');
      throw new ApiError('Token refresh failed', 500);
    }
  }

  // UPDATED: Logout using HADES + DEBUG
  async logout(): Promise<void> {
    console.log('🔄 HadesAuthApi: ===== LOGOUT API CALL STARTED =====');
    const logoutStartTime = Date.now();

    try {
      console.log('🔄 HadesAuthApi: Making logout fetch request...');
      await this.enhancedFetch('/api/v1/auth/logout', {
        method: 'POST',
      });

      const totalDuration = Date.now() - logoutStartTime;
      console.log(`✅ HadesAuthApi: Logout completed in ${totalDuration}ms`);
      console.log('✅ HadesAuthApi: ===== LOGOUT API CALL COMPLETED =====');
    } catch (error) {
      const totalDuration = Date.now() - logoutStartTime;
      console.warn(`⚠️ HadesAuthApi: Logout failed after ${totalDuration}ms (non-critical):`, error);
      console.warn('⚠️ HadesAuthApi: ===== LOGOUT API CALL FAILED (NON-CRITICAL) =====');
      // Don't throw on logout errors, just log them
    }
  }

  // UPDATED: Get current user from HADES + DEBUG
  async getUser(): Promise<AuthApiResponse> {
    console.log('🔄 HadesAuthApi: ===== GET USER API CALL STARTED =====');
    const getUserStartTime = Date.now();

    try {
      console.log('🔄 HadesAuthApi: Making get user fetch request...');
      const response = await this.enhancedFetch('/api/v1/auth/me', {
        method: 'GET',
      });

      console.log('🔄 HadesAuthApi: Processing get user response...');
      const result = await this.processHadesResponse<AuthApiResponse>(response);

      const totalDuration = Date.now() - getUserStartTime;
      console.log(`✅ HadesAuthApi: Get user completed in ${totalDuration}ms`);
      console.log('✅ HadesAuthApi: ===== GET USER API CALL COMPLETED =====');

      return result;
    } catch (error) {
      const totalDuration = Date.now() - getUserStartTime;
      console.error(`❌ HadesAuthApi: Get user failed after ${totalDuration}ms:`, error);
      console.error('❌ HadesAuthApi: ===== GET USER API CALL FAILED =====');
      throw error;
    }
  }

  // NEW: Health check for HADES connectivity + DEBUG
  async healthCheck(): Promise<boolean> {
    console.log('🔄 HadesAuthApi: ===== HEALTH CHECK STARTED =====');
    const healthStartTime = Date.now();

    try {
      console.log('🔄 HadesAuthApi: Making health check request...');
      const response = await this.enhancedFetch('/api/v1/monitoring/health', {
        method: 'GET',
      });

      console.log('🔄 HadesAuthApi: Processing health check response...');
      const hadesResponse = await this.processHadesResponse<{
        success: boolean;
        data: {
          status: string;
        };
      }>(response);

      const isHealthy = hadesResponse.success && hadesResponse.data.status === 'UP';
      const totalDuration = Date.now() - healthStartTime;
      
      console.log(`✅ HadesAuthApi: Health check completed in ${totalDuration}ms`, {
        isHealthy,
        status: hadesResponse.data?.status,
        success: hadesResponse.success
      });
      console.log('✅ HadesAuthApi: ===== HEALTH CHECK COMPLETED =====');

      return isHealthy;
    } catch (error) {
      const totalDuration = Date.now() - healthStartTime;
      console.warn(`⚠️ HadesAuthApi: Health check failed after ${totalDuration}ms:`, error);
      console.warn('⚠️ HadesAuthApi: ===== HEALTH CHECK FAILED =====');
      return false;
    }
  }

  // Add authorization header for authenticated requests + DEBUG
  async authenticatedRequest(
    endpoint: string,
    options: RequestInit = {},
    token?: string
  ): Promise<Response> {
    console.log('🔄 HadesAuthApi: Making authenticated request', {
      endpoint,
      method: options.method || 'GET',
      hasToken: !!token,
      tokenLength: token?.length || 0
    });

    const headers = {
      ...options.headers,
    };

    if (token) {
      (headers as any)['Authorization'] = `Bearer ${token}`;
      console.log('🔄 HadesAuthApi: Authorization header added');
    }

    return this.enhancedFetch(endpoint, {
      ...options,
      headers,
    });
  }

  // NEW: Test HADES connection + DEBUG
  async testConnection(): Promise<{
    success: boolean;
    message: string;
    responseTime: number;
  }> {
    console.log('🔄 HadesAuthApi: ===== CONNECTION TEST STARTED =====');
    const startTime = Date.now();
    
    try {
      console.log('🔄 HadesAuthApi: Testing connection via health check...');
      const isHealthy = await this.healthCheck();
      const responseTime = Date.now() - startTime;
      
      const result = {
        success: isHealthy,
        message: isHealthy ? 'HADES connection successful' : 'HADES health check failed',
        responseTime
      };

      console.log(`✅ HadesAuthApi: Connection test completed in ${responseTime}ms`, result);
      console.log('✅ HadesAuthApi: ===== CONNECTION TEST COMPLETED =====');
      
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const result = {
        success: false,
        message: `HADES connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        responseTime
      };

      console.error(`❌ HadesAuthApi: Connection test failed after ${responseTime}ms:`, error);
      console.error('❌ HadesAuthApi: ===== CONNECTION TEST FAILED =====');
      
      return result;
    }
  }
}

// Create and export singleton instance
console.log('🔄 HadesAuthApi: Creating singleton instance...');
export const hadesAuthApi = new HadesAuthApiClient();
console.log('✅ HadesAuthApi: Singleton instance created');

// Export individual methods for convenience (updated to use HADES)
export const {
  login,
  refresh,
  logout,
  getUser,
  healthCheck,
  testConnection,
} = hadesAuthApi;

// Export the ApiError class for error handling
export { ApiError };

// Backward compatibility - export as authApi
export const authApi = hadesAuthApi;

console.log('✅ HadesAuthApi: Module loaded successfully', {
  baseURL: hadesAuthApi['baseURL'],
  timeout: hadesAuthApi['timeout']
});