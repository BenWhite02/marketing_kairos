// src/components/business/atoms/AtomComposer/AtomComposer.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlayIcon,
  PauseIcon,
  StopIcon,
  EyeIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { DragDropCanvas, type AtomNode, type Connection } from '../../features/DragAndDrop';
import { RuleBuilder, type RuleNode } from '../../features/RuleBuilder';
import { CompositionCanvas } from './CompositionCanvas';
import { AtomPalette } from './AtomPalette';
import { classNames } from '../../../utils/dom/classNames';

interface AtomComposition {
  id: string;
  name: string;
  description: string;
  atoms: AtomNode[];
  connections: Connection[];
  rules: RuleNode[];
  status: 'draft' | 'testing' | 'active' | 'inactive';
  version: number;
  createdAt: Date;
  updatedAt: Date;
  metrics: {
    accuracy: number;
    coverage: number;
    performance: number;
    usage: number;
  };
}

interface AtomComposerProps {
  composition?: AtomComposition;
  availableAtoms: Array<{
    id: string;
    name: string;
    type: 'demographic' | 'behavioral' | 'transactional' | 'contextual';
    data: Record<string, any>;
    category: string;
    accuracy: number;
    usage: number;
  }>;
  onSave: (composition: AtomComposition) => Promise<void>;
  onTest: (composition: AtomComposition) => Promise<any>;
  onDeploy: (composition: AtomComposition) => Promise<void>;
  readOnly?: boolean;
}

export const AtomComposer: React.FC<AtomComposerProps> = ({
  composition: initialComposition,
  availableAtoms,
  onSave,
  onTest,
  onDeploy,
  readOnly = false
}) => {
  const [composition, setComposition] = useState<AtomComposition>(
    initialComposition || {
      id: `composition-${Date.now()}`,
      name: 'New Composition',
      description: '',
      atoms: [],
      connections: [],
      rules: [],
      status: 'draft',
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      metrics: {
        accuracy: 0,
        coverage: 0,
        performance: 0,
        usage: 0
      }
    }
  );

  const [activeTab, setActiveTab] = useState<'visual' | 'rules' | 'preview'>('visual');
  const [selectedAtomId, setSelectedAtomId] = useState<string | null>(null);
  const [isTestingMode, setIsTestingMode] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Validation
  const validationStatus = useMemo(() => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for orphaned atoms
    const connectedAtomIds = new Set([
      ...composition.connections.map(c => c.sourceId),
      ...composition.connections.map(c => c.targetId)
    ]);
    
    const orphanedAtoms = composition.atoms.filter(atom => 
      composition.atoms.length > 1 && !connectedAtomIds.has(atom.id)
    );
    
    if (orphanedAtoms.length > 0) {
      warnings.push(`${orphanedAtoms.length} atom(s) not connected`);
    }

    // Check for circular dependencies
    const hasCircularDependency = (atomId: string, visited: Set<string> = new Set()): boolean => {
      if (visited.has(atomId)) return true;
      visited.add(atomId);
      
      const connections = composition.connections.filter(c => c.sourceId === atomId);
      return connections.some(c => hasCircularDependency(c.targetId, new Set(visited)));
    };

    composition.atoms.forEach(atom => {
      if (hasCircularDependency(atom.id)) {
        errors.push('Circular dependency detected');
      }
    });

    // Check minimum requirements
    if (composition.atoms.length === 0) {
      errors.push('At least one atom is required');
    }

    if (!composition.name.trim()) {
      errors.push('Composition name is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, 100 - (errors.length * 25) - (warnings.length * 10))
    };
  }, [composition]);

  const handleUpdateComposition = useCallback((updates: Partial<AtomComposition>) => {
    setComposition(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date()
    }));
  }, []);

  const handleAtomsChange = useCallback((atoms: AtomNode[]) => {
    handleUpdateComposition({ atoms });
  }, [handleUpdateComposition]);

  const handleConnectionsChange = useCallback((connections: Connection[]) => {
    handleUpdateComposition({ connections });
  }, [handleUpdateComposition]);

  const handleRulesChange = useCallback((rules: RuleNode[]) => {
    handleUpdateComposition({ rules });
  }, [handleUpdateComposition]);

  const handleSave = useCallback(async () => {
    if (!validationStatus.isValid) return;
    
    setIsSaving(true);
    try {
      await onSave(composition);
    } finally {
      setIsSaving(false);
    }
  }, [composition, onSave, validationStatus.isValid]);

  const handleTest = useCallback(async () => {
    if (!validationStatus.isValid) return;
    
    setIsTestingMode(true);
    try {
      const results = await onTest(composition);
      setTestResults(results);
    } finally {
      setIsTestingMode(false);
    }
  }, [composition, onTest, validationStatus.isValid]);

  const handleDeploy = useCallback(async () => {
    if (!validationStatus.isValid || composition.status !== 'testing') return;
    
    try {
      await onDeploy(composition);
      handleUpdateComposition({ status: 'active' });
    } catch (error) {
      console.error('Deployment failed:', error);
    }
  }, [composition, onDeploy, validationStatus.isValid, handleUpdateComposition]);

  const handleAddAtomFromPalette = useCallback((atomTemplate: any) => {
    if (readOnly) return;
    
    const newAtom: AtomNode = {
      id: `atom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: atomTemplate.type,
      name: atomTemplate.name,
      position: {
        x: Math.random() * 400 + 50,
        y: Math.random() * 300 + 50
      },
      data: { ...atomTemplate.data }
    };

    handleAtomsChange([...composition.atoms, newAtom]);
  }, [composition.atoms, handleAtomsChange, readOnly]);

  const statusColors = {
    draft: 'bg-slate-100 text-slate-700 border-slate-300',
    testing: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    active: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    inactive: 'bg-red-100 text-red-700 border-red-300'
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <input
                type="text"
                value={composition.name}
                onChange={(e) => handleUpdateComposition({ name: e.target.value })}
                className="text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-0 text-slate-900 dark:text-white"
                placeholder="Composition Name"
                disabled={readOnly}
              />
              <div className="flex items-center space-x-2 mt-1">
                <span className={classNames(
                  'px-2 py-1 rounded-full text-xs font-medium border',
                  statusColors[composition.status]
                )}>
                  {composition.status}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  v{composition.version}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {composition.atoms.length} atoms
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Validation Status */}
            <div className="flex items-center space-x-2 mr-4">
              {validationStatus.isValid ? (
                <div className="flex items-center text-emerald-600 dark:text-emerald-400">
                  <CheckCircleIcon className="w-5 h-5 mr-1" />
                  <span className="text-sm font-medium">Valid</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600 dark:text-red-400">
                  <ExclamationTriangleIcon className="w-5 h-5 mr-1" />
                  <span className="text-sm font-medium">
                    {validationStatus.errors.length} errors
                  </span>
                </div>
              )}
              <div className="text-sm text-slate-500">
                Score: {validationStatus.score}/100
              </div>
            </div>

            {!readOnly && (
              <>
                <button
                  onClick={handleTest}
                  disabled={!validationStatus.isValid || isTestingMode}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isTestingMode ? (
                    <ArrowPathIcon className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <PlayIcon className="w-4 h-4 mr-1" />
                  )}
                  Test
                </button>

                <button
                  onClick={handleSave}
                  disabled={!validationStatus.isValid || isSaving}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? (
                    <ArrowPathIcon className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
                  )}
                  Save
                </button>

                {composition.status === 'testing' && (
                  <button
                    onClick={handleDeploy}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                  >
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    Deploy
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mt-4">
          {[
            { id: 'visual', label: 'Visual Editor', icon: EyeIcon },
            { id: 'rules', label: 'Rule Builder', icon: Cog6ToothIcon },
            { id: 'preview', label: 'Preview & Test', icon: ChartBarIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={classNames(
                'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                activeTab === tab.id
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700'
              )}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            {activeTab === 'visual' && (
              <motion.div
                key="visual"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex"
              >
                <CompositionCanvas
                  atoms={composition.atoms}
                  connections={composition.connections}
                  onAtomsChange={handleAtomsChange}
                  onConnectionsChange={handleConnectionsChange}
                  selectedAtomId={selectedAtomId}
                  onAtomSelect={setSelectedAtomId}
                  readOnly={readOnly}
                  className="flex-1"
                />
              </motion.div>
            )}

            {activeTab === 'rules' && (
              <motion.div
                key="rules"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 p-4"
              >
                <RuleBuilder
                  rules={composition.rules}
                  onRulesChange={handleRulesChange}
                  availableAtoms={availableAtoms}
                  readOnly={readOnly}
                />
              </motion.div>
            )}

            {activeTab === 'preview' && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 p-4"
              >
                <div className="h-full bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Composition Preview
                  </h3>
                  
                  {testResults ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-4 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {testResults.accuracy}%
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Accuracy</div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {testResults.coverage}%
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Coverage</div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {testResults.performance}ms
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Performance</div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {testResults.sample_size}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Sample Size</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <ChartBarIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                        No Test Results
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400">
                        Run a test to see composition performance metrics
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Atom Palette Sidebar */}
        {activeTab === 'visual' && (
          <div className="w-80 border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <AtomPalette
              atoms={availableAtoms}
              onAtomSelect={handleAddAtomFromPalette}
              readOnly={readOnly}
            />
          </div>
        )}
      </div>

      {/* Validation Errors */}
      {validationStatus.errors.length > 0 && (
        <div className="flex-shrink-0 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800 p-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                Validation Errors
              </h4>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-0.5">
                {validationStatus.errors.map((error, index) => (
                  <li key={index}>â€¢ {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
