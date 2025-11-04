/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark': {
          'bg': '#0a0a0a',      // Background principal
          'surface': '#1a1a1a',  // Superficies
          'surface-light': '#2a2a2a', // Superficies claras
          'border': '#3a3a3a',   // Bordes sutiles
          'text-primary': '#e5e5e5',   // Texto principal
          'text-secondary': '#a0a0a0', // Texto secundario
          'text-muted': '#6a6a6a',     // Texto mutado
        },
        'neon': {
          'green': '#00ff88',  // Verde neón para highlights
          'cyan': '#00ffff',   // Cyan para accents
          'pink': '#ff00ff',   // Pink para warnings
          'orange': '#ff6600', // Orange para info
        },
        'status': {
          'error': '#ff4444',
          'warning': '#ffaa00',
          'success': '#00ff88',
          'info': '#00ccff',
        }
      },
      fontFamily: {
        'mono': [
          'JetBrains Mono',
          'Fira Code',
          'SF Mono',
          'Monaco',
          'Consolas',
          'monospace'
        ],
        'sans': [
          'Inter',
          'SF Pro Display',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif'
        ],
      },
      fontSize: {
        'xs': ['12px', '16px'],
        'sm': ['13px', '18px'],
        'base': ['14px', '20px'],
        'lg': ['16px', '24px'],
        'xl': ['18px', '28px'],
        '2xl': ['20px', '32px'],
      },
      letterSpacing: {
        'tighter': '-0.05em',
        'tight': '-0.025em',
        'normal': '0em',
        'wide': '0.025em',
        'wider': '0.05em',
        'widest': '0.1em',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(0, 255, 136, 0.3)',
        'glow-cyan': '0 0 20px rgba(0, 255, 255, 0.2)',
        'glow-pink': '0 0 20px rgba(255, 0, 255, 0.2)',
        'subtle': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'md': '0 4px 16px rgba(0, 0, 0, 0.4)',
        'lg': '0 8px 32px rgba(0, 0, 0, 0.5)',
      },
      borderRadius: {
        'none': '0px',
        'xs': '2px',
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
        '2xl': '16px',
      },
      transitionDuration: {
        '0': '0ms',
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms',
      },
    },
  },
  plugins: [],
}
