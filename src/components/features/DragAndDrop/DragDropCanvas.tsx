// src/components/features/DragAndDrop/DragDropCanvas.tsx

import React, { useState, useCallback, useRef } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  rectIntersection,
} from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { DropZone } from './DropZone';
import { DraggableAtom } from './DraggableAtom';

interface AtomNode {
  id: string;
  type: 'demographic' | 'behavioral' | 'transactional' | 'contextual';
  name: string;
  position: { x: number; y: number };
  data: Record<string, any>;
}

interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'AND' | 'OR' | 'NOT';
}

interface DragDropCanvasProps {
  atoms: AtomNode[];
  connections: Connection[];
  onAtomsChange: (atoms: AtomNode[]) => void;
  onConnectionsChange: (connections: Connection[]) => void;
  onAtomSelect: (atomId: string | null) => void;
  selectedAtomId?: string | null;
  readOnly?: boolean;
  className?: string;
}

export const DragDropCanvas: React.FC<DragDropCanvasProps> = ({
  atoms,
  connections,
  onAtomsChange,
  onConnectionsChange,
  onAtomSelect,
  selectedAtomId,
  readOnly = false,
  className = '',
}) => {
  const [activeAtom, setActiveAtom] = useState<AtomNode | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const atomId = event.active.id as string;
    const atom = atoms.find(a => a.id === atomId);
    if (atom) {
      setActiveAtom(atom);
      // Calculate drag offset for smooth dragging
      const rect = event.active.rect.current.translated;
      if (rect) {
        setDragOffset({
          x: event.activatorEvent?.clientX ? event.activatorEvent.clientX - rect.left : 0,
          y: event.activatorEvent?.clientY ? event.activatorEvent.clientY - rect.top : 0,
        });
      }
    }
  }, [atoms]);

  const handleDragMove = useCallback((event: DragMoveEvent) => {
    if (!activeAtom || readOnly) return;

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const newPosition = {
      x: event.activatorEvent.clientX - canvasRect.left - dragOffset.x,
      y: event.activatorEvent.clientY - canvasRect.top - dragOffset.y,
    };

    // Update atom position in real-time
    const updatedAtoms = atoms.map(atom =>
      atom.id === activeAtom.id
        ? { ...atom, position: newPosition }
        : atom
    );
    onAtomsChange(updatedAtoms);
  }, [activeAtom, atoms, dragOffset, onAtomsChange, readOnly]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!active || readOnly) {
      setActiveAtom(null);
      return;
    }

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) {
      setActiveAtom(null);
      return;
    }

    // Calculate final position
    const finalPosition = {
      x: Math.max(0, Math.min(
        canvasRect.width - 200, // Atom width
        event.activatorEvent?.clientX ? 
          event.activatorEvent.clientX - canvasRect.left - dragOffset.x : 0
      )),
      y: Math.max(0, Math.min(
        canvasRect.height - 100, // Atom height
        event.activatorEvent?.clientY ? 
          event.activatorEvent.clientY - canvasRect.top - dragOffset.y : 0
      )),
    };

    // Update final atom position
    const updatedAtoms = atoms.map(atom =>
      atom.id === active.id
        ? { ...atom, position: finalPosition }
        : atom
    );
    onAtomsChange(updatedAtoms);

    // Handle connection creation if dropped on another atom
    if (over && over.id !== active.id) {
      const sourceAtom = atoms.find(a => a.id === active.id);
      const targetAtom = atoms.find(a => a.id === over.id);
      
      if (sourceAtom && targetAtom) {
        const newConnection: Connection = {
          id: `${sourceAtom.id}-${targetAtom.id}-${Date.now()}`,
          sourceId: sourceAtom.id,
          targetId: targetAtom.id,
          type: 'AND', // Default connection type
        };
        
        onConnectionsChange([...connections, newConnection]);
      }
    }

    setActiveAtom(null);
  }, [atoms, connections, dragOffset, onAtomsChange, onConnectionsChange, readOnly]);

  const handleAtomClick = useCallback((atomId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onAtomSelect(atomId);
  }, [onAtomSelect]);

  const handleCanvasClick = useCallback(() => {
    onAtomSelect(null);
  }, [onAtomSelect]);

  const handleDeleteAtom = useCallback((atomId: string) => {
    if (readOnly) return;
    
    // Remove atom and all its connections
    const updatedAtoms = atoms.filter(atom => atom.id !== atomId);
    const updatedConnections = connections.filter(
      conn => conn.sourceId !== atomId && conn.targetId !== atomId
    );
    
    onAtomsChange(updatedAtoms);
    onConnectionsChange(updatedConnections);
    
    if (selectedAtomId === atomId) {
      onAtomSelect(null);
    }
  }, [atoms, connections, onAtomsChange, onConnectionsChange, onAtomSelect, readOnly, selectedAtomId]);

  const renderConnectionLine = useCallback((connection: Connection) => {
    const sourceAtom = atoms.find(a => a.id === connection.sourceId);
    const targetAtom = atoms.find(a => a.id === connection.targetId);
    
    if (!sourceAtom || !targetAtom) return null;

    const sourceX = sourceAtom.position.x + 100; // Center of atom
    const sourceY = sourceAtom.position.y + 50;
    const targetX = targetAtom.position.x + 100;
    const targetY = targetAtom.position.y + 50;

    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;

    return (
      <g key={connection.id}>
        <motion.line
          x1={sourceX}
          y1={sourceY}
          x2={targetX}
          y2={targetY}
          stroke="#6366f1"
          strokeWidth="2"
          strokeDasharray="5,5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Connection type indicator */}
        <motion.circle
          cx={midX}
          cy={midY}
          r="12"
          fill="#6366f1"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        />
        <text
          x={midX}
          y={midY + 4}
          textAnchor="middle"
          fill="white"
          fontSize="10"
          fontWeight="bold"
        >
          {connection.type}
        </text>
      </g>
    );
  }, [atoms]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <div
          ref={canvasRef}
          className="relative w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800"
          onClick={handleCanvasClick}
        >
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%">
              <defs>
                <pattern
                  id="grid"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 20 0 L 0 0 0 20"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {connections.map(renderConnectionLine)}
          </svg>

          {/* Atoms */}
          <AnimatePresence>
            {atoms.map((atom) => (
              <motion.div
                key={atom.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'absolute',
                  left: atom.position.x,
                  top: atom.position.y,
                }}
              >
                <DraggableAtom
                  atom={atom}
                  isSelected={selectedAtomId === atom.id}
                  onClick={handleAtomClick}
                  onDelete={handleDeleteAtom}
                  readOnly={readOnly}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Drop Zones */}
          <DropZone className="absolute inset-0" />
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeAtom && (
            <div className="transform rotate-3 opacity-90">
              <DraggableAtom
                atom={activeAtom}
                isSelected={false}
                onClick={() => {}}
                onDelete={() => {}}
                readOnly={true}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Canvas Info */}
      <div className="absolute top-4 right-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3 text-sm">
        <div className="text-slate-600 dark:text-slate-300">
          <div>Atoms: {atoms.length}</div>
          <div>Connections: {connections.length}</div>
        </div>
      </div>
    </div>
  );
};