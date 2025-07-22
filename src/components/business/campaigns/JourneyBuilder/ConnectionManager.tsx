// src/components/business/campaigns/JourneyBuilder/ConnectionManager.tsx

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrashIcon } from '@heroicons/react/24/outline';

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

interface ConnectionManagerProps {
  connections: Connection[];
  steps: JourneyStepData[];
  onConnectionsChange: (connections: Connection[]) => void;
  selectedConnection: string | null;
  readOnly?: boolean;
}

interface ConnectionPath {
  id: string;
  path: string;
  midpoint: Position;
  label?: string;
  color: string;
}

export const ConnectionManager: React.FC<ConnectionManagerProps> = ({
  connections,
  steps,
  onConnectionsChange,
  selectedConnection,
  readOnly = false
}) => {
  // Calculate connection paths
  const connectionPaths = useMemo((): ConnectionPath[] => {
    return connections.map((connection) => {
      const fromStep = steps.find(s => s.id === connection.fromStepId);
      const toStep = steps.find(s => s.id === connection.toStepId);
      
      if (!fromStep || !toStep) {
        return {
          id: connection.id,
          path: '',
          midpoint: { x: 0, y: 0 },
          color: '#6b7280'
        };
      }

      // Calculate output position
      const fromOutputIndex = fromStep.outputs.indexOf(connection.fromOutput);
      const fromX = fromStep.position.x + 120; // Step width
      const fromY = fromStep.position.y + 20 + (fromOutputIndex * 15);

      // Calculate input position
      const toInputIndex = toStep.inputs.indexOf(connection.toInput);
      const toX = toStep.position.x;
      const toY = toStep.position.y + 20 + (toInputIndex * 15);

      // Create curved path
      const dx = toX - fromX;
      const dy = toY - fromY;
      const midX = fromX + dx / 2;
      const midY = fromY + dy / 2;

      // Control points for bezier curve
      const controlPoint1X = fromX + Math.max(50, Math.abs(dx) * 0.5);
      const controlPoint1Y = fromY;
      const controlPoint2X = toX - Math.max(50, Math.abs(dx) * 0.5);
      const controlPoint2Y = toY;

      const path = `M ${fromX} ${fromY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${toX} ${toY}`;

      // Determine connection color based on output type
      let color = '#6b7280'; // Default gray
      if (connection.fromOutput === 'yes' || connection.fromOutput === 'main') {
        color = '#10b981'; // Green
      } else if (connection.fromOutput === 'no') {
        color = '#ef4444'; // Red
      } else if (connection.fromOutput === 'path1') {
        color = '#3b82f6'; // Blue
      } else if (connection.fromOutput === 'path2') {
        color = '#f59e0b'; // Orange
      }

      return {
        id: connection.id,
        path,
        midpoint: { x: midX, y: midY },
        label: getConnectionLabel(connection, fromStep, toStep),
        color
      };
    });
  }, [connections, steps]);

  const getConnectionLabel = (connection: Connection, fromStep: JourneyStepData, toStep: JourneyStepData): string | undefined => {
    // Show labels for decision branches and splits
    if (fromStep.type === 'decision') {
      return connection.fromOutput === 'yes' ? 'Yes' : 'No';
    } else if (fromStep.type === 'split') {
      if (connection.fromOutput === 'path1') {
        return `${fromStep.config.splitRatio || 50}%`;
      } else if (connection.fromOutput === 'path2') {
        return `${100 - (fromStep.config.splitRatio || 50)}%`;
      }
    }
    return undefined;
  };

  const handleConnectionClick = (connectionId: string, event: React.MouseEvent) => {
    if (readOnly) return;
    
    event.stopPropagation();
    // Toggle connection selection or show context menu
  };

  const handleDeleteConnection = (connectionId: string) => {
    if (readOnly) return;
    
    const newConnections = connections.filter(c => c.id !== connectionId);
    onConnectionsChange(newConnections);
  };

  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      <defs>
        {/* Arrow markers for different colors */}
        <marker
          id="arrow-green"
          viewBox="0 0 10 10"
          refX="9"
          refY="3"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#10b981" />
        </marker>
        
        <marker
          id="arrow-red"
          viewBox="0 0 10 10"
          refX="9"
          refY="3"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#ef4444" />
        </marker>
        
        <marker
          id="arrow-blue"
          viewBox="0 0 10 10"
          refX="9"
          refY="3"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#3b82f6" />
        </marker>
        
        <marker
          id="arrow-orange"
          viewBox="0 0 10 10"
          refX="9"
          refY="3"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#f59e0b" />
        </marker>
        
        <marker
          id="arrow-gray"
          viewBox="0 0 10 10"
          refX="9"
          refY="3"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#6b7280" />
        </marker>

        {/* Drop shadow filter */}
        <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.2"/>
        </filter>
      </defs>

      {/* Render connections */}
      {connectionPaths.map((connectionPath) => {
        const isSelected = selectedConnection === connectionPath.id;
        const markerEnd = connectionPath.color === '#10b981' ? 'url(#arrow-green)' :
                          connectionPath.color === '#ef4444' ? 'url(#arrow-red)' :
                          connectionPath.color === '#3b82f6' ? 'url(#arrow-blue)' :
                          connectionPath.color === '#f59e0b' ? 'url(#arrow-orange)' :
                          'url(#arrow-gray)';

        return (
          <g key={connectionPath.id}>
            {/* Connection path */}
            <motion.path
              d={connectionPath.path}
              stroke={connectionPath.color}
              strokeWidth={isSelected ? 3 : 2}
              fill="none"
              markerEnd={markerEnd}
              className={`
                pointer-events-auto cursor-pointer transition-all duration-200
                ${isSelected ? 'drop-shadow-lg' : 'hover:stroke-width-3'}
              `}
              onClick={(e) => handleConnectionClick(connectionPath.id, e)}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              filter={isSelected ? "url(#drop-shadow)" : undefined}
            />

            {/* Connection label */}
            {connectionPath.label && (
              <g>
                {/* Label background */}
                <rect
                  x={connectionPath.midpoint.x - 15}
                  y={connectionPath.midpoint.y - 8}
                  width="30"
                  height="16"
                  fill="white"
                  stroke={connectionPath.color}
                  strokeWidth="1"
                  rx="8"
                  className="pointer-events-none"
                />
                {/* Label text */}
                <text
                  x={connectionPath.midpoint.x}
                  y={connectionPath.midpoint.y + 4}
                  textAnchor="middle"
                  className="text-xs font-medium pointer-events-none"
                  fill={connectionPath.color}
                >
                  {connectionPath.label}
                </text>
              </g>
            )}

            {/* Delete button for selected connection */}
            {isSelected && !readOnly && (
              <g>
                <circle
                  cx={connectionPath.midpoint.x + 25}
                  cy={connectionPath.midpoint.y - 25}
                  r="10"
                  fill="#ef4444"
                  className="pointer-events-auto cursor-pointer hover:fill-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConnection(connectionPath.id);
                  }}
                />
                <foreignObject
                  x={connectionPath.midpoint.x + 21}
                  y={connectionPath.midpoint.y - 29}
                  width="8"
                  height="8"
                  className="pointer-events-none"
                >
                  <TrashIcon className="w-2 h-2 text-white" />
                </foreignObject>
              </g>
            )}
          </g>
        );
      })}

      {/* Connection validation errors */}
      {connectionPaths.length === 0 && steps.length > 1 && (
        <g>
          <rect
            x="50"
            y="50"
            width="200"
            height="40"
            fill="#fef2f2"
            stroke="#f87171"
            strokeWidth="1"
            rx="4"
            className="pointer-events-none"
          />
          <text
            x="150"
            y="75"
            textAnchor="middle"
            className="text-sm font-medium pointer-events-none"
            fill="#dc2626"
          >
            Steps not connected
          </text>
        </g>
      )}

      {/* Journey flow direction indicators */}
      {connectionPaths.length > 0 && (
        <g>
          {connectionPaths.map((connectionPath, index) => (
            <motion.circle
              key={`flow-${connectionPath.id}`}
              r="3"
              fill={connectionPath.color}
              className="pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 0],
                offsetDistance: ['0%', '100%']
              }}
              transition={{
                duration: 2,
                delay: index * 0.5,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <animateMotion dur="2s" repeatCount="indefinite">
                <mpath href={`#path-${connectionPath.id}`} />
              </animateMotion>
            </motion.circle>
          ))}
        </g>
      )}

      {/* Hidden paths for animation */}
      <defs>
        {connectionPaths.map((connectionPath) => (
          <path
            key={`path-${connectionPath.id}`}
            id={`path-${connectionPath.id}`}
            d={connectionPath.path}
          />
        ))}
      </defs>
    </svg>
  );
};