// src/components/business/moments/MomentBuilder/AudienceBuilder.tsx

import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../../../ui/Card';
import { Button } from '../../../ui/Button';
import { Select } from '../../../ui/Input';

interface AudienceRule {
  id: string;
  atomId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

interface AudienceBuilderProps {
  rules: AudienceRule[];
  onChange: (rules: AudienceRule[]) => void;
  availableAtoms: any[];
  readOnly?: boolean;
}

export const AudienceBuilder: React.FC<AudienceBuilderProps> = ({
  rules,
  onChange,
  availableAtoms,
  readOnly = false
}) => {
  const [selectedAtom, setSelectedAtom] = useState<string>('');

  const addRule = () => {
    if (!selectedAtom) return;

    const newRule: AudienceRule = {
      id: `rule-${Date.now()}`,
      atomId: selectedAtom,
      operator: 'equals',
      value: ''
    };

    onChange([...rules, newRule]);
    setSelectedAtom('');
  };

  const updateRule = (ruleId: string, updates: Partial<AudienceRule>) => {
    onChange(
      rules.map(rule => 
        rule.id === ruleId ? { ...rule, ...updates } : rule
      )
    );
  };

  const removeRule = (ruleId: string) => {
    onChange(rules.filter(rule => rule.id !== ruleId));
  };

  const estimatedAudience = Math.floor(Math.random() * 50000) + 10000;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Audience Builder</h3>
          <div className="text-sm text-gray-600">
            Estimated reach: ~{estimatedAudience.toLocaleString()}
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          {/* Add Rule Interface */}
          <div className="flex space-x-2">
            <Select
              value={selectedAtom}
              onChange={(e) => setSelectedAtom(e.target.value)}
              disabled={readOnly}
              className="flex-1"
            >
              <option value="">Select an atom...</option>
              {availableAtoms.map(atom => (
                <option key={atom.id} value={atom.id}>
                  {atom.name} ({atom.type})
                </option>
              ))}
            </Select>
            <Button
              onClick={addRule}
              disabled={!selectedAtom || readOnly}
              size="sm"
            >
              Add Rule
            </Button>
          </div>

          {/* Rules List */}
          {rules.length > 0 && (
            <div className="space-y-2">
              {rules.map((rule, index) => {
                const atom = availableAtoms.find(a => a.id === rule.atomId);
                return (
                  <div key={rule.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                    {index > 0 && (
                      <span className="text-sm font-medium text-gray-500">AND</span>
                    )}
                    <div className="flex-1">
                      <span className="font-medium">{atom?.name || 'Unknown Atom'}</span>
                      <Select
                        value={rule.operator}
                        onChange={(e) => updateRule(rule.id, { operator: e.target.value as any })}
                        disabled={readOnly}
                        className="mx-2"
                      >
                        <option value="equals">equals</option>
                        <option value="not_equals">does not equal</option>
                        <option value="contains">contains</option>
                        <option value="greater_than">is greater than</option>
                        <option value="less_than">is less than</option>
                      </Select>
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
                );
              })}
            </div>
          )}

          {rules.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No audience rules defined.</p>
              <p className="text-sm">Add rules above to target specific customer segments.</p>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};