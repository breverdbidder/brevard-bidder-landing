import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // BidDeed.AI Design Tokens
      colors: {
        // Brand colors
        brand: {
          primary: '#10B981',    // Emerald-500
          secondary: '#06B6D4',  // Cyan-500
          accent: '#8B5CF6',     // Violet-500
        },
        // Decision colors
        decision: {
          bid: {
            DEFAULT: '#22C55E',  // Green-500
            light: '#4ADE80',    // Green-400
            dark: '#16A34A',     // Green-600
          },
          review: {
            DEFAULT: '#EAB308',  // Yellow-500
            light: '#FACC15',    // Yellow-400
            dark: '#CA8A04',     // Yellow-600
          },
          skip: {
            DEFAULT: '#EF4444',  // Red-500
            light: '#F87171',    // Red-400
            dark: '#DC2626',     // Red-600
          },
        },
        // Pipeline status colors
        pipeline: {
          pending: '#64748B',    // Slate-500
          running: '#3B82F6',    // Blue-500
          complete: '#22C55E',   // Green-500
          error: '#EF4444',      // Red-500
          skipped: '#94A3B8',    // Slate-400
        },
        // Dark theme base
        surface: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        // Financial data sizes
        'data-sm': ['0.75rem', { lineHeight: '1rem' }],
        'data-md': ['0.875rem', { lineHeight: '1.25rem' }],
        'data-lg': ['1rem', { lineHeight: '1.5rem' }],
        'data-xl': ['1.25rem', { lineHeight: '1.75rem' }],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        // Pipeline progress animation
        'progress-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        // Stage running spinner
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        // Decision panel reveal
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Accordion expand
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        // ML factor bar fill
        'bar-fill': {
          '0%': { width: '0%' },
          '100%': { width: 'var(--bar-width)' },
        },
      },
      animation: {
        'progress-pulse': 'progress-pulse 2s ease-in-out infinite',
        'spin-slow': 'spin-slow 3s linear infinite',
        'slide-down': 'slide-down 0.3s ease-out',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'bar-fill': 'bar-fill 0.5s ease-out forwards',
      },
      // Gradient utilities for decision cards
      backgroundImage: {
        'gradient-bid': 'linear-gradient(to right, #22C55E, #10B981)',
        'gradient-review': 'linear-gradient(to right, #EAB308, #F59E0B)',
        'gradient-skip': 'linear-gradient(to right, #EF4444, #F43F5E)',
        'gradient-brand': 'linear-gradient(to right, #10B981, #06B6D4)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
