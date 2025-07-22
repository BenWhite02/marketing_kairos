// File: src/components/ui/Card/CardBody.tsx
import React, { forwardRef } from 'react';
import { cn } from '@/utils/dom/classNames';

// Component prop types
export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional spacing variants */
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  /** Whether content should scroll */
  scrollable?: boolean;
  /** Maximum height for scrollable content */
  maxHeight?: string;
}

// CardBody component
export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  (
    {
      className,
      spacing = 'md',
      scrollable = false,
      maxHeight,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const spacingClasses = {
      none: '',
      sm: 'py-2',
      md: 'py-4',
      lg: 'py-6',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex-1',
          spacingClasses[spacing],
          scrollable && 'overflow-auto',
          className
        )}
        style={{
          ...style,
          ...(maxHeight && scrollable && { maxHeight }),
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'CardBody';