import type { Config } from 'tailwindcss';

const config = {
  content: ['./public/**/*.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: ['class', '.body--dark'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        foreground: 'var(--foreground)',
        background: 'var(--background)',
        dark: {
          DEFAULT: 'var(--dark)',
          page: 'var(--dark-page)',
        },
        text: 'var(--text)',
        positive: 'var(--positive)',
        negative: 'var(--negative)',
        info: 'var(--info)',
        warning: 'var(--warning)',
      },
    },
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
