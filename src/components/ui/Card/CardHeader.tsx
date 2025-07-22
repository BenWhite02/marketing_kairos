// File: src/components/ui/Card/CardHeader.tsx
import React, { forwardRef } from 'react';
import { cn } from '@/utils/dom/classNames';

// Component prop types
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Header title */
  title?: React.ReactNode;
  /** Header subtitle/description */
  subtitle?: React.ReactNode;
  /** Icon to display before title */
  icon?: React.ReactNode;
  /** Actions to display on the right */
  actions?: React.ReactNode;
  /** Whether to show bottom border */
  bordered?: boolean;
  /** Custom title element (h1, h2, etc.) */
  titleElement?: keyof JSX.IntrinsicElements;
  /** Title className */
  titleClassName?: string;
  /** Subtitle className */
  subtitleClassName?: string;
}

// CardHeader component
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  (
    {
      className,
      title,
      subtitle,
      icon,
      actions,
      bordered = false,
      titleElement: TitleElement = 'h3',
      titleClassName,
      subtitleClassName,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-start justify-between space-x-4',
          bordered && 'border-b border-gray-200 pb-4',
          className
        )}
        {...props}
      >
        {/* Left side content */}
        <div className="flex-1 min-w-0">
          {/* Title row with icon */}
          {(title || icon) && (
            <div className="flex items-center space-x-2">
              {icon && (
                <div className="flex-shrink-0 text-gray-400">
                  {icon}
                </div>
              )}
              {title && (
                <TitleElement 
                  className={cn(
                    'text-lg font-semibold text-gray-900 truncate',
                    titleClassName
                  )}
                >
                  {title}
                </TitleElement>
              )}
            </div>
          )}

          {/* Subtitle */}
          {subtitle && (
            <p 
              className={cn(
                'mt-1 text-sm text-gray-500',
                title && 'mt-1',
                subtitleClassName
              )}
            >
              {subtitle}
            </p>
          )}

          {/* Custom children content */}
          {children}
        </div>

        {/* Right side actions */}
        {actions && (
          <div className="flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';