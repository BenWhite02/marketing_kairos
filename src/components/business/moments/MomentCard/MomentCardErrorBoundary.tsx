// src/components/business/moments/MomentCard/MomentCardErrorBoundary.tsx

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class MomentCardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console and call optional error handler
    console.error('MomentCard Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error callback
    this.props.onError?.(error, errorInfo);

    // In production, you might want to log this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Error Loading Moment Card
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  Something went wrong while displaying this moment. This could be due to:
                </p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Invalid or corrupted data</li>
                  <li>Missing required properties</li>
                  <li>Network connection issues</li>
                </ul>
              </div>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-3">
                  <summary className="text-xs font-medium text-red-800 cursor-pointer">
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 p-2 bg-red-100 rounded text-xs font-mono text-red-900 overflow-auto">
                    <div className="font-bold">Error:</div>
                    <div className="mb-2">{this.state.error.message}</div>
                    <div className="font-bold">Stack:</div>
                    <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                    {this.state.errorInfo && (
                      <>
                        <div className="font-bold mt-2">Component Stack:</div>
                        <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                      </>
                    )}
                  </div>
                </details>
              )}

              <div className="mt-4 flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={this.handleRetry}
                  startIcon={<ArrowPathIcon className="w-4 h-4" />}
                >
                  Retry
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </Button>
              </div>
            </div>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

// HOC for easy wrapping of MomentCard components
export const withMomentCardErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const WithErrorBoundary = (props: P) => (
    <MomentCardErrorBoundary fallback={fallback}>
      <WrappedComponent {...props} />
    </MomentCardErrorBoundary>
  );

  WithErrorBoundary.displayName = `withMomentCardErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithErrorBoundary;
};