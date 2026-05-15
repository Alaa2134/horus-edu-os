/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        horus: {
          bg:     '#0a0a0f',
          surface:'#12121a',
          border: '#1e1e2e',
          gold:   '#c9a227',
          cyan:   '#00d4ff',
          blue:   '#1a73e8',
          red:    '#ff4444',
          green:  '#00ff88',
          orange: '#ff8c00',
          text:   '#e8e8f0',
          muted:  '#8888a8',
        },
      },
      fontFamily: {
        display: ['"Cinzel"', 'serif'],
        ui:      ['"Inter"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
