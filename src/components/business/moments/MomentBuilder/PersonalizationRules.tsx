// src/components/business/moments/MomentBuilder/PersonalizationRules.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SparklesIcon,
  PlusIcon,
  XMarkIcon,
  CodeBracketIcon,
  EyeIcon,
  DocumentTextIcon,
  AdjustmentsHorizontalIcon,
  LightBulbIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../../ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '../../../ui/Card';
import { Input, Select, TextArea } from '../../../ui/Input';
import { Modal } from '../../../ui/Modal';

// Types
interface PersonalizationConfig {
  enabled: boolean;
  rules: PersonalizationRule[];
  variables: PersonalizationVariable[];
}

interface PersonalizationRule {
  id: string;
  name: string;
  description: string;
  condition: RuleCondition;
  content: PersonalizedContent;
  priority: number;
  enabled: boolean;
}

interface RuleCondition {
  atomId: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in';
  value: any;
  logicOperator?: 'AND' | 'OR';
}

interface PersonalizedContent {
  subject?: string;
  title?: string;
  body?: string;
  cta?: string;
  variables: Record<string, any>;
}

interface PersonalizationVariable {
  id: string;
  name: string;
  displayName: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'array';
  source: 'atom' | 'custom' | 'computed';
  defaultValue: any;
  format?: string;
  description: string;
}

interface PersonalizationRulesProps {
  personalization: PersonalizationConfig;
  availableAtoms: any[];
  onChange: (personalization: PersonalizationConfig) => void;
  readOnly?: boolean;
}

const PersonalizationRules: React.FC<PersonalizationRulesProps> = ({
  personalization,
  availableAtoms = [],
  onChange,
  readOnly = false
}) => {
  // State Management
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [showVariableEditor, setShowVariableEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingRule, setEditingRule] = useState<PersonalizationRule | null>(null);
  const [editingVariable, setEditingVariable] = useState<PersonalizationVariable | null>(null);

  // Mock atoms if none provided
  const mockAtoms = [
    {
      id: 'firstName',
      name: 'firstName',
      displayName: 'First Name',
      type: 'demographic',
      dataType: 'string'
    },
    {
      id: 'age_group',
      name: 'age_group',
      displayName: 'Age Group',
      type: 'demographic',
      dataType: 'string'
    },
    {
      id: 'purchase_history',
      name: 'purchase_history',
      displayName: 'Purchase History',
      type: 'transactional',
      dataType: 'array'
    },
    {
      id: 'loyalty_tier',
      name: 'loyalty_tier',
      displayName: 'Loyalty Tier',
      type: 'behavioral',
      dataType: 'string'
    }
  ];

  const atoms = availableAtoms.length > 0 ? availableAtoms : mockAtoms;

  // Predefined personalization templates
  const personalizationTemplates = [
    {
      id: 'loyalty_greeting',
      name: 'Loyalty Tier Greeting',
      description: 'Customize greeting based on customer loyalty tier',
      condition: { atomId: 'loyalty_tier', operator: 'equals', value: 'Premium' },
      content: {
        title: 'Welcome back, valued customer!',
        body: 'As a Premium member, you get exclusive access to...',
        variables: { greeting_tone: 'premium' }
      }
    },
    {
      id: 'age_appropriate',
      name: 'Age-Appropriate Content',
      description: 'Adjust tone and content based on age group',
      condition: { atomId: 'age_group', operator: 'equals', value: '18-24' },
      content: {
        title: 'Hey {{firstName}}! 🎉',
        body: 'Check out these trending products perfect for your lifestyle...',
        variables: { tone: 'casual', emoji_usage: 'high' }
      }
    },
    {
      id: 'purchase_recommendations',
      name: 'Purchase-Based Recommendations',
      description: 'Recommend products based on purchase history',
      condition: { atomId: 'purchase_history', operator: 'contains', value: 'electronics' },
      content: {
        title: 'New tech arrivals just for you',
        body: 'Based on your interest in electronics, you might love...',
        variables: { recommendation_category: 'electronics' }
      }
    }
  ];

  // Event Handlers
  const updatePersonalization = useCallback((updates: Partial<PersonalizationConfig>) => {
    onChange({
      ...personalization,
      ...updates
    });
  }, [personalization, onChange]);

  const togglePersonalization = useCallback(() => {
    updatePersonalization({ enabled: !personalization.enabled });
  }, [personalization.enabled, updatePersonalization]);

  const addRule = useCallback((template?: any) => {
    const newRule: PersonalizationRule = template ? {
      id: `rule_${Date.now()}`,
      name: template.name,
      description: template.description,
      condition: template.condition,
      content: template.content,
      priority: personalization.rules.length + 1,
      enabled: true
    } : {
      id: `rule_${Date.now()}`,
      name: 'New Personalization Rule',
      description: '',
      condition: {
        atomId: atoms[0]?.id || 'firstName',
        operator: 'equals',
        value: ''
      },
      content: {
        variables: {}
      },
      priority: personalization.rules.length + 1,
      enabled: true
    };

    updatePersonalization({
      rules: [...personalization.rules, newRule]
    });

    if (!template) {
      setEditingRule(newRule);
      setShowRuleBuilder(true);
    }
  }, [personalization.rules, atoms, updatePersonalization]);

  const updateRule = useCallback((ruleId: string, updates: Partial<PersonalizationRule>) => {
    const updatedRules = personalization.rules.map(rule =>
      rule.id === ruleId ? { ...rule, ...updates } : rule
    );

    updatePersonalization({ rules: updatedRules });
  }, [personalization.rules, updatePersonalization]);

  const removeRule = useCallback((ruleId: string) => {
    updatePersonalization({
      rules: personalization.rules.filter(r => r.id !== ruleId)
    });
  }, [personalization.rules, updatePersonalization]);

  const addVariable = useCallback((variable?: Partial<PersonalizationVariable>) => {
    const newVariable: PersonalizationVariable = {
      id: `var_${Date.now()}`,
      name: variable?.name || 'newVariable',
      displayName: variable?.displayName || 'New Variable',
      type: variable?.type || 'text',
      source: variable?.source || 'atom',
      defaultValue: variable?.defaultValue || '',
      description: variable?.description || '',
      ...variable
    };

    updatePersonalization({
      variables: [...personalization.variables, newVariable]
    });

    setEditingVariable(newVariable);
    setShowVariableEditor(true);
  }, [personalization.variables, updatePersonalization]);

  const updateVariable = useCallback((variableId: string, updates: Partial<PersonalizationVariable>) => {
    const updatedVariables = personalization.variables.map(variable =>
      variable.id === variableId ? { ...variable, ...updates } : variable
    );

    updatePersonalization({ variables: updatedVariables });
  }, [personalization.variables, updatePersonalization]);

  const removeVariable = useCallback((variableId: string) => {
    updatePersonalization({
      variables: personalization.variables.filter(v => v.id !== variableId)
    });
  }, [personalization.variables, updatePersonalization]);

  // Computed values
  const enabledRulesCount = useMemo(() => {
    return personalization.rules.filter(rule => rule.enabled).length;
  }, [personalization.rules]);

  const getConditionText = useCallback((condition: RuleCondition) => {
    const atom = atoms.find(a => a.id === condition.atomId);
    const operatorMap = {
      equals: 'equals',
      not_equals: 'does not equal',
      greater_than: 'is greater than',
      less_than: 'is less than',
      contains: 'contains',
      in: 'is one of',
      not_in: 'is not one of'
    };
    
    return `${atom?.displayName || condition.atomId} ${operatorMap[condition.operator]} "${condition.value}"`;
  }, [atoms]);

  return (
    <div className="space-y-6">
      {/* Personalization Toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SparklesIcon className="w-6 h-6 text-purple-600" />
              <div>
                <h3 className="text-lg font-medium">Dynamic Personalization</h3>
                <p className="text-sm text-gray-500">
                  Create personalized content based on customer attributes
                </p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={togglePersonalization}
              disabled={readOnly}
              className={`
                relative inline-flex h-8 w-14 items-center rounded-full transition-colors
                ${personalization.enabled ? 'bg-purple-600' : 'bg-gray-200'}
                ${readOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <span
                className={`
                  inline-block h-6 w-6 transform rounded-full bg-white transition-transform
                  ${personalization.enabled ? 'translate-x-7' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
        </CardHeader>

        {personalization.enabled && (
          <CardBody>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-600">{personalization.rules.length}</div>
                <div className="text-sm text-gray-500">Total Rules</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{enabledRulesCount}</div>
                <div className="text-sm text-gray-500">Active Rules</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{personalization.variables.length}</div>
                <div className="text-sm text-gray-500">Variables</div>
              </div>
            </div>
          </CardBody>
        )}
      </Card>

      {/* Personalization Rules */}
      {personalization.enabled && (
        <>
          {/* Quick Templates */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Quick Start Templates</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {personalizationTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-purple-300 hover:bg-purple-50 transition-colors"
                    onClick={() => !readOnly && addRule(template)}
                  >
                    <h4 className="font-medium text-gray-900 mb-2">{template.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    <div className="text-xs text-purple-600">
                      Click to add this rule
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Rules Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Personalization Rules</h3>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(true)}
                    disabled={personalization.rules.length === 0}
                  >
                    <EyeIcon className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => addRule()}
                    disabled={readOnly}
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Rule
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardBody>
              {personalization.rules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No personalization rules defined</p>
                  <p className="text-sm">Add rules to create dynamic, personalized content</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {personalization.rules
                    .sort((a, b) => a.priority - b.priority)
                    .map((rule, index) => (
                      <motion.div
                        key={rule.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 border rounded-lg transition-all ${
                          rule.enabled 
                            ? 'border-purple-200 bg-purple-50' 
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-500">
                                #{rule.priority}
                              </span>
                              {rule.enabled ? (
                                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                              ) : (
                                <ExclamationTriangleIcon className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900">{rule.name}</div>
                              <div className="text-sm text-gray-600">{rule.description}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                When: {getConditionText(rule.condition)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {/* Priority Controls */}
                            <div className="flex flex-col space-y-1">
                              <button
                                onClick={() => updateRule(rule.id, { priority: Math.max(1, rule.priority - 1) })}
                                disabled={readOnly || rule.priority === 1}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                              >
                                ↑
                              </button>
                              <button
                                onClick={() => updateRule(rule.id, { priority: rule.priority + 1 })}
                                disabled={readOnly || index === personalization.rules.length - 1}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                              >
                                ↓
                              </button>
                            </div>

                            {/* Enable/Disable Toggle */}
                            <button
                              type="button"
                              onClick={() => updateRule(rule.id, { enabled: !rule.enabled })}
                              disabled={readOnly}
                              className={`
                                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                                ${rule.enabled ? 'bg-purple-600' : 'bg-gray-200'}
                                ${readOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                              `}
                            >
                              <span
                                className={`
                                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                  ${rule.enabled ? 'translate-x-6' : 'translate-x-1'}
                                `}
                              />
                            </button>

                            {/* Action Buttons */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingRule(rule);
                                setShowRuleBuilder(true);
                              }}
                              disabled={readOnly}
                            >
                              <AdjustmentsHorizontalIcon className="w-4 h-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeRule(rule.id)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              disabled={readOnly}
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Variables Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Custom Variables</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addVariable()}
                  disabled={readOnly}
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Variable
                </Button>
              </div>
            </CardHeader>

            <CardBody>
              {personalization.variables.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CodeBracketIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No custom variables defined</p>
                  <p className="text-sm">Add variables for advanced personalization</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {personalization.variables.map((variable) => (
                    <div
                      key={variable.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <code className="px-2 py-1 bg-gray-800 text-green-400 text-sm rounded font-mono">
                          {`{{${variable.name}}}`}
                        </code>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900">{variable.displayName}</div>
                          <div className="text-sm text-gray-600">{variable.description}</div>
                          <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                            <span className="capitalize">{variable.type}</span>
                            <span>•</span>
                            <span className="capitalize">{variable.source}</span>
                            <span>•</span>
                            <span>Default: {String(variable.defaultValue)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingVariable(variable);
                            setShowVariableEditor(true);
                          }}
                          disabled={readOnly}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVariable(variable.id)}
                          className="text-red-600 hover:text-red-800"
                          disabled={readOnly}
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </>
      )}

      {/* Rule Builder Modal */}
      <Modal
        isOpen={showRuleBuilder}
        onClose={() => {
          setShowRuleBuilder(false);
          setEditingRule(null);
        }}
        title={editingRule ? 'Edit Personalization Rule' : 'Create Personalization Rule'}
        size="lg"
      >
        <div className="p-6">
          <div className="text-center py-8 text-gray-500">
            <AdjustmentsHorizontalIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Advanced rule builder will be available in Phase 2</p>
            <p className="text-sm mt-2">Configure complex personalization logic with visual editor</p>
          </div>
        </div>
      </Modal>

      {/* Variable Editor Modal */}
      <Modal
        isOpen={showVariableEditor}
        onClose={() => {
          setShowVariableEditor(false);
          setEditingVariable(null);
        }}
        title={editingVariable ? 'Edit Variable' : 'Create Variable'}
        size="md"
      >
        <div className="p-6">
          <div className="text-center py-8 text-gray-500">
            <CodeBracketIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Variable editor will be available in Phase 2</p>
            <p className="text-sm mt-2">Configure custom variables and data sources</p>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Personalization Preview"
        size="lg"
      >
        <div className="p-6">
          <div className="text-center py-8 text-gray-500">
            <EyeIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Personalization preview will be available in Phase 2</p>
            <p className="text-sm mt-2">See how content looks for different customer segments</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PersonalizationRules;