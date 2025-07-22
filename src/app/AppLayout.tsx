// File: src/app/AppLayout.tsx
// Enhanced Kairos App Layout - Professional App Shell
// Author: Sankhadeep Banerjee

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/ui/Sidebar';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

/**
 * Enhanced main application layout following enterprise app shell pattern
 * Provides consistent navigation, header, and footer across the app
 * Implements responsive design and professional styling
 */
const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-1 relative">
        {/* Sidebar Navigation - Fixed Left */}
        <motion.div
          className={`
            fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out
            lg:translate-x-0 lg:static lg:inset-0 lg:z-auto
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
          initial={false}
          animate={{ x: sidebarOpen ? 0 : -256 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Sidebar onToggle={() => setSidebarOpen(!sidebarOpen)} />
        </motion.div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
          {/* Fixed Header */}
          <Header 
            onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
            sidebarOpen={sidebarOpen}
          />
          
          {/* Scrollable Page Content */}
          <main className="flex-1 relative overflow-auto">
            <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full">
              {/* Content with proper animations */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <Outlet />
              </motion.div>
            </div>
            
            {/* Spacer for fixed footer */}
            <div className="h-16" />
          </main>
        </div>
      </div>

      {/* Fixed Footer */}
      <Footer />
    </div>
  );
};

export default AppLayout;