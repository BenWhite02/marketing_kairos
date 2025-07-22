// src/components/ui/Tooltip/Tooltip.tsx

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/dom/classNames';

const tooltipVariants = cva(
  'absolute z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-lg pointer-events-none transition-opacity duration-200',
  {
    variants: {
      variant: {
        default: 'bg-gray-900 text-white',
        light: 'bg-white text-gray-900 border border-gray-200 shadow-lg',
        error: 'bg-red-600 text-white',
        warning: 'bg-yellow-600 text-white',
        success: 'bg-green-600 text-white',
        info: 'bg-blue-600 text-white',
      },
      size: {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-2 text-sm',
        lg: 'px-4 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface TooltipProps extends VariantProps<typeof tooltipVariants> {
  content: React.ReactNode;
  children: React.ReactElement;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  disabled?: boolean;
  className?: string;
  maxWidth?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement = 'top',
  delay = 500,
  disabled = false,
  variant,
  size,
  className,
  maxWidth = '300px',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    if (disabled || !content) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    let x = 0;
    let y = 0;

    switch (placement) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.top - tooltipRect.height - 8;
        break;
      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.bottom + 8;
        break;
      case 'left':
        x = triggerRect.left - tooltipRect.width - 8;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
      case 'right':
        x = triggerRect.right + 8;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
    }

    // Ensure tooltip stays within viewport
    x = Math.max(8, Math.min(x, viewport.width - tooltipRect.width - 8));
    y = Math.max(8, Math.min(y, viewport.height - tooltipRect.height - 8));

    setPosition({ x, y });
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      
      const handleResize = () => updatePosition();
      const handleScroll = () => updatePosition();
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [isVisible, placement]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const clonedChild = React.cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: (e: React.MouseEvent) => {
      children.props.onMouseEnter?.(e);
      showTooltip();
    },
    onMouseLeave: (e: React.MouseEvent) => {
      children.props.onMouseLeave?.(e);
      hideTooltip();
    },
    onFocus: (e: React.FocusEvent) => {
      children.props.onFocus?.(e);
      showTooltip();
    },
    onBlur: (e: React.FocusEvent) => {
      children.props.onBlur?.(e);
      hideTooltip();
    },
  });

  const tooltipElement = isVisible && content ? (
    <div
      ref={tooltipRef}
      className={cn(tooltipVariants({ variant, size }), className)}
      style={{
        left: position.x,
        top: position.y,
        maxWidth,
        opacity: isVisible ? 1 : 0,
      }}
      role="tooltip"
    >
      {content}
      
      {/* Arrow */}
      <div
        className={cn(
          'absolute w-2 h-2 transform rotate-45',
          variant === 'light' 
            ? 'bg-white border-l border-t border-gray-200' 
            : variant === 'error'
            ? 'bg-red-600'
            : variant === 'warning'
            ? 'bg-yellow-600'
            : variant === 'success'
            ? 'bg-green-600'
            : variant === 'info'
            ? 'bg-blue-600'
            : 'bg-gray-900',
          placement === 'top' && 'bottom-[-4px] left-1/2 -translate-x-1/2',
          placement === 'bottom' && 'top-[-4px] left-1/2 -translate-x-1/2',
          placement === 'left' && 'right-[-4px] top-1/2 -translate-y-1/2',
          placement === 'right' && 'left-[-4px] top-1/2 -translate-y-1/2'
        )}
      />
    </div>
  ) : null;

  return (
    <>
      {clonedChild}
      {tooltipElement && createPortal(tooltipElement, document.body)}
    </>
  );
};