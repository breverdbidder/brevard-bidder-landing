// tailwind.config.ts
// BidDeed.AI Enterprise Design System
// Standardized tokens for consistent UI across all components

import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // BidDeed.AI Brand Colors
      colors: {
        // Primary Brand
        'bb-primary': '#667eea',      // Trust Blue
        'bb-secondary': '#764ba2',    // Accent Purple
        
        // Background Shades
        'bb-dark': '#1a1a2e',         // Dark background
        'bb-darker': '#16213e',       // Darker panel
        'bb-accent': '#0f3460',       // Panel accent / borders
        
        // Decision Colors (Critical for auction recommendations)
        'bb-bid': '#22c55e',          // Green - BID recommendation
        'bb-review': '#fbbf24',       // Yellow - REVIEW recommendation
        'bb-skip': '#ef4444',         // Red - SKIP recommendation
        'bb-pending': '#6b7280',      // Gray - PENDING status
        
        // Text Colors
        'bb-text': {
          primary: '#ffffff',
          secondary: '#94a3b8',
          muted: '#64748b',
        },
        
        // Status Colors
        'bb-success': '#22c55e',
        'bb-warning': '#fbbf24',
        'bb-error': '#ef4444',
        'bb-info': '#3b82f6',
      },
      
      // Typography
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      
      // Font Sizes (with line heights)
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px - badges, captions
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px - body small
        'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px - body
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px - headings
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px - titles
        '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px - page titles
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px - hero
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px - large hero
      },
      
      // Spacing (extends default)
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      // Border Radius
      borderRadius: {
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      
      // Box Shadows
      boxShadow: {
        'glow-primary': '0 0 20px rgba(102, 126, 234, 0.3)',
        'glow-bid': '0 0 20px rgba(34, 197, 94, 0.3)',
        'glow-review': '0 0 20px rgba(251, 191, 36, 0.3)',
        'glow-skip': '0 0 20px rgba(239, 68, 68, 0.3)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
      },
      
      // Background Gradients
      backgroundImage: {
        'gradient-header': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-card': 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
        'gradient-bid': 'linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(34,197,94,0.05) 100%)',
        'gradient-review': 'linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(251,191,36,0.05) 100%)',
        'gradient-skip': 'linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(239,68,68,0.05) 100%)',
      },
      
      // Animations
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(102, 126, 234, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(102, 126, 234, 0.4)' },
        },
      },
      
      // Transitions
      transitionDuration: {
        '250': '250ms',
        '400': '400ms',
      },
      
      // Z-Index Scale
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
    // Custom utilities plugin
    function({ addUtilities, addComponents, theme }: any) {
      // Decision Badge Utilities
      addUtilities({
        '.badge-bid': {
          backgroundColor: theme('colors.bb-bid'),
          color: '#ffffff',
          fontWeight: '600',
        },
        '.badge-review': {
          backgroundColor: theme('colors.bb-review'),
          color: '#000000',
          fontWeight: '600',
        },
        '.badge-skip': {
          backgroundColor: theme('colors.bb-skip'),
          color: '#ffffff',
          fontWeight: '600',
        },
        '.badge-pending': {
          backgroundColor: theme('colors.bb-pending'),
          color: '#ffffff',
          fontWeight: '600',
        },
      });
      
      // Map Marker Utilities
      addUtilities({
        '.map-marker-bid': {
          backgroundColor: theme('colors.bb-bid'),
          borderColor: '#ffffff',
          borderWidth: '2px',
        },
        '.map-marker-review': {
          backgroundColor: theme('colors.bb-review'),
          borderColor: '#ffffff',
          borderWidth: '2px',
        },
        '.map-marker-skip': {
          backgroundColor: theme('colors.bb-skip'),
          borderColor: '#ffffff',
          borderWidth: '2px',
        },
      });
      
      // Resize Handle
      addUtilities({
        '.resize-handle': {
          width: '4px',
          backgroundColor: theme('colors.bb-accent'),
          cursor: 'col-resize',
          transition: 'background-color 200ms',
          '&:hover': {
            backgroundColor: theme('colors.bb-primary'),
          },
        },
      });
      
      // Card Components
      addComponents({
        '.card-property': {
          backgroundColor: theme('colors.bb-darker'),
          borderRadius: theme('borderRadius.lg'),
          border: `1px solid ${theme('colors.bb-accent')}`,
          padding: theme('spacing.4'),
          transition: 'all 200ms',
          '&:hover': {
            borderColor: theme('colors.bb-primary'),
            boxShadow: theme('boxShadow.card-hover'),
          },
        },
        '.card-bid': {
          borderLeftWidth: '4px',
          borderLeftColor: theme('colors.bb-bid'),
          backgroundImage: theme('backgroundImage.gradient-bid'),
        },
        '.card-review': {
          borderLeftWidth: '4px',
          borderLeftColor: theme('colors.bb-review'),
          backgroundImage: theme('backgroundImage.gradient-review'),
        },
        '.card-skip': {
          borderLeftWidth: '4px',
          borderLeftColor: theme('colors.bb-skip'),
          backgroundImage: theme('backgroundImage.gradient-skip'),
        },
      });
      
      // Button Components
      addComponents({
        '.btn-primary': {
          backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#ffffff',
          fontWeight: '500',
          padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
          borderRadius: theme('borderRadius.lg'),
          transition: 'opacity 200ms',
          '&:hover': {
            opacity: '0.9',
          },
          '&:disabled': {
            opacity: '0.5',
            cursor: 'not-allowed',
          },
        },
        '.btn-secondary': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          color: '#ffffff',
          fontWeight: '500',
          padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
          borderRadius: theme('borderRadius.lg'),
          transition: 'background-color 200ms',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          },
        },
      });
      
      // Input Components
      addComponents({
        '.input-primary': {
          backgroundColor: theme('colors.bb-dark'),
          color: '#ffffff',
          borderRadius: theme('borderRadius.lg'),
          border: `1px solid ${theme('colors.bb-accent')}`,
          padding: `${theme('spacing.3')} ${theme('spacing.4')}`,
          transition: 'all 200ms',
          '&::placeholder': {
            color: theme('colors.gray.500'),
          },
          '&:focus': {
            outline: 'none',
            borderColor: theme('colors.bb-primary'),
            boxShadow: `0 0 0 2px ${theme('colors.bb-primary')}33`,
          },
        },
      });
    },
  ],
};

export default config;
