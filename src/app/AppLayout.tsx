// File: src/app/AppLayout.tsx
// UPDATED: Fixed layout rendering for dashboard pages

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '@/components/ui/Header';
import { Sidebar } from '@/components/ui/Sidebar';
import { Footer } from '@/components/ui/Footer';
import { useAuth } from '@/hooks/auth/useAuth';

export const AppLayout: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  
  console.log('🏗️ AppLayout: Rendering layout for:', {
    path: location.pathname,
    authenticated: isAuthenticated,
    user: user?.email
  });

  // If not authenticated, don't render the layout
  if (!isAuthenticated) {
    console.log('🏗️ AppLayout: User not authenticated, rendering outlet only');
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Layout Container */}
      <div className="flex h-screen overflow-hidden">
        
        {/* Sidebar */}
        <aside className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-64">
            <Sidebar />
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Header */}
          <header className="flex-shrink-0 border-b border-gray-200 bg-white">
            <Header />
          </header>

          {/* Page Content */}
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-0">
              {/* Debug Info */}
              {process.env.NODE_ENV === 'development' && (
                <div className="hidden">
                  🏗️ AppLayout Debug: Rendering {location.pathname} for {user?.email}
                </div>
              )}
              
              {/* Page Content via Outlet */}
              <Outlet />
            </div>
          </main>

          {/* Footer */}
          <footer className="flex-shrink-0 border-t border-gray-200 bg-white">
            <Footer />
          </footer>
        </div>
      </div>
    </div>
  );
};