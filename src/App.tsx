// File: src/App.tsx
// Kairos Main App Component
// Author: Sankhadeep Banerjee

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import AppProviders from './app/AppProviders';
import AppRouter from './app/AppRouter';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Create Query Client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter
          future={{
            // React Router v7 future flags to prevent warnings
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AppProviders>
            <div className="min-h-screen bg-gray-50">
              {/* App Router handles all routing */}
              <AppRouter />
              
              {/* Global toast notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  className: 'font-medium',
                  success: {
                    iconTheme: {
                      primary: '#22c55e',
                      secondary: '#ffffff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#ffffff',
                    },
                  },
                }}
              />
            </div>
          </AppProviders>
        </BrowserRouter>
        
        {/* React Query DevTools */}
        {import.meta.env.DEV && (
          <ReactQueryDevtools
            initialIsOpen={false}
            position="bottom-right"
          />
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;