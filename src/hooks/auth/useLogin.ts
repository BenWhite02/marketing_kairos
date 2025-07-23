// src/hooks/auth/useLogin.ts
// Login-specific hook with React Query integration + COMPREHENSIVE DEBUG STATEMENTS
// Handles login mutations and state management

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth/authStore';
import { authApi } from '@/services/api/auth';
import type { LoginCredentials } from '@/types/auth';

export const useLogin = () => {
  console.log('🔄 useLogin: Hook initialized');
  
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { login: authLogin, clearError } = useAuthStore();

  // Debug hook dependencies
  console.log('🔄 useLogin: Hook dependencies', {
    hasNavigate: typeof navigate === 'function',
    hasLocation: !!location,
    hasQueryClient: !!queryClient,
    hasAuthLogin: typeof authLogin === 'function',
    hasClearError: typeof clearError === 'function',
    currentPath: location.pathname,
    locationState: location.state
  });

  // Get intended destination from navigation state
  const from = (location.state as any)?.from || '/dashboard';
  console.log('🔄 useLogin: Navigation destination:', from);

  const loginMutation = useMutation({
    mutationKey: ['login'],
    mutationFn: async (data: { credentials: LoginCredentials; bypassAuth?: boolean }) => {
      console.log('🔄 useLogin: ===== MUTATION FUNCTION STARTED =====');
      console.log('🔄 useLogin: Mutation function called with:', {
        email: data.credentials.email,
        passwordLength: data.credentials.password?.length || 0,
        bypassAuth: data.bypassAuth,
        timestamp: new Date().toISOString()
      });

      const mutationStartTime = Date.now();

      try {
        console.log('🔄 useLogin: Clearing previous errors...');
        clearError();

        console.log('🔄 useLogin: About to call authLogin from store...');
        console.log('🔄 useLogin: authLogin function type:', typeof authLogin);

        // Add timeout wrapper for the store login call
        const authLoginPromise = authLogin(data.credentials);
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            console.error('❌ useLogin: authLogin timeout after 25 seconds');
            reject(new Error('Auth store login timeout after 25 seconds'));
          }, 25000);
        });

        console.log('🔄 useLogin: Calling authLogin with 25s timeout...');
        await Promise.race([authLoginPromise, timeoutPromise]);

        const mutationDuration = Date.now() - mutationStartTime;
        console.log(`✅ useLogin: authLogin completed successfully in ${mutationDuration}ms`);
        console.log('✅ useLogin: ===== MUTATION FUNCTION COMPLETED =====');

        return data.credentials;
      } catch (error) {
        const mutationDuration = Date.now() - mutationStartTime;
        console.error(`❌ useLogin: authLogin failed after ${mutationDuration}ms`);
        console.error('❌ useLogin: Mutation function error:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          error
        });
        console.error('❌ useLogin: ===== MUTATION FUNCTION FAILED =====');
        throw error;
      }
    },
    onMutate: (variables) => {
      console.log('🔄 useLogin: onMutate triggered', {
        email: variables.credentials.email,
        bypassAuth: variables.bypassAuth
      });
    },
    onSuccess: (data, variables) => {
      console.log('🔄 useLogin: ===== ON SUCCESS TRIGGERED =====');
      console.log('🔄 useLogin: onSuccess called with:', {
        returnedData: data,
        originalVariables: {
          email: variables.credentials.email,
          bypassAuth: variables.bypassAuth
        }
      });

      try {
        console.log('🔄 useLogin: Invalidating React Query caches...');
        const invalidateStartTime = Date.now();

        // Invalidate and refetch any user-specific queries
        queryClient.invalidateQueries({ queryKey: ['user'] });
        queryClient.invalidateQueries({ queryKey: ['auth'] });

        const invalidateDuration = Date.now() - invalidateStartTime;
        console.log(`✅ useLogin: Query invalidation completed in ${invalidateDuration}ms`);

        console.log(`🔄 useLogin: Navigating to destination: ${from}`);
        console.log('🔄 useLogin: Navigation details:', {
          from,
          replace: true,
          currentLocation: location.pathname
        });

        const navigationStartTime = Date.now();
        navigate(from, { replace: true });
        
        // Note: navigation timing can't be measured directly as it's async
        console.log(`✅ useLogin: Navigation initiated after ${Date.now() - navigationStartTime}ms`);
        console.log('✅ useLogin: ===== ON SUCCESS COMPLETED =====');

      } catch (navError) {
        console.error('❌ useLogin: Error in onSuccess navigation:', navError);
      }
    },
    onError: (error, variables) => {
      console.error('🔄 useLogin: ===== ON ERROR TRIGGERED =====');
      console.error('❌ useLogin: onError called with:', {
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          name: error instanceof Error ? error.name : 'Unknown',
          stack: error instanceof Error ? error.stack : undefined
        },
        variables: {
          email: variables.credentials.email,
          bypassAuth: variables.bypassAuth
        },
        timestamp: new Date().toISOString()
      });
      console.error('❌ useLogin: ===== ON ERROR COMPLETED =====');
      
      // Error is already handled by the auth store, just log it
    },
    onSettled: (data, error, variables) => {
      console.log('🔄 useLogin: onSettled triggered', {
        hasData: !!data,
        hasError: !!error,
        variables: {
          email: variables.credentials.email,
          bypassAuth: variables.bypassAuth
        }
      });
    },
  });

  // Debug mutation state changes
  React.useEffect(() => {
    console.log('🔄 useLogin: Mutation state changed:', {
      status: loginMutation.status,
      isPending: loginMutation.isPending,
      isSuccess: loginMutation.isSuccess,
      isError: loginMutation.isError,
      error: loginMutation.error?.message || null
    });
  }, [
    loginMutation.status, 
    loginMutation.isPending, 
    loginMutation.isSuccess, 
    loginMutation.isError, 
    loginMutation.error
  ]);

  // Wrapper function to handle the login call
  const login = React.useCallback(async (credentials: LoginCredentials, bypassAuth = false) => {
    console.log('🔄 useLogin: ===== LOGIN WRAPPER CALLED =====');
    console.log('🔄 useLogin: Login wrapper parameters:', {
      email: credentials.email,
      passwordLength: credentials.password?.length || 0,
      bypassAuth,
      mutationStatus: loginMutation.status
    });

    // Check if mutation is already in progress
    if (loginMutation.isPending) {
      console.warn('⚠️ useLogin: Login already in progress, ignoring duplicate call');
      return;
    }

    try {
      console.log('🔄 useLogin: Calling mutation...');
      const result = await loginMutation.mutateAsync({ credentials, bypassAuth });
      console.log('✅ useLogin: Login wrapper completed successfully');
      console.log('✅ useLogin: ===== LOGIN WRAPPER COMPLETED =====');
      return result;
    } catch (error) {
      console.error('❌ useLogin: Login wrapper failed:', error);
      console.error('❌ useLogin: ===== LOGIN WRAPPER FAILED =====');
      throw error;
    }
  }, [loginMutation]);

  // Debug return values
  const returnValue = {
    login,
    loginAsync: loginMutation.mutateAsync,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
    isSuccess: loginMutation.isSuccess,
    reset: loginMutation.reset,
  };

  console.log('🔄 useLogin: Hook returning:', {
    hasLogin: typeof returnValue.login === 'function',
    hasLoginAsync: typeof returnValue.loginAsync === 'function',
    isLoading: returnValue.isLoading,
    hasError: !!returnValue.error,
    errorMessage: returnValue.error?.message || null,
    isSuccess: returnValue.isSuccess,
    hasReset: typeof returnValue.reset === 'function'
  });

  return returnValue;
};

// Logout hook with debug statements
export const useLogout = () => {
  console.log('🔄 useLogout: Hook initialized');
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout: authLogout } = useAuthStore();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log('🔄 useLogout: Logout mutation started');
      const logoutStartTime = Date.now();
      
      await authLogout();
      
      const logoutDuration = Date.now() - logoutStartTime;
      console.log(`✅ useLogout: Logout completed in ${logoutDuration}ms`);
    },
    onSuccess: () => {
      console.log('🔄 useLogout: Logout onSuccess triggered');
      
      // Clear all cached data
      console.log('🔄 useLogout: Clearing query cache...');
      queryClient.clear();
      
      // Navigate to login page
      console.log('🔄 useLogout: Navigating to login page...');
      navigate('/login', { replace: true });
      
      console.log('✅ useLogout: Logout onSuccess completed');
    },
    onError: (error) => {
      console.error('❌ useLogout: Logout error:', error);
      // Even if logout fails, redirect to login
      console.log('🔄 useLogout: Force navigating to login due to error...');
      navigate('/login', { replace: true });
    },
  });

  return {
    logout: logoutMutation.mutate,
    logoutAsync: logoutMutation.mutateAsync,
    isLoading: logoutMutation.isPending,
  };
};

// Token refresh hook with debug statements
export const useRefreshAuth = () => {
  console.log('🔄 useRefreshAuth: Hook initialized');
  
  const { refreshAuth } = useAuthStore();

  const refreshMutation = useMutation({
    mutationFn: async () => {
      console.log('🔄 useRefreshAuth: Refresh mutation started');
      const refreshStartTime = Date.now();
      
      await refreshAuth();
      
      const refreshDuration = Date.now() - refreshStartTime;
      console.log(`✅ useRefreshAuth: Refresh completed in ${refreshDuration}ms`);
    },
    onError: (error) => {
      console.error('❌ useRefreshAuth: Token refresh error:', error);
    },
  });

  return {
    refresh: refreshMutation.mutate,
    refreshAsync: refreshMutation.mutateAsync,
    isLoading: refreshMutation.isPending,
    error: refreshMutation.error,
  };
};

// Add React import for useEffect and useCallback
import React from 'react';