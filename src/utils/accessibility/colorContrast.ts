// src/utils/accessibility/colorContrast.ts
/**
 * Color Contrast Validation for WCAG 2.1 AA/AAA Compliance
 * Provides color contrast calculation and validation utilities
 */

export interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

export interface ColorHSL {
  h: number;
  s: number;
  l: number;
}

export interface ContrastResult {
  ratio: number;
  wcagAA: boolean;
  wcagAAA: boolean;
  wcagAALarge: boolean;
  wcagAAALarge: boolean;
  grade: 'Fail' | 'AA' | 'AA Large' | 'AAA' | 'AAA Large';
  recommendation?: string;
}

export interface ColorValidation {
  isValid: boolean;
  contrast: ContrastResult;
  suggestions?: string[];
}

/**
 * Color utility functions
 */
export class ColorUtils {
  /**
   * Convert hex color to RGB
   */
  static hexToRgb(hex: string): ColorRGB | null {
    // Remove # if present
    hex = hex.replace('#', '');

    // Support 3-character hex
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }

    if (hex.length !== 6) {
      return null;
    }

    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    return { r, g, b };
  }

  /**
   * Convert RGB to hex
   */
  static rgbToHex(rgb: ColorRGB): string {
    const toHex = (n: number) => {
      const hex = Math.round(n).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  }

  /**
   * Convert RGB to HSL
   */
  static rgbToHsl(rgb: ColorRGB): ColorHSL {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let h = 0;
    let s = 0;
    let l = (max + min) / 2;

    if (diff !== 0) {
      s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);

      switch (max) {
        case r:
          h = (g - b) / diff + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / diff + 2;
          break;
        case b:
          h = (r - g) / diff + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  /**
   * Convert HSL to RGB
   */
  static hslToRgb(hsl: ColorHSL): ColorRGB {
    const h = hsl.h / 360;
    const s = hsl.s / 100;
    const l = hsl.l / 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  /**
   * Parse color string to RGB
   */
  static parseColor(color: string): ColorRGB | null {
    // Handle hex colors
    if (color.startsWith('#')) {
      return this.hexToRgb(color);
    }

    // Handle rgb/rgba colors
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (rgbMatch) {
      return {
        r: parseInt(rgbMatch[1]),
        g: parseInt(rgbMatch[2]),
        b: parseInt(rgbMatch[3])
      };
    }

    // Handle hsl/hsla colors
    const hslMatch = color.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*[\d.]+)?\)/);
    if (hslMatch) {
      return this.hslToRgb({
        h: parseInt(hslMatch[1]),
        s: parseInt(hslMatch[2]),
        l: parseInt(hslMatch[3])
      });
    }

    // Handle named colors (basic set)
    const namedColors: { [key: string]: ColorRGB } = {
      black: { r: 0, g: 0, b: 0 },
      white: { r: 255, g: 255, b: 255 },
      red: { r: 255, g: 0, b: 0 },
      green: { r: 0, g: 128, b: 0 },
      blue: { r: 0, g: 0, b: 255 },
      yellow: { r: 255, g: 255, b: 0 },
      cyan: { r: 0, g: 255, b: 255 },
      magenta: { r: 255, g: 0, b: 255 },
      gray: { r: 128, g: 128, b: 128 },
      grey: { r: 128, g: 128, b: 128 }
    };

    return namedColors[color.toLowerCase()] || null;
  }
}

/**
 * Contrast calculation utilities
 */
export class ContrastCalculator {
  /**
   * Calculate relative luminance of a color
   */
  static getRelativeLuminance(rgb: ColorRGB): number {
    const sRGB = [rgb.r, rgb.g, rgb.b].map(channel => {
      const c = channel / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  }

  /**
   * Calculate contrast ratio between two colors
   */
  static getContrastRatio(color1: ColorRGB, color2: ColorRGB): number {
    const lum1 = this.getRelativeLuminance(color1);
    const lum2 = this.getRelativeLuminance(color2);

    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
  }

  /**
   * Evaluate contrast against WCAG standards
   */
  static evaluateContrast(
    foreground: ColorRGB,
    background: ColorRGB,
    isLargeText: boolean = false
  ): ContrastResult {
    const ratio = this.getContrastRatio(foreground, background);

    // WCAG 2.1 standards
    const wcagAA = ratio >= (isLargeText ? 3 : 4.5);
    const wcagAAA = ratio >= (isLargeText ? 4.5 : 7);
    const wcagAALarge = ratio >= 3;
    const wcagAAALarge = ratio >= 4.5;

    let grade: ContrastResult['grade'] = 'Fail';
    if (ratio >= 7) {
      grade = 'AAA';
    } else if (ratio >= 4.5) {
      grade = isLargeText ? 'AAA Large' : 'AA';
    } else if (ratio >= 3) {
      grade = 'AA Large';
    }

    let recommendation: string | undefined;
    if (!wcagAA) {
      const targetRatio = isLargeText ? 3 : 4.5;
      recommendation = `Increase contrast to at least ${targetRatio}:1 for WCAG AA compliance`;
    }

    return {
      ratio: Math.round(ratio * 100) / 100,
      wcagAA,
      wcagAAA,
      wcagAALarge,
      wcagAAALarge,
      grade,
      recommendation
    };
  }
}

/**
 * Color accessibility validator
 */
export class ColorAccessibilityValidator {
  /**
   * Validate color combination
   */
  static validateColorCombination(
    foreground: string,
    background: string,
    isLargeText: boolean = false
  ): ColorValidation {
    const fgColor = ColorUtils.parseColor(foreground);
    const bgColor = ColorUtils.parseColor(background);

    if (!fgColor || !bgColor) {
      return {
        isValid: false,
        contrast: {
          ratio: 0,
          wcagAA: false,
          wcagAAA: false,
          wcagAALarge: false,
          wcagAAALarge: false,
          grade: 'Fail',
          recommendation: 'Invalid color format'
        }
      };
    }

    const contrast = ContrastCalculator.evaluateContrast(fgColor, bgColor, isLargeText);
    const suggestions = this.generateSuggestions(fgColor, bgColor, contrast);

    return {
      isValid: contrast.wcagAA,
      contrast,
      suggestions
    };
  }

  /**
   * Generate color improvement suggestions
   */
  private static generateSuggestions(
    foreground: ColorRGB,
    background: ColorRGB,
    contrast: ContrastResult
  ): string[] {
    const suggestions: string[] = [];

    if (!contrast.wcagAA) {
      const fgHsl = ColorUtils.rgbToHsl(foreground);
      const bgHsl = ColorUtils.rgbToHsl(background);

      // Suggest darkening foreground or lightening background
      if (fgHsl.l > 50) {
        suggestions.push('Try darkening the text color');
      } else {
        suggestions.push('Try lightening the background color');
      }

      // Suggest alternative color approaches
      if (Math.abs(fgHsl.l - bgHsl.l) < 50) {
        suggestions.push('Increase the lightness difference between foreground and background');
      }

      if (fgHsl.s > 80 && bgHsl.s > 80) {
        suggestions.push('Reduce saturation of one color to improve contrast');
      }
    }

    return suggestions;
  }

  /**
   * Find accessible color alternatives
   */
  static findAccessibleAlternatives(
    baseColor: string,
    targetBackground: string,
    isLargeText: boolean = false
  ): string[] {
    const baseRgb = ColorUtils.parseColor(baseColor);
    const bgRgb = ColorUtils.parseColor(targetBackground);

    if (!baseRgb || !bgRgb) return [];

    const alternatives: string[] = [];
    const baseHsl = ColorUtils.rgbToHsl(baseRgb);
    const targetRatio = isLargeText ? 3 : 4.5;

    // Try different lightness values
    for (let l = 0; l <= 100; l += 5) {
      const testColor: ColorRGB = ColorUtils.hslToRgb({
        h: baseHsl.h,
        s: baseHsl.s,
        l: l
      });

      const ratio = ContrastCalculator.getContrastRatio(testColor, bgRgb);
      if (ratio >= targetRatio) {
        alternatives.push(ColorUtils.rgbToHex(testColor));
      }
    }

    // Remove duplicates and sort by similarity to original
    const uniqueAlternatives = Array.from(new Set(alternatives));
    return uniqueAlternatives.slice(0, 5); // Return top 5 alternatives
  }
}

/**
 * Theme accessibility utilities
 */
export class ThemeAccessibilityUtils {
  /**
   * Validate entire color theme
   */
  static validateTheme(theme: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  }): { [key: string]: ColorValidation } {
    const validations: { [key: string]: ColorValidation } = {};

    // Test common color combinations
    validations['primary-on-background'] = ColorAccessibilityValidator.validateColorCombination(
      theme.primary, theme.background
    );

    validations['text-on-background'] = ColorAccessibilityValidator.validateColorCombination(
      theme.text, theme.background
    );

    validations['text-on-surface'] = ColorAccessibilityValidator.validateColorCombination(
      theme.text, theme.surface
    );

    validations['secondary-text-on-background'] = ColorAccessibilityValidator.validateColorCombination(
      theme.textSecondary, theme.background
    );

    validations['primary-on-surface'] = ColorAccessibilityValidator.validateColorCombination(
      theme.primary, theme.surface
    );

    return validations;
  }

  /**
   * Generate accessible color palette
   */
  static generateAccessiblePalette(baseColors: {
    primary: string;
    secondary: string;
    background: string;
  }): {
    colors: { [key: string]: string };
    validation: { [key: string]: ColorValidation };
  } {
    const palette: { [key: string]: string } = {};
    const validation: { [key: string]: ColorValidation } = {};

    // Parse base colors
    const primaryRgb = ColorUtils.parseColor(baseColors.primary);
    const secondaryRgb = ColorUtils.parseColor(baseColors.secondary);
    const backgroundRgb = ColorUtils.parseColor(baseColors.background);

    if (!primaryRgb || !secondaryRgb || !backgroundRgb) {
      throw new Error('Invalid base colors provided');
    }

    // Generate accessible text colors
    const lightText = { r: 255, g: 255, b: 255 };
    const darkText = { r: 0, g: 0, b: 0 };

    // Determine best text color for background
    const lightOnBg = ContrastCalculator.getContrastRatio(lightText, backgroundRgb);
    const darkOnBg = ContrastCalculator.getContrastRatio(darkText, backgroundRgb);

    palette.text = lightOnBg > darkOnBg ? '#ffffff' : '#000000';
    palette.textSecondary = lightOnBg > darkOnBg ? '#e0e0e0' : '#666666';

    // Generate surface colors with proper contrast
    const backgroundHsl = ColorUtils.rgbToHsl(backgroundRgb);
    const surfaceLightness = backgroundHsl.l > 50 ? backgroundHsl.l - 5 : backgroundHsl.l + 5;
    
    palette.surface = ColorUtils.rgbToHex(ColorUtils.hslToRgb({
      h: backgroundHsl.h,
      s: Math.max(backgroundHsl.s - 10, 0),
      l: Math.max(0, Math.min(100, surfaceLightness))
    }));

    // Generate accessible primary variants
    const primaryHsl = ColorUtils.rgbToHsl(primaryRgb);
    palette.primaryLight = ColorUtils.rgbToHex(ColorUtils.hslToRgb({
      h: primaryHsl.h,
      s: Math.max(primaryHsl.s - 20, 0),
      l: Math.min(primaryHsl.l + 20, 90)
    }));

    palette.primaryDark = ColorUtils.rgbToHex(ColorUtils.hslToRgb({
      h: primaryHsl.h,
      s: Math.min(primaryHsl.s + 10, 100),
      l: Math.max(primaryHsl.l - 20, 10)
    }));

    // Validate all combinations
    validation['text-on-background'] = ColorAccessibilityValidator.validateColorCombination(
      palette.text, baseColors.background
    );
    validation['text-on-surface'] = ColorAccessibilityValidator.validateColorCombination(
      palette.text, palette.surface
    );
    validation['primary-on-background'] = ColorAccessibilityValidator.validateColorCombination(
      baseColors.primary, baseColors.background
    );

    return { colors: palette, validation };
  }

  /**
   * Auto-fix accessibility issues in color theme
   */
  static autoFixTheme(theme: { [key: string]: string }): { [key: string]: string } {
    const fixedTheme = { ...theme };
    
    // Fix text on background if needed
    if (fixedTheme.text && fixedTheme.background) {
      const validation = ColorAccessibilityValidator.validateColorCombination(
        fixedTheme.text, fixedTheme.background
      );
      
      if (!validation.isValid) {
        const alternatives = ColorAccessibilityValidator.findAccessibleAlternatives(
          fixedTheme.text, fixedTheme.background
        );
        if (alternatives.length > 0) {
          fixedTheme.text = alternatives[0];
        }
      }
    }

    // Fix primary on background if needed
    if (fixedTheme.primary && fixedTheme.background) {
      const validation = ColorAccessibilityValidator.validateColorCombination(
        fixedTheme.primary, fixedTheme.background
      );
      
      if (!validation.isValid) {
        const alternatives = ColorAccessibilityValidator.findAccessibleAlternatives(
          fixedTheme.primary, fixedTheme.background
        );
        if (alternatives.length > 0) {
          fixedTheme.primaryAccessible = alternatives[0];
        }
      }
    }

    return fixedTheme;
  }
}

/**
 * Real-time contrast checker for live editing
 */
export class LiveContrastChecker {
  private element: HTMLElement;
  private callback: (validation: ColorValidation) => void;
  private observer: MutationObserver;

  constructor(element: HTMLElement, callback: (validation: ColorValidation) => void) {
    this.element = element;
    this.callback = callback;
    this.observer = new MutationObserver(this.handleMutation);
    this.startObserving();
    this.checkContrast(); // Initial check
  }

  private startObserving(): void {
    this.observer.observe(this.element, {
      attributes: true,
      attributeFilter: ['style', 'class'],
      subtree: true
    });
  }

  private handleMutation = (): void => {
    this.checkContrast();
  };

  private checkContrast(): void {
    const styles = window.getComputedStyle(this.element);
    const color = styles.color;
    const backgroundColor = styles.backgroundColor;

    if (color && backgroundColor) {
      const validation = ColorAccessibilityValidator.validateColorCombination(
        color, backgroundColor
      );
      this.callback(validation);
    }
  }

  destroy(): void {
    this.observer.disconnect();
  }
}

/**
 * React hook for color contrast validation
 */
export const useColorContrastValidation = (
  foreground: string,
  background: string,
  isLargeText: boolean = false
) => {
  const [validation, setValidation] = useState<ColorValidation | null>(null);

  useEffect(() => {
    if (foreground && background) {
      const result = ColorAccessibilityValidator.validateColorCombination(
        foreground, background, isLargeText
      );
      setValidation(result);
    }
  }, [foreground, background, isLargeText]);

  return validation;
};

/**
 * React hook for live contrast checking
 */
export const useLiveContrastChecker = (
  elementRef: React.RefObject<HTMLElement>,
  onValidation: (validation: ColorValidation) => void
) => {
  const checkerRef = useRef<LiveContrastChecker | null>(null);

  useEffect(() => {
    if (elementRef.current) {
      checkerRef.current = new LiveContrastChecker(elementRef.current, onValidation);
    }

    return () => {
      checkerRef.current?.destroy();
    };
  }, [elementRef, onValidation]);
};

/**
 * Utility to get contrast ratio from CSS custom properties
 */
export const getCSSCustomPropertyContrast = (
  foregroundProperty: string,
  backgroundProperty: string
): number => {
  const foregroundValue = getComputedStyle(document.documentElement)
    .getPropertyValue(foregroundProperty).trim();
  const backgroundValue = getComputedStyle(document.documentElement)
    .getPropertyValue(backgroundProperty).trim();

  const fgColor = ColorUtils.parseColor(foregroundValue);
  const bgColor = ColorUtils.parseColor(backgroundValue);

  if (!fgColor || !bgColor) return 0;

  return ContrastCalculator.getContrastRatio(fgColor, bgColor);
};

export default {
  ColorUtils,
  ContrastCalculator,
  ColorAccessibilityValidator,
  ThemeAccessibilityUtils,
  LiveContrastChecker,
  useColorContrastValidation,
  useLiveContrastChecker,
  getCSSCustomPropertyContrast,
};