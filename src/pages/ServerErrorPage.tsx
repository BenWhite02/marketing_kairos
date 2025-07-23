// File: src/pages/ServerErrorPage.tsx
// Server Error Page - Handles 500 internal server errors
// Provides error reporting, retry mechanisms, and user guidance

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

interface ErrorDetails {
  timestamp: string;
  errorId: string;
  userAgent: string;
  url: string;
  userId?: string;
}

const ServerErrorPage: React.FC = () => {
  const navigate = useNavigate();
  const [errorDetails, setErrorDetails] = useState<ErrorDetails | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [errorReported, setErrorReported] = useState(false);

  useEffect(() => {
    // Generate error details
    const details: ErrorDetails = {
      timestamp: new Date().toISOString(),
      errorId: `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: localStorage.getItem('userId') || undefined
    };
    setErrorDetails(details);

    // Auto-report error
    reportError(details);
  }, []);

  const reportError = async (details: ErrorDetails) => {
    try {
      // Simulate error reporting to monitoring service
      console.log('Reporting error:', details);
      
      // In real implementation, send to error tracking service
      // await errorTrackingService.report(details);
      
      setErrorReported(true);
    } catch (error) {
      console.error('Failed to report error:', error);
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      // Simulate retry delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Try to reload the previous page or go to dashboard
      const previousPage = sessionStorage.getItem('previousPage') || ROUTES.DASHBOARD.HOME;
      navigate(previousPage);
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleGoHome = () => {
    navigate(ROUTES.DASHBOARD.HOME);
  };

  const handleContactSupport = () => {
    // Open support chat or email
    const subject = `Server Error Report - ${errorDetails?.errorId}`;
    const body = `Error ID: ${errorDetails?.errorId}\nTimestamp: ${errorDetails?.timestamp}\nURL: ${errorDetails?.url}`;
    const mailtoLink = `mailto:support@kairos.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  const copyErrorId = () => {
    if (errorDetails?.errorId) {
      navigator.clipboard.writeText(errorDetails.errorId);
      // Show toast notification in real implementation
      alert('Error ID copied to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        
        {/* Error Icon and Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-600 text-4xl">⚠️</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-600">
            We're experiencing technical difficulties. Our team has been notified and is working on a fix.
          </p>
        </div>

        {/* Error Details Card */}
        {errorDetails && (
          <Card className="mb-6 bg-white border border-red-200">
            <CardBody className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">Error Details</h3>
                {errorReported && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Reported
                  </span>
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Error ID:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-gray-900">{errorDetails.errorId}</span>
                    <button
                      onClick={copyErrorId}
                      className="text-blue-600 hover:text-blue-800 text-xs"
                      title="Copy Error ID"
                    >
                      📋
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="text-gray-900">
                    {new Date(errorDetails.timestamp).toLocaleString()}
                  </span>
                </div>
                {retryCount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Retry attempts:</span>
                    <span className="text-gray-900">{retryCount}</span>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleRetry}
            disabled={isRetrying}
          >
            {isRetrying ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Retrying...
              </div>
            ) : (
              `Try Again ${retryCount > 0 ? `(${retryCount})` : ''}`
            )}
          </Button>

          <Button
            variant="tertiary"
            size="lg"
            className="w-full"
            onClick={handleGoHome}
          >
            Go to Dashboard
          </Button>

          <Button
            variant="tertiary"
            size="lg"
            className="w-full"
            onClick={handleContactSupport}
          >
            Contact Support
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            What can you do?
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Try refreshing the page or clicking "Try Again"</li>
            <li>• Check your internet connection</li>
            <li>• Wait a few minutes and try again</li>
            <li>• Contact support if the problem persists</li>
          </ul>
        </div>

        {/* Status Information */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-blue-600 text-lg mr-2">ℹ️</span>
            <div>
              <h4 className="text-sm font-medium text-blue-900">System Status</h4>
              <p className="text-sm text-blue-700">
                Check our <a href="/status" className="underline hover:no-underline">status page</a> for real-time system health updates.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Kairos Marketing Platform • Error occurred at {new Date().toLocaleTimeString()}</p>
          {errorDetails && (
            <p className="mt-1">Reference: {errorDetails.errorId}</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default ServerErrorPage;