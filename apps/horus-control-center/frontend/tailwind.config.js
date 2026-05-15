/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        horus: {
          gold:     '#c9a227',
          goldLight:'#f5d060',
          goldDark: '#a07820',
          blue:     '#1a73e8',
          cyan:     '#00d4ff',
          bg:       '#0a0a0f',
          surface:  '#12121a',
          surface2: '#1a1a27',
          surface3: '#22223a',
          text:     '#e8e8f0',
          muted:    '#aaaacc',
          dim:      '#666688',
          success:  '#00e676',
          warning:  '#ff9800',
          error:    '#f44336',
        },
      },
      fontFamily: {
        display: ['Cinzel', 'Georgia', 'serif'],
        ui:      ['Inter', '-apple-system', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
        arabic:  ['Noto Naskh Arabic', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        gold:   '0 0 20px rgba(201,162,39,0.35), 0 0 40px rgba(201,162,39,0.15)',
        cyan:   '0 0 20px rgba(0,212,255,0.35)',
        card:   '0 8px 32px rgba(0,0,0,0.5)',
        inset:  'inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      backgroundImage: {
        'gradient-bg':   'linear-gradient(135deg, #0a0a0f 0%, #12121a 50%, #0d0d1a 100%)',
        'gradient-gold': 'linear-gradient(90deg, #a07820, #c9a227, #f5d060, #c9a227, #a07820)',
        'gradient-card': 'linear-gradient(135deg, rgba(201,162,39,0.05) 0%, rgba(26,115,232,0.03) 100%)',
      },
      animation: {
        'pulse-gold':   'pulseGold 2s ease-in-out infinite',
        'fade-in':      'fadeIn 0.4s ease-out',
        'slide-up':     'slideUp 0.3s ease-out',
        'spin-slow':    'spin 3s linear infinite',
      },
      keyframes: {
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(201,162,39,0.2)' },
          '50%':      { boxShadow: '0 0 25px rgba(201,162,39,0.5)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
