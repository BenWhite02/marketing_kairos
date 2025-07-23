// File: src/pages/dashboard/OverviewPage.tsx
// PRODUCTION VERSION: Enhanced Dashboard with Integrated Layout Components
// Following Kairos React Development Guidelines for CSS conflict resistance

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  BeakerIcon, 
  CogIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Import existing layout components based on project structure
import Header from '@/components/ui/Header';
import { Sidebar } from '@/components/ui/Sidebar';
import Footer from '@/components/ui/Footer';
import { Badge } from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Import hooks according to project structure
import { useAuth } from '@/hooks/auth/useAuth';
import { useTheme } from '@/hooks/useTheme';

// Import utilities
import { cn } from '@/utils/dom/classNames';

interface DashboardMetric {
  id: string;
  label: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
  target?: number;
  status: 'healthy' | 'warning' | 'critical';
}

interface QuickAction {
  id: string;
  label: string;
  description: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  isNew?: boolean;
  isBeta?: boolean;
  category: 'primary' | 'secondary';
}

interface RecentActivity {
  id: string;
  type: 'atom' | 'moment' | 'campaign' | 'test';
  title: string;
  description: string;
  timestamp: string;
  status: 'active' | 'draft' | 'completed' | 'failed';
  user: string;
  avatar?: string;
}

interface AlertItem {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  dismissible: boolean;
}

// CSS Reset to prevent conflicts (following Kairos guidelines)
const CSS_RESET = `
  body, html, #root {
    margin: 0 !important;
    padding: 0 !important;
    overflow: visible !important;
    position: static !important;
    z-index: auto !important;
    transform: none !important;
    opacity: 1 !important;
    visibility: visible !important;
    display: block !important;
    width: 100% !important;
    min-height: 100vh !important;
    background: #ffffff !important;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  }
  
  * {
    box-sizing: border-box !important;
  }
`;

export default function OverviewPage() {
  const { user } = useAuth();
  const { effectiveTheme } = useTheme();
  const navigate = useNavigate();
  
  // Layout state for responsive sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Dashboard data state
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);

  console.log('🎯 PRODUCTION: OverviewPage started with layout integration');

  // Apply CSS reset following Kairos guidelines
  useEffect(() => {
    console.log('🎯 PRODUCTION: Applying CSS reset for conflict prevention');
    
    let resetStyle = document.getElementById('kairos-overview-reset');
    if (!resetStyle) {
      resetStyle = document.createElement('style');
      resetStyle.id = 'kairos-overview-reset';
      resetStyle.textContent = CSS_RESET;
      document.head.appendChild(resetStyle);
    }

    // Force root element styles
    const root = document.getElementById('root');
    if (root) {
      root.style.cssText = `
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        position: static !important;
        z-index: auto !important;
        background: #ffffff !important;
        min-height: 100vh !important;
        width: 100% !important;
      `;
    }

    console.log('🎯 PRODUCTION: CSS reset applied successfully');
  }, []);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        console.log('🎯 PRODUCTION: Loading dashboard data...');
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Mock metrics data with comprehensive business indicators
        const dashboardMetrics: DashboardMetric[] = [
          {
            id: 'active-campaigns',
            label: 'Active Campaigns',
            value: 24,
            change: 12.5,
            changeType: 'increase',
            icon: ChartBarIcon,
            color: 'bg-blue-500',
            description: 'Currently running marketing campaigns',
            target: 30,
            status: 'healthy'
          },
          {
            id: 'monthly-conversions',
            label: 'Monthly Conversions',
            value: '12.4K',
            change: 8.2,
            changeType: 'increase',
            icon: ArrowTrendingUpIcon,
            color: 'bg-green-500',
            description: 'Total conversions this month',
            status: 'healthy'
          },
          {
            id: 'eligibility-atoms',
            label: 'Eligibility Atoms',
            value: 156,
            change: 5.1,
            changeType: 'increase',
            icon: BeakerIcon,
            color: 'bg-purple-500',
            description: 'Active targeting rules',
            target: 200,
            status: 'warning'
          },
          {
            id: 'perfect-moments',
            label: 'Perfect Moments',
            value: 89,
            change: -2.3,
            changeType: 'decrease',
            icon: ClockIcon,
            color: 'bg-orange-500',
            description: 'Optimized delivery opportunities',
            target: 100,
            status: 'warning'
          }
        ];

        // Mock quick actions with categories
        const quickActionsData: QuickAction[] = [
          {
            id: 'create-atom',
            label: 'Create Atom',
            description: 'Build new eligibility rules',
            path: '/atoms/composer',
            icon: BeakerIcon,
            color: 'bg-blue-500',
            category: 'primary',
            isNew: true
          },
          {
            id: 'create-moment',
            label: 'Create Moment',
            description: 'Design marketing moments',
            path: '/moments/builder',
            icon: ClockIcon,
            color: 'bg-green-500',
            category: 'primary'
          },
          {
            id: 'launch-campaign',
            label: 'Launch Campaign',
            description: 'Start new campaign',
            path: '/campaigns',
            icon: ChartBarIcon,
            color: 'bg-purple-500',
            category: 'primary'
          },
          {
            id: 'view-analytics',
            label: 'Analytics',
            description: 'View performance insights',
            path: '/analytics',
            icon: ChartBarIcon,
            color: 'bg-orange-500',
            category: 'secondary'
          },
          {
            id: 'manage-integrations',
            label: 'Integrations',
            description: 'Manage connections',
            path: '/integrations',
            icon: CogIcon,
            color: 'bg-gray-500',
            category: 'secondary'
          },
          {
            id: 'user-management',
            label: 'Users',
            description: 'Manage team access',
            path: '/enterprise/organizations',
            icon: UserGroupIcon,
            color: 'bg-indigo-500',
            category: 'secondary',
            isBeta: true
          }
        ];

        // Mock activity data with avatars
        const recentActivities: RecentActivity[] = [
          {
            id: '1',
            type: 'campaign',
            title: 'Summer Sale Campaign',
            description: 'Campaign launched successfully with 95% delivery rate',
            timestamp: '2 hours ago',
            status: 'active',
            user: 'Sarah Chen',
            avatar: '/api/placeholder/32/32'
          },
          {
            id: '2',
            type: 'atom',
            title: 'High Value Customer Atom',
            description: 'New eligibility rule created for premium customers',
            timestamp: '4 hours ago',
            status: 'draft',
            user: 'Mike Rodriguez'
          },
          {
            id: '3',
            type: 'test',
            title: 'CTA Button Color Test',
            description: 'A/B test completed with 95% confidence interval',
            timestamp: '6 hours ago',
            status: 'completed',
            user: 'Emily Johnson'
          },
          {
            id: '4',
            type: 'moment',
            title: 'Cart Abandonment Moment',
            description: 'Triggered 2.3K personalized recovery emails',
            timestamp: '8 hours ago',
            status: 'active',
            user: 'David Kim'
          },
          {
            id: '5',
            type: 'campaign',
            title: 'Email Sequence Update',
            description: 'Modified nurture sequence based on performance data',
            timestamp: '1 day ago',
            status: 'completed',
            user: 'Lisa Wang'
          }
        ];

        // Mock alerts
        const alertsData: AlertItem[] = [
          {
            id: '1',
            type: 'warning',
            title: 'Low Conversion Rate',
            message: 'Mobile campaign conversion rate dropped by 15% in the last 24 hours',
            timestamp: '30 minutes ago',
            dismissible: true
          },
          {
            id: '2',
            type: 'info',
            title: 'System Maintenance',
            message: 'Scheduled maintenance window: July 25, 2:00 AM - 4:00 AM UTC',
            timestamp: '2 hours ago',
            dismissible: true
          }
        ];

        setMetrics(dashboardMetrics);
        setActivities(recentActivities);
        setAlerts(alertsData);
        setQuickActions(quickActionsData);
        
        console.log('🎯 PRODUCTION: Dashboard data loaded successfully');
      } catch (error) {
        console.error('🎯 PRODUCTION: Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Handle logout
  const handleLogout = () => {
    console.log('🎯 PRODUCTION: User logout triggered');
    // Add logout logic here
    navigate('/auth/login');
  };

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle sidebar collapse
  const handleSidebarCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Dismiss alert
  const dismissAlert = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  // Helper functions
  const getChangeIndicator = (changeType: string, change: number) => {
    if (changeType === 'neutral') {
      return (
        <span className="inline-flex items-center text-sm font-medium text-gray-500">
          <span className="mr-1">→</span>
          {Math.abs(change)}%
        </span>
      );
    }

    const isPositive = changeType === 'increase';
    return (
      <span className={cn(
        "inline-flex items-center text-sm font-medium",
        isPositive ? "text-green-600" : "text-red-600"
      )}>
        {isPositive ? (
          <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
        ) : (
          <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
        )}
        {Math.abs(change)}%
      </span>
    );
  };

  const getActivityIcon = (type: string) => {
    const iconMap = {
      'campaign': '🚀',
      'atom': '⚛️',
      'moment': '⏰',
      'test': '🧪'
    };
    return iconMap[type as keyof typeof iconMap] || '📋';
  };

  const getStatusConfig = (status: string) => {
    const statusMap = {
      'active': { 
        className: 'bg-green-100 text-green-800 border-green-200', 
        label: 'Active',
        icon: '🟢'
      },
      'draft': { 
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        label: 'Draft',
        icon: '🟡'
      },
      'completed': { 
        className: 'bg-blue-100 text-blue-800 border-blue-200', 
        label: 'Completed',
        icon: '🔵'
      },
      'failed': { 
        className: 'bg-red-100 text-red-800 border-red-200', 
        label: 'Failed',
        icon: '🔴'
      }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.draft;
  };

  const getAlertConfig = (type: string) => {
    const alertMap = {
      'info': { 
        className: 'bg-blue-50 border-blue-200 text-blue-800',
        icon: '💡'
      },
      'warning': { 
        className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        icon: '⚠️'
      },
      'error': { 
        className: 'bg-red-50 border-red-200 text-red-800',
        icon: '🚨'
      },
      'success': { 
        className: 'bg-green-50 border-green-200 text-green-800',
        icon: '✅'
      }
    };
    return alertMap[type as keyof typeof alertMap] || alertMap.info;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <LoadingSpinner size="xl" color="primary" />
              <motion.p 
                className="mt-4 text-gray-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Loading your dashboard...
              </motion.p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('🎯 PRODUCTION: Rendering integrated dashboard layout');

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={cn(
        "hidden lg:flex lg:flex-shrink-0 transition-all duration-300",
        isCollapsed ? "lg:w-16" : "lg:w-64"
      )}>
        <Sidebar 
          isCollapsed={isCollapsed} 
          onToggleCollapse={handleSidebarCollapse}
        />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div 
                className="absolute inset-0 bg-gray-600 opacity-75"
                onClick={() => setSidebarOpen(false)}
              />
            </motion.div>
            <motion.div
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white lg:hidden"
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <Sidebar onToggle={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex flex-1 flex-col min-w-0">
        
        {/* Header */}
        <Header 
          onSidebarToggle={handleSidebarToggle}
          sidebarOpen={sidebarOpen}
          user={user}
          onLogout={handleLogout}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-16"> {/* pb-16 for footer space */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Alerts Section */}
            {alerts.length > 0 && (
              <div className="mb-8 space-y-4">
                {alerts.map((alert) => {
                  const config = getAlertConfig(alert.type);
                  return (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={cn(
                        "p-4 rounded-lg border",
                        config.className
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <span className="text-lg">{config.icon}</span>
                          <div>
                            <h4 className="font-semibold">{alert.title}</h4>
                            <p className="text-sm mt-1">{alert.message}</p>
                            <p className="text-xs mt-2 opacity-75">{alert.timestamp}</p>
                          </div>
                        </div>
                        {alert.dismissible && (
                          <button
                            onClick={() => dismissAlert(alert.id)}
                            className="p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
                          >
                            <span className="sr-only">Dismiss</span>
                            ✕
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Welcome Section */}
            <motion.div 
              className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      Welcome back, {user?.firstName || user?.name || 'User'}! 👋
                    </h1>
                    <p className="text-lg text-gray-600">
                      Here's what's happening with your marketing campaigns today.
                    </p>
                    <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                      <span>Last updated: just now</span>
                      <span>•</span>
                      <span>All systems operational</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <motion.button 
                      onClick={() => navigate('/analytics')}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View Analytics
                    </motion.button>
                    <motion.button 
                      onClick={() => navigate('/ai')}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/25 font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      AI Dashboard ✨
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {metrics.map((metric, index) => (
                <motion.div
                  key={metric.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn(
                      "p-3 rounded-lg",
                      metric.color
                    )}>
                      <metric.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      metric.status === 'healthy' && "bg-green-100 text-green-800",
                      metric.status === 'warning' && "bg-yellow-100 text-yellow-800",
                      metric.status === 'critical' && "bg-red-100 text-red-800"
                    )}>
                      {metric.status}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                    
                    <div className="flex items-center justify-between">
                      {getChangeIndicator(metric.changeType, metric.change)}
                      <span className="text-xs text-gray-500">vs last month</span>
                    </div>
                    
                    {metric.target && (
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Progress to target</span>
                          <span>{Math.round((Number(metric.value) / metric.target) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={cn(
                              "h-1.5 rounded-full transition-all duration-500",
                              metric.color
                            )}
                            style={{ 
                              width: `${Math.min((Number(metric.value) / metric.target) * 100, 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-2">{metric.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <motion.div 
              className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Quick Actions</h2>
                <p className="text-gray-600">Jump into your most common tasks</p>
              </div>
              
              <div className="p-6">
                {/* Primary actions */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Primary Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quickActions
                      .filter(action => action.category === 'primary')
                      .map((action, index) => (
                        <motion.button
                          key={action.id}
                          onClick={() => navigate(action.path)}
                          className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={cn(
                              "p-2 rounded-lg group-hover:scale-110 transition-transform",
                              action.color
                            )}>
                              <action.icon className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-gray-900">{action.label}</h4>
                                {action.isNew && (
                                  <Badge variant="success" size="sm">New</Badge>
                                )}
                                {action.isBeta && (
                                  <Badge variant="warning" size="sm">Beta</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                            </div>
                          </div>
                        </motion.button>
                      ))
                    }
                  </div>
                </div>

                {/* Secondary actions */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">More Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quickActions
                      .filter(action => action.category === 'secondary')
                      .map((action, index) => (
                        <motion.button
                          key={action.id}
                          onClick={() => navigate(action.path)}
                          className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all text-left group"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: (index + 3) * 0.1 }}
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={cn(
                              "p-2 rounded-lg group-hover:scale-105 transition-transform",
                              action.color
                            )}>
                              <action.icon className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-gray-900 text-sm">{action.label}</h4>
                                {action.isNew && (
                                  <Badge variant="success" size="sm">New</Badge>
                                )}
                                {action.isBeta && (
                                  <Badge variant="warning" size="sm">Beta</Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mt-1">{action.description}</p>
                            </div>
                          </div>
                        </motion.button>
                      ))
                    }
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div 
              className="bg-white rounded-xl shadow-sm border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Recent Activity</h2>
                    <p className="text-gray-600">Latest updates from your team</p>
                  </div>
                  <button 
                    onClick={() => navigate('/analytics')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All
                  </button>
                </div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {activities.map((activity, index) => {
                  const statusConfig = getStatusConfig(activity.status);
                  return (
                    <motion.div
                      key={activity.id}
                      className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      onClick={() => {
                        // Navigate to specific activity detail
                        console.log('Navigate to activity:', activity.id);
                      }}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                            {getActivityIcon(activity.type)}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {activity.title}
                            </h3>
                            <div className={cn(
                              "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
                              statusConfig.className
                            )}>
                              <span className="mr-1">{statusConfig.icon}</span>
                              {statusConfig.label}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center space-x-2">
                              {activity.avatar ? (
                                <img 
                                  src={activity.avatar} 
                                  alt={activity.user}
                                  className="w-5 h-5 rounded-full"
                                />
                              ) : (
                                <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center text-xs text-gray-600">
                                  {activity.user.charAt(0)}
                                </div>
                              )}
                              <span className="font-medium">{activity.user}</span>
                            </div>
                            <span>{activity.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}