// src/components/business/campaigns/JourneyBuilder/JourneyCanvas.tsx

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  TrashIcon,
  ArrowPathIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  Square3Stack3DIcon,
  MapIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../../ui/Button';
import { Card, CardBody } from '../../../ui/Card';
import { JourneyStep } from './JourneyStep';
import { ConnectionManager } from './ConnectionManager';
import { StepPalette } from './StepPalette';

interface Position {
  x: number;
  y: number;
}

interface JourneyStepData {
  id: string;
  type: 'trigger' | 'moment' | 'decision' | 'delay' | 'split' | 'merge' | 'end';
  position: Position;
  title: string;
  subtitle?: string;
  config: {
    momentId?: string;
    delayDuration?: number;
    delayUnit?: 'minutes' | 'hours' | 'days';
    condition?: string;
    splitType?: 'random' | 'rules' | 'percentage';
    splitRatio?: number;
    channels?: string[];
    triggers?: string[];
  };
  inputs: string[];
  outputs: string[];
}

interface Connection {
  id: string;
  fromStepId: string;
  toStepId: string;
  fromOutput: string;
  toInput: string;
  label?: string;
  condition?: string;
}

interface JourneyCanvasProps {
  steps: JourneyStepData[];
  connections: Connection[];
  onStepsChange: (steps: JourneyStepData[]) => void;
  onConnectionsChange: (connections: Connection[]) => void;
  readOnly?: boolean;
}

const INITIAL_STEPS: JourneyStepData[] = [
  {
    id: 'start',
    type: 'trigger',
    position: { x: 100, y: 200 },
    title: 'Campaign Start',
    subtitle: 'User enters campaign',
    config: { triggers: ['signup', 'purchase'] },
    inputs: [],
    outputs: ['main']
  }
];

export const JourneyCanvas: React.FC<JourneyCanvasProps> = ({
  steps = INITIAL_STEPS,
  connections = [],
  onStepsChange,
  onConnectionsChange,
  readOnly = false
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [draggedStep, setDraggedStep] = useState<string | null>(null);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 });
  const [showPalette, setShowPalette] = useState(false);
  const [connectionMode, setConnectionMode] = useState(false);
  const [connectionStart, setConnectionStart] = useState<{
    stepId: string;
    output: string;
    position: Position;
  } | null>(null);

  // Handle step dragging
  const handleStepMouseDown = useCallback((stepId: string, event: React.MouseEvent) => {
    if (readOnly) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const step = steps.find(s => s.id === stepId);
    if (!step) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = (event.clientX - rect.left - pan.x) / zoom;
    const mouseY = (event.clientY - rect.top - pan.y) / zoom;

    setDraggedStep(stepId);
    setSelectedStep(stepId);
    setDragOffset({
      x: mouseX - step.position.x,
      y: mouseY - step.position.y
    });
  }, [steps, pan, zoom, readOnly]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left - pan.x) / zoom;
    const mouseY = (event.clientY - rect.top - pan.y) / zoom;

    if (draggedStep) {
      // Update step position
      const newSteps = steps.map(step => 
        step.id === draggedStep
          ? {
              ...step,
              position: {
                x: mouseX - dragOffset.x,
                y: mouseY - dragOffset.y
              }
            }
          : step
      );
      onStepsChange(newSteps);
    } else if (isPanning) {
      // Update pan position
      setPan({
        x: event.clientX - panStart.x,
        y: event.clientY - panStart.y
      });
    }
  }, [draggedStep, isPanning, steps, dragOffset, pan, zoom, panStart, onStepsChange]);

  const handleMouseUp = useCallback(() => {
    setDraggedStep(null);
    setIsPanning(false);
    setConnectionMode(false);
    setConnectionStart(null);
  }, []);

  // Handle canvas panning
  const handleCanvasMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.button === 1 || (event.button === 0 && event.ctrlKey)) {
      // Middle click or Ctrl+click for panning
      event.preventDefault();
      setIsPanning(true);
      setPanStart({
        x: event.clientX - pan.x,
        y: event.clientY - pan.y
      });
    } else if (event.target === event.currentTarget) {
      // Click on empty canvas
      setSelectedStep(null);
    }
  }, [pan]);

  // Handle zoom
  const handleWheel = useCallback((event: React.WheelEvent) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.25, Math.min(2, zoom * delta));
    setZoom(newZoom);
  }, [zoom]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    setZoom(prev => Math.min(2, prev * 1.2));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom(prev => Math.max(0.25, prev / 1.2));
  }, []);

  const fitToView = useCallback(() => {
    if (steps.length === 0) return;

    const padding = 100;
    const minX = Math.min(...steps.map(s => s.position.x)) - padding;
    const maxX = Math.max(...steps.map(s => s.position.x)) + padding;
    const minY = Math.min(...steps.map(s => s.position.y)) - padding;
    const maxY = Math.max(...steps.map(s => s.position.y)) + padding;

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const scaleX = canvasRect.width / contentWidth;
    const scaleY = canvasRect.height / contentHeight;
    const newZoom = Math.min(scaleX, scaleY, 1);

    setZoom(newZoom);
    setPan({
      x: (canvasRect.width - contentWidth * newZoom) / 2 - minX * newZoom,
      y: (canvasRect.height - contentHeight * newZoom) / 2 - minY * newZoom
    });
  }, [steps]);

  // Add new step
  const addStep = useCallback((stepType: JourneyStepData['type'], position?: Position) => {
    if (readOnly) return;

    const newPosition = position || {
      x: (400 - pan.x) / zoom,
      y: (300 - pan.y) / zoom
    };

    const newStep: JourneyStepData = {
      id: `step_${Date.now()}`,
      type: stepType,
      position: newPosition,
      title: getDefaultTitle(stepType),
      subtitle: getDefaultSubtitle(stepType),
      config: getDefaultConfig(stepType),
      inputs: getDefaultInputs(stepType),
      outputs: getDefaultOutputs(stepType)
    };

    onStepsChange([...steps, newStep]);
    setSelectedStep(newStep.id);
  }, [steps, pan, zoom, readOnly, onStepsChange]);

  // Delete step
  const deleteStep = useCallback((stepId: string) => {
    if (readOnly || stepId === 'start') return;

    const newSteps = steps.filter(s => s.id !== stepId);
    const newConnections = connections.filter(c => 
      c.fromStepId !== stepId && c.toStepId !== stepId
    );

    onStepsChange(newSteps);
    onConnectionsChange(newConnections);
    setSelectedStep(null);
  }, [steps, connections, readOnly, onStepsChange, onConnectionsChange]);

  // Handle connection creation
  const startConnection = useCallback((stepId: string, output: string, position: Position) => {
    if (readOnly) return;
    
    setConnectionMode(true);
    setConnectionStart({ stepId, output, position });
  }, [readOnly]);

  const completeConnection = useCallback((toStepId: string, input: string) => {
    if (!connectionStart || readOnly) return;

    const newConnection: Connection = {
      id: `conn_${Date.now()}`,
      fromStepId: connectionStart.stepId,
      toStepId,
      fromOutput: connectionStart.output,
      toInput: input
    };

    onConnectionsChange([...connections, newConnection]);
    setConnectionStart(null);
    setConnectionMode(false);
  }, [connectionStart, connections, readOnly, onConnectionsChange]);

  // Helper functions
  const getDefaultTitle = (type: JourneyStepData['type']): string => {
    switch (type) {
      case 'trigger': return 'Trigger';
      case 'moment': return 'Send Moment';
      case 'decision': return 'Decision Point';
      case 'delay': return 'Wait';
      case 'split': return 'Split Audience';
      case 'merge': return 'Merge Paths';
      case 'end': return 'End Journey';
      default: return 'Step';
    }
  };

  const getDefaultSubtitle = (type: JourneyStepData['type']): string => {
    switch (type) {
      case 'trigger': return 'Event trigger';
      case 'moment': return 'Send message';
      case 'decision': return 'Branch logic';
      case 'delay': return 'Time delay';
      case 'split': return 'Audience split';
      case 'merge': return 'Combine paths';
      case 'end': return 'Journey complete';
      default: return '';
    }
  };

  const getDefaultConfig = (type: JourneyStepData['type']): JourneyStepData['config'] => {
    switch (type) {
      case 'delay':
        return { delayDuration: 1, delayUnit: 'hours' };
      case 'split':
        return { splitType: 'percentage', splitRatio: 50 };
      case 'moment':
        return { channels: ['email'] };
      default:
        return {};
    }
  };

  const getDefaultInputs = (type: JourneyStepData['type']): string[] => {
    switch (type) {
      case 'trigger': return [];
      case 'merge': return ['input1', 'input2'];
      default: return ['main'];
    }
  };

  const getDefaultOutputs = (type: JourneyStepData['type']): string[] => {
    switch (type) {
      case 'end': return [];
      case 'decision': return ['yes', 'no'];
      case 'split': return ['path1', 'path2'];
      default: return ['main'];
    }
  };

  // Event listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Grid background style
  const gridStyle = {
    backgroundImage: `
      radial-gradient(circle, #e5e7eb 1px, transparent 1px)
    `,
    backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
    backgroundPosition: `${pan.x}px ${pan.y}px`
  };

  return (
    <div className="relative h-full bg-gray-50 overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <Card>
          <CardBody className="p-2 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPalette(!showPalette)}
              icon={PlusIcon}
              className={showPalette ? 'bg-blue-100 text-blue-600' : ''}
            >
              Add Step
            </Button>
            
            <div className="h-4 border-l border-gray-300" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomOut}
              icon={MagnifyingGlassMinusIcon}
              disabled={zoom <= 0.25}
            />
            
            <span className="text-sm font-medium text-gray-600 min-w-[50px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomIn}
              icon={MagnifyingGlassPlusIcon}
              disabled={zoom >= 2}
            />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={fitToView}
              icon={Square3Stack3DIcon}
            >
              Fit
            </Button>
          </CardBody>
        </Card>
      </div>

      {/* Mini-map */}
      <div className="absolute top-4 right-4 z-10">
        <Card>
          <CardBody className="p-2">
            <div className="w-32 h-24 bg-gray-100 rounded relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <MapIcon className="w-6 h-6 text-gray-400" />
              </div>
              <div className="text-xs text-gray-500 mt-1 text-center">Mini-map</div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Step Palette */}
      <AnimatePresence>
        {showPalette && (
          <StepPalette
            onAddStep={(type, position) => {
              addStep(type, position);
              setShowPalette(false);
            }}
            onClose={() => setShowPalette(false)}
          />
        )}
      </AnimatePresence>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={gridStyle}
        onMouseDown={handleCanvasMouseDown}
        onWheel={handleWheel}
      >
        <div
          className="relative w-full h-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
          }}
        >
          {/* Connections */}
          <ConnectionManager
            connections={connections}
            steps={steps}
            onConnectionsChange={onConnectionsChange}
            selectedConnection={null}
          />

          {/* Steps */}
          {steps.map((step) => (
            <JourneyStep
              key={step.id}
              step={step}
              isSelected={selectedStep === step.id}
              isDragging={draggedStep === step.id}
              onMouseDown={(e) => handleStepMouseDown(step.id, e)}
              onConfigChange={(config) => {
                const newSteps = steps.map(s =>
                  s.id === step.id ? { ...s, config: { ...s.config, ...config } } : s
                );
                onStepsChange(newSteps);
              }}
              onDelete={() => deleteStep(step.id)}
              onStartConnection={startConnection}
              onCompleteConnection={completeConnection}
              connectionMode={connectionMode}
              readOnly={readOnly}
            />
          ))}

          {/* Temporary connection line */}
          {connectionStart && connectionMode && (
            <svg className="absolute inset-0 pointer-events-none">
              <defs>
                <marker
                  id="temp-arrow"
                  viewBox="0 0 10 10"
                  refX="5"
                  refY="3"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto"
                >
                  <path d="M0,0 L0,6 L9,3 z" fill="#3b82f6" />
                </marker>
              </defs>
              <line
                x1={connectionStart.position.x}
                y1={connectionStart.position.y}
                x2={connectionStart.position.x + 100}
                y2={connectionStart.position.y}
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="5,5"
                markerEnd="url(#temp-arrow)"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Selected Step Actions */}
      {selectedStep && !readOnly && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <Card>
            <CardBody className="p-2 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteStep(selectedStep)}
                icon={TrashIcon}
                disabled={selectedStep === 'start'}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Delete
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const step = steps.find(s => s.id === selectedStep);
                  if (step) {
                    addStep(step.type, {
                      x: step.position.x + 200,
                      y: step.position.y
                    });
                  }
                }}
                icon={ArrowPathIcon}
              >
                Duplicate
              </Button>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Journey Stats */}
      <div className="absolute bottom-4 right-4 z-10">
        <Card>
          <CardBody className="p-3">
            <div className="text-xs text-gray-600 space-y-1">
              <div>Steps: {steps.length}</div>
              <div>Connections: {connections.length}</div>
              <div>Paths: {Math.max(1, connections.length - steps.length + 2)}</div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};