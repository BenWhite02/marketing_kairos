// src/components/business/testing/TestManagement/TestDashboard.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BeakerIcon,
  PlusIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  TrophyIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../../ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '../../../ui/Card';
import { Input, Select } from '../../../ui/Input';
import { TestCard } from './TestCard';
import type { ExperimentConfig } from '../ExperimentDesigner/ExperimentBuilder';

interface TestDashboardProps {
  experiments: ExperimentConfig[];
  onCreateExperiment: () => void;
  onEditExperiment: (experiment: ExperimentConfig) => void;
  onDeleteExperiment: (experimentId: string) => void;
  onStartExperiment: (experimentId: string) => void;
  onPauseExperiment: (experimentId: string) => void;
  onStopExperiment: (experimentId: string) => void;
  onViewResults: (experimentId: string) => void;
  readOnly?: boolean;
}

type ViewMode = 'grid' | 'list';
type FilterStatus = 'all' | 'draft' | 'active' | 'paused' | 'completed';
type SortBy = 'created' | 'updated' | 'name' | 'status';

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  review: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-purple-100 text-purple-800'
};

const STATUS_ICONS = {
  draft: ClockIcon,
  review: BeakerIcon,
  active: PlayIcon,
  paused: PauseIcon,
  completed: TrophyIcon
};

export const TestDashboard: React.FC<TestDashboardProps> = ({
  experiments,
  onCreateExperiment,
  onEditExperiment,
  onDeleteExperiment,
  onStartExperiment,
  onPauseExperiment,
  onStopExperiment,
  onViewResults,
  readOnly = false
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('updated');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExperiments, setSelectedExperiments] = useState<string[]>([]);

  // Filter and sort experiments
  const filteredAndSortedExperiments = useMemo(() => {
    let filtered = experiments;

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(exp => exp.status === filterStatus);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(exp => 
        exp.name.toLowerCase().includes(query) ||
        exp.description.toLowerCase().includes(query) ||
        exp.hypothesis.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return filtered;
  }, [experiments, filterStatus, searchQuery, sortBy]);

  // Calculate summary statistics
  const stats = useMemo(() => {
    const total = experiments.length;
    const active = experiments.filter(e => e.status === 'active').length;
    const completed = experiments.filter(e => e.status === 'completed').length;
    const draft = experiments.filter(e => e.status === 'draft').length;

    return { total, active, completed, draft };
  }, [experiments]);

  const handleSelectExperiment = useCallback((experimentId: string, selected: boolean) => {
    setSelectedExperiments(prev => 
      selected 
        ? [...prev, experimentId]
        : prev.filter(id => id !== experimentId)
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    const allIds = filteredAndSortedExperiments.map(exp => exp.id);
    setSelectedExperiments(prev => 
      prev.length === allIds.length ? [] : allIds
    );
  }, [filteredAndSortedExperiments]);

  const handleBulkAction = useCallback((action: 'start' | 'pause' | 'stop' | 'delete') => {
    selectedExperiments.forEach(experimentId => {
      switch (action) {
        case 'start':
          onStartExperiment(experimentId);
          break;
        case 'pause':
          onPauseExperiment(experimentId);
          break;
        case 'stop':
          onStopExperiment(experimentId);
          break;
        case 'delete':
          onDeleteExperiment(experimentId);
          break;
      }
    });
    setSelectedExperiments([]);
  }, [selectedExperiments, onStartExperiment, onPauseExperiment, onStopExperiment, onDeleteExperiment]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">A/B Testing Dashboard</h1>
          <p className="text-gray-600">Manage and monitor your experiments</p>
        </div>
        <Button
          variant="primary"
          onClick={onCreateExperiment}
          leftIcon={PlusIcon}
          disabled={readOnly}
        >
          New Experiment
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BeakerIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-500">Total Experiments</div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <PlayIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
                <div className="text-sm text-gray-500">Active Tests</div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrophyIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-3">
                <div className="text-2xl font-bold text-gray-900">{stats.draft}</div>
                <div className="text-sm text-gray-500">Drafts</div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search experiments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80"
              />
            </div>

            <div className="flex items-center space-x-4">
              {/* Status Filter */}
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </Select>

              {/* Sort */}
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
              >
                <option value="updated">Last Updated</option>
                <option value="created">Created Date</option>
                <option value="name">Name</option>
                <option value="status">Status</option>
              </Select>

              {/* View Mode */}
              <div className="flex border border-gray-300 rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Squares2X2Icon className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none border-l-0"
                >
                  <ListBulletIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Bulk Actions */}
      {selectedExperiments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex items-center">
            <span className="text-sm font-medium text-blue-800">
              {selectedExperiments.length} experiment(s) selected
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('start')}
              disabled={readOnly}
            >
              Start
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('pause')}
              disabled={readOnly}
            >
              Pause
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('stop')}
              disabled={readOnly}
            >
              Stop
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('delete')}
              disabled={readOnly}
              className="text-red-600 hover:text-red-700"
            >
              Delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedExperiments([])}
            >
              Clear
            </Button>
          </div>
        </motion.div>
      )}

      {/* Experiments Grid/List */}
      {filteredAndSortedExperiments.length > 0 ? (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          <AnimatePresence>
            {filteredAndSortedExperiments.map((experiment) => (
              <motion.div
                key={experiment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TestCard
                  experiment={experiment}
                  viewMode={viewMode}
                  selected={selectedExperiments.includes(experiment.id)}
                  onSelect={(selected) => handleSelectExperiment(experiment.id, selected)}
                  onEdit={() => onEditExperiment(experiment)}
                  onDelete={() => onDeleteExperiment(experiment.id)}
                  onStart={() => onStartExperiment(experiment.id)}
                  onPause={() => onPauseExperiment(experiment.id)}
                  onStop={() => onStopExperiment(experiment.id)}
                  onViewResults={() => onViewResults(experiment.id)}
                  readOnly={readOnly}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              {searchQuery || filterStatus !== 'all' ? (
                <>
                  <FunnelIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No experiments found</h3>
                  <p className="text-gray-500 mb-4">
                    Try adjusting your search or filters to find experiments.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setFilterStatus('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </>
              ) : (
                <>
                  <BeakerIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No experiments yet</h3>
                  <p className="text-gray-500 mb-4">
                    Get started by creating your first A/B test experiment.
                  </p>
                  <Button
                    variant="primary"
                    onClick={onCreateExperiment}
                    disabled={readOnly}
                  >
                    Create Your First Experiment
                  </Button>
                </>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Quick Actions Footer */}
      <Card>
        <CardFooter>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedExperiments.length === filteredAndSortedExperiments.length && filteredAndSortedExperiments.length > 0}
                  onChange={handleSelectAll}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Select All</span>
              </label>
              <span className="text-sm text-gray-500">
                Showing {filteredAndSortedExperiments.length} of {experiments.length} experiments
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" leftIcon={ChartBarIcon}>
                Analytics
              </Button>
              <Button variant="outline" size="sm">
                Export
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};