module.exports = {
  mode: 'jit',
  purge: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1677FF',
          lightBlue: '#40A9FF',
          dark: '#0a1628',
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',  // ✅ 你需要的颜色
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        trust: {
          bg: 'rgba(255, 255, 255, 0.08)',
          text: 'rgba(255, 255, 255, 0.65)',
        },
        card: {
          bg: 'rgba(255, 255, 255, 0.96)',
          border: '#e8ecf1',
        },
        input: {
          bg: '#f8fafc',
          placeholder: '#b0b8c4',
        },
        social: {
          border: '#e8ecf1',
        }
      },
      fontFamily: {
        sans: ['PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '24px',
      },
      boxShadow: {
        'login': '0 24px 80px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.08) inset',
        'brand': '0 8px 32px rgba(22, 119, 255, 0.30)',
        'btn': '0 8px 28px rgba(22, 119, 255, 0.35)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 1s ease-out',
        'slide-in-right': 'slideInRight 0.8s ease-out',
        'pulse-dot': 'pulse 2s infinite',
        'gradient-shift': 'gradientShift 3s ease-in-out infinite',
        'border-rotate': 'borderRotate 4s linear infinite',
        'pulse-badge': 'pulseBadge 2s ease-in-out infinite',
      },
      transitionTimingFunction: {
        'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        borderRotate: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        pulseBadge: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.12)' },
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
