// src/components/business/atoms/AtomComposer/AtomPalette.tsx

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  ShoppingCartIcon,
  ClockIcon,
  DevicePhoneMobileIcon,
  ChevronDownIcon,
  PlusIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { classNames } from '../../../utils/dom/classNames';

interface AtomTemplate {
  id: string;
  name: string;
  type: 'demographic' | 'behavioral' | 'transactional' | 'contextual';
  category: string;
  data: Record<string, any>;
  accuracy: number;
  usage: number;
  description?: string;
  tags?: string[];
  isPopular?: boolean;
  isFavorite?: boolean;
}

interface AtomPaletteProps {
  atoms: AtomTemplate[];
  onAtomSelect: (atom: AtomTemplate) => void;
  readOnly?: boolean;
  className?: string;
}

const atomTypeConfig = {
  demographic: {
    icon: UserIcon,
    color: 'emerald',
    label: 'Demographic',
    description: 'User characteristics and profile data'
  },
  behavioral: {
    icon: ShoppingCartIcon,
    color: 'blue',
    label: 'Behavioral',
    description: 'User actions and behavior patterns'
  },
  transactional: {
    icon: ClockIcon,
    color: 'purple',
    label: 'Transactional',
    description: 'Purchase and transaction history'
  },
  contextual: {
    icon: DevicePhoneMobileIcon,
    color: 'orange',
    label: 'Contextual',
    description: 'Environmental and contextual factors'
  }
};

export const AtomPalette: React.FC<AtomPaletteProps> = ({
  atoms,
  onAtomSelect,
  readOnly = false,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'accuracy'>('usage');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(atoms.map(atom => atom.category))).sort();
  }, [atoms]);

  // Filter and sort atoms
  const filteredAtoms = useMemo(() => {
    let filtered = atoms.filter(atom => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = atom.name.toLowerCase().includes(query);
        const matchesCategory = atom.category.toLowerCase().includes(query);
        const matchesTags = atom.tags?.some(tag => tag.toLowerCase().includes(query));
        
        if (!matchesName && !matchesCategory && !matchesTags) {
          return false;
        }
      }

      // Type filter
      if (selectedTypes.size > 0 && !selectedTypes.has(atom.type)) {
        return false;
      }

      // Category filter
      if (selectedCategories.size > 0 && !selectedCategories.has(atom.category)) {
        return false;
      }

      return true;
    });

    // Sort atoms
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'accuracy':
          return b.accuracy - a.accuracy;
        case 'usage':
        default:
          return b.usage - a.usage;
      }
    });

    return filtered;
  }, [atoms, searchQuery, selectedTypes, selectedCategories, sortBy]);

  // Group atoms by category
  const groupedAtoms = useMemo(() => {
    const groups: Record<string, AtomTemplate[]> = {};
    
    filteredAtoms.forEach(atom => {
      if (!groups[atom.category]) {
        groups[atom.category] = [];
      }
      groups[atom.category].push(atom);
    });

    return groups;
  }, [filteredAtoms]);

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTypes(new Set());
    setSelectedCategories(new Set());
  };

  const renderAtomCard = (atom: AtomTemplate) => {
    const config = atomTypeConfig[atom.type];
    const IconComponent = config.icon;

    return (
      <motion.div
        key={atom.id}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={classNames(
          'relative p-3 bg-white dark:bg-slate-700 rounded-lg border-2 border-slate-200 dark:border-slate-600 cursor-pointer transition-all duration-200 group',
          !readOnly ? 'hover:border-indigo-300 hover:shadow-md' : 'cursor-default'
        )}
        onClick={() => !readOnly && onAtomSelect(atom)}
      >
        {/* Type Badge */}
        <div className={`absolute -top-1 -right-1 w-5 h-5 bg-${config.color}-500 rounded-full flex items-center justify-center`}>
          <IconComponent className="w-3 h-3 text-white" />
        </div>

        {/* Favorite Star */}
        {atom.isFavorite && (
          <div className="absolute top-1 left-1">
            <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
          </div>
        )}

        {/* Popular Badge */}
        {atom.isPopular && (
          <div className="absolute top-1 right-1">
            <div className="px-1.5 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded">
              HOT
            </div>
          </div>
        )}

        {/* Content */}
        <div className="space-y-2">
          <div>
            <h4 className="font-medium text-slate-900 dark:text-white text-sm leading-tight">
              {atom.name}
            </h4>
            <p className={`text-xs text-${config.color}-600 dark:text-${config.color}-400 mt-0.5`}>
              {config.label}
            </p>
          </div>

          {atom.description && (
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
              {atom.description}
            </p>
          )}

          {/* Metrics */}
          <div className="flex justify-between text-xs">
            <div className="text-center">
              <div className="font-semibold text-slate-900 dark:text-white">
                {atom.accuracy}%
              </div>
              <div className="text-slate-500 dark:text-slate-400">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-slate-900 dark:text-white">
                {atom.usage > 1000 ? `${(atom.usage / 1000).toFixed(1)}K` : atom.usage}
              </div>
              <div className="text-slate-500 dark:text-slate-400">Usage</div>
            </div>
          </div>

          {/* Tags */}
          {atom.tags && atom.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {atom.tags.slice(0, 2).map(tag => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
              {atom.tags.length > 2 && (
                <span className="text-xs text-slate-400">
                  +{atom.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Add Button Overlay */}
        {!readOnly && (
          <div className="absolute inset-0 bg-indigo-500/90 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex items-center text-white font-medium">
              <PlusIcon className="w-5 h-5 mr-1" />
              Add to Canvas
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className={classNames('flex flex-col h-full bg-slate-50 dark:bg-slate-800', className)}>
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Atom Palette
          </h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={classNames(
              'p-2 rounded-lg transition-colors',
              showFilters
                ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            )}
          >
            <FunnelIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search atoms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-3 overflow-hidden"
            >
              {/* Type Filters */}
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Atom Types
                </label>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(atomTypeConfig).map(([type, config]) => (
                    <button
                      key={type}
                      onClick={() => handleTypeToggle(type)}
                      className={classNames(
                        'inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border transition-colors',
                        selectedTypes.has(type)
                          ? `bg-${config.color}-100 dark:bg-${config.color}-900 border-${config.color}-300 dark:border-${config.color}-700 text-${config.color}-700 dark:text-${config.color}-300`
                          : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500'
                      )}
                    >
                      <config.icon className="w-3 h-3 mr-1" />
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filters */}
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Categories
                </label>
                <div className="flex flex-wrap gap-1">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => handleCategoryToggle(category)}
                      className={classNames(
                        'px-2 py-1 text-xs font-medium rounded border transition-colors',
                        selectedCategories.has(category)
                          ? 'bg-indigo-100 dark:bg-indigo-900 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                          : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500'
                      )}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="usage">Usage</option>
                  <option value="accuracy">Accuracy</option>
                  <option value="name">Name</option>
                </select>
              </div>

              {/* Clear Filters */}
              {(searchQuery || selectedTypes.size > 0 || selectedCategories.size > 0) && (
                <button
                  onClick={clearFilters}
                  className="w-full px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Count */}
      <div className="flex-shrink-0 px-4 py-2 text-xs text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
        {filteredAtoms.length} of {atoms.length} atoms
      </div>

      {/* Atom List */}
      <div className="flex-1 overflow-y-auto">
        {Object.keys(groupedAtoms).length === 0 ? (
          <div className="p-4 text-center">
            <div className="text-slate-400 mb-2">
              <MagnifyingGlassIcon className="w-8 h-8 mx-auto" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No atoms match your filters
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {Object.entries(groupedAtoms).map(([category, categoryAtoms]) => (
              <div key={category}>
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 sticky top-0 bg-slate-50 dark:bg-slate-800 py-1">
                  {category}
                  <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                    ({categoryAtoms.length})
                  </span>
                </h4>
                <div className="space-y-2">
                  <AnimatePresence>
                    {categoryAtoms.map(renderAtomCard)}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};