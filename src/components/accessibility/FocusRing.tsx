// src/components/accessibility/FocusRing.tsx
import React from 'react';
import { clsx } from 'clsx';

/**
 * Focus Ring Component for WCAG 2.1 AA Compliance
 * Provides customizable focus indicators for better keyboard navigation
 */

export interface FocusRingProps {
  children: React.ReactNode;
  className?: string;
  within?: boolean; // Focus ring appears within the element
  offset?: number; // Distance from element edge
  color?: 'blue' | 'purple' | 'green' | 'red' | 'yellow' | 'custom';
  customColor?: string; // Custom color for focus ring
  thickness?: 'thin' | 'medium' | 'thick';
  style?: 'solid' | 'dashed' | 'dotted';
  rounded?: boolean; // Match element border radius
  visible?: 'focus' | 'focus-visible' | 'always';
  as?: keyof JSX.IntrinsicElements;
}

const colorClasses = {
  blue: 'ring-blue-500 dark:ring-blue-400',
  purple: 'ring-purple-500 dark:ring-purple-400',
  green: 'ring-green-500 dark:ring-green-400',
  red: 'ring-red-500 dark:ring-red-400',
  yellow: 'ring-yellow-500 dark:ring-yellow-400',
  custom: ''
};

const thicknessClasses = {
  thin: 'ring-1',
  medium: 'ring-2',
  thick: 'ring-4'
};

const offsetClasses = {
  0: 'ring-offset-0',
  1: 'ring-offset-1',
  2: 'ring-offset-2',
  4: 'ring-offset-4',
  8: 'ring-offset-8'
};

export const FocusRing: React.FC<FocusRingProps> = ({
  children,
  className,
  within = false,
  offset = 2,
  color = 'blue',
  customColor,
  thickness = 'medium',
  style = 'solid',
  rounded = true,
  visible = 'focus-visible',
  as: Component = 'div',
  ...props
}) => {
  const focusClasses = React.useMemo(() => {
    const classes: string[] = [];

    // Base focus styles
    classes.push('outline-none');

    // Visibility condition
    if (visible === 'focus') {
      classes.push('focus:ring');
    } else if (visible === 'focus-visible') {
      classes.push('focus-visible:ring');
    } else if (visible === 'always') {
      classes.push('ring');
    }

    // Color
    if (color === 'custom' && customColor) {
      classes.push(`[--tw-ring-color:${customColor}]`);
    } else {
      classes.push(colorClasses[color]);
    }

    // Thickness
    classes.push(thicknessClasses[thickness]);

    // Offset
    const offsetClass = offsetClasses[offset as keyof typeof offsetClasses];
    if (offsetClass) {
      classes.push(offsetClass);
    }

    // Within/inset
    if (within) {
      classes.push('ring-inset');
    }

    // Ring style
    if (style === 'dashed') {
      classes.push('[--tw-ring-style:dashed]');
    } else if (style === 'dotted') {
      classes.push('[--tw-ring-style:dotted]');
    }

    return classes;
  }, [color, customColor, thickness, offset, within, style, visible]);

  const customStyles = React.useMemo(() => {
    const styles: React.CSSProperties = {};

    if (color === 'custom' && customColor) {
      styles['--tw-ring-color' as any] = customColor;
    }

    if (style !== 'solid') {
      styles['--tw-ring-style' as any] = style;
    }

    return styles;
  }, [color, customColor, style]);

  return React.createElement(
    Component,
    {
      className: clsx(
        focusClasses,
        rounded && 'focus-visible:ring-offset-2',
        className
      ),
      style: customStyles,
      ...props
    },
    children
  );
};

/**
 * Enhanced Focus Ring with animations and advanced features
 */
export interface AnimatedFocusRingProps extends FocusRingProps {
  animate?: boolean;
  pulseOnFocus?: boolean;
  scaleOnFocus?: boolean;
  showFocusWithin?: boolean; // Show when any child is focused
}

export const AnimatedFocusRing: React.FC<AnimatedFocusRingProps> = ({
  children,
  animate = true,
  pulseOnFocus = false,
  scaleOnFocus = false,
  showFocusWithin = false,
  className,
  ...focusRingProps
}) => {
  const animationClasses = React.useMemo(() => {
    const classes: string[] = [];

    if (animate) {
      classes.push('transition-all duration-150 ease-in-out');
    }

    if (pulseOnFocus) {
      classes.push('focus-visible:animate-pulse');
    }

    if (scaleOnFocus) {
      classes.push('focus-visible:scale-105');
    }

    if (showFocusWithin) {
      classes.push('focus-within:ring');
      if (focusRingProps.color === 'custom' && focusRingProps.customColor) {
        // Custom color handling for focus-within
      } else {
        classes.push(colorClasses[focusRingProps.color || 'blue']);
      }
    }

    return classes;
  }, [animate, pulseOnFocus, scaleOnFocus, showFocusWithin, focusRingProps.color, focusRingProps.customColor]);

  return (
    <FocusRing
      {...focusRingProps}
      className={clsx(animationClasses, className)}
    >
      {children}
    </FocusRing>
  );
};

/**
 * Focus Ring for specific component types
 */
export const ButtonFocusRing: React.FC<Omit<FocusRingProps, 'as'>> = (props) => (
  <FocusRing
    as="button"
    rounded={true}
    offset={2}
    thickness="medium"
    {...props}
  />
);

export const InputFocusRing: React.FC<Omit<FocusRingProps, 'as'>> = (props) => (
  <FocusRing
    as="div"
    within={true}
    offset={0}
    thickness="medium"
    rounded={true}
    {...props}
  />
);

export const CardFocusRing: React.FC<Omit<FocusRingProps, 'as'>> = (props) => (
  <FocusRing
    as="div"
    offset={4}
    thickness="medium"
    rounded={true}
    {...props}
  />
);

/**
 * Focus Ring Context for managing focus states
 */
interface FocusRingContextValue {
  globalFocusVisible: boolean;
  setGlobalFocusVisible: (visible: boolean) => void;
  focusRingSettings: {
    color: FocusRingProps['color'];
    thickness: FocusRingProps['thickness'];
    style: FocusRingProps['style'];
  };
  updateSettings: (settings: Partial<FocusRingContextValue['focusRingSettings']>) => void;
}

const FocusRingContext = React.createContext<FocusRingContextValue | null>(null);

export interface FocusRingProviderProps {
  children: React.ReactNode;
  defaultColor?: FocusRingProps['color'];
  defaultThickness?: FocusRingProps['thickness'];
  defaultStyle?: FocusRingProps['style'];
}

export const FocusRingProvider: React.FC<FocusRingProviderProps> = ({
  children,
  defaultColor = 'blue',
  defaultThickness = 'medium',
  defaultStyle = 'solid'
}) => {
  const [globalFocusVisible, setGlobalFocusVisible] = React.useState(false);
  const [focusRingSettings, setFocusRingSettings] = React.useState({
    color: defaultColor,
    thickness: defaultThickness,
    style: defaultStyle
  });

  const updateSettings = React.useCallback((
    settings: Partial<FocusRingContextValue['focusRingSettings']>
  ) => {
    setFocusRingSettings(prev => ({ ...prev, ...settings }));
  }, []);

  const contextValue: FocusRingContextValue = React.useMemo(() => ({
    globalFocusVisible,
    setGlobalFocusVisible,
    focusRingSettings,
    updateSettings
  }), [globalFocusVisible, focusRingSettings, updateSettings]);

  // Global focus-visible detection
  React.useEffect(() => {
    let hadKeyboardEvent = true;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.altKey || e.ctrlKey) return;
      hadKeyboardEvent = true;
    };

    const onPointerDown = () => {
      hadKeyboardEvent = false;
    };

    const onFocus = () => {
      setGlobalFocusVisible(hadKeyboardEvent);
    };

    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('mousedown', onPointerDown, true);
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('touchstart', onPointerDown, true);
    document.addEventListener('focusin', onFocus, true);

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('mousedown', onPointerDown, true);
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('touchstart', onPointerDown, true);
      document.removeEventListener('focusin', onFocus, true);
    };
  }, []);

  return (
    <FocusRingContext.Provider value={contextValue}>
      {children}
    </FocusRingContext.Provider>
  );
};

/**
 * Hook to use focus ring context
 */
export const useFocusRing = () => {
  const context = React.useContext(FocusRingContext);
  if (!context) {
    throw new Error('useFocusRing must be used within a FocusRingProvider');
  }
  return context;
};

/**
 * Hook for focus-visible detection
 */
export const useFocusVisible = () => {
  const [isFocusVisible, setIsFocusVisible] = React.useState(false);

  React.useEffect(() => {
    let hadKeyboardEvent = true;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.altKey || e.ctrlKey) return;
      hadKeyboardEvent = true;
    };

    const onPointerDown = () => {
      hadKeyboardEvent = false;
    };

    const onFocus = () => {
      setIsFocusVisible(hadKeyboardEvent);
    };

    const onBlur = () => {
      setIsFocusVisible(false);
    };

    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('mousedown', onPointerDown, true);
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('touchstart', onPointerDown, true);
    document.addEventListener('focusin', onFocus, true);
    document.addEventListener('focusout', onBlur, true);

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('mousedown', onPointerDown, true);
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('touchstart', onPointerDown, true);
      document.removeEventListener('focusin', onFocus, true);
      document.removeEventListener('focusout', onBlur, true);
    };
  }, []);

  return isFocusVisible;
};

/**
 * Focus Ring utilities
 */
export const focusRingUtils = {
  /**
   * Get CSS custom properties for focus ring
   */
  getCSSProperties: (props: Pick<FocusRingProps, 'color' | 'customColor' | 'thickness' | 'style'>) => {
    const properties: { [key: string]: string } = {};

    if (props.color === 'custom' && props.customColor) {
      properties['--focus-ring-color'] = props.customColor;
    }

    if (props.style && props.style !== 'solid') {
      properties['--focus-ring-style'] = props.style;
    }

    return properties;
  },

  /**
   * Generate focus ring classes
   */
  getClasses: (props: FocusRingProps) => {
    const classes: string[] = ['outline-none'];

    // Visibility
    if (props.visible === 'focus') {
      classes.push('focus:ring');
    } else if (props.visible === 'focus-visible') {
      classes.push('focus-visible:ring');
    } else if (props.visible === 'always') {
      classes.push('ring');
    }

    // Color
    if (props.color !== 'custom') {
      classes.push(colorClasses[props.color || 'blue']);
    }

    // Thickness
    classes.push(thicknessClasses[props.thickness || 'medium']);

    // Offset
    const offsetClass = offsetClasses[props.offset as keyof typeof offsetClasses];
    if (offsetClass) {
      classes.push(offsetClass);
    }

    // Within
    if (props.within) {
      classes.push('ring-inset');
    }

    return classes;
  },

  /**
   * Check if focus should be visible
   */
  shouldShowFocus: (hadKeyboardEvent: boolean, isFocused: boolean) => {
    return hadKeyboardEvent && isFocused;
  }
};

export default {
  FocusRing,
  AnimatedFocusRing,
  ButtonFocusRing,
  InputFocusRing,
  CardFocusRing,
  FocusRingProvider,
  useFocusRing,
  useFocusVisible,
  focusRingUtils,
};