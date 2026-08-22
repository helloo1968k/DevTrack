/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0B0E14',
          900: '#12161F',
          800: '#1B212D',
          700: '#242B39',
          600: '#2A3140'
        },
        paper: {
          DEFAULT: '#E8E6DF',
          dim: '#8B93A7'
        },
        brass: {
          DEFAULT: '#D4A24E',
          bright: '#E8B968',
          dim: '#8A6A32'
        },
        signal: {
          backlog: '#5A6478',
          todo: '#8B93A7',
          progress: '#5B8DEF',
          review: '#9C7CE0',
          done: '#4FAE8A',
          cancelled: '#5A6478',
          critical: '#E2665A',
          high: '#E0995B',
          medium: '#5B8DEF',
          low: '#5A6478'
        }
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 50px -20px rgba(0,0,0,0.6)',
        card: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.5)'
      },
      keyframes: {
        'pulse-rail': {
          '0%': { transform: 'translateY(-10%)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(110%)', opacity: '0' }
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'pulse-rail': 'pulse-rail 3.2s ease-in-out infinite',
        'fade-up': 'fade-up 0.4s ease-out both'
      }
    }
  },
  plugins: []
}
