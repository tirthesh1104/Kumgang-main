/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#060606',
          900: '#0A0A0A',
          850: '#0F0F10',
          800: '#141416',
          750: '#151517',
          700: '#18181B',
          650: '#1B1B1F',
          600: '#202024',
        },
        champagne: {
          DEFAULT: '#C9A86A',
          hover: '#D7B97C',
          active: '#B89355',
          soft: '#2A2419',
          border: '#55462C',
          text: '#E8D6AE',
        },
        silver: {
          soft: '#BFC3C8',
          bright: '#D9DCE0',
          dark: '#7E838A',
        },
        navy: {
          DEFAULT: '#141416',
          50: '#151517',
          100: '#18181B',
          700: '#1B1B1F',
          800: '#0F0F10',
          900: '#0A0A0A',
          950: '#060606',
        },
        brand: {
          blue: '#C9A86A',
          blueHover: '#D7B97C',
          blueLight: '#2A2419',
          blueText: '#E8D6AE',

          green: '#3FB984',
          greenLight: '#163127',
          greenText: '#70D0A8',

          amber: '#D6A84F',
          amberLight: '#322917',
          amberText: '#E5C47A',

          red: '#E05A5A',
          redLight: '#34191B',
          redText: '#F08A8A',

          purple: '#9A82D4',
          purpleLight: '#251F32',
          purpleText: '#BBA8E8',

          teal: '#4BA7A7',
          tealLight: '#172A2A',
          tealText: '#83CACA',

          special: '#56A9C7',
          specialLight: '#17272E',
          specialText: '#89C9DF',
        },
        main: {
          bg: '#0A0A0A',
          card: '#151517',
          text: '#F5F5F3',
          subtext: '#B4B4B8',
          border: '#262629',
          inputBg: '#111113',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'kpi-xl': ['56px', { lineHeight: '1', fontWeight: '700' }],
        'kpi-lg': ['40px', { lineHeight: '1.1', fontWeight: '700' }],
      },
      boxShadow: {
        'card': '0 4px 20px 0 rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 30px 0 rgba(0, 0, 0, 0.6)',
        'sidebar': '1px 0 0 0 #1E1E20',
      },
    },
  },
  plugins: [],
}
