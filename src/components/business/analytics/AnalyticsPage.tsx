// ===============================================
// src/pages/analytics/AnalyticsPage.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AnalyticsDashboard } from '../../components/business/analytics';

interface AnalyticsPageProps {
  className?: string;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  className = ''
}) => {
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-refresh functionality
  useEffect(() => {
    const interval = setInterval(() => {
      // Trigger data refresh
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 1000);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`container mx-auto px-4 py-6 ${className}`}
    >
      <AnalyticsDashboard
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        refreshInterval={30000}
      />
    </motion.div>
  );
};

// ===============================================