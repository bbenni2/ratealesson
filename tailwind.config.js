/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: {
          DEFAULT: '#0a0a0f',
          soft: '#12121a',
          card: '#16161f',
          elevated: '#1c1c28',
        },
        line: '#262633',
        accent: {
          DEFAULT: '#a855f7',
          soft: '#c084fc',
          glow: '#d946ef',
        },
        lime: '#bef264',
        amber: '#fbbf24',
      },
      boxShadow: {
        glow: '0 0 40px -8px rgba(168, 85, 247, 0.5)',
        'glow-lg': '0 0 60px -10px rgba(217, 70, 239, 0.45)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 30px -10px rgba(168,85,247,0.5)' },
          '50%': { boxShadow: '0 0 55px -6px rgba(217,70,239,0.7)' },
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateY(-16px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'scale-in': 'scale-in 0.25s ease-out',
        'slide-up': 'slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        shimmer: 'shimmer 1.6s infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'toast-in': 'toast-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
