// src/components/business/moments/MomentBuilder/PersonalizationRules.tsx

import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../../../ui/Card';
import { Button } from '../../../ui/Button';
import { Input, Select, TextArea } from '../../../ui/Input';

interface PersonalizationRule {
  id: string;
  field: string;
  condition: string;
  value: any;
  replacement: string;
}

interface PersonalizationRulesProps {
  rules: PersonalizationRule[];
  onChange: (rules: PersonalizationRule[]) => void;
  availableFields: string[];
  readOnly?: boolean;
}

export const PersonalizationRules: React.FC<PersonalizationRulesProps> = ({
  rules,
  onChange,
  availableFields,
  readOnly = false
}) => {
  const [newRule, setNewRule] = useState<Partial<PersonalizationRule>>({
    field: '',
    condition: 'equals',
    value: '',
    replacement: ''
  });

  const addRule = () => {
    if (!newRule.field || !newRule.replacement) return;

    const rule: PersonalizationRule = {
      id: `rule-${Date.now()}`,
      field: newRule.field!,
      condition: newRule.condition!,
      value: newRule.value,
      replacement: newRule.replacement!
    };

    onChange([...rules, rule]);
    setNewRule({ field: '', condition: 'equals', value: '', replacement: '' });
  };

  const updateRule = (ruleId: string, updates: Partial<PersonalizationRule>) => {
    onChange(
      rules.map(rule => 
        rule.id === ruleId ? { ...rule, ...updates } : rule
      )
    );
  };

  const removeRule = (ruleId: string) => {
    onChange(rules.filter(rule => rule.id !== ruleId));
  };

  const commonFields = [
    'firstName',
    'lastName', 
    'email',
    'city',
    'state',
    'country',
    'company',
    'lastPurchaseDate',
    'totalSpent',
    'loyaltyTier'
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Personalization Rules</h3>
          <div className="text-sm text-gray-600">
            {rules.length} rule{rules.length !== 1 ? 's' : ''} active
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-6">
          {/* Available Variables */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Available Variables</h4>
            <div className="flex flex-wrap gap-2">
              {commonFields.map(field => (
                <span
                  key={field}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-mono"
                >
                  {`{{${field}}}`}
                </span>
              ))}
            </div>
            <p className="text-xs text-blue-700 mt-2">
              Use these variables in your content to personalize messages
            </p>
          </div>

          {/* Add New Rule */}
          {!readOnly && (
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-4">Add Personalization Rule</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Field"
                  value={newRule.field || ''}
                  onChange={(e) => setNewRule({ ...newRule, field: e.target.value })}
                >
                  <option value="">Select field...</option>
                  {commonFields.map(field => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </Select>
                
                <Select
                  label="Condition"
                  value={newRule.condition || 'equals'}
                  onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
                >
                  <option value="equals">equals</option>
                  <option value="not_equals">does not equal</option>
                  <option value="contains">contains</option>
                  <option value="greater_than">is greater than</option>
                  <option value="less_than">is less than</option>
                  <option value="is_empty">is empty</option>
                  <option value="is_not_empty">is not empty</option>
                </Select>

                <Input
                  label="Value"
                  value={newRule.value || ''}
                  onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
                  placeholder="Enter comparison value..."
                />

                <Input
                  label="Replacement Text"
                  value={newRule.replacement || ''}
                  onChange={(e) => setNewRule({ ...newRule, replacement: e.target.value })}
                  placeholder="Text to show when condition is met..."
                />
              </div>
              
              <div className="mt-4">
                <Button
                  onClick={addRule}
                  disabled={!newRule.field || !newRule.replacement}
                  size="sm"
                >
                  Add Rule
                </Button>
              </div>
            </div>
          )}

          {/* Existing Rules */}
          {rules.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Active Rules</h4>
              {rules.map((rule, index) => (
                <div key={rule.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm">
                        <span className="font-medium">When</span>{' '}
                        <span className="font-mono bg-gray-100 px-1 rounded">{rule.field}</span>{' '}
                        <span>{rule.condition.replace('_', ' ')}</span>{' '}
                        {rule.value && (
                          <>
                            <span className="font-mono bg-gray-100 px-1 rounded">{rule.value}</span>
                          </>
                        )}
                      </div>
                      <div className="text-sm mt-1">
                        <span className="font-medium">Show:</span>{' '}
                        <span className="font-mono bg-green-100 px-1 rounded">{rule.replacement}</span>
                      </div>
                    </div>
                    {!readOnly && (
                      <Button
                        onClick={() => removeRule(rule.id)}
                        variant="outline"
                        size="sm"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {rules.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No personalization rules defined.</p>
              <p className="text-sm">Add rules above to customize content for different customer segments.</p>
            </div>
          )}

          {/* Example */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Example</h4>
            <div className="text-sm text-gray-600">
              <div className="mb-2">
                <strong>Content:</strong> "Hello {{`{firstName}`}}, {{`{loyaltyMessage}`}}!"
              </div>
              <div className="mb-2">
                <strong>Rule:</strong> When loyaltyTier equals "Gold" → Show "Thanks for being a Gold member"
              </div>
              <div>
                <strong>Result:</strong> "Hello John, Thanks for being a Gold member!"
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};