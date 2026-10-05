/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        temple: {
          gold: {
            DEFAULT: '#C67C00',
            light: '#F5A623',
            dark: '#9E6300',
            ultraLight: '#FFF6E6',
          },
          maroon: {
            DEFAULT: '#A83232',
            light: '#C54B4B',
            dark: '#7D2222',
            ultraLight: '#FDF2F2',
          },
          cream: {
            DEFAULT: '#FFF9F2',
            dark: '#F5EBE1',
            light: '#FFFDFA',
          },
          charcoal: {
            DEFAULT: '#2D2D2D',
            light: '#4A4A4A',
            dark: '#1A1A1A',
          }
        }
      },
      fontFamily: {
        display: ['"Cinzel"', 'serif'],
        serif: ['"Lora"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
