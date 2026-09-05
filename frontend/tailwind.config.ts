import type { Config } from 'tailwindcss';

// Design tokens for Daily Life OS.
// Palette is built around the product's core metaphor — a day/night cycle —
// rather than a generic SaaS blue: "day" (amber/ochre) for money & time &
// tasks, "night" (indigo) for sleep & rest, kept quiet everywhere else so
// the 24-hour day ring on the dashboard remains the one bold visual moment.
const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './features/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1.25rem', screens: { '2xl': '1280px' } },
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      colors: {
        paper: 'hsl(var(--paper))',
        ink: 'hsl(var(--ink))',
        surface: 'hsl(var(--surface))',
        'surface-muted': 'hsl(var(--surface-muted))',
        border: 'hsl(var(--border))',
        muted: 'hsl(var(--muted))',
        day: { DEFAULT: 'hsl(var(--day))', foreground: 'hsl(var(--day-foreground))' },
        night: { DEFAULT: 'hsl(var(--night))', foreground: 'hsl(var(--night-foreground))' },
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        error: 'hsl(var(--error))',
      },
      borderRadius: {
        lg: '10px',
        md: '8px',
        sm: '6px',
      },
      boxShadow: {
        card: '0 1px 2px hsl(var(--ink) / 0.04), 0 1px 1px hsl(var(--ink) / 0.03)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
