// src/components/auth/ProtectedRoute.tsx
// Protected Route Component with Authentication Checks
// Handles authentication verification and redirects

import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth/authStore';
import type { ProtectedRouteProps } from '@/types/auth';

// Loading skeleton component
const AuthLoadingSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50 animate-pulse">
    {/* Header Skeleton */}
    <div className="h-16 bg-white border-b border-gray-200 mb-6">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 bg-gray-300 rounded-lg"></div>
          <div className="h-6 w-24 bg-gray-300 rounded"></div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
          <div className="h-4 w-20 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>

    {/* Content Skeleton */}
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex">
        {/* Sidebar Skeleton */}
        <div className="w-64 pr-6">
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-5 w-5 bg-gray-300 rounded"></div>
                <div className="h-4 w-20 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback,
  requiredPermissions = [] 
}) => {
  const location = useLocation();
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    bypassAuth,
    refreshAuth 
  } = useAuthStore();

  // Check if user has required permissions
  const hasRequiredPermissions = (permissions: string[]): boolean => {
    if (!user || permissions.length === 0) return true;
    
    // Admin users have all permissions
    if (user.permissions.includes('*')) return true;
    
    // Check if user has all required permissions
    return permissions.every(permission => 
      user.permissions.includes(permission)
    );
  };

  // Attempt to refresh authentication on mount
  useEffect(() => {
    const initializeAuth = async () => {
      // Skip if already authenticated or in bypass mode
      if (isAuthenticated || bypassAuth) return;

      try {
        await refreshAuth();
      } catch (error) {
        // Refresh failed, user will be redirected to login
        console.warn('Auth refresh failed:', error);
      }
    };

    initializeAuth();
  }, [isAuthenticated, bypassAuth, refreshAuth]);

  // Show loading state during authentication check
  if (isLoading) {
    return fallback || <AuthLoadingSkeleton />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Preserve the attempted location for post-login redirect
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname + location.search }}
        replace 
      />
    );
  }

  // Check permissions
  if (!hasRequiredPermissions(requiredPermissions)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full mx-auto text-center"
        >
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this resource. 
              Please contact your administrator if you believe this is an error.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.history.back()}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Render protected content with animation
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

// ✅ ADD BOTH NAMED AND DEFAULT EXPORT
export default ProtectedRoute;
export { ProtectedRoute };