// src/hooks/auth/useAuth.ts
// Enhanced custom authentication hooks with navigation integration + COMPREHENSIVE DEBUG STATEMENTS
// Provides convenient access to auth state and actions

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth/authStore';
import type { User, LoginCredentials } from '@/types/auth';

console.log('🔄 useAuth: Module loading...');

// Main authentication hook with navigation integration + DEBUG
export const useAuth = () => {
  console.log('🔄 useAuth: Hook initialized');
  
  const navigate = useNavigate();
  
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const bypassAuth = useAuthStore((state) => state.bypassAuth);

  const storeLogin = useAuthStore((state) => state.login);
  const storeLogout = useAuthStore((state) => state.logout);
  const refreshAuth = useAuthStore((state) => state.refreshAuth);
  const clearError = useAuthStore((state) => state.clearError);
  const updateUser = useAuthStore((state) => state.updateUser);
  const setBypassAuth = useAuthStore((state) => state.setBypassAuth);

  // Debug auth state
  console.log('🔄 useAuth: Current auth state:', {
    hasUser: !!user,
    isAuthenticated,
    isLoading,
    hasError: !!error,
    errorMessage: error || 'No error',
    bypassAuth,
    userEmail: user?.email || 'No user',
    userRole: user?.role || 'No role'
  });

  // Debug store functions
  console.log('🔄 useAuth: Store functions availability:', {
    hasStoreLogin: typeof storeLogin === 'function',
    hasStoreLogout: typeof storeLogout === 'function',
    hasRefreshAuth: typeof refreshAuth === 'function',
    hasClearError: typeof clearError === 'function',
    hasUpdateUser: typeof updateUser === 'function',
    hasSetBypassAuth: typeof setBypassAuth === 'function',
    hasNavigate: typeof navigate === 'function'
  });

  // Enhanced login with navigation + DEBUG
  const login = useCallback(async (credentials: LoginCredentials) => {
    console.log('🔄 useAuth: ===== LOGIN FUNCTION CALLED =====');
    console.log('🔄 useAuth: Login parameters:', {
      email: credentials.email,
      passwordLength: credentials.password?.length || 0,
      timestamp: new Date().toISOString()
    });

    const loginStartTime = Date.now();

    try {
      console.log('🔄 useAuth: Calling store login function...');
      console.log('🔄 useAuth: Store login function type:', typeof storeLogin);
      
      // Add timeout wrapper for store login
      const storeLoginPromise = storeLogin(credentials);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          console.error('❌ useAuth: Store login timeout after 30 seconds');
          reject(new Error('Store login timeout after 30 seconds'));
        }, 30000);
      });

      console.log('🔄 useAuth: Calling store login with 30s timeout...');
      await Promise.race([storeLoginPromise, timeoutPromise]);
      
      const loginDuration = Date.now() - loginStartTime;
      console.log(`✅ useAuth: Store login completed in ${loginDuration}ms`);

      console.log('🔄 useAuth: Navigating to dashboard...');
      console.log('🔄 useAuth: Navigate function type:', typeof navigate);
      
      const navStartTime = Date.now();
      navigate('/dashboard', { replace: true });
      const navDuration = Date.now() - navStartTime;
      
      console.log(`✅ useAuth: Navigation initiated in ${navDuration}ms`);
      
      const totalDuration = Date.now() - loginStartTime;
      console.log(`✅ useAuth: Complete login process finished in ${totalDuration}ms`);
      console.log('✅ useAuth: ===== LOGIN FUNCTION COMPLETED =====');
      
    } catch (error) {
      const totalDuration = Date.now() - loginStartTime;
      console.error(`❌ useAuth: Login failed after ${totalDuration}ms`);
      console.error('❌ useAuth: Login error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined
      });
      console.error('❌ useAuth: ===== LOGIN FUNCTION FAILED =====');
      throw error;
    }
  }, [storeLogin, navigate]);

  // Enhanced logout with navigation and confirmation + DEBUG
  const logout = useCallback(async () => {
    console.log('🔄 useAuth: ===== LOGOUT FUNCTION CALLED =====');
    const logoutStartTime = Date.now();

    try {
      console.log('🔄 useAuth: Calling store logout function...');
      console.log('🔄 useAuth: Store logout function type:', typeof storeLogout);
      
      const storeLogoutStartTime = Date.now();
      await storeLogout();
      const storeLogoutDuration = Date.now() - storeLogoutStartTime;
      
      console.log(`✅ useAuth: Store logout completed in ${storeLogoutDuration}ms`);

      console.log('🔄 useAuth: Navigating to login page...');
      const navStartTime = Date.now();
      navigate('/login', { replace: true });
      const navDuration = Date.now() - navStartTime;
      
      console.log(`✅ useAuth: Navigation to login initiated in ${navDuration}ms`);
      
      const totalDuration = Date.now() - logoutStartTime;
      console.log(`✅ useAuth: Complete logout process finished in ${totalDuration}ms`);
      console.log('✅ useAuth: ===== LOGOUT FUNCTION COMPLETED =====');
      
    } catch (error) {
      const totalDuration = Date.now() - logoutStartTime;
      console.error(`❌ useAuth: Logout failed after ${totalDuration}ms`);
      console.error('❌ useAuth: Logout error details:', error);
      
      // Force navigation even if logout API fails
      console.log('🔄 useAuth: Force navigating to login due to logout error...');
      navigate('/login', { replace: true });
      
      console.error('❌ useAuth: ===== LOGOUT FUNCTION FAILED =====');
    }
  }, [storeLogout, navigate]);

  // Safe logout without navigation (for use in components that handle navigation themselves) + DEBUG
  const logoutWithoutNavigation = useCallback(async () => {
    console.log('🔄 useAuth: ===== LOGOUT WITHOUT NAVIGATION CALLED =====');
    const logoutStartTime = Date.now();

    try {
      console.log('🔄 useAuth: Calling store logout (no navigation)...');
      await storeLogout();
      
      const totalDuration = Date.now() - logoutStartTime;
      console.log(`✅ useAuth: Logout without navigation completed in ${totalDuration}ms`);
      console.log('✅ useAuth: ===== LOGOUT WITHOUT NAVIGATION COMPLETED =====');
      
    } catch (error) {
      const totalDuration = Date.now() - logoutStartTime;
      console.error(`❌ useAuth: Logout without navigation failed after ${totalDuration}ms:`, error);
      console.error('❌ useAuth: ===== LOGOUT WITHOUT NAVIGATION FAILED =====');
      throw error;
    }
  }, [storeLogout]);

  // Check if user has specific permission + DEBUG
  const hasPermission = useCallback((permission: string): boolean => {
    console.log('🔄 useAuth: Checking permission:', {
      permission,
      hasUser: !!user,
      userPermissions: user?.permissions || [],
      isAdmin: user?.permissions?.includes('*')
    });

    if (!user) {
      console.log('❌ useAuth: No user, permission denied');
      return false;
    }
    
    if (user.permissions.includes('*')) {
      console.log('✅ useAuth: Admin access, permission granted');
      return true; // Admin access
    }
    
    const hasPermissionResult = user.permissions.includes(permission);
    console.log(`${hasPermissionResult ? '✅' : '❌'} useAuth: Permission ${permission} ${hasPermissionResult ? 'granted' : 'denied'}`);
    
    return hasPermissionResult;
  }, [user]);

  // Check if user has any of the specified roles + DEBUG
  const hasRole = useCallback((roles: string | string[]): boolean => {
    const roleArray = Array.isArray(roles) ? roles : [roles];
    
    console.log('🔄 useAuth: Checking roles:', {
      requiredRoles: roleArray,
      hasUser: !!user,
      userRole: user?.role || 'No role'
    });

    if (!user) {
      console.log('❌ useAuth: No user, role check failed');
      return false;
    }
    
    const hasRoleResult = roleArray.includes(user.role);
    console.log(`${hasRoleResult ? '✅' : '❌'} useAuth: Role check ${hasRoleResult ? 'passed' : 'failed'}`);
    
    return hasRoleResult;
  }, [user]);

  // Check if user has all specified permissions + DEBUG
  const hasAllPermissions = useCallback((permissions: string[]): boolean => {
    console.log('🔄 useAuth: Checking all permissions:', {
      requiredPermissions: permissions,
      hasUser: !!user,
      userPermissions: user?.permissions || []
    });

    if (!user) {
      console.log('❌ useAuth: No user, all permissions check failed');
      return false;
    }
    
    if (user.permissions.includes('*')) {
      console.log('✅ useAuth: Admin access, all permissions granted');
      return true; // Admin access
    }
    
    const hasAllResult = permissions.every(permission => user.permissions.includes(permission));
    console.log(`${hasAllResult ? '✅' : '❌'} useAuth: All permissions check ${hasAllResult ? 'passed' : 'failed'}`);
    
    return hasAllResult;
  }, [user]);

  // Check if user has any of the specified permissions + DEBUG
  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    console.log('🔄 useAuth: Checking any permissions:', {
      requiredPermissions: permissions,
      hasUser: !!user,
      userPermissions: user?.permissions || []
    });

    if (!user) {
      console.log('❌ useAuth: No user, any permissions check failed');
      return false;
    }
    
    if (user.permissions.includes('*')) {
      console.log('✅ useAuth: Admin access, any permissions granted');
      return true; // Admin access
    }
    
    const hasAnyResult = permissions.some(permission => user.permissions.includes(permission));
    console.log(`${hasAnyResult ? '✅' : '❌'} useAuth: Any permissions check ${hasAnyResult ? 'passed' : 'failed'}`);
    
    return hasAnyResult;
  }, [user]);

  // Check if user is admin + DEBUG
  const isAdmin = useCallback((): boolean => {
    console.log('🔄 useAuth: Checking admin status:', {
      hasUser: !!user,
      userRole: user?.role,
      hasAdminPermission: user?.permissions?.includes('*')
    });

    if (!user) {
      console.log('❌ useAuth: No user, not admin');
      return false;
    }
    
    const isAdminResult = user.role === 'admin' || user.permissions.includes('*');
    console.log(`${isAdminResult ? '✅' : '❌'} useAuth: Admin check ${isAdminResult ? 'passed' : 'failed'}`);
    
    return isAdminResult;
  }, [user]);

  // Get user display name + DEBUG
  const getDisplayName = useCallback((): string => {
    const displayName = user ? `${user.firstName} ${user.lastName}`.trim() || user.email : 'User';
    
    console.log('🔄 useAuth: Getting display name:', {
      hasUser: !!user,
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
      displayName
    });
    
    return displayName;
  }, [user]);

  // Get user initials + DEBUG
  const getUserInitials = useCallback((): string => {
    let initials: string;
    
    if (!user) {
      initials = 'U';
    } else {
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || user.email.charAt(0).toUpperCase();
    }
    
    console.log('🔄 useAuth: Getting user initials:', {
      hasUser: !!user,
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
      initials
    });
    
    return initials;
  }, [user]);

  // Debug return object
  const returnValue = {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    bypassAuth,

    // Actions
    login,
    logout,
    logoutWithoutNavigation,
    refreshAuth,
    clearError,
    updateUser,
    setBypassAuth,

    // Utility functions
    hasPermission,
    hasRole,
    hasAllPermissions,
    hasAnyPermission,
    isAdmin,
    getDisplayName,
    getUserInitials,
  };

  console.log('🔄 useAuth: Hook returning object:', {
    hasUser: !!returnValue.user,
    isAuthenticated: returnValue.isAuthenticated,
    isLoading: returnValue.isLoading,
    hasError: !!returnValue.error,
    bypassAuth: returnValue.bypassAuth,
    hasLogin: typeof returnValue.login === 'function',
    hasLogout: typeof returnValue.logout === 'function',
    hasUtilities: typeof returnValue.hasPermission === 'function'
  });

  return returnValue;
};

// Specific hooks for common use cases + DEBUG
export const useUser = () => {
  console.log('🔄 useUser: Hook called');
  const user = useAuthStore((state) => state.user);
  console.log('🔄 useUser: Returning user:', { hasUser: !!user, email: user?.email });
  return user;
};

export const useIsAuthenticated = () => {
  console.log('🔄 useIsAuthenticated: Hook called');
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  console.log('🔄 useIsAuthenticated: Returning:', isAuthenticated);
  return isAuthenticated;
};

export const useAuthLoading = () => {
  console.log('🔄 useAuthLoading: Hook called');
  const isLoading = useAuthStore((state) => state.isLoading);
  console.log('🔄 useAuthLoading: Returning:', isLoading);
  return isLoading;
};

export const useAuthError = () => {
  console.log('🔄 useAuthError: Hook called');
  const error = useAuthStore((state) => state.error);
  console.log('🔄 useAuthError: Returning:', { hasError: !!error, error });
  return error;
};

export const useBypassAuth = () => {
  console.log('🔄 useBypassAuth: Hook called');
  const bypassAuth = useAuthStore((state) => state.bypassAuth);
  console.log('🔄 useBypassAuth: Returning:', bypassAuth);
  return bypassAuth;
};

// Hook for checking permissions with memoization + DEBUG
export const usePermissions = () => {
  console.log('🔄 usePermissions: Hook called');
  const user = useAuthStore((state) => state.user);
  
  return useCallback((permission: string | string[]) => {
    console.log('🔄 usePermissions: Permission check callback called:', {
      permission,
      hasUser: !!user,
      userPermissions: user?.permissions || []
    });

    if (!user) {
      console.log('❌ usePermissions: No user');
      return false;
    }
    
    if (user.permissions.includes('*')) {
      console.log('✅ usePermissions: Admin access');
      return true;
    }
    
    if (Array.isArray(permission)) {
      const hasAllPermissions = permission.every(p => user.permissions.includes(p));
      console.log(`${hasAllPermissions ? '✅' : '❌'} usePermissions: Array permission check ${hasAllPermissions ? 'passed' : 'failed'}`);
      return hasAllPermissions;
    }
    
    const hasPermission = user.permissions.includes(permission);
    console.log(`${hasPermission ? '✅' : '❌'} usePermissions: Single permission check ${hasPermission ? 'passed' : 'failed'}`);
    return hasPermission;
  }, [user]);
};

// Hook for checking roles with memoization + DEBUG
export const useRole = () => {
  console.log('🔄 useRole: Hook called');
  const user = useAuthStore((state) => state.user);
  
  return useCallback((role: string | string[]) => {
    console.log('🔄 useRole: Role check callback called:', {
      role,
      hasUser: !!user,
      userRole: user?.role
    });

    if (!user) {
      console.log('❌ useRole: No user');
      return false;
    }
    
    if (Array.isArray(role)) {
      const hasRole = role.includes(user.role);
      console.log(`${hasRole ? '✅' : '❌'} useRole: Array role check ${hasRole ? 'passed' : 'failed'}`);
      return hasRole;
    }
    
    const hasRole = user.role === role;
    console.log(`${hasRole ? '✅' : '❌'} useRole: Single role check ${hasRole ? 'passed' : 'failed'}`);
    return hasRole;
  }, [user]);
};

// Hook for user display information + DEBUG
export const useUserDisplay = () => {
  console.log('🔄 useUserDisplay: Hook called');
  const user = useAuthStore((state) => state.user);
  
  const displayInfo = {
    displayName: user ? `${user.firstName} ${user.lastName}`.trim() || user.email : 'User',
    initials: user ? 
      `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase() || user.email.charAt(0).toUpperCase() 
      : 'U',
    email: user?.email || '',
    role: user?.role || 'user',
    avatar: user?.avatar,
  };

  console.log('🔄 useUserDisplay: Returning display info:', displayInfo);
  return displayInfo;
};

// Hook for logout with custom navigation + DEBUG
export const useLogout = () => {
  console.log('🔄 useLogout: Hook called');
  const navigate = useNavigate();
  const storeLogout = useAuthStore((state) => state.logout);
  
  return useCallback(async (redirectTo = '/login') => {
    console.log('🔄 useLogout: Logout callback called:', { redirectTo });
    const logoutStartTime = Date.now();

    try {
      console.log('🔄 useLogout: Calling store logout...');
      await storeLogout();
      
      console.log(`🔄 useLogout: Navigating to ${redirectTo}...`);
      navigate(redirectTo, { replace: true });
      
      const totalDuration = Date.now() - logoutStartTime;
      console.log(`✅ useLogout: Logout callback completed in ${totalDuration}ms`);
      
    } catch (error) {
      const totalDuration = Date.now() - logoutStartTime;
      console.error(`❌ useLogout: Logout callback failed after ${totalDuration}ms:`, error);
      
      // Force navigation even if logout fails
      console.log(`🔄 useLogout: Force navigating to ${redirectTo} due to error...`);
      navigate(redirectTo, { replace: true });
    }
  }, [storeLogout, navigate]);
};

console.log('✅ useAuth: Module loaded successfully');