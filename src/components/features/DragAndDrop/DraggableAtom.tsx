// src/components/features/DragAndDrop/DraggableAtom.tsx

import React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  ShoppingCartIcon, 
  ClockIcon, 
  DevicePhoneMobileIcon,
  XMarkIcon,
  EyeIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { classNames } from '../../../utils/dom/classNames';

interface AtomNode {
  id: string;
  type: 'demographic' | 'behavioral' | 'transactional' | 'contextual';
  name: string;
  position: { x: number; y: number };
  data: Record<string, any>;
}

interface DraggableAtomProps {
  atom: AtomNode;
  isSelected: boolean;
  onClick: (atomId: string, event: React.MouseEvent) => void;
  onDelete: (atomId: string) => void;
  readOnly?: boolean;
}

const atomTypeConfig = {
  demographic: {
    icon: UserIcon,
    color: 'emerald',
    label: 'Demographic',
    description: 'User characteristics'
  },
  behavioral: {
    icon: ShoppingCartIcon,
    color: 'blue',
    label: 'Behavioral',
    description: 'User actions'
  },
  transactional: {
    icon: ClockIcon,
    color: 'purple',
    label: 'Transactional',
    description: 'Purchase data'
  },
  contextual: {
    icon: DevicePhoneMobileIcon,
    color: 'orange',
    label: 'Contextual',
    description: 'Environment'
  }
};

export const DraggableAtom: React.FC<DraggableAtomProps> = ({
  atom,
  isSelected,
  onClick,
  onDelete,
  readOnly = false
}) => {
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
    isDragging,
  } = useDraggable({
    id: atom.id,
    disabled: readOnly,
  });

  const {
    setNodeRef: setDropRef,
    isOver,
  } = useDroppable({
    id: atom.id,
  });

  const config = atomTypeConfig[atom.type];
  const IconComponent = config.icon;

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onClick(atom.id, event);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDelete(atom.id);
  };

  const handleView = (event: React.MouseEvent) => {
    event.stopPropagation();
    // TODO: Open atom detail modal
    console.log('View atom:', atom.id);
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    // TODO: Open atom edit modal
    console.log('Edit atom:', atom.id);
  };

  const setRef = (node: HTMLElement | null) => {
    setDragRef(node);
    setDropRef(node);
  };

  const transformStyle = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <motion.div
      ref={setRef}
      style={transformStyle}
      className={classNames(
        'relative w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border-2 transition-all duration-200 cursor-pointer',
        isSelected ? `border-${config.color}-500 shadow-lg` : 'border-slate-200 dark:border-slate-700',
        isOver && !isDragging ? `border-${config.color}-400 shadow-md` : '',
        isDragging ? 'opacity-50 shadow-2xl scale-105' : '',
        readOnly ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
      )}
      whileHover={!readOnly ? { scale: 1.02 } : {}}
      whileTap={!readOnly ? { scale: 0.98 } : {}}
      onClick={handleClick}
      {...attributes}
      {...listeners}
    >
      {/* Type Badge */}
      <div className={`absolute -top-2 -left-2 w-6 h-6 bg-${config.color}-500 rounded-full flex items-center justify-center shadow-md`}>
        <IconComponent className="w-3 h-3 text-white" />
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <motion.div
          className={`absolute -inset-1 bg-${config.color}-500/20 rounded-lg`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {atom.name}
            </h3>
            <p className={`text-xs text-${config.color}-600 dark:text-${config.color}-400 mt-1`}>
              {config.label}
            </p>
          </div>

          {/* Actions */}
          {!readOnly && (
            <div className="flex items-center space-x-1 ml-2">
              <button
                onClick={handleView}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                title="View details"
              >
                <EyeIcon className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleEdit}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                title="Edit atom"
              >
                <Cog6ToothIcon className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleDelete}
                className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                title="Delete atom"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Data Preview */}
        <div className="space-y-2">
          {Object.entries(atom.data).slice(0, 2).map(([key, value]) => (
            <div key={key} className="flex justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}:
              </span>
              <span className="text-slate-700 dark:text-slate-300 font-medium truncate ml-1">
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </span>
            </div>
          ))}
          
          {Object.keys(atom.data).length > 2 && (
            <div className="text-xs text-slate-400 dark:text-slate-500">
              +{Object.keys(atom.data).length - 2} more
            </div>
          )}
        </div>

        {/* Metrics */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
          <div className="flex justify-between text-xs">
            <div className="text-center">
              <div className="font-semibold text-slate-900 dark:text-white">
                {Math.floor(Math.random() * 100)}%
              </div>
              <div className="text-slate-500 dark:text-slate-400">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-slate-900 dark:text-white">
                {(Math.random() * 10).toFixed(1)}K
              </div>
              <div className="text-slate-500 dark:text-slate-400">Usage</div>
            </div>
            <div className="text-center">
              <div className={`font-semibold text-${config.color}-600 dark:text-${config.color}-400`}>
                {(Math.random() * 5 + 1).toFixed(1)}x
              </div>
              <div className="text-slate-500 dark:text-slate-400">Impact</div>
            </div>
          </div>
        </div>
      </div>

      {/* Drag Handle */}
      {!readOnly && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex space-x-0.5">
            <div className="w-1 h-1 bg-slate-400 rounded-full" />
            <div className="w-1 h-1 bg-slate-400 rounded-full" />
            <div className="w-1 h-1 bg-slate-400 rounded-full" />
          </div>
        </div>
      )}

      {/* Connection Points */}
      <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
        <div className={`w-4 h-4 bg-${config.color}-500 rounded-full border-2 border-white dark:border-slate-800 shadow-sm`} />
      </div>
      <div className="absolute -left-2 top-1/2 transform -translate-y-1/2">
        <div className={`w-4 h-4 bg-${config.color}-500 rounded-full border-2 border-white dark:border-slate-800 shadow-sm`} />
      </div>
    </motion.div>
  );
};