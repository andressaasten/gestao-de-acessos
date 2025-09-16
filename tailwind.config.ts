import type { Config } from 'tailwindcss';

const config = {
  content: ['./public/**/*.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: ['class', '.body--dark'],
  theme: {
    extend: {},
    screens: {
      xs: '0px',
      sm: '600px',
      md: '1024px',
      lg: '1440px',
      xl: '1920px',
    },
  },
  plugins: [],
} satisfies Config;

export default config;
