/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        studio: {
          bg:        '#0a0a0d',
          panel:     '#0d0d11',
          surface:   '#111114',
          elevated:  '#1c1c1e',
          border:    '#1a1a1e',
          muted:     '#2a2a2e',
          text:      '#ffffff',
          subtext:   '#888888',
          dim:       '#444444',
          accent:    '#007AFF',
          purple:    '#5856D6',
          green:     '#34C759',
          red:       '#FF453A',
          orange:    '#FF9500',
        },
      },
      fontFamily: {
        sf: ['"SF Pro Display"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"SF Mono"', '"Fira Code"', 'monospace'],
      },
      boxShadow: {
        'iphone': '0 0 0 2px #1a1a1a, 0 0 0 4px #3a3a3a, 0 30px 80px rgba(0,0,0,0.8)',
        'panel': '2px 0 20px rgba(0,0,0,0.5)',
        'glow-blue': '0 0 20px rgba(0,122,255,0.3)',
      },
      animation: {
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.3s ease',
        'notif-in': 'notifIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        notifIn: {
          from: { transform: 'translateY(30px) scale(0.9)', opacity: '0' },
          to: { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
