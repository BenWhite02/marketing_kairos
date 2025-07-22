// File: C:\Marketing\kairos\src\app\AppRouter.tsx
// Kairos App Router - Main routing configuration
// Author: Sankhadeep Banerjee

import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AppLayout from './AppLayout';

// Lazy load page components for better performance
const DashboardPage = React.lazy(() => import('@/pages/DashboardPage'));
const AtomsPage = React.lazy(() => import('@/pages/atoms/AtomsPage'));
const MomentsPage = React.lazy(() => import('@/pages/moments/MomentsPage'));
const CampaignsPage = React.lazy(() => import('@/pages/campaigns/CampaignsPage'));
const AnalyticsPage = React.lazy(() => import('@/pages/analytics/AnalyticsPage'));
const LoginPage = React.lazy(() => import('@/pages/auth/LoginPage'));
const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage'));

/**
 * Main router component that handles all application routing
 * Uses lazy loading for better performance and code splitting
 */
const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected routes with layout */}
        <Route path="/" element={<AppLayout />}>
          {/* Redirect root to dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* Main application routes */}
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="atoms/*" element={<AtomsPage />} />
          <Route path="moments/*" element={<MomentsPage />} />
          <Route path="campaigns/*" element={<CampaignsPage />} />
          <Route path="analytics/*" element={<AnalyticsPage />} />
        </Route>
        
        {/* 404 catch-all route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;