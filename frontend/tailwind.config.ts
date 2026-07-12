import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Fraunces', 'serif'],
      },
      colors: {
        'base-navy': 'var(--color-base-navy)',
        'surface-dark': 'var(--color-surface-dark)',
        'accent-gold': 'var(--color-accent-gold)',
        'accent-emerald': 'var(--color-accent-emerald)',
        'accent-crimson': 'var(--color-accent-crimson)',
        'neutral': {
          100: 'var(--color-neutral-100)',
          200: 'var(--color-neutral-200)',
          300: 'var(--color-neutral-300)',
          400: 'var(--color-neutral-400)',
          500: 'var(--color-neutral-500)',
        }
      },
    },
  },
  plugins: [],
} satisfies Config
