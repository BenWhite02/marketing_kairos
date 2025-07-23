// src/components/auth/AuthLayout.tsx
// Cinematic Authentication Layout with True Detective Aesthetics

import React from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title = "Authentication",
  subtitle = "Secure access to your marketing command center"
}) => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Global Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 -z-10" />
      
      {/* Subtle Animated Background Elements */}
      <div className="fixed inset-0 -z-10">
        {/* Floating geometric shapes */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute opacity-5"
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + i * 10}%`,
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <div className="w-32 h-32 border border-blue-200/30 rounded-full" />
          </motion.div>
        ))}
        
        {/* Gradient orbs */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <motion.div
          className="absolute bottom-1/3 left-1/5 w-80 h-80 bg-gradient-to-tr from-indigo-200/15 to-purple-200/15 rounded-full blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Main Content */}
      <motion.main
        className="relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {children}
      </motion.main>

      {/* Bottom Accent Bar */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 z-20"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 2, delay: 1.5 }}
      />

      {/* Corner Branding Elements */}
      <motion.div
        className="fixed top-6 left-6 opacity-10 z-10"
        initial={{ opacity: 0, rotate: -10 }}
        animate={{ opacity: 0.1, rotate: 0 }}
        transition={{ duration: 1, delay: 2 }}
      >
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-blue-600">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
      </motion.div>

      <motion.div
        className="fixed bottom-6 right-6 opacity-10 z-10"
        initial={{ opacity: 0, rotate: 10 }}
        animate={{ opacity: 0.1, rotate: 0 }}
        transition={{ duration: 1, delay: 2.2 }}
      >
        <div className="text-xs text-gray-400 text-right leading-tight">
          <div className="font-medium">KAIROS</div>
          <div className="font-light">MARKETING PLATFORM</div>
        </div>
      </motion.div>

      {/* Cinematic Vignette Effect */}
      <div className="fixed inset-0 pointer-events-none z-10">
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/5" />
      </div>

      {/* Performance Optimization - Preload Critical Resources */}
      <div className="hidden">
        <link rel="preload" as="image" href="/api/placeholder/400/600" />
      </div>
    </div>
  );
};

export default AuthLayout;