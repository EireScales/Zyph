import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          'Inter',
          'sans-serif',
        ],
      },
      colors: {
        background: '#0a0008',
        foreground: 'rgba(255,255,255,0.92)',
        accent: '#7c3aed',
        'accent-rose': '#e8837a',
        'accent-gold': '#d4956a',
      },
      animation: {
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        'glow-slow': 'glow-slow 6s ease-in-out infinite',
        'float-orb': 'float-orb 10s ease-in-out infinite',
        'float-orb-slow': 'float-orb 12s ease-in-out infinite',
        'float-orb-fast': 'float-orb 8s ease-in-out infinite',
        'hero-in': 'hero-in 800ms ease-out forwards',
        'hero-in-delay-1': 'hero-in 800ms ease-out 100ms forwards',
        'hero-in-delay-2': 'hero-in 800ms ease-out 200ms forwards',
        'buttons-in': 'buttons-in 600ms ease-out 400ms forwards',
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.7' },
        },
        'glow-slow': {
          '0%, 100%': { opacity: '0.2', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(1.05)' },
        },
        'float-orb': {
          '0%, 100%': { transform: 'translateY(-30px)' },
          '50%': { transform: 'translateY(30px)' },
        },
        'hero-in': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'buttons-in': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(to bottom, #ffffff, rgba(255,255,255,0.7))',
      },
    },
  },
  plugins: [],
};

export default config;
