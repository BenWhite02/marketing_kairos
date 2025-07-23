// src/types/auth.ts
// Complete Authentication TypeScript Interfaces
// File path: src/types/auth.ts

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user' | 'manager';
  avatar?: string;
  lastLogin?: string;
  isActive: boolean;
  permissions: string[];
  // HADES specific fields
  tenantId?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  version?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    refreshToken: string;
    user: User;
    expiresIn: number;
  };
  message: string;
  timestamp: string;
}

export interface RefreshTokenRequest {
  token: string; // HADES uses 'token' not 'refreshToken'
}

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    token: string;
    refreshToken: string;
    expiresIn: number;
  };
  message: string;
}

export interface AuthState {
  // Authentication status
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Token management
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
  
  // Configuration
  bypassAuth: boolean;
  hadesConnected: boolean; // NEW: Track HADES connection
  
  // Session management
  lastActivity: Date | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
  updateUser: (updates: Partial<User>) => void;
  setBypassAuth: (bypass: boolean) => void;
  
  // Utility methods
  isTokenExpired: () => boolean;
  getTokenTimeRemaining: () => number;
  testHadesConnection: () => Promise<{
    success: boolean;
    message: string;
    responseTime: number;
  }>;
}

export interface ApiError {
  code?: string;
  message: string;
  status: number;
  field?: string;
}

export interface AuthApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: ApiError[];
  timestamp?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredPermissions?: string[];
}

// HADES specific types
export interface HadesUser {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface HadesLoginRequest {
  email: string;
  password: string;
}

export interface HadesLoginResponse {
  success: boolean;
  data: {
    token: string;
    user: HadesUser;
  };
  message: string;
  timestamp: string;
}

export interface HadesRefreshRequest {
  token: string;
}

export interface HadesRefreshResponse {
  success: boolean;
  data: {
    token: string;
  };
  message: string;
}

// Connection test types
export interface ConnectionTestResult {
  success: boolean;
  message: string;
  responseTime: number;
}

// Auth hook return types
export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  isTokenExpired: () => boolean;
  hadesConnected: boolean;
  testConnection: () => Promise<ConnectionTestResult>;
}