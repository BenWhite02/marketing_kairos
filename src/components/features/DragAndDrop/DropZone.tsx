// src/components/features/DragAndDrop/DropZone.tsx

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon } from '@heroicons/react/24/outline';
import { classNames } from '../../../utils/dom/classNames';

interface DropZoneProps {
  className?: string;
  onDrop?: (data: any) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({
  className = '',
  onDrop
}) => {
  const {
    setNodeRef,
    isOver,
    active,
  } = useDroppable({
    id: 'canvas-drop-zone',
  });

  const isDragging = !!active;
  const isValidDrop = isOver && isDragging;

  return (
    <div
      ref={setNodeRef}
      className={classNames(
        'pointer-events-none transition-all duration-300',
        className
      )}
    >
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Drop Indicator Overlay */}
            <div
              className={classNames(
                'absolute inset-0 border-2 border-dashed rounded-lg transition-all duration-200',
                isValidDrop
                  ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20'
                  : 'border-slate-300 dark:border-slate-600 bg-slate-50/30 dark:bg-slate-800/30'
              )}
            />

            {/* Drop Message */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className={classNames(
                  'flex flex-col items-center p-6 rounded-lg backdrop-blur-sm transition-all duration-200',
                  isValidDrop
                    ? 'bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200'
                    : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300'
                )}
              >
                <motion.div
                  animate={isValidDrop ? { rotate: 180 } : { rotate: 0 }}
                  transition={{ duration: 0.3 }}
                  className={classNames(
                    'w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors duration-200',
                    isValidDrop
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  )}
                >
                  <PlusIcon className="w-6 h-6" />
                </motion.div>
                
                <div className="text-center">
                  <h3 className="font-semibold mb-1">
                    {isValidDrop ? 'Drop to Add Atom' : 'Drag Atoms Here'}
                  </h3>
                  <p className="text-sm opacity-80">
                    {isValidDrop
                      ? 'Release to place atom on canvas'
                      : 'Create visual compositions by dragging atoms'
                    }
                  </p>
                </div>

                {/* Animated Rings */}
                {isValidDrop && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute border-2 border-emerald-400 rounded-full"
                        initial={{ width: 48, height: 48, opacity: 0.8 }}
                        animate={{
                          width: 48 + (i + 1) * 40,
                          height: 48 + (i + 1) * 40,
                          opacity: 0,
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.3,
                          ease: "easeOut",
                        }}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid Guidelines */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            <svg width="100%" height="100%" className="absolute inset-0">
              <defs>
                <pattern
                  id="drop-grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke={isValidDrop ? "#10b981" : "#94a3b8"}
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#drop-grid)" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Corner Guides */}
      {isDragging && (
        <div className="absolute inset-4 pointer-events-none">
          {/* Corner indicators */}
          {[
            { position: 'top-left', className: 'top-0 left-0' },
            { position: 'top-right', className: 'top-0 right-0' },
            { position: 'bottom-left', className: 'bottom-0 left-0' },
            { position: 'bottom-right', className: 'bottom-0 right-0' },
          ].map(({ position, className }) => (
            <motion.div
              key={position}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.6 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: 0.1 }}
              className={classNames(
                'absolute w-6 h-6 border-2 transition-colors duration-200',
                className,
                isValidDrop
                  ? 'border-emerald-400'
                  : 'border-slate-300 dark:border-slate-600'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};