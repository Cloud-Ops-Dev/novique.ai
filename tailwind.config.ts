import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Novique brand colors - subtle blues and greens
        primary: {
          50: '#e0f7fa',  // Light cyan from logo
          100: '#b2ebf2',
          200: '#80deea',
          300: '#4dd0e1',
          400: '#26c6da',
          500: '#1e90ff', // Dodger blue from logo
          600: '#4169e1', // Royal blue from logo
          700: '#0277bd',
          800: '#01579b',
          900: '#001f3f', // Dark navy from logo
        },
        secondary: {
          50: '#e8f5e9',
          100: '#c8e6c9',
          200: '#a5d6a7',
          300: '#81c784',
          400: '#66bb6a',
          500: '#4caf50',
          600: '#43a047',
          700: '#388e3c',
          800: '#2e7d32',
          900: '#1b5e20',
        },
        accent: {
          light: '#a0d8ef', // From logo
          DEFAULT: '#1e90ff',
          dark: '#4169e1',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      typography: {
        DEFAULT: {
          css: {
            'li': {
              marginTop: '0.25em',
              marginBottom: '0.25em',
            },
            'ul': {
              marginTop: '0.5em',
              marginBottom: '0.5em',
            },
            'ol': {
              marginTop: '0.5em',
              marginBottom: '0.5em',
            },
          },
        },
        lg: {
          css: {
            'li': {
              marginTop: '0.25em',
              marginBottom: '0.25em',
            },
            'ul': {
              marginTop: '0.5em',
              marginBottom: '0.5em',
            },
            'ol': {
              marginTop: '0.5em',
              marginBottom: '0.5em',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;
