// File: src/components/ui/Card/CardFooter.tsx
import React, { forwardRef } from 'react';
import { cn } from '@/utils/dom/classNames';

// Component prop types
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Footer actions/buttons */
  actions?: React.ReactNode;
  /** Footer information/text */
  info?: React.ReactNode;
  /** Whether to show top border */
  bordered?: boolean;
  /** Justify content alignment */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  /** Footer size variant */
  size?: 'sm' | 'md' | 'lg';
}

// CardFooter component
export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  (
    {
      className,
      actions,
      info,
      bordered = false,
      justify = 'between',
      size = 'md',
      children,
      ...props
    },
    ref
  ) => {
    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
    };

    const sizeClasses = {
      sm: 'pt-2',
      md: 'pt-4',
      lg: 'pt-6',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center',
          justifyClasses[justify],
          sizeClasses[size],
          bordered && 'border-t border-gray-200',
          className
        )}
        {...props}
      >
        {/* Info content */}
        {info && (
          <div className="text-sm text-gray-500">
            {info}
          </div>
        )}

        {/* Custom children content */}
        {children}

        {/* Actions */}
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';