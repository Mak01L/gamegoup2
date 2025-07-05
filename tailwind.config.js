/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Mobile-optimized breakpoints
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        // Mobile-specific breakpoints
        'mobile': {'max': '767px'},
        'tablet': {'min': '768px', 'max': '1023px'},
        'desktop': {'min': '1024px'},
      },
      // Mobile-optimized spacing
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      // Mobile-optimized animations
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in-scale': 'fadeInScale 0.2s ease-out',
        'bounce-soft': 'bounceSoft 0.6s ease-in-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeInScale: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSoft: {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
          '40%, 43%': { transform: 'translate3d(0, -8px, 0)' },
          '70%': { transform: 'translate3d(0, -4px, 0)' },
          '90%': { transform: 'translate3d(0, -2px, 0)' },
        },
      },
      // Mobile-optimized font sizes
      fontSize: {
        'mobile-xs': ['0.75rem', { lineHeight: '1.5' }],
        'mobile-sm': ['0.875rem', { lineHeight: '1.5' }],
        'mobile-base': ['1rem', { lineHeight: '1.6' }],
        'mobile-lg': ['1.125rem', { lineHeight: '1.6' }],
        'mobile-xl': ['1.25rem', { lineHeight: '1.5' }],
        'mobile-2xl': ['1.5rem', { lineHeight: '1.4' }],
      },
      // Mobile-optimized colors for better contrast
      colors: {
        mobile: {
          dark: '#000000',
          'dark-soft': '#0a0a0a',
          'gray-900': '#111111',
          'gray-800': '#1a1a1a',
          'gray-700': '#2a2a2a',
        }
      }
    },
  },
  plugins: [
    // Plugin for mobile-specific utilities
    function({ addUtilities }) {
      const newUtilities = {
        '.touch-manipulation': {
          touchAction: 'manipulation',
        },
        '.mobile-scroll': {
          '-webkit-overflow-scrolling': 'touch',
          'overscroll-behavior': 'contain',
        },
        '.hide-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        },
        '.hide-scrollbar::-webkit-scrollbar': {
          display: 'none',
        },
        '.mobile-full-width': {
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}