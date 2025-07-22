// src/components/features/RuleBuilder/RuleBuilder.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { LogicGate } from './LogicGate';
import { ConnectionLine } from './ConnectionLine';
import { classNames } from '../../../utils/dom/classNames';

interface RuleNode {
  id: string;
  type: 'atom' | 'gate' | 'group';
  operation?: 'AND' | 'OR' | 'NOT';
  atomId?: string;
  children?: RuleNode[];
  position?: { x: number; y: number };
  metadata?: {
    name?: string;
    description?: string;
    weight?: number;
  };
}

interface RuleBuilderProps {
  rules: RuleNode[];
  onRulesChange: (rules: RuleNode[]) => void;
  availableAtoms: Array<{
    id: string;
    name: string;
    type: string;
    data: Record<string, any>;
  }>;
  onValidate?: (rules: RuleNode[]) => boolean;
  readOnly?: boolean;
  className?: string;
}

export const RuleBuilder: React.FC<RuleBuilderProps> = ({
  rules,
  onRulesChange,
  availableAtoms,
  onValidate,
  readOnly = false,
  className = ''
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [draggedNode, setDraggedNode] = useState<RuleNode | null>(null);

  // Validation logic
  const validationResult = useMemo(() => {
    if (!onValidate) return { isValid: true, errors: [] };
    
    const errors: string[] = [];
    
    const validateNode = (node: RuleNode): boolean => {
      switch (node.type) {
        case 'atom':
          if (!node.atomId) {
            errors.push(`Atom node ${node.id} missing atomId`);
            return false;
          }
          if (!availableAtoms.find(a => a.id === node.atomId)) {
            errors.push(`Atom ${node.atomId} not found`);
            return false;
          }
          return true;
          
        case 'gate':
          if (!node.operation) {
            errors.push(`Gate node ${node.id} missing operation`);
            return false;
          }
          if (!node.children || node.children.length === 0) {
            errors.push(`Gate node ${node.id} has no children`);
            return false;
          }
          if (node.operation === 'NOT' && node.children.length > 1) {
            errors.push(`NOT gate ${node.id} can only have one child`);
            return false;
          }
          return node.children.every(validateNode);
          
        case 'group':
          if (!node.children || node.children.length === 0) {
            errors.push(`Group node ${node.id} has no children`);
            return false;
          }
          return node.children.every(validateNode);
          
        default:
          errors.push(`Unknown node type: ${node.type}`);
          return false;
      }
    };

    const isValid = rules.every(validateNode);
    return { isValid, errors };
  }, [rules, availableAtoms, onValidate]);

  const handleAddNode = useCallback((parentId: string | null, nodeType: 'atom' | 'gate' | 'group') => {
    if (readOnly) return;
    
    const newNode: RuleNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: nodeType,
      ...(nodeType === 'gate' && { operation: 'AND', children: [] }),
      ...(nodeType === 'group' && { children: [] }),
      ...(nodeType === 'atom' && { atomId: availableAtoms[0]?.id }),
      metadata: {
        name: `New ${nodeType}`,
        weight: 1
      }
    };

    if (!parentId) {
      onRulesChange([...rules, newNode]);
    } else {
      const addToParent = (nodes: RuleNode[]): RuleNode[] => {
        return nodes.map(node => {
          if (node.id === parentId) {
            return {
              ...node,
              children: [...(node.children || []), newNode]
            };
          }
          if (node.children) {
            return {
              ...node,
              children: addToParent(node.children)
            };
          }
          return node;
        });
      };
      
      onRulesChange(addToParent(rules));
    }
  }, [readOnly, rules, onRulesChange, availableAtoms]);

  const handleDeleteNode = useCallback((nodeId: string) => {
    if (readOnly) return;
    
    const deleteFromRules = (nodes: RuleNode[]): RuleNode[] => {
      return nodes
        .filter(node => node.id !== nodeId)
        .map(node => ({
          ...node,
          children: node.children ? deleteFromRules(node.children) : undefined
        }));
    };
    
    onRulesChange(deleteFromRules(rules));
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  }, [readOnly, rules, onRulesChange, selectedNodeId]);

  const handleUpdateNode = useCallback((nodeId: string, updates: Partial<RuleNode>) => {
    if (readOnly) return;
    
    const updateInRules = (nodes: RuleNode[]): RuleNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, ...updates };
        }
        if (node.children) {
          return {
            ...node,
            children: updateInRules(node.children)
          };
        }
        return node;
      });
    };
    
    onRulesChange(updateInRules(rules));
  }, [readOnly, rules, onRulesChange]);

  const handleToggleExpanded = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const renderRuleNode = useCallback((node: RuleNode, depth: number = 0, parentId?: string) => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNodeId === node.id;
    const hasChildren = node.children && node.children.length > 0;
    const indentLevel = depth * 24;

    return (
      <motion.div
        key={node.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className="relative"
      >
        {/* Connection line to parent */}
        {depth > 0 && (
          <div 
            className="absolute left-0 top-0 w-6 h-6 border-l-2 border-b-2 border-slate-300 dark:border-slate-600"
            style={{ left: indentLevel - 24 }}
          />
        )}

        {/* Node Content */}
        <div
          className={classNames(
            'relative flex items-center p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer group',
            isSelected 
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600',
            'mb-2'
          )}
          style={{ marginLeft: indentLevel }}
          onClick={() => setSelectedNodeId(node.id)}
        >
          {/* Expand/Collapse Button */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleExpanded(node.id);
              }}
              className="mr-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              {isExpanded ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Node Icon/Type */}
          <div className="flex-shrink-0 mr-3">
            {node.type === 'gate' && (
              <LogicGate 
                operation={node.operation!} 
                size="sm"
                isActive={isSelected}
              />
            )}
            {node.type === 'atom' && (
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">A</span>
              </div>
            )}
            {node.type === 'group' && (
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">G</span>
              </div>
            )}
          </div>

          {/* Node Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-slate-900 dark:text-white">
                  {node.metadata?.name || 
                   (node.type === 'atom' && node.atomId ? 
                    availableAtoms.find(a => a.id === node.atomId)?.name : 
                    `${node.type} ${node.operation || ''}`
                   )}
                </h4>
                {node.type === 'gate' && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {node.operation} gate • {node.children?.length || 0} children
                  </p>
                )}
                {node.type === 'atom' && node.atomId && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {availableAtoms.find(a => a.id === node.atomId)?.type}
                  </p>
                )}
              </div>

              {/* Node Actions */}
              {!readOnly && (
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddNode(node.id, 'atom');
                    }}
                    className="p-1 text-slate-400 hover:text-emerald-600"
                    title="Add atom"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNode(node.id);
                    }}
                    className="p-1 text-slate-400 hover:text-red-500"
                    title="Delete node"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Weight Indicator */}
          {node.metadata?.weight && node.metadata.weight !== 1 && (
            <div className="ml-2 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-medium">
              {node.metadata.weight}x
            </div>
          )}
        </div>

        {/* Children */}
        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="ml-6 border-l-2 border-slate-200 dark:border-slate-700 pl-4">
                {node.children!.map(child => renderRuleNode(child, depth + 1, node.id))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }, [
    expandedNodes, 
    selectedNodeId, 
    availableAtoms, 
    readOnly, 
    handleToggleExpanded, 
    handleAddNode, 
    handleDeleteNode
  ]);

  return (
    <div className={classNames('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Rule Builder
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Build complex eligibility rules using atoms and logic gates
          </p>
        </div>

        {/* Validation Status */}
        <div className="flex items-center space-x-2">
          {validationResult.isValid ? (
            <div className="flex items-center text-emerald-600 dark:text-emerald-400">
              <CheckCircleIcon className="w-5 h-5 mr-1" />
              <span className="text-sm font-medium">Valid</span>
            </div>
          ) : (
            <div className="flex items-center text-red-600 dark:text-red-400">
              <ExclamationTriangleIcon className="w-5 h-5 mr-1" />
              <span className="text-sm font-medium">
                {validationResult.errors.length} errors
              </span>
            </div>
          )}

          {!readOnly && (
            <button
              onClick={() => handleAddNode(null, 'gate')}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Rule
            </button>
          )}
        </div>
      </div>

      {/* Rules Tree */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        {rules.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full mx-auto mb-4 flex items-center justify-center">
              <PlusIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No Rules Defined
            </h4>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Start building your eligibility rules by adding atoms and logic gates.
            </p>
            {!readOnly && (
              <button
                onClick={() => handleAddNode(null, 'gate')}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add First Rule
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {rules.map(rule => renderRuleNode(rule, 0))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Validation Errors */}
      {!validationResult.isValid && validationResult.errors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
        >
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                Rule Validation Errors
              </h4>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                {validationResult.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};