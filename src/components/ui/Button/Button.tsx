// src/components/ui/Button/Button.tsx

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/dom/classNames';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
        destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
        outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100',
        secondary: 'bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800',
        ghost: 'text-gray-600 hover:bg-gray-100 active:bg-gray-200',
        link: 'text-blue-600 underline-offset-4 hover:underline',
        primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
        success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
        warning: 'bg-yellow-600 text-white hover:bg-yellow-700 active:bg-yellow-800',
        error: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
        xs: 'h-7 px-2 text-xs',
        xl: 'h-12 px-10 text-lg',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth,
    asChild = false, 
    isLoading = false,
    startIcon,
    endIcon,
    loadingText,
    disabled,
    children,
    ...props 
  }, ref) => {
    const isDisabled = disabled || isLoading;
    const content = isLoading && loadingText ? loadingText : children;

    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        ref={ref}
        disabled={isDisabled}
        aria-busy={isLoading}
        aria-disabled={isDisabled}
        {...props}
      >
        {/* Loading spinner */}
        {isLoading && (
          <svg 
            className="mr-2 h-4 w-4 animate-spin" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
        )}
        
        {/* Start icon */}
        {!isLoading && startIcon && (
          <span className="mr-2 flex-shrink-0">{startIcon}</span>
        )}
        
        {/* Button content */}
        {content && <span className="truncate">{content}</span>}
        
        {/* End icon */}
        {!isLoading && endIcon && (
          <span className="ml-2 flex-shrink-0">{endIcon}</span>
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };