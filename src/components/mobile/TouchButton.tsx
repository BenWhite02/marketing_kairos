// src/components/mobile/TouchButton.tsx
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button, ButtonProps } from '../ui/Button';

interface TouchButtonProps extends ButtonProps {
  hapticFeedback?: boolean;
  ripple?: boolean;
  longPressDelay?: number;
  onLongPress?: () => void;
}

export const TouchButton: React.FC<TouchButtonProps> = ({
  hapticFeedback = true,
  ripple = true,
  longPressDelay = 500,
  onLongPress,
  onClick,
  children,
  className,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [rippleCoords, setRippleCoords] = useState<{ x: number; y: number } | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const triggerHapticFeedback = useCallback(() => {
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10); // Light haptic feedback
    }
  }, [hapticFeedback]);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    setIsPressed(true);
    triggerHapticFeedback();

    // Handle ripple effect
    if (ripple) {
      const rect = event.currentTarget.getBoundingClientRect();
      const touch = event.touches[0];
      setRippleCoords({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      });
    }

    // Handle long press
    if (onLongPress) {
      const timer = setTimeout(() => {
        onLongPress();
        if (hapticFeedback && 'vibrate' in navigator) {
          navigator.vibrate([50, 50, 50]); // Long press haptic pattern
        }
      }, longPressDelay);
      setLongPressTimer(timer);
    }
  }, [hapticFeedback, ripple, onLongPress, longPressDelay, triggerHapticFeedback]);

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false);
    setRippleCoords(null);
    
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  const handleClick = useCallback((event: React.MouseEvent) => {
    triggerHapticFeedback();
    onClick?.(event);
  }, [onClick, triggerHapticFeedback]);

  return (
    <motion.div
      className="relative overflow-hidden"
      animate={{
        scale: isPressed ? 0.98 : 1,
      }}
      transition={{ duration: 0.1 }}
    >
      <Button
        {...props}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`
          relative select-none touch-manipulation
          ${isPressed ? 'brightness-95' : ''}
          ${className}
        `}
      >
        {children}
        
        {/* Ripple Effect */}
        {ripple && rippleCoords && (
          <motion.div
            className="absolute pointer-events-none bg-white/20 rounded-full"
            style={{
              left: rippleCoords.x - 20,
              top: rippleCoords.y - 20,
              width: 40,
              height: 40,
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </Button>
    </motion.div>
  );
};

// src/components/mobile/SwipeableCard.tsx
import React, { useState, useRef, useCallback } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { TrashIcon, PencilIcon, ShareIcon } from '@heroicons/react/24/outline';

interface SwipeAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  backgroundColor: string;
  action: () => void;
}

interface SwipeableCardProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  swipeThreshold?: number;
  className?: string;
  disabled?: boolean;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  leftActions = [],
  rightActions = [],
  swipeThreshold = 80,
  className,
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [actionTriggered, setActionTriggered] = useState<string | null>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.8, 1, 1, 1, 0.8]);
  const leftActionOpacity = useTransform(x, [0, swipeThreshold], [0, 1]);
  const rightActionOpacity = useTransform(x, [-swipeThreshold, 0], [1, 0]);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    setIsDragging(false);
    
    const threshold = swipeThreshold;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    // Determine if an action should be triggered
    if (Math.abs(offset) > threshold || Math.abs(velocity) > 500) {
      if (offset > 0 && leftActions.length > 0) {
        // Swipe right - trigger left action
        const actionIndex = Math.min(
          Math.floor((offset - threshold) / 60),
          leftActions.length - 1
        );
        const action = leftActions[actionIndex];
        setActionTriggered(action.id);
        action.action();
      } else if (offset < 0 && rightActions.length > 0) {
        // Swipe left - trigger right action
        const actionIndex = Math.min(
          Math.floor((Math.abs(offset) - threshold) / 60),
          rightActions.length - 1
        );
        const action = rightActions[actionIndex];
        setActionTriggered(action.id);
        action.action();
      }
    }

    // Reset position
    x.set(0);
    setTimeout(() => setActionTriggered(null), 300);
  }, [x, swipeThreshold, leftActions, rightActions]);

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={constraintsRef} className={`relative overflow-hidden ${className}`}>
      {/* Left Actions Background */}
      {leftActions.length > 0 && (
        <motion.div
          className="absolute left-0 top-0 bottom-0 flex items-center"
          style={{ opacity: leftActionOpacity }}
        >
          {leftActions.map((action, index) => (
            <motion.div
              key={action.id}
              className={`
                flex items-center justify-center w-16 h-full
                ${action.backgroundColor} ${action.color}
              `}
              style={{
                x: useTransform(x, [0, (index + 1) * 80], [-(index + 1) * 60, 0])
              }}
            >
              <action.icon className="w-6 h-6" />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Right Actions Background */}
      {rightActions.length > 0 && (
        <motion.div
          className="absolute right-0 top-0 bottom-0 flex items-center"
          style={{ opacity: rightActionOpacity }}
        >
          {rightActions.map((action, index) => (
            <motion.div
              key={action.id}
              className={`
                flex items-center justify-center w-16 h-full
                ${action.backgroundColor} ${action.color}
              `}
              style={{
                x: useTransform(x, [-(index + 1) * 80, 0], [0, (index + 1) * 60])
              }}
            >
              <action.icon className="w-6 h-6" />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Main Card Content */}
      <motion.div
        drag="x"
        dragConstraints={constraintsRef}
        dragElastic={0.2}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{ x, opacity }}
        className={`
          relative z-10 bg-white dark:bg-gray-800
          ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
          ${actionTriggered ? 'transition-all duration-300' : ''}
        `}
        whileTap={{ scale: 0.98 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

// src/components/mobile/PullToRefresh.tsx
import React, { useState, useRef, useCallback } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  refreshThreshold?: number;
  className?: string;
  disabled?: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  refreshThreshold = 80,
  className,
  disabled = false
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);
  
  const y = useMotionValue(0);
  const refreshProgress = useTransform(y, [0, refreshThreshold], [0, 1]);
  const pullIndicatorRotation = useTransform(y, [0, refreshThreshold], [0, 180]);
  const pullIndicatorScale = useTransform(y, [0, refreshThreshold], [0.5, 1]);

  const handleDragStart = useCallback(() => {
    if (!disabled && !isRefreshing) {
      setIsPulling(true);
    }
  }, [disabled, isRefreshing]);

  const handleDragEnd = useCallback(async (event: any, info: PanInfo) => {
    setIsPulling(false);
    
    if (disabled || isRefreshing) return;

    if (info.offset.y > refreshThreshold) {
      setIsRefreshing(true);
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }

    y.set(0);
  }, [disabled, isRefreshing, refreshThreshold, onRefresh, y]);

  const dragConstraints = {
    top: 0,
    bottom: isRefreshing ? refreshThreshold : refreshThreshold * 1.5
  };

  return (
    <div ref={constraintsRef} className={`relative overflow-hidden ${className}`}>
      {/* Pull Indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center"
        style={{
          height: refreshThreshold,
          y: useTransform(y, [0, refreshThreshold], [-refreshThreshold, 0])
        }}
      >
        <motion.div
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-300"
          style={{
            opacity: refreshProgress,
            scale: pullIndicatorScale
          }}
        >
          <motion.div
            style={{ rotate: isRefreshing ? 360 : pullIndicatorRotation }}
            animate={isRefreshing ? { rotate: 360 } : {}}
            transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
          >
            <ArrowPathIcon className="w-5 h-5" />
          </motion.div>
          <span className="text-sm font-medium">
            {isRefreshing ? 'Refreshing...' : isPulling ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        drag="y"
        dragConstraints={dragConstraints}
        dragElastic={0.3}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{ y }}
        className="relative"
      >
        {children}
      </motion.div>
    </div>
  );
};

// src/components/mobile/BottomSheet.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { createPortal } from 'react-dom';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoints?: number[];
  initialSnap?: number;
  className?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  snapPoints = [0.3, 0.7, 0.9],
  initialSnap = 1,
  className
}) => {
  const [currentSnap, setCurrentSnap] = useState(initialSnap);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    
    const windowHeight = window.innerHeight;
    const currentY = windowHeight - (windowHeight * snapPoints[currentSnap]);
    const dragY = currentY + info.offset.y;
    const newHeightPercentage = (windowHeight - dragY) / windowHeight;

    // Find closest snap point
    let closestSnapIndex = 0;
    let closestDistance = Math.abs(snapPoints[0] - newHeightPercentage);

    snapPoints.forEach((snap, index) => {
      const distance = Math.abs(snap - newHeightPercentage);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestSnapIndex = index;
      }
    });

    // Close if dragged below minimum
    if (newHeightPercentage < snapPoints[0] * 0.5) {
      onClose();
    } else {
      setCurrentSnap(closestSnapIndex);
    }
  };

  const sheetHeight = `${snapPoints[currentSnap] * 100}vh`;

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end"
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Bottom Sheet */}
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          initial={{ y: '100%' }}
          animate={{ 
            y: 0,
            height: sheetHeight,
            transition: { type: 'spring', damping: 30, stiffness: 300 }
          }}
          exit={{ y: '100%' }}
          className={`
            relative w-full bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl
            ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
            ${className}
          `}
        >
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>

          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-auto px-6 py-4">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

// src/components/mobile/TouchGestures.tsx
import React, { useRef, useState, useCallback } from 'react';
import { motion, PanInfo } from 'framer-motion';

interface TouchGesturesProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onDoubleTap?: () => void;
  swipeThreshold?: number;
  className?: string;
}

export const TouchGestures: React.FC<TouchGesturesProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  onDoubleTap,
  swipeThreshold = 50,
  className
}) => {
  const [lastTap, setLastTap] = useState(0);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });

    // Handle pinch gesture
    if (event.touches.length === 2 && onPinch) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      setInitialPinchDistance(distance);
    }
  }, [onPinch]);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (event.touches.length === 2 && onPinch && initialPinchDistance) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      const scale = distance / initialPinchDistance;
      onPinch(scale);
    }
  }, [onPinch, initialPinchDistance]);

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Handle swipe gestures
    if (Math.max(absDeltaX, absDeltaY) > swipeThreshold) {
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }
    }

    // Handle double tap
    if (onDoubleTap && absDeltaX < 10 && absDeltaY < 10) {
      const now = Date.now();
      if (now - lastTap < 300) {
        onDoubleTap();
      }
      setLastTap(now);
    }

    setTouchStart(null);
    setInitialPinchDistance(null);
  }, [touchStart, swipeThreshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onDoubleTap, lastTap]);

  return (
    <div
      className={`touch-manipulation ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
};