// File: src/components/ui/Input/Input.tsx
import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/dom/classNames';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

// Input variants using CVA
const inputVariants = cva(
  'flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-gray-300 focus-visible:border-blue-500',
        error: 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500',
        success: 'border-green-500 focus-visible:border-green-500 focus-visible:ring-green-500',
        warning: 'border-yellow-500 focus-visible:border-yellow-500 focus-visible:ring-yellow-500',
      },
      size: {
        sm: 'h-8 px-2 text-xs',
        md: 'h-10 px-3 text-sm',
        lg: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Component prop types
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  /** Label for the input */
  label?: string;
  /** Helper text below input */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Success message */
  success?: string;
  /** Warning message */
  warning?: string;
  /** Icon to display before input */
  startIcon?: React.ReactNode;
  /** Icon to display after input */
  endIcon?: React.ReactNode;
  /** Loading state */
  isLoading?: boolean;
  /** Required field indicator */
  required?: boolean;
  /** Input container className */
  containerClassName?: string;
  /** Label className */
  labelClassName?: string;
  /** Show password toggle for password inputs */
  showPasswordToggle?: boolean;
}

// Input component with forwardRef
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      label,
      helperText,
      error,
      success,
      warning,
      startIcon,
      endIcon,
      isLoading,
      required,
      containerClassName,
      labelClassName,
      showPasswordToggle = false,
      type = 'text',
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    
    // Determine the actual input type
    const inputType = showPasswordToggle && type === 'password' 
      ? (showPassword ? 'text' : 'password')
      : type;

    // Determine variant based on state
    const currentVariant = error ? 'error' : success ? 'success' : warning ? 'warning' : variant;

    // Get status message and icon
    const statusMessage = error || success || warning || helperText;
    const statusIcon = error ? AlertCircle : null;

    return (
      <div className={cn('space-y-2', containerClassName)}>
        {/* Label */}
        {label && (
          <label 
            className={cn(
              'text-sm font-medium text-gray-700',
              disabled && 'text-gray-400',
              labelClassName
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input container */}
        <div className="relative">
          {/* Start icon */}
          {startIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {startIcon}
            </div>
          )}

          {/* Input field */}
          <input
            type={inputType}
            ref={ref}
            disabled={disabled || isLoading}
            className={cn(
              inputVariants({ variant: currentVariant, size }),
              startIcon && 'pl-10',
              (endIcon || showPasswordToggle || isLoading) && 'pr-10',
              className
            )}
            {...props}
          />

          {/* End icons container */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {/* Loading spinner */}
            {isLoading && (
              <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full" />
            )}

            {/* Password toggle */}
            {showPasswordToggle && type === 'password' && !isLoading && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}

            {/* End icon */}
            {endIcon && !isLoading && (
              <div className="text-gray-400">
                {endIcon}
              </div>
            )}
          </div>
        </div>

        {/* Status message */}
        {statusMessage && (
          <div className={cn(
            'flex items-center text-xs',
            error && 'text-red-600',
            success && 'text-green-600',
            warning && 'text-yellow-600',
            !error && !success && !warning && 'text-gray-500'
          )}>
            {statusIcon && <statusIcon className="h-3 w-3 mr-1" />}
            {statusMessage}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Export variants for external usage
export { inputVariants };