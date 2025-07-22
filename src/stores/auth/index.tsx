// src/stores/auth/index.tsx (RENAME FROM .ts TO .tsx)
import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'user';
  avatar?: string;
  permissions: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  accessToken: string | null;
  refreshToken: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; accessToken: string; refreshToken: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_RESET_ERROR' }
  | { type: 'AUTH_UPDATE_USER'; payload: Partial<User> };

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  accessToken: null,
  refreshToken: null,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...initialState,
      };
    case 'AUTH_RESET_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'AUTH_UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    default:
      return state;
  }
};

// Context
const AuthContext = createContext<{
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  resetError: () => void;
} | null>(null);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Mock login function - replace with actual API call
  const login = async (email: string, password: string) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      const mockUser: User = {
        id: '1',
        email,
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin',
        permissions: ['read', 'write', 'admin'],
      };
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: mockUser,
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
      });
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : 'Login failed',
      });
    }
  };

  const logout = () => {
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  const updateUser = (updates: Partial<User>) => {
    dispatch({ type: 'AUTH_UPDATE_USER', payload: updates });
  };

  const resetError = () => {
    dispatch({ type: 'AUTH_RESET_ERROR' });
  };

  // Auto-logout on token expiry (mock implementation)
  useEffect(() => {
    if (state.accessToken) {
      // In a real app, you'd check token expiry
      console.log('User authenticated:', state.user?.email);
    }
  }, [state.accessToken, state.user]);

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        logout,
        updateUser,
        resetError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Selector hooks
export const useAuthState = () => useAuth().state;
export const useUser = () => useAuth().state.user;
export const useIsAuthenticated = () => useAuth().state.isAuthenticated;