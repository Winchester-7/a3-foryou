/** Mirrors the main site's tokens so the planner feels like part of A3 FOR YOU. */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      colors: {
        paper: '#FFFFFF',
        surface: '#F6F5F3',
        surface2: '#EFEDE9',
        line: '#E6E3DE',
        ink: { DEFAULT: '#232323', soft: '#5B5B5B', faint: '#8A8A8A' },
        accent: { DEFAULT: '#E0241B', soft: '#F4C9C6', ink: '#B31C15' },
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      letterSpacing: { brand: '0.32em', wide2: '0.16em' },
      transitionTimingFunction: {
        'out-strong': 'cubic-bezier(0.23, 1, 0.32, 1)',
        drawer: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      boxShadow: {
        card: '0 1px 2px rgba(35,35,35,0.04), 0 12px 40px -18px rgba(35,35,35,0.18)',
        float: '0 18px 50px -20px rgba(35,35,35,0.35)',
      },
    },
  },
  plugins: [],
};
