// src/pages/integrations/DataMappingPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  ArrowRightIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  DocumentTextIcon,
  TableCellsIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

interface FieldMapping {
  id: string;
  sourceField: string;
  targetField: string;
  transformation?: string;
  isRequired: boolean;
  dataType: 'string' | 'number' | 'date' | 'boolean' | 'object';
}

interface DataSchema {
  name: string;
  fields: SchemaField[];
}

interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'object';
  required: boolean;
  description?: string;
  sample?: string;
}

const mockSourceSchema: DataSchema = {
  name: 'Salesforce Contacts',
  fields: [
    { name: 'Id', type: 'string', required: true, description: 'Unique identifier', sample: '003xx000004TmiQAAS' },
    { name: 'FirstName', type: 'string', required: false, description: 'Contact first name', sample: 'John' },
    { name: 'LastName', type: 'string', required: true, description: 'Contact last name', sample: 'Smith' },
    { name: 'Email', type: 'string', required: false, description: 'Email address', sample: 'john.smith@example.com' },
    { name: 'Phone', type: 'string', required: false, description: 'Phone number', sample: '+1-555-123-4567' },
    { name: 'Account.Name', type: 'string', required: false, description: 'Company name', sample: 'Acme Corp' },
    { name: 'LeadSource', type: 'string', required: false, description: 'Lead source', sample: 'Website' },
    { name: 'CreatedDate', type: 'date', required: true, description: 'Creation date', sample: '2024-01-15T10:30:00Z' },
    { name: 'LastModifiedDate', type: 'date', required: true, description: 'Last modified', sample: '2024-01-20T14:22:00Z' }
  ]
};

const mockTargetSchema: DataSchema = {
  name: 'Kairos Customer Profile',
  fields: [
    { name: 'customer_id', type: 'string', required: true, description: 'Unique customer identifier' },
    { name: 'first_name', type: 'string', required: false, description: 'Customer first name' },
    { name: 'last_name', type: 'string', required: true, description: 'Customer last name' },
    { name: 'email_address', type: 'string', required: false, description: 'Primary email address' },
    { name: 'phone_number', type: 'string', required: false, description: 'Primary phone number' },
    { name: 'company_name', type: 'string', required: false, description: 'Associated company' },
    { name: 'acquisition_channel', type: 'string', required: false, description: 'How customer was acquired' },
    { name: 'created_at', type: 'date', required: true, description: 'Account creation timestamp' },
    { name: 'updated_at', type: 'date', required: true, description: 'Last update timestamp' },
    { name: 'lifetime_value', type: 'number', required: false, description: 'Customer lifetime value' },
    { name: 'status', type: 'string', required: true, description: 'Customer status (active, inactive, etc.)' }
  ]
};

const DataMappingPage: React.FC = () => {
  const { integrationId } = useParams<{ integrationId: string }>();
  const navigate = useNavigate();
  const [mappings, setMappings] = useState<FieldMapping[]>([
    {
      id: '1',
      sourceField: 'Id',
      targetField: 'customer_id',
      isRequired: true,
      dataType: 'string'
    },
    {
      id: '2',
      sourceField: 'FirstName',
      targetField: 'first_name',
      isRequired: false,
      dataType: 'string'
    },
    {
      id: '3',
      sourceField: 'LastName',
      targetField: 'last_name',
      isRequired: true,
      dataType: 'string'
    },
    {
      id: '4',
      sourceField: 'Email',
      targetField: 'email_address',
      isRequired: false,
      dataType: 'string'
    }
  ]);
  
  const [selectedView, setSelectedView] = useState<'visual' | 'table' | 'code'>('visual');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addMapping = () => {
    const newMapping: FieldMapping = {
      id: Date.now().toString(),
      sourceField: '',
      targetField: '',
      isRequired: false,
      dataType: 'string'
    };
    setMappings([...mappings, newMapping]);
  };

  const removeMapping = (id: string) => {
    setMappings(mappings.filter(m => m.id !== id));
  };

  const updateMapping = (id: string, updates: Partial<FieldMapping>) => {
    setMappings(mappings.map(m => 
      m.id === id ? { ...m, ...updates } : m
    ));
  };

  const generatePreview = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate mock preview data
    const preview = [
      {
        customer_id: '003xx000004TmiQAAS',
        first_name: 'John',
        last_name: 'Smith',
        email_address: 'john.smith@example.com',
        created_at: '2024-01-15T10:30:00Z'
      },
      {
        customer_id: '003xx000004TmiQBBS',
        first_name: 'Jane',
        last_name: 'Doe',
        email_address: 'jane.doe@example.com',
        created_at: '2024-01-16T11:15:00Z'
      }
    ];
    
    setPreviewData(preview);
    setIsLoading(false);
  };

  const saveMappings = async () => {
    setIsLoading(true);
    
    try {
      // Simulate saving
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate back to integrations
      navigate('/integrations');
    } catch (error) {
      console.error('Failed to save mappings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDataTypeIcon = (type: string) => {
    switch (type) {
      case 'string': return '📝';
      case 'number': return '🔢';
      case 'date': return '📅';
      case 'boolean': return '✅';
      case 'object': return '🏷️';
      default: return '❓';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/integrations')}
                className="flex items-center"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Integrations
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Data Mapping
                </h1>
                <p className="text-gray-600">
                  Configure field mappings for {integrationId || 'your integration'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setSelectedView('visual')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    selectedView === 'visual' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ArrowRightIcon className="h-4 w-4 mr-1 inline" />
                  Visual
                </button>
                <button
                  onClick={() => setSelectedView('table')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    selectedView === 'table' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <TableCellsIcon className="h-4 w-4 mr-1 inline" />
                  Table
                </button>
                <button
                  onClick={() => setSelectedView('code')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    selectedView === 'code' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <CodeBracketIcon className="h-4 w-4 mr-1 inline" />
                  Code
                </button>
              </div>

              <Button onClick={generatePreview} variant="outline" disabled={isLoading}>
                <EyeIcon className="h-4 w-4 mr-2" />
                {isLoading ? 'Generating...' : 'Preview'}
              </Button>

              <Button onClick={saveMappings} variant="primary" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Mappings'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedView === 'visual' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Source Schema */}
            <div>
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium text-gray-900">
                    Source: {mockSourceSchema.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {mockSourceSchema.fields.length} fields available
                  </p>
                </CardHeader>
                <CardBody>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {mockSourceSchema.fields.map((field) => (
                      <div
                        key={field.name}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        draggable
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getDataTypeIcon(field.type)}</span>
                          <div>
                            <span className="font-medium text-gray-900">{field.name}</span>
                            {field.required && (
                              <span className="text-red-500 text-xs ml-1">*</span>
                            )}
                            {field.description && (
                              <p className="text-xs text-gray-500">{field.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Mappings */}
            <div>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Field Mappings</h3>
                    <Button onClick={addMapping} variant="outline" size="sm">
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {mappings.map((mapping) => (
                      <div key={mapping.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">Mapping #{mapping.id}</span>
                          <button
                            onClick={() => removeMapping(mapping.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Source Field
                            </label>
                            <select
                              value={mapping.sourceField}
                              onChange={(e) => updateMapping(mapping.id, { sourceField: e.target.value })}
                              className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select source field...</option>
                              {mockSourceSchema.fields.map((field) => (
                                <option key={field.name} value={field.name}>
                                  {field.name} ({field.type})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex justify-center">
                            <ArrowRightIcon className="h-5 w-5 text-gray-400" />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Target Field
                            </label>
                            <select
                              value={mapping.targetField}
                              onChange={(e) => updateMapping(mapping.id, { targetField: e.target.value })}
                              className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select target field...</option>
                              {mockTargetSchema.fields.map((field) => (
                                <option key={field.name} value={field.name}>
                                  {field.name} ({field.type})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Transformation (Optional)
                            </label>
                            <Input
                              type="text"
                              value={mapping.transformation || ''}
                              onChange={(e) => updateMapping(mapping.id, { transformation: e.target.value })}
                              placeholder="e.g., toLowerCase(), formatDate()"
                              className="text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Target Schema */}
            <div>
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium text-gray-900">
                    Target: {mockTargetSchema.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {mockTargetSchema.fields.length} fields available
                  </p>
                </CardHeader>
                <CardBody>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {mockTargetSchema.fields.map((field) => {
                      const isMapped = mappings.some(m => m.targetField === field.name);
                      
                      return (
                        <div
                          key={field.name}
                          className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                            isMapped 
                              ? 'bg-blue-50 border border-blue-200' 
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getDataTypeIcon(field.type)}</span>
                            <div>
                              <span className={`font-medium ${isMapped ? 'text-blue-900' : 'text-gray-900'}`}>
                                {field.name}
                              </span>
                              {field.required && (
                                <span className="text-red-500 text-xs ml-1">*</span>
                              )}
                              {field.description && (
                                <p className="text-xs text-gray-500">{field.description}</p>
                              )}
                            </div>
                          </div>
                          {isMapped && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        )}

        {selectedView === 'table' && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">Mapping Table</h3>
            </CardHeader>
            <CardBody>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source Field
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Target Field
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transformation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Required
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mappings.map((mapping) => (
                      <tr key={mapping.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {mapping.sourceField || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {mapping.targetField || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="flex items-center">
                            {getDataTypeIcon(mapping.dataType)}
                            <span className="ml-1">{mapping.dataType}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {mapping.transformation || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {mapping.isRequired ? '✓' : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => removeMapping(mapping.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        )}

        {selectedView === 'code' && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">JSON Configuration</h3>
            </CardHeader>
            <CardBody>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                {JSON.stringify({ mappings }, null, 2)}
              </pre>
            </CardBody>
          </Card>
        )}

        {/* Preview Section */}
        {previewData.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">Data Preview</h3>
              <p className="text-sm text-gray-600">
                Sample of how your data will look after transformation
              </p>
            </CardHeader>
            <CardBody>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(previewData[0] || {}).map((key) => (
                        <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value, cellIndex) => (
                          <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DataMappingPage;