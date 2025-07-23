// File: src/pages/UnauthorizedPage.tsx
// Unauthorized Access Page - Handles 401/403 access denied scenarios
// Provides login options, permission explanations, and contact support

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/useAuth';
import { ROUTES } from '@/constants/routes';

interface AccessAttempt {
  timestamp: string;
  attemptedPath: string;
  userRole?: string;
  requiredPermissions?: string[];
  reason: 'not_authenticated' | 'insufficient_permissions' | 'role_required' | 'feature_disabled';
}

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [accessAttempt, setAccessAttempt] = useState<AccessAttempt | null>(null);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    // Analyze the access attempt
    const attemptDetails: AccessAttempt = {
      timestamp: new Date().toISOString(),
      attemptedPath: location.pathname,
      userRole: user?.role,
      requiredPermissions: location.state?.requiredPermissions,
      reason: determineAccessDenialReason()
    };
    
    setAccessAttempt(attemptDetails);

    // Log the access attempt for security monitoring
    logAccessAttempt(attemptDetails);
  }, [location, user]);

  const determineAccessDenialReason = (): AccessAttempt['reason'] => {
    if (!user) {
      return 'not_authenticated';
    }
    
    if (location.state?.requiredRole && user.role !== location.state.requiredRole) {
      return 'role_required';
    }
    
    if (location.state?.requiredPermissions) {
      return 'insufficient_permissions';
    }
    
    return 'feature_disabled';
  };

  const logAccessAttempt = async (attempt: AccessAttempt) => {
    try {
      // Log to security monitoring service
      console.log('Access attempt logged:', attempt);
      
      // In real implementation, send to security service
      // await securityService.logAccessAttempt(attempt);
    } catch (error) {
      console.error('Failed to log access attempt:', error);
    }
  };

  const getAccessDenialMessage = () => {
    if (!accessAttempt) return { title: 'Access Denied', description: 'You do not have permission to access this resource.' };

    switch (accessAttempt.reason) {
      case 'not_authenticated':
        return {
          title: 'Authentication Required',
          description: 'You need to log in to access this page. Please sign in with your Kairos account.',
          icon: '🔐'
        };
      case 'insufficient_permissions':
        return {
          title: 'Insufficient Permissions',
          description: 'Your account doesn\'t have the required permissions to access this feature.',
          icon: '🚫'
        };
      case 'role_required':
        return {
          title: 'Admin Access Required',
          description: 'This feature is only available to administrators. Contact your admin to request access.',
          icon: '👑'
        };
      case 'feature_disabled':
        return {
          title: 'Feature Unavailable',
          description: 'This feature is currently disabled or not available for your account type.',
          icon: '🚧'
        };
      default:
        return {
          title: 'Access Denied',
          description: 'You do not have permission to access this resource.',
          icon: '⛔'
        };
    }
  };

  const handleLogin = () => {
    // Store the intended destination for post-login redirect
    sessionStorage.setItem('redirectAfterLogin', location.pathname);
    navigate(ROUTES.AUTH.LOGIN);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTES.AUTH.LOGIN);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleRequestAccess = async () => {
    try {
      setRequestSent(true);
      
      // Simulate access request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real implementation, send request to admin/support
      const requestData = {
        userId: user?.id,
        userName: user?.name,
        userEmail: user?.email,
        requestedPath: accessAttempt?.attemptedPath,
        requiredPermissions: accessAttempt?.requiredPermissions,
        timestamp: new Date().toISOString(),
        reason: 'User requested access to restricted feature'
      };
      
      console.log('Access request sent:', requestData);
      // await accessRequestService.submitRequest(requestData);
      
    } catch (error) {
      console.error('Failed to send access request:', error);
      setRequestSent(false);
    }
  };

  const handleGoHome = () => {
    navigate(ROUTES.DASHBOARD.HOME);
  };

  const handleContactSupport = () => {
    const subject = `Access Request - ${accessAttempt?.attemptedPath}`;
    const body = `Hi Support Team,

I am trying to access: ${accessAttempt?.attemptedPath}
My current role: ${user?.role || 'Not logged in'}
Required permissions: ${accessAttempt?.requiredPermissions?.join(', ') || 'Unknown'}
Timestamp: ${accessAttempt?.timestamp}

Please help me gain access to this feature.

Thank you!`;

    const mailtoLink = `mailto:support@kairos.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  const message = getAccessDenialMessage();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        
        {/* Access Denied Icon and Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-600 text-4xl">{message.icon}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {message.title}
          </h1>
          <p className="text-gray-600">
            {message.description}
          </p>
        </div>

        {/* Access Details Card */}
        {accessAttempt && (
          <Card className="mb-6 bg-white border border-orange-200">
            <CardBody className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Access Details</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Attempted Path:</span>
                  <span className="font-mono text-gray-900 text-xs">
                    {accessAttempt.attemptedPath}
                  </span>
                </div>
                
                {user ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Your Role:</span>
                      <span className="text-gray-900">{user.role || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Account:</span>
                      <span className="text-gray-900">{user.email}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-red-600">Not authenticated</span>
                  </div>
                )}
                
                {accessAttempt.requiredPermissions && (
                  <div>
                    <span className="text-gray-600 text-xs">Required Permissions:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {accessAttempt.requiredPermissions.map((permission, index) => (
                        <span 
                          key={index}
                          className="inline-block px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="text-gray-900 text-xs">
                    {new Date(accessAttempt.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {!user ? (
            // Not authenticated - show login button
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleLogin}
            >
              🔐 Sign In to Continue
            </Button>
          ) : (
            // Authenticated but insufficient permissions
            <>
              {accessAttempt?.reason === 'insufficient_permissions' && (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleRequestAccess}
                  disabled={requestSent}
                >
                  {requestSent ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Request Sent
                    </div>
                  ) : (
                    '📝 Request Access'
                  )}
                </Button>
              )}
              
              <Button
                variant="tertiary"
                size="lg"
                className="w-full"
                onClick={handleLogout}
              >
                🔄 Sign in with Different Account
              </Button>
            </>
          )}

          <Button
            variant="tertiary"
            size="lg"
            className="w-full"
            onClick={handleGoHome}
          >
            🏠 Go to Dashboard
          </Button>

          <Button
            variant="tertiary"
            size="lg"
            className="w-full"
            onClick={handleContactSupport}
          >
            📧 Contact Support
          </Button>
        </div>

        {/* Request Status */}
        {requestSent && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-green-600 text-lg mr-2">✅</span>
              <div>
                <h4 className="text-sm font-medium text-green-900">Access Request Submitted</h4>
                <p className="text-sm text-green-700">
                  Your request has been sent to the administrators. You'll receive an email when your access is approved.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Help Information */}
        <div className="mt-8 text-center">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Need help?
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            {!user ? (
              <>
                <li>• Make sure you're using the correct login credentials</li>
                <li>• Check if your account is active</li>
                <li>• Contact IT support if you're having login issues</li>
              </>
            ) : (
              <>
                <li>• Request access from your administrator</li>
                <li>• Check if your role has been updated recently</li>
                <li>• Contact support if you believe this is an error</li>
              </>
            )}
          </ul>
        </div>

        {/* Feature Access Information */}
        {accessAttempt?.reason === 'feature_disabled' && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-blue-600 text-lg mr-2">ℹ️</span>
              <div>
                <h4 className="text-sm font-medium text-blue-900">Feature Information</h4>
                <p className="text-sm text-blue-700">
                  This feature may be part of a premium plan or currently under development. 
                  Contact sales for more information about feature availability.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-8 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <span className="text-yellow-600 text-sm mr-2">🔒</span>
            <div>
              <p className="text-xs text-yellow-800">
                <strong>Security Notice:</strong> This access attempt has been logged for security purposes. 
                Unauthorized access attempts may result in account suspension.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Kairos Marketing Platform • Access denied at {new Date().toLocaleTimeString()}</p>
          {user && (
            <p className="mt-1">Logged in as: {user.email}</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default UnauthorizedPage;