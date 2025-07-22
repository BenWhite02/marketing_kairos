// File: C:\Marketing\kairos\src\components\ui\LoadingSpinner.tsx
// Loading Spinner Component for Kairos
// Author: Sankhadeep Banerjee

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fullScreen?: boolean;
  message?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

/**
 * Loading spinner component with different sizes and optional full-screen mode
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  fullScreen = false,
  message,
}) => {
  const spinnerElement = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Animated spinner */}
      <motion.div
        className={`${sizeClasses[size]} border-2 border-gray-300 border-t-primary-500 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      {/* Optional loading message */}
      {message && (
        <motion.p
          className="mt-3 text-sm text-gray-600 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinnerElement}
      </div>
    );
  }

  return spinnerElement;
};

export default LoadingSpinner;