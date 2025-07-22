// src/pages/atoms/AtomsPage.tsx
import React, { useState, useMemo } from 'react';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  FunnelIcon,
  EllipsisVerticalIcon,
  ChevronDownIcon,
  DocumentArrowDownIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  DocumentDuplicateIcon  // âœ… FIXED: Changed from DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Modal, ConfirmModal } from '../../components/ui/Modal';
import { AtomCard } from '../../components/business/atoms/AtomCard';

// Mock data structure
interface Atom {
  id: string;
  name: string;
  description: string;
  type: 'demographic' | 'behavioral' | 'transactional' | 'contextual';
  category: string;
  status: 'active' | 'draft' | 'paused' | 'archived';
  usage: number;
  accuracy: number;
  lastModified: string;
  createdBy: string;
  tags: string[];
  conditions: number;
  performance: {
    impressions: number;
    conversions: number;
    conversionRate: number;
  };
  trend?: 'up' | 'down' | 'stable'; // Added for AtomCard compatibility
}

// Mock atoms data
const mockAtoms: Atom[] = [
  {
    id: 'atom-001',
    name: 'High-Value Customer',
    description: 'Customers with lifetime value > $10,000',
    type: 'behavioral',
    category: 'Customer Segmentation',
    status: 'active',
    usage: 156,
    accuracy: 94.2,
    lastModified: '2025-07-20',
    createdBy: 'Sarah Chen',
    tags: ['high-value', 'loyalty', 'retention'],
    conditions: 8,
    performance: {
      impressions: 45678,
      conversions: 3421,
      conversionRate: 7.5
    },
    trend: 'up'
  },
  {
    id: 'atom-002',
    name: 'Cart Abandoner',
    description: 'Users who abandoned cart in last 24 hours',
    type: 'behavioral',
    category: 'Purchase Behavior',
    status: 'active',
    usage: 203,
    accuracy: 89.7,
    lastModified: '2025-07-19',
    createdBy: 'Mike Rodriguez',
    tags: ['cart', 'abandonment', 'recovery'],
    conditions: 5,
    performance: {
      impressions: 23456,
      conversions: 1876,
      conversionRate: 8.0
    },
    trend: 'stable'
  },
  {
    id: 'atom-003',
    name: 'New Mobile User',
    description: 'First-time users on mobile platforms',
    type: 'demographic',
    category: 'User Acquisition',
    status: 'draft',
    usage: 87,
    accuracy: 96.1,
    lastModified: '2025-07-18',
    createdBy: 'Alex Thompson',
    tags: ['mobile', 'new-user', 'onboarding'],
    conditions: 3,
    performance: {
      impressions: 12345,
      conversions: 987,
      conversionRate: 8.0
    },
    trend: 'up'
  },
  {
    id: 'atom-004',
    name: 'Premium Product Interest',
    description: 'Users showing interest in premium products',
    type: 'transactional',
    category: 'Product Affinity',
    status: 'active',
    usage: 124,
    accuracy: 91.8,
    lastModified: '2025-07-17',
    createdBy: 'Emma Davis',
    tags: ['premium', 'product', 'upsell'],
    conditions: 6,
    performance: {
      impressions: 34567,
      conversions: 2456,
      conversionRate: 7.1
    },
    trend: 'down'
  },
  {
    id: 'atom-005',
    name: 'Weekend Shopper',
    description: 'Customers who primarily shop on weekends',
    type: 'contextual',
    category: 'Timing Patterns',
    status: 'paused',
    usage: 92,
    accuracy: 87.3,
    lastModified: '2025-07-16',
    createdBy: 'David Kim',
    tags: ['weekend', 'timing', 'schedule'],
    conditions: 4,
    performance: {
      impressions: 18234,
      conversions: 1345,
      conversionRate: 7.4
    },
    trend: 'stable'
  },
  {
    id: 'atom-006',
    name: 'Email Engaged',
    description: 'Users with high email engagement rates',
    type: 'behavioral',
    category: 'Channel Preference',
    status: 'active',
    usage: 178,
    accuracy: 93.5,
    lastModified: '2025-07-15',
    createdBy: 'Lisa Zhang',
    tags: ['email', 'engagement', 'channel'],
    conditions: 7,
    performance: {
      impressions: 56789,
      conversions: 4123,
      conversionRate: 7.3
    },
    trend: 'up'
  }
];

const AtomsPage: React.FC = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'accuracy' | 'lastModified'>('usage');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedAtoms, setSelectedAtoms] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Derived data
  const filteredAtoms = useMemo(() => {
    return mockAtoms
      .filter(atom => {
        const matchesSearch = atom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            atom.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            atom.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = selectedType === 'all' || atom.type === selectedType;
        const matchesStatus = selectedStatus === 'all' || atom.status === selectedStatus;
        const matchesCategory = selectedCategory === 'all' || atom.category === selectedCategory;
        
        return matchesSearch && matchesType && matchesStatus && matchesCategory;
      })
      .sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
          case 'name':
            aValue = a.name;
            bValue = b.name;
            break;
          case 'usage':
            aValue = a.usage;
            bValue = b.usage;
            break;
          case 'accuracy':
            aValue = a.accuracy;
            bValue = b.accuracy;
            break;
          case 'lastModified':
            aValue = new Date(a.lastModified).getTime();
            bValue = new Date(b.lastModified).getTime();
            break;
          default:
            return 0;
        }
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
  }, [searchTerm, selectedType, selectedStatus, selectedCategory, sortBy, sortOrder]);

  // Get unique values for filters
  const uniqueTypes = [...new Set(mockAtoms.map(atom => atom.type))];
  const uniqueStatuses = [...new Set(mockAtoms.map(atom => atom.status))];
  const uniqueCategories = [...new Set(mockAtoms.map(atom => atom.category))];

  // Handlers
  const handleAtomSelect = (atomId: string) => {
    setSelectedAtoms(prev => 
      prev.includes(atomId) 
        ? prev.filter(id => id !== atomId)
        : [...prev, atomId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAtoms.length === filteredAtoms.length) {
      setSelectedAtoms([]);
    } else {
      setSelectedAtoms(filteredAtoms.map(atom => atom.id));
    }
  };

  const handleBulkDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmBulkDelete = () => {
    // In real app, this would call the API
    console.log('Deleting atoms:', selectedAtoms);
    setSelectedAtoms([]);
    setShowDeleteConfirm(false);
    setShowBulkActions(false);
  };

  const handleExport = () => {
    // In real app, this would trigger export
    console.log('Exporting atoms:', selectedAtoms.length > 0 ? selectedAtoms : 'all');
  };

  const handleCreateAtom = () => {
    setShowCreateModal(true);
  };

  const handleAtomEdit = (atom: Atom) => {
    console.log('Editing atom:', atom);
  };

  const handleAtomTest = (atom: Atom) => {
    console.log('Testing atom:', atom);
  };

  const handleAtomDuplicate = (atom: Atom) => {
    console.log('Duplicating atom:', atom);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Eligibility Atoms</h1>
            <p className="text-slate-600 mt-1">
              Manage and optimize your customer eligibility rules
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="flex items-center gap-2"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              Export
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateAtom}
              className="flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Create Atom
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-6 flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search atoms by name, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-3">
            <Button
              variant={showFilters ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <FunnelIcon className="h-4 w-4" />
              Filters
              {showFilters && <span className="ml-1 bg-white text-slate-600 px-1.5 py-0.5 rounded text-xs">
                {[selectedType, selectedStatus, selectedCategory].filter(f => f !== 'all').length}
              </span>}
            </Button>

            {/* View Mode Toggle */}
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 border-t border-slate-200 pt-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">All Types</option>
                  {uniqueTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">All Statuses</option>
                  {uniqueStatuses.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">All Categories</option>
                  {uniqueCategories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sort By</label>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="usage">Usage</option>
                    <option value="accuracy">Accuracy</option>
                    <option value="name">Name</option>
                    <option value="lastModified">Modified</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                  >
                    <ChevronDownIcon className={`h-4 w-4 transition-transform ${
                      sortOrder === 'asc' ? 'rotate-180' : ''
                    }`} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedAtoms.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-50 border-b border-emerald-200 px-6 py-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-emerald-800">
                  {selectedAtoms.length} atom{selectedAtoms.length !== 1 ? 's' : ''} selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAtoms([])}
                  className="text-emerald-700 hover:text-emerald-800"
                >
                  Clear selection
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="flex items-center gap-2"
                >
                  <EllipsisVerticalIcon className="h-4 w-4" />
                  Actions
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Summary */}
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing {filteredAtoms.length} of {mockAtoms.length} atoms
          </p>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={selectedAtoms.length === filteredAtoms.length && filteredAtoms.length > 0}
                onChange={handleSelectAll}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              Select all visible
            </label>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {filteredAtoms.map((atom) => (
                <motion.div
                  key={atom.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative"
                >
                  <input
                    type="checkbox"
                    checked={selectedAtoms.includes(atom.id)}
                    onChange={() => handleAtomSelect(atom.id)}
                    className="absolute top-4 right-4 z-10 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <AtomCard
                    atom={{
                      id: atom.id,
                      name: atom.name,
                      description: atom.description,
                      type: atom.type,
                      category: atom.category,
                      conditions: atom.conditions,
                      accuracy: atom.accuracy,
                      usage: atom.usage,
                      performance: atom.performance,
                      status: atom.status,
                      tags: atom.tags,
                      createdAt: atom.lastModified,
                      updatedAt: atom.lastModified,
                      trend: atom.trend || 'stable'
                    }}
                    variant="default"
                    isSelected={selectedAtoms.includes(atom.id)}
                    onSelect={() => handleAtomSelect(atom.id)}
                    onEdit={handleAtomEdit}
                    onTest={handleAtomTest}
                    onDuplicate={handleAtomDuplicate}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="w-12 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedAtoms.length === filteredAtoms.length && filteredAtoms.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Name</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Type</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Status</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Usage</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Accuracy</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Modified</th>
                      <th className="w-16 px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredAtoms.map((atom) => (
                      <motion.tr
                        key={atom.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedAtoms.includes(atom.id)}
                            onChange={() => handleAtomSelect(atom.id)}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <div className="font-medium text-slate-900">{atom.name}</div>
                            <div className="text-sm text-slate-500 truncate max-w-xs">{atom.description}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            atom.type === 'demographic' ? 'bg-blue-100 text-blue-800' :
                            atom.type === 'behavioral' ? 'bg-purple-100 text-purple-800' :
                            atom.type === 'transactional' ? 'bg-green-100 text-green-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {atom.type}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            atom.status === 'active' ? 'bg-green-100 text-green-800' :
                            atom.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            atom.status === 'paused' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {atom.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-900">{atom.usage}</td>
                        <td className="px-4 py-4 text-sm text-slate-900">{atom.accuracy}%</td>
                        <td className="px-4 py-4 text-sm text-slate-500">{atom.lastModified}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {filteredAtoms.length === 0 && (
            <div className="text-center py-12">
              <div className="text-slate-400 text-6xl mb-4">âš›ï¸</div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No atoms found</h3>
              <p className="text-slate-500 mb-6">
                {searchTerm || selectedType !== 'all' || selectedStatus !== 'all' || selectedCategory !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'Get started by creating your first eligibility atom.'}
              </p>
              <Button variant="primary" onClick={handleCreateAtom}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Create First Atom
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Create Atom Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Atom"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Atom Name
            </label>
            <Input
              type="text"
              placeholder="Enter a descriptive name for your atom..."
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <Input
              type="text"
              placeholder="Describe what this atom identifies..."
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Type
              </label>
              <select className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                <option value="demographic">Demographic</option>
                <option value="behavioral">Behavioral</option>
                <option value="transactional">Transactional</option>
                <option value="contextual">Contextual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category
              </label>
              <select className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                <option value="Customer Segmentation">Customer Segmentation</option>
                <option value="Purchase Behavior">Purchase Behavior</option>
                <option value="User Acquisition">User Acquisition</option>
                <option value="Product Affinity">Product Affinity</option>
                <option value="Timing Patterns">Timing Patterns</option>
                <option value="Channel Preference">Channel Preference</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                // In real app, this would create the atom
                console.log('Creating atom...');
                setShowCreateModal(false);
              }}
            >
              Create Atom
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmBulkDelete}
        title="Delete Selected Atoms"
        message={`Are you sure you want to delete ${selectedAtoms.length} atom${selectedAtoms.length !== 1 ? 's' : ''}? This action cannot be undone.`}
        type="danger"
      />
    </div>
  );
};

export default AtomsPage;
