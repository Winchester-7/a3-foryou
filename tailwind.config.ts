import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  // hover: styles only on devices that can really hover — no sticky hover on touch
  future: { hoverOnlyWhenSupported: true },
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.25rem', lg: '2rem', xl: '2.5rem' },
      screens: { '2xl': '1360px' },
    },
    extend: {
      colors: {
        paper: '#FFFFFF',
        surface: '#F6F5F3',
        surface2: '#EFEDE9',
        line: '#E6E3DE',
        ink: {
          DEFAULT: '#232323',
          soft: '#5B5B5B',
          faint: '#8A8A8A',
        },
        accent: {
          DEFAULT: '#E0241B',
          soft: '#F4C9C6',
          ink: '#B31C15',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        brand: '0.32em',
        wide2: '0.16em',
      },
      maxWidth: {
        prose2: '68ch',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
        'out-strong': 'cubic-bezier(0.23, 1, 0.32, 1)',
        'in-out-strong': 'cubic-bezier(0.77, 0, 0.175, 1)',
        drawer: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      boxShadow: {
        card: '0 1px 2px rgba(35,35,35,0.04), 0 12px 40px -18px rgba(35,35,35,0.18)',
        float: '0 18px 50px -20px rgba(35,35,35,0.35)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both',
      },
    },
  },
  plugins: [],
};

export default config;
