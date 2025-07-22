// File: src/components/ui/Input/Select.tsx
import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/dom/classNames';
import { ChevronDown, AlertCircle, Check } from 'lucide-react';

// Select variants using CVA
const selectVariants = cva(
  'flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
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

// Option type
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
  icon?: React.ReactNode;
}

// Component prop types
export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof selectVariants> {
  /** Label for the select */
  label?: string;
  /** Helper text below select */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Success message */
  success?: string;
  /** Warning message */
  warning?: string;
  /** Options array */
  options: SelectOption[];
  /** Placeholder text */
  placeholder?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Required field indicator */
  required?: boolean;
  /** Select container className */
  containerClassName?: string;
  /** Label className */
  labelClassName?: string;
  /** Custom dropdown icon */
  dropdownIcon?: React.ReactNode;
  /** Allow clearing selection */
  clearable?: boolean;
  /** Search functionality */
  searchable?: boolean;
}

// Select component with forwardRef
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
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
      options,
      placeholder = 'Select an option...',
      isLoading,
      required,
      containerClassName,
      labelClassName,
      dropdownIcon,
      clearable = false,
      disabled,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    // Determine variant based on state
    const currentVariant = error ? 'error' : success ? 'success' : warning ? 'warning' : variant;

    // Get status message and icon
    const statusMessage = error || success || warning || helperText;
    const statusIcon = error ? AlertCircle : null;

    // Find selected option
    const selectedOption = options.find(option => option.value === value);

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

        {/* Select container */}
        <div className="relative">
          <select
            ref={ref}
            disabled={disabled || isLoading}
            value={value}
            onChange={onChange}
            className={cn(
              selectVariants({ variant: currentVariant, size }),
              'appearance-none cursor-pointer pr-10',
              !value && 'text-gray-400',
              className
            )}
            {...props}
          >
            {/* Placeholder option */}
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}

            {/* Regular options */}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className={cn(
                  'text-gray-900',
                  option.disabled && 'text-gray-400'
                )}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Dropdown icon */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            {isLoading ? (
              <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full" />
            ) : (
              dropdownIcon || <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>

          {/* Clear button */}
          {clearable && value && !isLoading && (
            <button
              type="button"
              onClick={() => onChange?.({ target: { value: '' } } as any)}
              className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
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

Select.displayName = 'Select';

// Export variants for external usage
export { selectVariants };