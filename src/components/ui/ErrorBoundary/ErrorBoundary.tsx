// src/components/ui/ErrorBoundary/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';

// Error types for better categorization
export type ErrorType = 
  | 'chunk-load-error'
  | 'import-error'
  | 'network-error'
  | 'permission-error'
  | 'unknown-error';

// Error classification
const classifyError = (error: Error): ErrorType => {
  const message = error.message?.toLowerCase() || '';
  
  if (message.includes('loading chunk') || message.includes('loading css chunk')) {
    return 'chunk-load-error';
  }
  
  if (message.includes('does not provide an export') || message.includes('cannot resolve module')) {
    return 'import-error';
  }
  
  if (message.includes('network') || message.includes('fetch')) {
    return 'network-error';
  }
  
  if (message.includes('permission') || message.includes('unauthorized')) {
    return 'permission-error';
  }
  
  return 'unknown-error';
};

// Error messages and recovery suggestions
const ERROR_MESSAGES = {
  'chunk-load-error': {
    title: 'Update Required',
    message: 'The application has been updated. Please refresh to get the latest version.',
    suggestion: 'Click refresh to reload the application with the latest updates.',
    action: 'Refresh Page'
  },
  'import-error': {
    title: 'Component Loading Error',
    message: 'A component failed to load properly.',
    suggestion: 'This might be a temporary issue. Try refreshing the page.',
    action: 'Refresh Page'
  },
  'network-error': {
    title: 'Network Error',
    message: 'Unable to connect to our servers.',
    suggestion: 'Check your internet connection and try again.',
    action: 'Try Again'
  },
  'permission-error': {
    title: 'Permission Error',
    message: 'You don\'t have permission to access this resource.',
    suggestion: 'Please contact your administrator if you believe this is an error.',
    action: 'Go Back'
  },
  'unknown-error': {
    title: 'Something went wrong',
    message: 'An unexpected error occurred.',
    suggestion: 'Please try refreshing the page or contact support if the problem persists.',
    action: 'Try Again'
  }
};

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<FallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorType: ErrorType;
  retryCount: number;
}

export interface FallbackProps {
  error: Error | null;
  errorType: ErrorType;
  retryCount: number;
  resetErrorBoundary: () => void;
  showErrorDetails?: boolean;
}

class ErrorBoundaryClass extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: 'unknown-error',
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorType = classifyError(error);
    return {
      hasError: true,
      error,
      errorType
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo);

    // Log to error reporting service
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // In a real application, you would send this to your error reporting service
    // like Sentry, LogRocket, Bugsnag, etc.
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorType: this.state.errorType
    };

    // Example: Send to error reporting service
    // errorReportingService.captureException(error, errorReport);
    
    console.group('🚨 Error Report');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Full Report:', errorReport);
    console.groupEnd();
  };

  private resetErrorBoundary = () => {
    const { errorType, retryCount } = this.state;
    
    // For chunk loading errors, refresh the page
    if (errorType === 'chunk-load-error') {
      window.location.reload();
      return;
    }

    // For import errors, also refresh the page
    if (errorType === 'import-error') {
      window.location.reload();
      return;
    }

    // For other errors, reset the error boundary state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: retryCount + 1
    });

    // Auto-retry with exponential backoff for network errors
    if (errorType === 'network-error' && retryCount < 3) {
      const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
      this.retryTimeoutId = setTimeout(() => {
        this.resetErrorBoundary();
      }, delay);
    }
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props;
      
      if (Fallback) {
        return (
          <Fallback
            error={this.state.error}
            errorType={this.state.errorType}
            retryCount={this.state.retryCount}
            resetErrorBoundary={this.resetErrorBoundary}
            showErrorDetails={this.props.showErrorDetails}
          />
        );
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorType={this.state.errorType}
          retryCount={this.state.retryCount}
          resetErrorBoundary={this.resetErrorBoundary}
          showErrorDetails={this.props.showErrorDetails}
        />
      );
    }

    return this.props.children;
  }
}

// Default error fallback component
const DefaultErrorFallback: React.FC<FallbackProps> = ({
  error,
  errorType,
  retryCount,
  resetErrorBoundary,
  showErrorDetails = false
}) => {
  const errorConfig = ERROR_MESSAGES[errorType];
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        {/* Error Icon */}
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
        </div>

        {/* Error Title */}
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {errorConfig.title}
        </h3>

        {/* Error Message */}
        <p className="text-sm text-gray-500 mb-4">
          {errorConfig.message}
        </p>

        {/* Suggestion */}
        <p className="text-xs text-gray-400 mb-6">
          {errorConfig.suggestion}
        </p>

        {/* Retry Count */}
        {retryCount > 0 && (
          <p className="text-xs text-gray-400 mb-4">
            Retry attempt: {retryCount}
          </p>
        )}

        {/* Action Button */}
        <Button
          onClick={resetErrorBoundary}
          className="w-full mb-4"
          startIcon={<ArrowPathIcon className="w-4 h-4" />}
        >
          {errorConfig.action}
        </Button>

        {/* Additional Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/'}
            className="flex-1"
          >
            Go Home
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
            className="flex-1"
          >
            Go Back
          </Button>
        </div>

        {/* Error Details (Development/Debug Mode) */}
        {(isDevelopment || showErrorDetails) && error && (
          <details className="mt-6 text-left">
            <summary className="text-xs text-gray-500 cursor-pointer mb-2">
              Error Details (Debug Info)
            </summary>
            <div className="bg-gray-100 rounded p-3 text-xs text-gray-700 max-h-40 overflow-auto">
              <div className="mb-2">
                <strong>Error Type:</strong> {errorType}
              </div>
              <div className="mb-2">
                <strong>Message:</strong> {error.message}
              </div>
              {error.stack && (
                <div>
                  <strong>Stack:</strong>
                  <pre className="whitespace-pre-wrap mt-1 text-xs">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}

        {/* Support Contact */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            Need help? Contact{' '}
            <a 
              href="mailto:support@kairos.com" 
              className="text-primary-600 hover:text-primary-700"
            >
              support@kairos.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

// HOC for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundaryClass {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundaryClass>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Main export
export const ErrorBoundary = ErrorBoundaryClass;

// Utility hook for manually triggering error boundary
export const useErrorHandler = () => {
  return React.useCallback((error: Error) => {
    // This will be caught by the nearest error boundary
    throw error;
  }, []);
};