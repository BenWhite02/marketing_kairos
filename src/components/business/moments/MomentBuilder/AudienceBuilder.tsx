// src/components/business/moments/MomentBuilder/AudienceBuilder.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UsersIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
  FunnelIcon,
  ChartBarIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  TagIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../../ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '../../../ui/Card';
import { Input, Select } from '../../../ui/Input';
import { Modal } from '../../../ui/Modal';

// Types
interface AudienceConfig {
  name: string;
  description: string;
  atoms: string[];
  estimatedSize: number;
  rules: AudienceRule[];
}

interface AudienceRule {
  id: string;
  atomId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';
  value: any;
  logicOperator: 'AND' | 'OR';
}

interface AtomInfo {
  id: string;
  name: string;
  displayName: string;
  category: string;
  type: 'demographic' | 'behavioral' | 'transactional' | 'contextual';
  description: string;
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'array';
  accuracy: number;
  usage: number;
  lastUpdated: string;
  possibleValues?: string[];
  constraints?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

interface AudienceBuilderProps {
  audience: AudienceConfig;
  availableAtoms: AtomInfo[];
  onChange: (audience: AudienceConfig) => void;
  readOnly?: boolean;
}

const AudienceBuilder: React.FC<AudienceBuilderProps> = ({
  audience,
  availableAtoms = [],
  onChange,
  readOnly = false
}) => {
  // State Management
  const [showAtomBrowser, setShowAtomBrowser] = useState(false);
  const [showAudiencePreview, setShowAudiencePreview] = useState(false);
  const [atomSearchQuery, setAtomSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAtomType, setSelectedAtomType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'accuracy'>('usage');

  // Mock atoms if none provided
  const mockAtoms: AtomInfo[] = [
    {
      id: 'age_group',
      name: 'age_group',
      displayName: 'Age Group',
      category: 'Demographics',
      type: 'demographic',
      description: 'Customer age group classification',
      dataType: 'string',
      accuracy: 95,
      usage: 1240,
      lastUpdated: '2024-01-15',
      possibleValues: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+']
    },
    {
      id: 'location_country',
      name: 'location_country',
      displayName: 'Country',
      category: 'Demographics',
      type: 'demographic',
      description: 'Customer location country',
      dataType: 'string',
      accuracy: 98,
      usage: 2180,
      lastUpdated: '2024-01-20',
      possibleValues: ['US', 'CA', 'UK', 'AU', 'DE', 'FR', 'JP', 'Other']
    },
    {
      id: 'total_purchases',
      name: 'total_purchases',
      displayName: 'Total Purchases',
      category: 'Purchase Behavior',
      type: 'transactional',
      description: 'Total number of purchases made',
      dataType: 'number',
      accuracy: 99,
      usage: 1890,
      lastUpdated: '2024-01-18',
      constraints: { min: 0, max: 1000 }
    },
    {
      id: 'last_purchase_date',
      name: 'last_purchase_date',
      displayName: 'Last Purchase Date',
      category: 'Purchase Behavior',
      type: 'transactional',
      description: 'Date of customer\'s last purchase',
      dataType: 'date',
      accuracy: 99,
      usage: 1650,
      lastUpdated: '2024-01-19'
    },
    {
      id: 'email_engagement',
      name: 'email_engagement',
      displayName: 'Email Engagement',
      category: 'Engagement',
      type: 'behavioral',
      description: 'Email engagement level',
      dataType: 'string',
      accuracy: 87,
      usage: 980,
      lastUpdated: '2024-01-16',
      possibleValues: ['High', 'Medium', 'Low', 'None']
    },
    {
      id: 'device_type',
      name: 'device_type',
      displayName: 'Primary Device',
      category: 'Technology',
      type: 'contextual',
      description: 'Primary device type used',
      dataType: 'string',
      accuracy: 92,
      usage: 1320,
      lastUpdated: '2024-01-17',
      possibleValues: ['Mobile', 'Desktop', 'Tablet']
    }
  ];

  const atoms = availableAtoms.length > 0 ? availableAtoms : mockAtoms;

  // Event Handlers
  const updateAudience = useCallback((updates: Partial<AudienceConfig>) => {
    onChange({
      ...audience,
      ...updates
    });
  }, [audience, onChange]);

  const addAtom = useCallback((atom: AtomInfo) => {
    if (audience.atoms.includes(atom.id)) return;
    
    const newRule: AudienceRule = {
      id: `rule_${Date.now()}`,
      atomId: atom.id,
      operator: atom.dataType === 'boolean' ? 'equals' : 'equals',
      value: atom.dataType === 'boolean' ? true : '',
      logicOperator: audience.rules.length > 0 ? 'AND' : 'AND'
    };
    
    updateAudience({
      atoms: [...audience.atoms, atom.id],
      rules: [...audience.rules, newRule],
      estimatedSize: calculateEstimatedSize([...audience.rules, newRule])
    });
    
    setShowAtomBrowser(false);
  }, [audience, updateAudience]);

  const removeAtom = useCallback((atomId: string) => {
    updateAudience({
      atoms: audience.atoms.filter(id => id !== atomId),
      rules: audience.rules.filter(rule => rule.atomId !== atomId),
      estimatedSize: calculateEstimatedSize(audience.rules.filter(rule => rule.atomId !== atomId))
    });
  }, [audience, updateAudience]);

  const updateRule = useCallback((ruleId: string, updates: Partial<AudienceRule>) => {
    const updatedRules = audience.rules.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    );
    
    updateAudience({
      rules: updatedRules,
      estimatedSize: calculateEstimatedSize(updatedRules)
    });
  }, [audience.rules, updateAudience]);

  const calculateEstimatedSize = useCallback((rules: AudienceRule[]): number => {
    // Mock calculation - in real app, this would call an API
    let baseSize = 100000; // Base audience size
    
    rules.forEach(rule => {
      // Apply filters to reduce audience size
      switch (rule.operator) {
        case 'equals':
          baseSize *= 0.6; // Reduce by 40%
          break;
        case 'greater_than':
        case 'less_than':
          baseSize *= 0.7; // Reduce by 30%
          break;
        case 'between':
          baseSize *= 0.5; // Reduce by 50%
          break;
        case 'in':
          baseSize *= 0.8; // Reduce by 20%
          break;
        case 'contains':
          baseSize *= 0.4; // Reduce by 60%
          break;
        default:
          baseSize *= 0.8;
      }
    });
    
    return Math.max(Math.round(baseSize), 100); // Minimum 100 people
  }, []);

  // Computed values
  const filteredAtoms = useMemo(() => {
    return atoms.filter(atom => {
      const matchesSearch = atom.displayName.toLowerCase().includes(atomSearchQuery.toLowerCase()) ||
                           atom.description.toLowerCase().includes(atomSearchQuery.toLowerCase()) ||
                           atom.category.toLowerCase().includes(atomSearchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || atom.category === selectedCategory;
      const matchesType = selectedAtomType === 'all' || atom.type === selectedAtomType;
      
      return matchesSearch && matchesCategory && matchesType;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.displayName.localeCompare(b.displayName);
        case 'usage':
          return b.usage - a.usage;
        case 'accuracy':
          return b.accuracy - a.accuracy;
        default:
          return 0;
      }
    });
  }, [atoms, atomSearchQuery, selectedCategory, selectedAtomType, sortBy]);

  const categories = useMemo(() => {
    const cats = new Set(atoms.map(atom => atom.category));
    return Array.from(cats).sort();
  }, [atoms]);

  const selectedAtoms = useMemo(() => {
    return audience.atoms.map(atomId => atoms.find(atom => atom.id === atomId)).filter(Boolean) as AtomInfo[];
  }, [audience.atoms, atoms]);

  const getOperatorOptions = useCallback((dataType: string) => {
    switch (dataType) {
      case 'string':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'not_equals', label: 'Not Equals' },
          { value: 'contains', label: 'Contains' },
          { value: 'in', label: 'Is One Of' },
          { value: 'not_in', label: 'Is Not One Of' }
        ];
      case 'number':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'not_equals', label: 'Not Equals' },
          { value: 'greater_than', label: 'Greater Than' },
          { value: 'less_than', label: 'Less Than' },
          { value: 'between', label: 'Between' }
        ];
      case 'boolean':
        return [
          { value: 'equals', label: 'Is' }
        ];
      case 'date':
        return [
          { value: 'equals', label: 'On Date' },
          { value: 'greater_than', label: 'After' },
          { value: 'less_than', label: 'Before' },
          { value: 'between', label: 'Between Dates' }
        ];
      case 'array':
        return [
          { value: 'contains', label: 'Contains' },
          { value: 'in', label: 'Contains Any Of' }
        ];
      default:
        return [{ value: 'equals', label: 'Equals' }];
    }
  }, []);

  const getTypeColor = useCallback((type: string) => {
    switch (type) {
      case 'demographic': return 'bg-blue-100 text-blue-800';
      case 'behavioral': return 'bg-green-100 text-green-800';
      case 'transactional': return 'bg-purple-100 text-purple-800';
      case 'contextual': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Audience Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Audience Configuration</h3>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Estimated reach: <span className="font-semibold text-indigo-600">
                  {audience.estimatedSize.toLocaleString()}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAudiencePreview(true)}
                disabled={audience.atoms.length === 0}
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Audience Name"
              value={audience.name}
              onChange={(e) => updateAudience({ name: e.target.value })}
              placeholder="Enter audience name"
              disabled={readOnly}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={audience.description}
                onChange={(e) => updateAudience({ description: e.target.value })}
                placeholder="Describe this audience"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                rows={3}
                disabled={readOnly}
              />
            </div>
          </div>

          {/* Audience Metrics */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{audience.atoms.length}</div>
              <div className="text-sm text-gray-500">Atoms Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{audience.estimatedSize.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Estimated Reach</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {audience.estimatedSize > 1000 ? 'Good' : audience.estimatedSize > 100 ? 'Fair' : 'Small'}
              </div>
              <div className="text-sm text-gray-500">Audience Size</div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Selected Atoms & Rules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Targeting Rules</h3>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAtomBrowser(true)}
              disabled={readOnly}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Atom
            </Button>
          </div>
        </CardHeader>
        
        <CardBody>
          {audience.atoms.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UsersIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No targeting rules defined</p>
              <p className="text-sm">Add atoms to start building your audience</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowAtomBrowser(true)}
                disabled={readOnly}
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Your First Atom
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {audience.rules.map((rule, index) => {
                const atom = atoms.find(a => a.id === rule.atomId);
                if (!atom) return null;
                
                const operatorOptions = getOperatorOptions(atom.dataType);
                
                return (
                  <motion.div
                    key={rule.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    {/* Logic Operator */}
                    {index > 0 && (
                      <Select
                        value={rule.logicOperator}
                        onChange={(e) => updateRule(rule.id, { logicOperator: e.target.value as 'AND' | 'OR' })}
                        className="w-20"
                        disabled={readOnly}
                      >
                        <option value="AND">AND</option>
                        <option value="OR">OR</option>
                      </Select>
                    )}
                    
                    {/* Atom Info */}
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(atom.type)}`}>
                        {atom.type}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900">{atom.displayName}</div>
                        <div className="text-sm text-gray-500 truncate">{atom.description}</div>
                      </div>
                    </div>
                    
                    {/* Operator */}
                    <Select
                      value={rule.operator}
                      onChange={(e) => updateRule(rule.id, { operator: e.target.value as any })}
                      className="w-32"
                      disabled={readOnly}
                    >
                      {operatorOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </Select>
                    
                    {/* Value Input */}
                    <div className="w-40">
                      {atom.dataType === 'boolean' ? (
                        <Select
                          value={rule.value.toString()}
                          onChange={(e) => updateRule(rule.id, { value: e.target.value === 'true' })}
                          disabled={readOnly}
                        >
                          <option value="true">True</option>
                          <option value="false">False</option>
                        </Select>
                      ) : atom.possibleValues ? (
                        <Select
                          value={rule.value}
                          onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                          disabled={readOnly}
                        >
                          <option value="">Select value</option>
                          {atom.possibleValues.map(value => (
                            <option key={value} value={value}>{value}</option>
                          ))}
                        </Select>
                      ) : (
                        <Input
                          type={atom.dataType === 'number' ? 'number' : atom.dataType === 'date' ? 'date' : 'text'}
                          value={rule.value}
                          onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                          placeholder="Enter value"
                          disabled={readOnly}
                        />
                      )}
                    </div>
                    
                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAtom(atom.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      disabled={readOnly}
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Atom Browser Modal */}
      <Modal
        isOpen={showAtomBrowser}
        onClose={() => setShowAtomBrowser(false)}
        title="Select Atoms"
        size="lg"
      >
        <div className="p-6">
          {/* Search and Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search atoms..."
                value={atomSearchQuery}
                onChange={(e) => setAtomSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-40"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </Select>
            
            <Select
              value={selectedAtomType}
              onChange={(e) => setSelectedAtomType(e.target.value)}
              className="w-40"
            >
              <option value="all">All Types</option>
              <option value="demographic">Demographic</option>
              <option value="behavioral">Behavioral</option>
              <option value="transactional">Transactional</option>
              <option value="contextual">Contextual</option>
            </Select>
            
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-32"
            >
              <option value="usage">Usage</option>
              <option value="accuracy">Accuracy</option>
              <option value="name">Name</option>
            </Select>
          </div>

          {/* Atoms List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredAtoms.map((atom) => {
              const isSelected = audience.atoms.includes(atom.id);
              
              return (
                <div
                  key={atom.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-indigo-300 bg-indigo-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => !isSelected && addAtom(atom)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(atom.type)}`}>
                        {atom.type}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{atom.displayName}</span>
                          {isSelected && <CheckCircleIcon className="w-4 h-4 text-green-500" />}
                        </div>
                        <p className="text-sm text-gray-500 truncate">{atom.description}</p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                          <span>Category: {atom.category}</span>
                          <span>Accuracy: {atom.accuracy}%</span>
                          <span>Usage: {atom.usage}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{atom.accuracy}%</div>
                        <div className="text-xs text-gray-500">Accuracy</div>
                      </div>
                      
                      {!isSelected && (
                        <Button variant="primary" size="sm">
                          Add
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredAtoms.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FunnelIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No atoms match your search criteria</p>
              <p className="text-sm mt-2">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Audience Preview Modal */}
      <Modal
        isOpen={showAudiencePreview}
        onClose={() => setShowAudiencePreview(false)}
        title="Audience Preview"
        size="md"
      >
        <div className="p-6">
          <div className="text-center py-8 text-gray-500">
            <ChartBarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Audience preview will be available in Phase 2</p>
            <p className="text-sm mt-2">View detailed audience analytics and insights</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AudienceBuilder;