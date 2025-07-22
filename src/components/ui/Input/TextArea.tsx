// File: src/components/ui/Input/TextArea.tsx
import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/dom/classNames';
import { AlertCircle } from 'lucide-react';

// TextArea variants using CVA
const textAreaVariants = cva(
  'flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical',
  {
    variants: {
      variant: {
        default: 'border-gray-300 focus-visible:border-blue-500',
        error: 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500',
        success: 'border-green-500 focus-visible:border-green-500 focus-visible:ring-green-500',
        warning: 'border-yellow-500 focus-visible:border-yellow-500 focus-visible:ring-yellow-500',
      },
      size: {
        sm: 'min-h-[80px] px-2 py-1 text-xs',
        md: 'min-h-[100px] px-3 py-2 text-sm',
        lg: 'min-h-[120px] px-4 py-3 text-base',
      },
      resize: {
        none: 'resize-none',
        vertical: 'resize-y',
        horizontal: 'resize-x',
        both: 'resize',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      resize: 'vertical',
    },
  }
);

// Component prop types
export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textAreaVariants> {
  /** Label for the textarea */
  label?: string;
  /** Helper text below textarea */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Success message */
  success?: string;
  /** Warning message */
  warning?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Required field indicator */
  required?: boolean;
  /** TextArea container className */
  containerClassName?: string;
  /** Label className */
  labelClassName?: string;
  /** Show character count */
  showCharCount?: boolean;
  /** Maximum characters allowed */
  maxLength?: number;
  /** Auto-resize based on content */
  autoResize?: boolean;
}

// TextArea component with forwardRef
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      className,
      variant,
      size,
      resize,
      label,
      helperText,
      error,
      success,
      warning,
      isLoading,
      required,
      containerClassName,
      labelClassName,
      showCharCount = false,
      maxLength,
      autoResize = false,
      disabled,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [charCount, setCharCount] = React.useState(0);
    const textAreaRef = React.useRef<HTMLTextAreaElement | null>(null);

    // Determine variant based on state
    const currentVariant = error ? 'error' : success ? 'success' : warning ? 'warning' : variant;

    // Get status message and icon
    const statusMessage = error || success || warning || helperText;
    const statusIcon = error ? AlertCircle : null;

    // Handle character count
    React.useEffect(() => {
      if (typeof value === 'string') {
        setCharCount(value.length);
      }
    }, [value]);

    // Handle auto-resize
    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize && textAreaRef.current) {
        textAreaRef.current.style.height = 'auto';
        textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
      }
      
      setCharCount(e.target.value.length);
      onChange?.(e);
    }, [autoResize, onChange]);

    // Set refs
    const setRefs = React.useCallback((element: HTMLTextAreaElement | null) => {
      textAreaRef.current = element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    }, [ref]);

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

        {/* TextArea field */}
        <textarea
          ref={setRefs}
          disabled={disabled || isLoading}
          maxLength={maxLength}
          value={value}
          onChange={handleChange}
          className={cn(
            textAreaVariants({ variant: currentVariant, size, resize: autoResize ? 'none' : resize }),
            isLoading && 'cursor-wait',
            className
          )}
          {...props}
        />

        {/* Bottom row with status message and character count */}
        <div className="flex justify-between items-start">
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

          {/* Character count */}
          {showCharCount && (
            <div className={cn(
              'text-xs',
              maxLength && charCount > maxLength * 0.9 ? 'text-red-500' :
              maxLength && charCount > maxLength * 0.8 ? 'text-yellow-500' :
              'text-gray-400'
            )}>
              {charCount}{maxLength && `/${maxLength}`}
            </div>
          )}
        </div>
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

// Export variants for external usage
export { textAreaVariants };