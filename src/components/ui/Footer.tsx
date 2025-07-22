// File: src/components/ui/Footer.tsx
// Footer Component for Kairos - Professional Fixed Bottom Bar
// Author: Sankhadeep Banerjee

import React from 'react';
import { motion } from 'framer-motion';
import { 
  HeartIcon,
  ShieldCheckIcon,
  ClockIcon,
  SignalIcon
} from '@heroicons/react/24/outline';

/**
 * Professional footer component with system status and quick actions
 * Fixed at the bottom of the screen following enterprise patterns
 */
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const systemStatus = 'operational'; // This would come from a health check API
  
  const statusColor = {
    operational: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500'
  };

  const quickActions = [
    { 
      label: 'System Health', 
      icon: ShieldCheckIcon, 
      status: 'operational',
      onClick: () => console.log('System health clicked')
    },
    { 
      label: 'Last Sync', 
      icon: ClockIcon, 
      value: '2 min ago',
      onClick: () => console.log('Last sync clicked')
    },
    { 
      label: 'API Status', 
      icon: SignalIcon, 
      status: 'online',
      onClick: () => console.log('API status clicked')
    }
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section - Branding and status */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <motion.div
                className="flex items-center space-x-1 text-sm text-gray-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span>Made with</span>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                >
                  <HeartIcon className="h-4 w-4 text-red-500" />
                </motion.div>
                <span>by Kairos Team</span>
              </motion.div>
            </div>

            {/* System status indicators */}
            <div className="hidden md:flex items-center space-x-4">
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.label}
                  onClick={action.onClick}
                  className="flex items-center space-x-1.5 px-2 py-1 rounded-md text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <action.icon className={`h-3.5 w-3.5 ${
                    action.status === 'operational' || action.status === 'online' 
                      ? 'text-green-500' 
                      : 'text-gray-400'
                  }`} />
                  <span>{action.label}</span>
                  {action.value && (
                    <span className="text-gray-500">: {action.value}</span>
                  )}
                  {action.status && (
                    <div className={`w-2 h-2 rounded-full ${
                      action.status === 'operational' || action.status === 'online'
                        ? 'bg-green-500' 
                        : 'bg-gray-400'
                    }`} />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Right section - Version and links */}
          <div className="flex items-center space-x-6">
            {/* Version info */}
            <div className="hidden sm:flex items-center space-x-4 text-xs text-gray-500">
              <span>v1.0.0</span>
              <span>•</span>
              <span>© {currentYear} Kairos</span>
            </div>

            {/* Quick links */}
            <div className="flex items-center space-x-3">
              <motion.a
                href="/help"
                className="text-xs text-gray-500 hover:text-primary-600 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                Help
              </motion.a>
              <span className="text-gray-300">|</span>
              <motion.a
                href="/docs"
                className="text-xs text-gray-500 hover:text-primary-600 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                Docs
              </motion.a>
              <span className="text-gray-300">|</span>
              <motion.a
                href="/support"
                className="text-xs text-gray-500 hover:text-primary-600 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                Support
              </motion.a>
            </div>

            {/* Mobile system status */}
            <div className="md:hidden">
              <motion.button
                className={`flex items-center space-x-1 text-xs ${statusColor[systemStatus]}`}
                whileHover={{ scale: 1.05 }}
              >
                <div className={`w-2 h-2 rounded-full ${
                  systemStatus === 'operational' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="capitalize">{systemStatus}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;