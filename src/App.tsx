// File: C:\Marketing\kairos\src\App.tsx
// UPDATED: Fixed Kairos Application Root Component with HADES Integration
// File path: src/App.tsx

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from 'react-error-boundary';
import { AppRouter } from './app/AppRouter';
import './App.css';

// Create QueryClient with optimized defaults for HADES integration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        // Don't retry connection refused errors (HADES down)
        if (error && typeof error === 'object' && 'message' in error) {
          const message = (error as any).message?.toLowerCase() || '';
          if (message.includes('connection refused') || message.includes('network')) {
            return failureCount < 1; // Only try once for network errors
          }
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection time)
      networkMode: 'online', // Only run queries when online
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry mutations on client errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 1; // Only retry mutations once
      },
      networkMode: 'online',
    },
  },
});

// Enhanced Error Boundary Fallback Component
function ErrorFallback({ error, resetErrorBoundary }: any) {
  const isHadesError = error?.message?.includes('HADES') || 
                       error?.message?.includes('localhost:8080') ||
                       error?.message?.includes('connection refused');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h2 className="text-lg font-semibold text-gray-900 text-center mb-2">
          {isHadesError ? 'Backend Connection Error' : 'Something went wrong'}
        </h2>
        
        <p className="text-gray-600 text-center mb-4 text-sm">
          {isHadesError 
            ? 'Unable to connect to HADES backend. Please ensure the backend server is running on localhost:8080.'
            : (error?.message || 'An unexpected error occurred')
          }
        </p>
        
        {isHadesError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  <strong>Quick Fix:</strong> Start HADES backend server and refresh this page.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <button
            onClick={resetErrorBoundary}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            Try again
          </button>
          
          {isHadesError && (
            <button
              onClick={() => window.location.href = '/login?bypass=true'}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
            >
              Continue with Mock Data
            </button>
          )}
        </div>
        
        {/* Debug info in development */}
        {import.meta.env.DEV && (
          <details className="mt-4">
            <summary className="text-xs text-gray-500 cursor-pointer">Debug Info</summary>
            <pre className="mt-2 text-xs text-gray-400 bg-gray-50 p-2 rounded overflow-auto max-h-32">
              {error?.stack || error?.message || 'No error details available'}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

// Enhanced Loading Fallback Component
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {/* Kairos Logo */}
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-white text-2xl font-bold">K</span>
        </div>
        
        {/* Loading Spinner */}
        <div className="loading-spinner mx-auto mb-4"></div>
        
        {/* Loading Text */}
        <p className="text-gray-600 text-sm font-medium">Loading Kairos...</p>
        
        {/* Connection Status */}
        <p className="text-xs text-gray-400 mt-2">
          Connecting to HADES backend...
        </p>
      </div>
    </div>
  );
}

// Connection Test Component
function ConnectionTestWarning() {
  const [connectionStatus, setConnectionStatus] = React.useState<'testing' | 'success' | 'failed'>('testing');

  React.useEffect(() => {
    // Test HADES connection on app startup
    const testConnection = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/v1/monitoring/health', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (response.ok) {
          setConnectionStatus('success');
        } else {
          setConnectionStatus('failed');
        }
      } catch (error) {
        console.warn('HADES connection test failed:', error);
        setConnectionStatus('failed');
      }
    };

    testConnection();
  }, []);

  if (connectionStatus === 'testing') {
    return <LoadingFallback />;
  }

  if (connectionStatus === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full mb-4">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h2 className="text-lg font-semibold text-gray-900 text-center mb-2">
            HADES Backend Unavailable
          </h2>
          
          <p className="text-gray-600 text-center mb-4 text-sm">
            Cannot connect to HADES backend server at localhost:8080. 
            You can continue with mock data or start the backend server.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => setConnectionStatus('success')}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
            >
              Continue with Mock Data
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              Retry Connection
            </button>
          </div>
          
          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>To start HADES backend:</p>
            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
              cd C:\Marketing\Hades && ./gradlew bootRun
            </code>
          </div>
        </div>
      </div>
    );
  }

  return null; // Connection successful, continue with app
}

// Main App Component with Enhanced Error Handling
function App() {
  const [showConnectionTest, setShowConnectionTest] = React.useState(true);

  // Skip connection test in development if bypass is enabled
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const bypassConnection = urlParams.get('bypass') === 'true' || 
                             import.meta.env.VITE_AUTH_BYPASS_ENABLED === 'true';
    
    if (bypassConnection) {
      setShowConnectionTest(false);
    }
  }, []);

  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        // Log errors in development
        if (import.meta.env.DEV) {
          console.error('App Error:', error, errorInfo);
        }
        
        // In production, you might want to send errors to a service like Sentry
        // Sentry.captureException(error, { extra: errorInfo });
      }}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <div className="App min-h-screen bg-gray-50">
            {/* Connection Test (only in production or when not bypassed) */}
            {showConnectionTest && !import.meta.env.DEV && (
              <ConnectionTestWarning />
            )}
            
            {/* Main App Content */}
            {(!showConnectionTest || import.meta.env.DEV) && (
              <React.Suspense fallback={<LoadingFallback />}>
                <AppRouter />
              </React.Suspense>
            )}
            
            {/* Toast Notifications with Enhanced Styling */}
            <Toaster
              position="top-right"
              gutter={8}
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  borderRadius: '0.75rem',
                  padding: '1rem 1.25rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  maxWidth: '420px',
                },
                success: {
                  style: {
                    background: '#10b981',
                  },
                  iconTheme: {
                    primary: '#fff',
                    secondary: '#10b981',
                  },
                },
                error: {
                  style: {
                    background: '#ef4444',
                  },
                  iconTheme: {
                    primary: '#fff',
                    secondary: '#ef4444',
                  },
                },
                loading: {
                  style: {
                    background: '#3b82f6',
                  },
                },
              }}
            />
            
            {/* React Query DevTools (only in development) */}
            {import.meta.env.DEV && (
              <ReactQueryDevtools 
                initialIsOpen={false} 
                position="bottom-right"
                toggleButtonProps={{
                  style: {
                    background: '#1f2937',
                    color: '#f9fafb',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }
                }}
              />
            )}
            
            {/* Development Info Panel */}
            {import.meta.env.DEV && (
              <div className="fixed bottom-4 left-4 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg opacity-75 hover:opacity-100 transition-opacity">
                <div>🔧 Dev Mode</div>
                <div>HADES: localhost:8080</div>
                <div>Kairos: {window.location.host}</div>
              </div>
            )}
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;