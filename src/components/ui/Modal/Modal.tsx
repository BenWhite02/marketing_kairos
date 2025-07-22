// File: src/components/ui/Modal/Modal.tsx
import React, { forwardRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/dom/classNames';
import { X } from 'lucide-react';

// Modal variants using CVA
const modalVariants = cva(
  'relative bg-white rounded-lg shadow-xl transform transition-all',
  {
    variants: {
      size: {
        xs: 'max-w-xs',
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        '6xl': 'max-w-6xl',
        full: 'max-w-full',
      },
      position: {
        center: '',
        top: 'mt-16',
        bottom: 'mb-16',
      },
    },
    defaultVariants: {
      size: 'md',
      position: 'center',
    },
  }
);

// Component prop types
export interface ModalProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modalVariants> {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to call when modal should close */
  onClose: () => void;
  /** Modal title */
  title?: React.ReactNode;
  /** Modal description */
  description?: React.ReactNode;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Whether clicking overlay closes modal */
  closeOnOverlayClick?: boolean;
  /** Whether pressing escape closes modal */
  closeOnEscape?: boolean;
  /** Custom close button */
  closeButton?: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Loading state */
  isLoading?: boolean;
  /** Custom overlay className */
  overlayClassName?: string;
  /** Custom content className */
  contentClassName?: string;
  /** Z-index for the modal */
  zIndex?: number;
  /** Portal container element */
  portalContainer?: Element;
  /** Prevent body scroll when modal is open */
  preventScroll?: boolean;
}

// Modal component
export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      className,
      size,
      position,
      isOpen,
      onClose,
      title,
      description,
      showCloseButton = true,
      closeOnOverlayClick = true,
      closeOnEscape = true,
      closeButton,
      footer,
      isLoading = false,
      overlayClassName,
      contentClassName,
      zIndex = 50,
      portalContainer,
      preventScroll = true,
      children,
      ...props
    },
    ref
  ) => {
    // Handle escape key
    useEffect(() => {
      if (!isOpen || !closeOnEscape) return;

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, closeOnEscape, onClose]);

    // Handle body scroll prevention
    useEffect(() => {
      if (!isOpen || !preventScroll) return;

      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalStyle;
      };
    }, [isOpen, preventScroll]);

    // Handle overlay click
    const handleOverlayClick = (event: React.MouseEvent) => {
      if (event.target === event.currentTarget && closeOnOverlayClick) {
        onClose();
      }
    };

    if (!isOpen) return null;

    const modalContent = (
      <div
        className={cn(
          'fixed inset-0 flex items-center justify-center p-4',
          overlayClassName
        )}
        style={{ zIndex }}
        onClick={handleOverlayClick}
      >
        {/* Overlay backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          aria-hidden="true"
        />

        {/* Modal content */}
        <div
          ref={ref}
          className={cn(
            modalVariants({ size, position }),
            'relative w-full mx-auto',
            contentClassName,
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          aria-describedby={description ? 'modal-description' : undefined}
          {...props}
        >
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg z-10">
              <div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-blue-600 rounded-full" />
            </div>
          )}

          {/* Header */}
          {(title || description || showCloseButton) && (
            <div className="flex items-start justify-between p-6 pb-4">
              <div className="flex-1 min-w-0">
                {title && (
                  <h3 
                    id="modal-title"
                    className="text-lg font-semibold text-gray-900 mb-1"
                  >
                    {title}
                  </h3>
                )}
                {description && (
                  <p 
                    id="modal-description"
                    className="text-sm text-gray-500"
                  >
                    {description}
                  </p>
                )}
              </div>

              {/* Close button */}
              {showCloseButton && (
                <div className="flex-shrink-0 ml-4">
                  {closeButton || (
                    <button
                      type="button"
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1"
                    >
                      <span className="sr-only">Close</span>
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Body */}
          <div className={cn(
            'px-6',
            !(title || description || showCloseButton) && 'pt-6',
            !footer && 'pb-6'
          )}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              {footer}
            </div>
          )}
        </div>
      </div>
    );

    // Render in portal
    const container = portalContainer || document.body;
    return createPortal(modalContent, container);
  }
);

Modal.displayName = 'Modal';

// Export variants for external usage
export { modalVariants };