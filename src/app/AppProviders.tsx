// src/app/AppProviders.tsx
// Simplified AppProviders - Router and QueryClient handled in App.tsx

import React, { Suspense } from 'react';

// Store providers only (no Router/QueryClient)
import { AuthProvider } from '@/stores/auth';
import { ThemeProvider } from '@/stores/ui/themeStore';
import { ModalProvider } from '@/components/ui/Modal';

// Loading fallback with skeleton
const LoadingFallback = () => (
  <div className="min-h-screen bg-gray-50 animate-pulse">
    <div className="h-16 bg-white border-b border-gray-200 mb-6">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center">
        <div className="h-8 w-32 bg-gray-300 rounded"></div>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4">
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
);

const AppProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ModalProvider>
          <Suspense fallback={<LoadingFallback />}>
            {children}
          </Suspense>
        </ModalProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default AppProviders;
export { AppProviders };