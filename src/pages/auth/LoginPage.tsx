// File: C:\Marketing\kairos\src\pages\auth\LoginPage.tsx
// Login Page Component for Kairos

import React from 'react';
import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div>
          <div className="mx-auto h-12 w-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">K</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Sign in to Kairos
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Perfect Moment Delivery Interface
          </p>
        </div>
        
        <div className="card p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Authentication - Block B Implementation
            </h3>
            <p className="text-gray-600 mb-6">
              Complete authentication system will be implemented in Block B (Week 3)
              with JWT token management and secure login flow.
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-700 rounded-lg">
              <span className="text-sm font-medium">Coming in Block B</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;