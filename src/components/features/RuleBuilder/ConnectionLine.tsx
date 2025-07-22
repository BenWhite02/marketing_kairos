// src/components/features/RuleBuilder/ConnectionLine.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { classNames } from '../../../utils/dom/classNames';

interface Point {
  x: number;
  y: number;
}

interface ConnectionLineProps {
  start: Point;
  end: Point;
  type?: 'straight' | 'curved' | 'step';
  style?: 'solid' | 'dashed' | 'dotted';
  color?: 'default' | 'success' | 'warning' | 'error';
  animated?: boolean;
  label?: string;
  thickness?: 'thin' | 'medium' | 'thick';
  className?: string;
}

const colorConfig = {
  default: {
    stroke: '#64748b',
    activeStroke: '#3b82f6',
    labelBg: 'bg-slate-500',
    labelText: 'text-white'
  },
  success: {
    stroke: '#10b981',
    activeStroke: '#059669',
    labelBg: 'bg-emerald-500',
    labelText: 'text-white'
  },
  warning: {
    stroke: '#f59e0b',
    activeStroke: '#d97706',
    labelBg: 'bg-amber-500',
    labelText: 'text-white'
  },
  error: {
    stroke: '#ef4444',
    activeStroke: '#dc2626',
    labelBg: 'bg-red-500',
    labelText: 'text-white'
  }
};

const thicknessConfig = {
  thin: '1',
  medium: '2',
  thick: '3'
};

export const ConnectionLine: React.FC<ConnectionLineProps> = ({
  start,
  end,
  type = 'curved',
  style = 'solid',
  color = 'default',
  animated = false,
  label,
  thickness = 'medium',
  className = ''
}) => {
  const config = colorConfig[color];
  const strokeWidth = thicknessConfig[thickness];

  // Calculate path based on connection type
  const getPath = (): string => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    switch (type) {
      case 'straight':
        return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
      
      case 'step':
        const midX = start.x + dx / 2;
        return `M ${start.x} ${start.y} H ${midX} V ${end.y} H ${end.x}`;
      
      case 'curved':
      default:
        const controlPoint1X = start.x + Math.abs(dx) * 0.5;
        const controlPoint1Y = start.y;
        const controlPoint2X = end.x - Math.abs(dx) * 0.5;
        const controlPoint2Y = end.y;
        
        return `M ${start.x} ${start.y} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${end.x} ${end.y}`;
    }
  };

  // Calculate midpoint for label positioning
  const midPoint = {
    x: start.x + (end.x - start.x) / 2,
    y: start.y + (end.y - start.y) / 2
  };

  // Stroke dash array based on style
  const getStrokeDashArray = (): string => {
    switch (style) {
      case 'dashed':
        return '8,4';
      case 'dotted':
        return '2,2';
      case 'solid':
      default:
        return '';
    }
  };

  const path = getPath();
  const strokeDasharray = getStrokeDashArray();

  return (
    <g className={className}>
      {/* Connection Path */}
      <motion.path
        d={path}
        stroke={config.stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="transition-all duration-200 hover:stroke-current"
        style={{ 
          '--tw-stroke-opacity': '0.8',
          stroke: animated ? config.activeStroke : config.stroke
        }}
      />

      {/* Animated Flow Effect */}
      {animated && (
        <motion.circle
          r="3"
          fill={config.activeStroke}
          initial={{ offsetDistance: '0%', opacity: 0 }}
          animate={{ 
            offsetDistance: '100%', 
            opacity: [0, 1, 1, 0],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          style={{
            offsetPath: `path('${path}')`,
            offsetRotate: 'auto'
          }}
        />
      )}

      {/* Arrow Head */}
      <motion.polygon
        points={`${end.x-8},${end.y-4} ${end.x},${end.y} ${end.x-8},${end.y+4}`}
        fill={config.stroke}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, duration: 0.2 }}
        className="transition-all duration-200"
      />

      {/* Connection Label */}
      {label && (
        <g>
          {/* Label Background */}
          <motion.rect
            x={midPoint.x - 20}
            y={midPoint.y - 10}
            width="40"
            height="20"
            rx="10"
            fill={config.stroke}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 0.2 }}
          />
          
          {/* Label Text */}
          <motion.text
            x={midPoint.x}
            y={midPoint.y + 4}
            textAnchor="middle"
            fontSize="10"
            fontWeight="bold"
            fill="white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.2 }}
          >
            {label}
          </motion.text>
        </g>
      )}

      {/* Hover Effect Circle */}
      <motion.circle
        cx={midPoint.x}
        cy={midPoint.y}
        r="0"
        fill={config.activeStroke}
        fillOpacity="0.2"
        whileHover={{ r: 15 }}
        transition={{ duration: 0.2 }}
        className="cursor-pointer"
      />

      {/* Debug Points (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <>
          <circle cx={start.x} cy={start.y} r="2" fill="red" opacity="0.5" />
          <circle cx={end.x} cy={end.y} r="2" fill="blue" opacity="0.5" />
          <circle cx={midPoint.x} cy={midPoint.y} r="1" fill="green" opacity="0.5" />
        </>
      )}
    </g>
  );
};