// src/pages/testing/TestingPage.tsx

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BeakerIcon,
  PlusIcon,
  ChartBarIcon,
  AcademicCapIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { TestDashboard } from '../../components/business/testing/TestManagement/TestDashboard';
import { ExperimentBuilder } from '../../components/business/testing/ExperimentDesigner/ExperimentBuilder';
import { useTestingData } from '../../hooks/business/useTesting';
import type { ExperimentConfig } from '../../components/business/testing/ExperimentDesigner/ExperimentBuilder';

type ViewMode = 'dashboard' | 'create' | 'edit' | 'results';

export const TestingPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedExperiment, setSelectedExperiment] = useState<ExperimentConfig | null>(null);

  const {
    experiments,
    isLoading,
    createExperiment,
    updateExperiment,
    deleteExperiment,
    startExperiment,
    pauseExperiment,
    stopExperiment
  } = useTestingData();

  const handleCreateExperiment = useCallback(() => {
    setSelectedExperiment(null);
    setViewMode('create');
  }, []);

  const handleEditExperiment = useCallback((experiment: ExperimentConfig) => {
    setSelectedExperiment(experiment);
    setViewMode('edit');
  }, []);

  const handleSaveExperiment = useCallback(async (experiment: ExperimentConfig) => {
    try {
      if (selectedExperiment) {
        await updateExperiment(experiment);
      } else {
        await createExperiment(experiment);
      }
      setViewMode('dashboard');
      setSelectedExperiment(null);
    } catch (error) {
      console.error('Failed to save experiment:', error);
    }
  }, [selectedExperiment, updateExperiment, createExperiment]);

  const handleCancelEdit = useCallback(() => {
    setViewMode('dashboard');
    setSelectedExperiment(null);
  }, []);

  const handleViewResults = useCallback((experimentId: string) => {
    const experiment = experiments.find(e => e.id === experimentId);
    if (experiment) {
      setSelectedExperiment(experiment);
      setViewMode('results');
    }
  }, [experiments]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading experiments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <span>Testing</span>
        {viewMode !== 'dashboard' && (
          <>
            <span>›</span>
            <span className="text-gray-900 font-medium">
              {viewMode === 'create' ? 'New Experiment' : 
               viewMode === 'edit' ? 'Edit Experiment' : 
               viewMode === 'results' ? 'Results' : viewMode}
            </span>
          </>
        )}
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <TestDashboard
              experiments={experiments}
              onCreateExperiment={handleCreateExperiment}
              onEditExperiment={handleEditExperiment}
              onDeleteExperiment={deleteExperiment}
              onStartExperiment={startExperiment}
              onPauseExperiment={pauseExperiment}
              onStopExperiment={stopExperiment}
              onViewResults={handleViewResults}
            />
          </motion.div>
        )}

        {(viewMode === 'create' || viewMode === 'edit') && (
          <motion.div
            key="experiment-builder"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ExperimentBuilder
              experiment={selectedExperiment || undefined}
              onSave={handleSaveExperiment}
              onCancel={handleCancelEdit}
            />
          </motion.div>
        )}

        {viewMode === 'results' && selectedExperiment && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-6">
              {/* Results Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {selectedExperiment.name} - Results
                  </h1>
                  <p className="text-gray-600">
                    Statistical analysis and performance insights
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setViewMode('dashboard')}
                >
                  Back to Dashboard
                </Button>
              </div>

              {/* Results Placeholder */}
              <Card>
                <CardHeader>
                  <div className="flex items-center">
                    <ChartBarIcon className="h-6 w-6 text-blue-600 mr-3" />
                    <h3 className="text-lg font-medium text-gray-900">
                      Experiment Results
                    </h3>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="text-center py-12">
                    <AcademicCapIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Results Analysis Coming Soon
                    </h3>
                    <p className="text-gray-500">
                      Statistical analysis and detailed results will be displayed here.
                    </p>
                  </div>
                </CardBody>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};