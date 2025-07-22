// src/components/ui/Progress/Progress.tsx

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/dom/classNames';

const progressVariants = cva(
  'relative overflow-hidden rounded-full bg-gray-200',
  {
    variants: {
      size: {
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4',
        xl: 'h-6',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const progressBarVariants = cva(
  'h-full rounded-full transition-all duration-500 ease-out',
  {
    variants: {
      variant: {
        default: 'bg-blue-600',
        success: 'bg-green-600',
        warning: 'bg-yellow-600',
        error: 'bg-red-600',
        info: 'bg-cyan-600',
        primary: 'bg-indigo-600',
        secondary: 'bg-gray-600',
      },
      animated: {
        true: 'animate-pulse',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      animated: false,
    },
  }
);

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants>,
    VariantProps<typeof progressBarVariants> {
  value: number;
  max?: number;
  showLabel?: boolean;
  label?: string;
  showPercentage?: boolean;
  indeterminate?: boolean;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    className,
    value,
    max = 100,
    size,
    variant,
    animated,
    showLabel = false,
    label,
    showPercentage = false,
    indeterminate = false,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const displayLabel = label || `${Math.round(percentage)}%`;

    return (
      <div className="w-full">
        {(showLabel || showPercentage) && (
          <div className="flex justify-between items-center mb-2">
            {showLabel && (
              <span className="text-sm font-medium text-gray-700">
                {showPercentage ? displayLabel : label}
              </span>
            )}
            {showPercentage && !showLabel && (
              <span className="text-sm text-gray-600">
                {Math.round(percentage)}%
              </span>
            )}
            {showLabel && showPercentage && label && (
              <span className="text-sm text-gray-600">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}
        
        <div
          ref={ref}
          className={cn(progressVariants({ size }), className)}
          role="progressbar"
          aria-valuenow={indeterminate ? undefined : value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
          {...props}
        >
          <div
            className={cn(
              progressBarVariants({ variant, animated }),
              indeterminate && 'w-1/3 animate-bounce'
            )}
            style={{
              width: indeterminate ? undefined : `${percentage}%`,
              transform: indeterminate ? 'translateX(-100%)' : undefined,
              animation: indeterminate 
                ? 'progress-indeterminate 1.5s ease-in-out infinite' 
                : undefined,
            }}
          />
        </div>
        
        <style>{`
          @keyframes progress-indeterminate {
            0% {
              transform: translateX(-100%);
            }
            50% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>
      </div>
    );
  }
);

Progress.displayName = 'Progress';