// src/components/features/RuleBuilder/LogicGate.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { classNames } from '../../../utils/dom/classNames';

interface LogicGateProps {
  operation: 'AND' | 'OR' | 'NOT';
  size?: 'sm' | 'md' | 'lg';
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

const gateConfig = {
  AND: {
    symbol: '&',
    color: 'emerald',
    description: 'All conditions must be true',
    shape: 'rounded-lg'
  },
  OR: {
    symbol: '|',
    color: 'blue',
    description: 'At least one condition must be true',
    shape: 'rounded-full'
  },
  NOT: {
    symbol: '!',
    color: 'red',
    description: 'Condition must be false',
    shape: 'rounded-none'
  }
};

const sizeConfig = {
  sm: {
    container: 'w-8 h-8',
    text: 'text-xs',
    padding: 'p-1'
  },
  md: {
    container: 'w-12 h-12',
    text: 'text-sm',
    padding: 'p-2'
  },
  lg: {
    container: 'w-16 h-16',
    text: 'text-lg',
    padding: 'p-3'
  }
};

export const LogicGate: React.FC<LogicGateProps> = ({
  operation,
  size = 'md',
  isActive = false,
  onClick,
  className = ''
}) => {
  const config = gateConfig[operation];
  const sizeStyle = sizeConfig[size];

  return (
    <motion.div
      className={classNames(
        'relative flex items-center justify-center font-bold border-2 cursor-pointer transition-all duration-200 select-none',
        sizeStyle.container,
        sizeStyle.padding,
        config.shape,
        isActive
          ? `bg-${config.color}-500 border-${config.color}-600 text-white shadow-lg`
          : `bg-${config.color}-100 dark:bg-${config.color}-900 border-${config.color}-300 dark:border-${config.color}-700 text-${config.color}-700 dark:text-${config.color}-300`,
        onClick ? 'hover:scale-105 active:scale-95' : '',
        className
      )}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.05 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      title={config.description}
    >
      {/* Gate Symbol */}
      <span className={classNames('font-mono', sizeStyle.text)}>
        {config.symbol}
      </span>

      {/* Active Indicator */}
      {isActive && (
        <motion.div
          className={`absolute -inset-1 bg-${config.color}-500/20 ${config.shape} -z-10`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Pulse Animation for Active State */}
      {isActive && size !== 'sm' && (
        <motion.div
          className={`absolute inset-0 bg-${config.color}-400/30 ${config.shape}`}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Connection Points for larger sizes */}
      {size !== 'sm' && (
        <>
          {/* Input connections */}
          <div className="absolute -left-1 top-1/3 w-2 h-2 bg-slate-400 rounded-full" />
          <div className="absolute -left-1 bottom-1/3 w-2 h-2 bg-slate-400 rounded-full" />
          
          {/* Output connection */}
          <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-slate-600 rounded-full" />
        </>
      )}

      {/* Gate Type Label for larger sizes */}
      {size === 'lg' && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
          <span className={`text-xs font-medium text-${config.color}-600 dark:text-${config.color}-400`}>
            {operation}
          </span>
        </div>
      )}
    </motion.div>
  );
};