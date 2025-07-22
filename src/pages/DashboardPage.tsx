// File: src/pages/DashboardPage.tsx
// Enhanced Dashboard Page Component for Kairos - Professional Enterprise Style
// Author: Sankhadeep Banerjee

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BeakerIcon,
  ClockIcon,
  MegaphoneIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  PlayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface StatCard {
  label: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
}

interface RecentActivity {
  id: string;
  type: 'atom' | 'moment' | 'campaign';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

/**
 * Enhanced dashboard page with professional enterprise styling
 * Following Kairos design system with proper cards, spacing, and animations
 */
const DashboardPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  const stats: StatCard[] = [
    {
      label: 'Active Atoms',
      value: '156',
      change: '+12%',
      changeType: 'increase',
      icon: BeakerIcon,
      description: 'Eligibility rules currently active'
    },
    {
      label: 'Perfect Moments',
      value: '89',
      change: '+8%',
      changeType: 'increase',
      icon: ClockIcon,
      description: 'Optimized delivery opportunities'
    },
    {
      label: 'Running Campaigns',
      value: '23',
      change: '+5%',
      changeType: 'increase',
      icon: MegaphoneIcon,
      description: 'Active marketing campaigns'
    },
    {
      label: 'Success Rate',
      value: '94.2%',
      change: '+2.1%',
      changeType: 'increase',
      icon: ChartBarIcon,
      description: 'Campaign performance accuracy'
    },
  ];

  const recentActivity: RecentActivity[] = [
    {
      id: '1',
      type: 'atom',
      title: 'High Value Customer',
      description: 'New eligibility atom created with demographic filters',
      timestamp: '2 minutes ago',
      status: 'success'
    },
    {
      id: '2',
      type: 'campaign',
      title: 'Summer Promotion',
      description: 'Campaign completed with 96.3% success rate',
      timestamp: '1 hour ago',
      status: 'success'
    },
    {
      id: '3',
      type: 'moment',
      title: 'Weekend Shopping',
      description: 'Moment performance exceeded target by 15%',
      timestamp: '3 hours ago',
      status: 'info'
    },
    {
      id: '4',
      type: 'atom',
      title: 'Geographic Filter',
      description: 'Atom requires attention - low match rate',
      timestamp: '5 hours ago',
      status: 'warning'
    },
  ];

  const getChangeIcon = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase':
        return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
      case 'decrease':
        return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'atom':
        return <BeakerIcon className="h-5 w-5" />;
      case 'moment':
        return <ClockIcon className="h-5 w-5" />;
      case 'campaign':
        return <MegaphoneIcon className="h-5 w-5" />;
      default:
        return <ChartBarIcon className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: RecentActivity['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Welcome to Kairos - The Perfect Moment Delivery Interface
            </p>
          </div>
          
          {/* Period selector */}
          <div className="mt-4 sm:mt-0">
            <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
              {['1d', '7d', '30d', '90d'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    selectedPeriod === period
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="group"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group-hover:border-primary-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="p-2 bg-primary-50 rounded-lg group-hover:bg-primary-100 transition-colors">
                      <stat.icon className="h-6 w-6 text-primary-600" />
                    </div>
                  </div>
                  
                  <h3 className="text-sm font-medium text-gray-500 mb-1">{stat.label}</h3>
                  
                  <div className="flex items-baseline space-x-2 mb-1">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                      stat.changeType === 'increase' 
                        ? 'bg-green-50 text-green-700' 
                        : stat.changeType === 'decrease'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-gray-50 text-gray-700'
                    }`}>
                      {getChangeIcon(stat.changeType)}
                      <span>{stat.change}</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  View all
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`flex items-start space-x-4 p-4 rounded-lg border ${getStatusColor(activity.status)}`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-2">{activity.timestamp}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions & Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-6"
        >
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6 space-y-3">
              {[
                { label: 'Create New Atom', icon: BeakerIcon, color: 'primary' },
                { label: 'Launch Campaign', icon: PlayIcon, color: 'green' },
                { label: 'View Analytics', icon: EyeIcon, color: 'blue' },
              ].map((action, index) => (
                <motion.button
                  key={action.label}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg border-2 border-dashed transition-all ${
                    action.color === 'primary' 
                      ? 'border-primary-200 hover:border-primary-300 hover:bg-primary-50'
                      : action.color === 'green'
                      ? 'border-green-200 hover:border-green-300 hover:bg-green-50'
                      : 'border-blue-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <action.icon className={`h-5 w-5 ${
                    action.color === 'primary' 
                      ? 'text-primary-600'
                      : action.color === 'green'
                      ? 'text-green-600'
                      : 'text-blue-600'
                  }`} />
                  <span className="text-sm font-medium text-gray-700">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Decision Engine', status: 'operational', uptime: '99.9%' },
                { label: 'Data Pipeline', status: 'operational', uptime: '99.7%' },
                { label: 'API Gateway', status: 'operational', uptime: '99.8%' },
              ].map((system, index) => (
                <div key={system.label} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">{system.label}</span>
                  </div>
                  <span className="text-xs text-gray-500">{system.uptime}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Implementation Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-200 p-8"
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <CheckCircleIcon className="h-8 w-8 text-primary-600" />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Foundation Complete
          </h2>
          
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            The core infrastructure is ready. Advanced dashboard features including real-time analytics, 
            performance metrics, and campaign insights will be available as we progress through the 
            implementation blocks.
          </p>
          
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-700">Block A: Foundation Complete</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-700">Block B: In Progress</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;