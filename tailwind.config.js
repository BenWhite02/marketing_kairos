// tailwind.config.js
// 🎨 Tailwind CSS Configuration with 7-Theme Support

const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: ['class', '[data-theme="midnight-elegance"]'],
  theme: {
    extend: {
      colors: {
        // Theme-aware color system
        'theme-primary': 'var(--theme-primary)',
        'theme-primary-50': 'var(--theme-primary-50)',
        'theme-primary-100': 'var(--theme-primary-100)',
        'theme-primary-200': 'var(--theme-primary-200)',
        'theme-primary-300': 'var(--theme-primary-300)',
        'theme-primary-400': 'var(--theme-primary-400)',
        'theme-primary-500': 'var(--theme-primary-500)',
        'theme-primary-600': 'var(--theme-primary-600)',
        'theme-primary-700': 'var(--theme-primary-700)',
        'theme-primary-800': 'var(--theme-primary-800)',
        'theme-primary-900': 'var(--theme-primary-900)',
        
        'theme-secondary': 'var(--theme-secondary)',
        'theme-secondary-50': 'var(--theme-secondary-50)',
        'theme-secondary-100': 'var(--theme-secondary-100)',
        'theme-secondary-200': 'var(--theme-secondary-200)',
        'theme-secondary-300': 'var(--theme-secondary-300)',
        'theme-secondary-400': 'var(--theme-secondary-400)',
        'theme-secondary-500': 'var(--theme-secondary-500)',
        'theme-secondary-600': 'var(--theme-secondary-600)',
        'theme-secondary-700': 'var(--theme-secondary-700)',
        'theme-secondary-800': 'var(--theme-secondary-800)',
        'theme-secondary-900': 'var(--theme-secondary-900)',
        
        'theme-accent': 'var(--theme-accent)',
        'theme-accent-50': 'var(--theme-accent-50)',
        'theme-accent-100': 'var(--theme-accent-100)',
        'theme-accent-200': 'var(--theme-accent-200)',
        'theme-accent-300': 'var(--theme-accent-300)',
        'theme-accent-400': 'var(--theme-accent-400)',
        'theme-accent-500': 'var(--theme-accent-500)',
        'theme-accent-600': 'var(--theme-accent-600)',
        'theme-accent-700': 'var(--theme-accent-700)',
        'theme-accent-800': 'var(--theme-accent-800)',
        'theme-accent-900': 'var(--theme-accent-900)',
        
        // Semantic colors
        'theme-success': 'var(--theme-success)',
        'theme-warning': 'var(--theme-warning)',
        'theme-error': 'var(--theme-error)',
        'theme-info': 'var(--theme-info)',
        
        // Surface colors
        'theme-background': 'var(--theme-background)',
        'theme-surface': 'var(--theme-surface)',
        'theme-surface-hover': 'var(--theme-surface-hover)',
        'theme-surface-active': 'var(--theme-surface-active)',
        
        // Text colors
        'theme-text-primary': 'var(--theme-text-primary)',
        'theme-text-secondary': 'var(--theme-text-secondary)',
        'theme-text-muted': 'var(--theme-text-muted)',
        'theme-text-inverse': 'var(--theme-text-inverse)',
        
        // Border colors
        'theme-border': 'var(--theme-border)',
        'theme-border-muted': 'var(--theme-border-muted)',
        'theme-border-strong': 'var(--theme-border-strong)',

        // Kairos brand colors (fallback)
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        accent: {
          50: '#fef7f0',
          100: '#feeade',
          200: '#fdd2bb',
          300: '#fcb387',
          400: '#fa8a51',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },

        // Business domain colors
        atom: {
          demographic: '#8b5cf6',
          behavioral: '#06b6d4',
          technical: '#10b981',
          predictive: '#f59e0b',
        },
        moment: {
          draft: '#6b7280',
          active: '#22c55e',
          paused: '#f59e0b',
          completed: '#3b82f6',
        },
        campaign: {
          planning: '#8b5cf6',
          running: '#22c55e',
          optimizing: '#f59e0b',
          completed: '#6b7280',
        },
      },
      
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
        mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
        display: ['Cal Sans', 'Inter var', ...defaultTheme.fontFamily.sans],
      },
      
      boxShadow: {
        'theme-sm': 'var(--theme-shadow-sm)',
        'theme-md': 'var(--theme-shadow-md)',
        'theme-lg': 'var(--theme-shadow-lg)',
        'theme-xl': 'var(--theme-shadow-xl)',
        
        // Neumorphic shadows
        'neu-sm': '2px 2px 4px #d1d5db, -2px -2px 4px #ffffff',
        'neu-md': '4px 4px 8px #d1d5db, -4px -4px 8px #ffffff',
        'neu-lg': '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff',
        'neu-xl': '12px 12px 24px #d1d5db, -12px -12px 24px #ffffff',
        'neu-inset': 'inset 4px 4px 8px #d1d5db, inset -4px -4px 8px #ffffff',
        
        // Glass shadows
        'glass-sm': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'glass-md': '0 8px 16px rgba(0, 0, 0, 0.15)',
        'glass-lg': '0 16px 32px rgba(0, 0, 0, 0.2)',
        'glass-xl': '0 24px 48px rgba(0, 0, 0, 0.25)',
      },
      
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'theme-gradient-primary': 'var(--theme-gradient-primary)',
        'theme-gradient-secondary': 'var(--theme-gradient-secondary)',
        'theme-gradient-accent': 'var(--theme-gradient-accent)',
        
        // Theme-specific gradients
        'glass-bg': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'neu-convex': 'linear-gradient(145deg, #f0f0f0, #cacaca)',
        'neu-concave': 'linear-gradient(145deg, #cacaca, #f0f0f0)',
      },
      
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounce 2s infinite',
        'fadeIn': 'fadeIn 0.3s ease-out',
        'fadeInUp': 'fadeInUp 0.3s ease-out',
        'fadeInDown': 'fadeInDown 0.3s ease-out',
        'fadeInLeft': 'fadeInLeft 0.3s ease-out',
        'fadeInRight': 'fadeInRight 0.3s ease-out',
        'scaleIn': 'scaleIn 0.3s ease-out',
        'slideInUp': 'slideInUp 0.3s ease-out',
        'slideInDown': 'slideInDown 0.3s ease-out',
        'slideInLeft': 'slideInLeft 0.3s ease-out',
        'slideInRight': 'slideInRight 0.3s ease-out',
        'glowPulse': 'glowPulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideInDown: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 5px var(--theme-primary)' },
          '50%': { boxShadow: '0 0 20px var(--theme-primary), 0 0 30px var(--theme-primary)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'out-circ': 'cubic-bezier(0.08, 0.82, 0.17, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    
    // Custom plugin for theme utilities
    function({ addUtilities, addComponents, theme }) {
      // Theme-aware utilities
      addUtilities({
        '.theme-transition': {
          transition: 'all var(--theme-transition-normal)',
        },
        '.theme-transition-fast': {
          transition: 'all var(--theme-transition-fast)',
        },
        '.theme-transition-slow': {
          transition: 'all var(--theme-transition-slow)',
        },
        
        // Glass utilities
        '.glass': {
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--glass-border)',
        },
        '.glass-panel': {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '1rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        },
        
        // Neumorphic utilities
        '.neu': {
          background: '#f3f4f6',
          boxShadow: '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff',
          borderRadius: '1rem',
        },
        '.neu-inset': {
          background: 'linear-gradient(145deg, #cacaca, #f0f0f0)',
          boxShadow: 'inset 8px 8px 16px #d1d5db, inset -8px -8px 16px #ffffff',
          borderRadius: '1rem',
        },
        '.neu-convex': {
          background: 'linear-gradient(145deg, #f0f0f0, #cacaca)',
          boxShadow: '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff',
          borderRadius: '1rem',
        },
      });
      
      // Theme-aware components
      addComponents({
        '.btn-theme': {
          background: 'var(--theme-primary)',
          border: '1px solid var(--theme-primary)',
          borderRadius: '0.5rem',
          color: 'var(--theme-text-inverse)',
          cursor: 'pointer',
          fontWeight: '600',
          padding: '0.75rem 1.5rem',
          transition: 'all var(--theme-transition-fast)',
          
          '&:hover': {
            opacity: '0.9',
            transform: 'translateY(-1px)',
            boxShadow: 'var(--theme-shadow-md)',
          },
          
          '&:active': {
            transform: 'translateY(0)',
            boxShadow: 'var(--theme-shadow-sm)',
          },
          
          '&:disabled': {
            opacity: '0.5',
            cursor: 'not-allowed',
            transform: 'none',
          },
        },
        
        '.card-theme': {
          backgroundColor: 'var(--theme-surface)',
          border: '1px solid var(--theme-border)',
          borderRadius: '0.75rem',
          boxShadow: 'var(--theme-shadow-sm)',
          color: 'var(--theme-text-primary)',
          padding: '1.5rem',
          transition: 'all var(--theme-transition-normal)',
          
          '&:hover': {
            backgroundColor: 'var(--theme-surface-hover)',
            boxShadow: 'var(--theme-shadow-md)',
            transform: 'translateY(-2px)',
          },
        },
        
        '.input-theme': {
          background: 'var(--theme-surface)',
          border: '1px solid var(--theme-border)',
          borderRadius: '0.5rem',
          color: 'var(--theme-text-primary)',
          fontFamily: 'inherit',
          fontSize: '0.875rem',
          padding: '0.75rem 1rem',
          transition: 'all var(--theme-transition-fast)',
          width: '100%',
          
          '&::placeholder': {
            color: 'var(--theme-text-muted)',
          },
          
          '&:focus': {
            borderColor: 'var(--theme-primary)',
            boxShadow: '0 0 0 3px rgba(var(--theme-primary-rgb), 0.1)',
            outline: 'none',
          },
          
          '&:hover': {
            borderColor: 'var(--theme-border-strong)',
          },
        },
      });
    },
  ],
};