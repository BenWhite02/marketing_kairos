// src/stores/auth/authStore.ts
// UPDATED: Enhanced Zustand Auth Store with HADES Integration + COMPREHENSIVE DEBUG STATEMENTS
// Professional authentication state management with real HADES backend

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { AuthState, LoginCredentials, User } from '@/types/auth';
import { hadesAuthApi } from '@/services/api/auth';

console.log('🔄 authStore: Module loading...');

// Mock user for bypass authentication (unchanged)
const MOCK_USER: User = {
  id: 'mock-user-1',
  email: 'admin@kairos.dev',
  firstName: 'Kairos',
  lastName: 'Administrator',
  role: 'admin',
  avatar: undefined,
  lastLogin: new Date().toISOString(),
  isActive: true,
  permissions: ['*'], // Full access
};

// Token refresh timeout ID
let refreshTimeoutId: NodeJS.Timeout | null = null;

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  accessToken: null,
  refreshToken: null,
  tokenExpiry: null,
  bypassAuth: import.meta.env.DEV, // Default to bypass in development
  hadesConnected: false, // NEW: Track HADES connection status
};

console.log('🔄 authStore: Initial state configured:', {
  bypassAuth: initialState.bypassAuth,
  isDev: import.meta.env.DEV,
  hadesApiUrl: import.meta.env.VITE_HADES_API_URL
});

// Create enhanced auth store with HADES integration
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        // UPDATED: Login action with HADES integration + DEBUG
        login: async (credentials: LoginCredentials) => {
          console.log('🔄 authStore: ===== LOGIN ACTION STARTED =====');
          console.log('🔄 authStore: Login called with:', {
            email: credentials.email,
            passwordLength: credentials.password?.length || 0,
            timestamp: new Date().toISOString()
          });

          const loginStartTime = Date.now();
          const currentState = get();
          
          console.log('🔄 authStore: Current auth state:', {
            isAuthenticated: currentState.isAuthenticated,
            isLoading: currentState.isLoading,
            bypassAuth: currentState.bypassAuth,
            hadesConnected: currentState.hadesConnected,
            hasUser: !!currentState.user,
            hasToken: !!currentState.accessToken
          });

          // Check if already loading
          if (currentState.isLoading) {
            console.warn('⚠️ authStore: Login already in progress, ignoring duplicate call');
            return;
          }

          console.log('🔄 authStore: Setting loading state...');
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });
          console.log('✅ authStore: Loading state set to true');

          try {
            // Check if bypass authentication is enabled
            if (get().bypassAuth) {
              console.log('🔄 authStore: ===== BYPASS MODE SELECTED =====');
              console.log('🔄 authStore: Using bypass authentication mode');
              
              // Simulate API delay for realistic experience
              console.log('🔄 authStore: Starting 1000ms mock delay...');
              const delayStartTime = Date.now();
              await new Promise(resolve => setTimeout(resolve, 1000));
              const delayDuration = Date.now() - delayStartTime;
              console.log(`✅ authStore: Mock delay completed in ${delayDuration}ms`);
              
              console.log('🔄 authStore: Setting bypass auth state...');
              set((state) => {
                state.user = MOCK_USER;
                state.isAuthenticated = true;
                state.isLoading = false;
                state.accessToken = 'mock-jwt-token';
                state.refreshToken = 'mock-refresh-token';
                state.tokenExpiry = Date.now() + (60 * 60 * 1000); // 1 hour
                state.hadesConnected = false; // Mock mode
              });
              
              const totalDuration = Date.now() - loginStartTime;
              console.log(`✅ authStore: Bypass authentication completed in ${totalDuration}ms`);
              console.log('✅ authStore: ===== BYPASS MODE COMPLETED =====');
              return;
            }

            // UPDATED: Real HADES authentication
            console.log('🔄 authStore: ===== HADES MODE SELECTED =====');
            console.log('🔄 authStore: Authenticating with HADES backend...');
            console.log('🔄 authStore: HADES API configuration:', {
              baseUrl: import.meta.env.VITE_HADES_API_URL,
              timeout: '10000ms',
              retryAttempts: import.meta.env.VITE_HADES_RETRY_ATTEMPTS || '3'
            });
            
            const apiStartTime = Date.now();
            console.log('🔄 authStore: Calling hadesAuthApi.login...');
            console.log('🔄 authStore: hadesAuthApi type:', typeof hadesAuthApi);
            console.log('🔄 authStore: hadesAuthApi.login type:', typeof hadesAuthApi.login);

            // Add timeout wrapper for HADES API call
            const hadesLoginPromise = hadesAuthApi.login(credentials);
            const hadesTimeoutPromise = new Promise((_, reject) => {
              setTimeout(() => {
                console.error('❌ authStore: HADES API timeout after 20 seconds');
                reject(new Error('HADES API timeout after 20 seconds'));
              }, 20000);
            });

            console.log('🔄 authStore: Calling HADES API with 20s timeout...');
            const response = await Promise.race([hadesLoginPromise, hadesTimeoutPromise]);
            
            const apiDuration = Date.now() - apiStartTime;
            console.log(`✅ authStore: HADES API response received in ${apiDuration}ms`);
            console.log('🔄 authStore: HADES response:', {
              success: response.success,
              hasData: !!response.data,
              hasToken: !!response.data?.token,
              hasUser: !!response.data?.user,
              expiresIn: response.data?.expiresIn,
              message: response.message
            });
            
            if (!response.success) {
              console.error('❌ authStore: HADES authentication failed:', response.message);
              throw new Error(response.message || 'HADES authentication failed');
            }

            const { token, refreshToken, user, expiresIn } = response.data;

            console.log('🔄 authStore: Processing HADES authentication result...');
            console.log('🔄 authStore: Token info:', {
              hasToken: !!token,
              tokenLength: token?.length || 0,
              hasRefreshToken: !!refreshToken,
              expiresIn,
              hasUserData: !!user
            });

            console.log('🔄 authStore: Setting HADES auth state...');
            set((state) => {
              state.user = user;
              state.isAuthenticated = true;
              state.isLoading = false;
              state.accessToken = token;
              state.refreshToken = refreshToken || token; // Use token as refresh token if not provided
              state.tokenExpiry = Date.now() + expiresIn * 1000;
              state.hadesConnected = true; // HADES mode
              state.error = null;
            });

            console.log('✅ authStore: HADES auth state set successfully');

            // Schedule token refresh
            console.log('🔄 authStore: Scheduling token refresh...');
            scheduleTokenRefresh(expiresIn);

            const totalDuration = Date.now() - loginStartTime;
            console.log(`✅ authStore: HADES authentication completed in ${totalDuration}ms`);
            console.log('✅ authStore: ===== HADES MODE COMPLETED =====');

          } catch (error) {
            const totalDuration = Date.now() - loginStartTime;
            console.error(`❌ authStore: Authentication failed after ${totalDuration}ms`);
            console.error('❌ authStore: Error details:', {
              message: error instanceof Error ? error.message : 'Unknown error',
              name: error instanceof Error ? error.name : 'Unknown',
              stack: error instanceof Error ? error.stack : undefined,
              error
            });
            
            console.log('🔄 authStore: Setting error state...');
            set((state) => {
              state.isLoading = false;
              state.error = error instanceof Error ? error.message : 'Login failed';
              state.hadesConnected = false;
            });
            console.log('✅ authStore: Error state set');
            
            console.error('❌ authStore: ===== LOGIN ACTION FAILED =====');
            throw error;
          } finally {
            console.log('🔄 authStore: Login action cleanup completed');
            console.log('🔄 authStore: ===== LOGIN ACTION FINISHED =====');
          }
        },

        // UPDATED: Enhanced logout action with HADES support + DEBUG
        logout: async () => {
          console.log('🔄 authStore: ===== LOGOUT ACTION STARTED =====');
          const logoutStartTime = Date.now();
          const currentState = get();
          
          console.log('🔄 authStore: Current state before logout:', {
            isAuthenticated: currentState.isAuthenticated,
            hadesConnected: currentState.hadesConnected,
            bypassAuth: currentState.bypassAuth,
            hasRefreshToken: !!currentState.refreshToken,
            hasUser: !!currentState.user
          });
          
          try {
            // Clear refresh timeout immediately
            if (refreshTimeoutId) {
              console.log('🔄 authStore: Clearing token refresh timeout...');
              clearTimeout(refreshTimeoutId);
              refreshTimeoutId = null;
              console.log('✅ authStore: Token refresh timeout cleared');
            }

            // Call HADES logout API if connected and not in bypass mode
            if (currentState.hadesConnected && !currentState.bypassAuth && currentState.refreshToken) {
              try {
                console.log('🔄 authStore: Calling HADES logout API...');
                const apiStartTime = Date.now();
                
                await hadesAuthApi.logout();
                
                const apiDuration = Date.now() - apiStartTime;
                console.log(`✅ authStore: HADES logout API completed in ${apiDuration}ms`);
              } catch (apiError) {
                console.warn('⚠️ authStore: HADES logout API call failed:', apiError);
                // Continue with local logout even if API fails
              }
            } else {
              console.log('🔄 authStore: Skipping HADES logout API (bypass mode or not connected)');
            }

          } catch (error) {
            console.warn('⚠️ authStore: Logout process encountered error:', error);
          } finally {
            // Always clear state regardless of API success/failure
            console.log('🔄 authStore: Clearing authentication state...');
            
            set((state) => {
              // Reset all auth state to initial values
              state.user = null;
              state.isAuthenticated = false;
              state.isLoading = false;
              state.error = null;
              state.accessToken = null;
              state.refreshToken = null;
              state.tokenExpiry = null;
              state.hadesConnected = false;
              // Keep bypassAuth setting
            });
            
            console.log('✅ authStore: Authentication state cleared');

            // Clear any stored auth data
            try {
              console.log('🔄 authStore: Clearing localStorage...');
              localStorage.removeItem('auth-storage');
              console.log('✅ authStore: localStorage cleared');
            } catch (storageError) {
              console.warn('⚠️ authStore: Failed to clear auth storage:', storageError);
            }

            const totalDuration = Date.now() - logoutStartTime;
            console.log(`✅ authStore: Logout completed in ${totalDuration}ms`);
            console.log('✅ authStore: ===== LOGOUT ACTION COMPLETED =====');
          }
        },

        // UPDATED: Refresh authentication with HADES support + DEBUG
        refreshAuth: async () => {
          console.log('🔄 authStore: ===== REFRESH AUTH STARTED =====');
          const refreshStartTime = Date.now();
          const { refreshToken, bypassAuth, tokenExpiry, hadesConnected } = get();

          console.log('🔄 authStore: Refresh auth state check:', {
            hasRefreshToken: !!refreshToken,
            bypassAuth,
            hadesConnected,
            tokenExpiry,
            timeUntilExpiry: tokenExpiry ? Math.floor((tokenExpiry - Date.now()) / 1000) : 0
          });

          // Check if refresh is needed
          if (!tokenExpiry || Date.now() < tokenExpiry - 60000) { // 1 minute buffer
            console.log('🔄 authStore: Token still valid, skipping refresh');
            console.log('✅ authStore: ===== REFRESH AUTH SKIPPED =====');
            return; // Token still valid
          }

          if (bypassAuth) {
            console.log('🔄 authStore: Bypass mode - extending mock token...');
            // In bypass mode, just extend the mock token
            set((state) => {
              state.tokenExpiry = Date.now() + (60 * 60 * 1000); // Extend 1 hour
            });
            scheduleTokenRefresh(3600); // Schedule next refresh in 1 hour
            
            const refreshDuration = Date.now() - refreshStartTime;
            console.log(`✅ authStore: Mock token refresh completed in ${refreshDuration}ms`);
            console.log('✅ authStore: ===== REFRESH AUTH COMPLETED (BYPASS) =====');
            return;
          }

          if (!refreshToken) {
            console.error('❌ authStore: No refresh token available');
            throw new Error('No refresh token available');
          }

          if (!hadesConnected) {
            console.error('❌ authStore: HADES backend not connected');
            throw new Error('HADES backend not connected');
          }

          try {
            console.log('🔄 authStore: Refreshing HADES token...');
            const apiStartTime = Date.now();
            
            const response = await hadesAuthApi.refresh(refreshToken);
            
            const apiDuration = Date.now() - apiStartTime;
            console.log(`✅ authStore: HADES refresh API completed in ${apiDuration}ms`);
            
            if (!response.success) {
              console.error('❌ authStore: HADES token refresh failed:', response.message);
              throw new Error(response.message || 'Token refresh failed');
            }

            const { token, expiresIn } = response.data;

            console.log('🔄 authStore: Updating token state...');
            set((state) => {
              state.accessToken = token;
              state.refreshToken = token; // Use new token as refresh token
              state.tokenExpiry = Date.now() + expiresIn * 1000;
            });

            // Schedule next refresh
            console.log('🔄 authStore: Scheduling next token refresh...');
            scheduleTokenRefresh(expiresIn);

            const totalDuration = Date.now() - refreshStartTime;
            console.log(`✅ authStore: HADES token refresh completed in ${totalDuration}ms`);
            console.log('✅ authStore: ===== REFRESH AUTH COMPLETED =====');

          } catch (error) {
            // Refresh failed, logout user
            console.error('❌ authStore: HADES token refresh failed:', error);
            console.log('🔄 authStore: Logging out due to refresh failure...');
            await get().logout();
            
            console.error('❌ authStore: ===== REFRESH AUTH FAILED =====');
            throw error;
          }
        },

        // Clear error + DEBUG
        clearError: () => {
          console.log('🔄 authStore: Clearing error state');
          set((state) => {
            state.error = null;
          });
          console.log('✅ authStore: Error state cleared');
        },

        // Update user data + DEBUG
        updateUser: (updates: Partial<User>) => {
          console.log('🔄 authStore: Updating user data:', updates);
          set((state) => {
            if (state.user) {
              Object.assign(state.user, updates);
              console.log('✅ authStore: User data updated');
            } else {
              console.warn('⚠️ authStore: No user to update');
            }
          });
        },

        // Set bypass authentication + DEBUG
        setBypassAuth: (bypass: boolean) => {
          console.log(`🔄 authStore: Setting bypass auth to ${bypass}`);
          set((state) => {
            state.bypassAuth = bypass;
          });
          console.log(`✅ authStore: Bypass auth set to ${bypass}`);

          // If switching to HADES mode, test connection
          if (!bypass) {
            console.log('🔄 authStore: Switching to HADES mode, testing connection...');
            testHadesConnection();
          }
        },

        // Check if token is expired + DEBUG
        isTokenExpired: () => {
          const { tokenExpiry } = get();
          const expired = !tokenExpiry || Date.now() >= tokenExpiry;
          console.log('🔄 authStore: Token expired check:', {
            hasTokenExpiry: !!tokenExpiry,
            tokenExpiry,
            currentTime: Date.now(),
            expired
          });
          return expired;
        },

        // Get time until token expires (in seconds) + DEBUG
        getTokenTimeRemaining: () => {
          const { tokenExpiry } = get();
          if (!tokenExpiry) {
            console.log('🔄 authStore: No token expiry set');
            return 0;
          }
          const remaining = Math.max(0, Math.floor((tokenExpiry - Date.now()) / 1000));
          console.log(`🔄 authStore: Token time remaining: ${remaining} seconds`);
          return remaining;
        },

        // NEW: Test HADES connection + DEBUG
        testHadesConnection: async () => {
          console.log('🔄 authStore: ===== TESTING HADES CONNECTION =====');
          const testStartTime = Date.now();
          
          try {
            console.log('🔄 authStore: Calling HADES test connection...');
            
            const result = await hadesAuthApi.testConnection();
            
            const testDuration = Date.now() - testStartTime;
            console.log(`🔄 authStore: HADES connection test completed in ${testDuration}ms`);
            
            set((state) => {
              state.hadesConnected = result.success;
            });

            if (result.success) {
              console.log(`✅ authStore: HADES connection successful (${result.responseTime}ms)`);
            } else {
              console.warn(`❌ authStore: HADES connection failed: ${result.message}`);
            }

            console.log('✅ authStore: ===== HADES CONNECTION TEST COMPLETED =====');
            return result;
          } catch (error) {
            const testDuration = Date.now() - testStartTime;
            console.error(`❌ authStore: HADES connection test failed after ${testDuration}ms:`, error);
            
            set((state) => {
              state.hadesConnected = false;
            });

            const result = {
              success: false,
              message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
              responseTime: testDuration
            };

            console.error('❌ authStore: ===== HADES CONNECTION TEST FAILED =====');
            return result;
          }
        },
      })),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          tokenExpiry: state.tokenExpiry,
          bypassAuth: state.bypassAuth,
          hadesConnected: state.hadesConnected, // NEW: Persist HADES connection status
        }),
        version: 2, // UPDATED: Increment version for migration
        migrate: (persistedState: any, version: number) => {
          console.log(`🔄 authStore: Migrating from version ${version} to 2`);
          // Handle migration between versions
          if (version < 2) {
            // Migration from version 1 to 2
            const migrated = {
              ...persistedState,
              bypassAuth: import.meta.env.DEV,
              hadesConnected: false, // Default to disconnected
            };
            console.log('✅ authStore: Migration completed');
            return migrated;
          }
          return persistedState;
        },
        onRehydrateStorage: () => {
          console.log('🔄 authStore: Starting state rehydration...');
          return (state, error) => {
            if (error) {
              console.error('❌ authStore: Rehydration failed:', error);
            } else {
              console.log('✅ authStore: State rehydrated successfully:', {
                isAuthenticated: state?.isAuthenticated,
                hasUser: !!state?.user,
                bypassAuth: state?.bypassAuth,
                hadesConnected: state?.hadesConnected
              });
            }
          };
        },
      }
    ),
    { 
      name: 'auth-store',
      enabled: import.meta.env.DEV,
    }
  )
);

console.log('✅ authStore: Store created successfully');

// Token refresh scheduling with error handling + DEBUG
function scheduleTokenRefresh(expiresIn: number) {
  console.log(`🔄 authStore: Scheduling token refresh for ${expiresIn} seconds`);
  
  // Clear existing timeout
  if (refreshTimeoutId) {
    console.log('🔄 authStore: Clearing existing refresh timeout');
    clearTimeout(refreshTimeoutId);
    refreshTimeoutId = null;
  }

  // Don't schedule if expiry is too short
  if (expiresIn <= 300) { // Less than 5 minutes
    console.warn(`⚠️ authStore: Expiry too short (${expiresIn}s), not scheduling refresh`);
    return;
  }

  // Schedule refresh 5 minutes before expiry
  const refreshTime = Math.max(0, (expiresIn - 300) * 1000);
  console.log(`🔄 authStore: Scheduling refresh in ${refreshTime}ms (${Math.floor(refreshTime/1000)}s)`);
  
  refreshTimeoutId = setTimeout(async () => {
    console.log('🔄 authStore: Auto token refresh triggered');
    try {
      const { refreshAuth, isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated) {
        console.log('🔄 authStore: User authenticated, proceeding with refresh');
        await refreshAuth();
        console.log('✅ authStore: Auto token refresh completed');
      } else {
        console.log('🔄 authStore: User not authenticated, skipping refresh');
      }
    } catch (error) {
      console.error('❌ authStore: Auto token refresh failed:', error);
      // The refreshAuth method will handle logout on failure
    }
  }, refreshTime);
  
  console.log('✅ authStore: Token refresh scheduled');
}

// NEW: Test HADES connection on store initialization + DEBUG
const testHadesConnection = async () => {
  console.log('🔄 authStore: Testing HADES connection on initialization...');
  const { testHadesConnection } = useAuthStore.getState();
  await testHadesConnection();
};

// Initialize auto-refresh and test HADES connection if user is authenticated + DEBUG
const initializeStore = () => {
  console.log('🔄 authStore: Initializing store...');
  const state = useAuthStore.getState();
  
  console.log('🔄 authStore: Current state on initialization:', {
    isAuthenticated: state.isAuthenticated,
    bypassAuth: state.bypassAuth,
    hadesConnected: state.hadesConnected,
    hasTokenExpiry: !!state.tokenExpiry
  });
  
  // Test HADES connection if not in bypass mode
  if (!state.bypassAuth) {
    console.log('🔄 authStore: Not in bypass mode, testing HADES connection...');
    testHadesConnection();
  } else {
    console.log('🔄 authStore: In bypass mode, skipping HADES connection test');
  }
  
  // Initialize auto-refresh if authenticated
  if (state.isAuthenticated && state.tokenExpiry) {
    const timeUntilExpiry = Math.floor((state.tokenExpiry - Date.now()) / 1000);
    console.log(`🔄 authStore: User authenticated, token expires in ${timeUntilExpiry}s`);
    
    if (timeUntilExpiry > 300) { // More than 5 minutes remaining
      console.log('🔄 authStore: Scheduling auto-refresh for existing session');
      scheduleTokenRefresh(timeUntilExpiry);
    } else {
      console.warn('⚠️ authStore: Token expires soon, not scheduling refresh');
    }
  } else {
    console.log('🔄 authStore: User not authenticated or no token expiry, skipping auto-refresh');
  }
  
  console.log('✅ authStore: Store initialization completed');
};

// Initialize on store creation
console.log('🔄 authStore: Starting store initialization...');
initializeStore();

// UPDATED: Auth selectors for optimized subscriptions
export const authSelectors = {
  user: (state: AuthState) => state.user,
  isAuthenticated: (state: AuthState) => state.isAuthenticated,
  isLoading: (state: AuthState) => state.isLoading,
  error: (state: AuthState) => state.error,
  bypassAuth: (state: AuthState) => state.bypassAuth,
  accessToken: (state: AuthState) => state.accessToken,
  tokenExpiry: (state: AuthState) => state.tokenExpiry,
  hadesConnected: (state: AuthState) => state.hadesConnected, // NEW
};

// Convenience hooks (updated)
export const useAuthUser = () => useAuthStore(authSelectors.user);
export const useIsAuthenticated = () => useAuthStore(authSelectors.isAuthenticated);
export const useAuthLoading = () => useAuthStore(authSelectors.isLoading);
export const useAuthError = () => useAuthStore(authSelectors.error);
export const useBypassAuth = () => useAuthStore(authSelectors.bypassAuth);
export const useAccessToken = () => useAuthStore(authSelectors.accessToken);
export const useHadesConnected = () => useAuthStore(authSelectors.hadesConnected); // NEW

console.log('✅ authStore: Module loaded successfully');