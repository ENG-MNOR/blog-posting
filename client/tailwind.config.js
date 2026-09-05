/** @type {import('tailwindcss').Config} */
import animate from 'tailwindcss-animate';
import typography from '@tailwindcss/typography';

const withOpacity = (variable) => `rgb(var(${variable}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: withOpacity('--color-border'),
        input: withOpacity('--color-input'),
        ring: withOpacity('--color-ring'),
        background: withOpacity('--color-background'),
        foreground: withOpacity('--color-foreground'),
        surface: {
          DEFAULT: withOpacity('--color-surface'),
          muted: withOpacity('--color-surface-muted'),
        },
        primary: {
          DEFAULT: withOpacity('--color-primary'),
          foreground: withOpacity('--color-primary-foreground'),
        },
        secondary: {
          DEFAULT: withOpacity('--color-secondary'),
          foreground: withOpacity('--color-secondary-foreground'),
        },
        accent: {
          DEFAULT: withOpacity('--color-accent'),
          foreground: withOpacity('--color-accent-foreground'),
        },
        muted: {
          DEFAULT: withOpacity('--color-muted'),
          foreground: withOpacity('--color-muted-foreground'),
        },
        card: {
          DEFAULT: withOpacity('--color-card'),
          foreground: withOpacity('--color-card-foreground'),
        },
        popover: {
          DEFAULT: withOpacity('--color-popover'),
          foreground: withOpacity('--color-popover-foreground'),
        },
        destructive: {
          DEFAULT: withOpacity('--color-destructive'),
          foreground: withOpacity('--color-destructive-foreground'),
        },
        success: {
          DEFAULT: withOpacity('--color-success'),
          foreground: withOpacity('--color-success-foreground'),
        },
        warning: {
          DEFAULT: withOpacity('--color-warning'),
          foreground: withOpacity('--color-warning-foreground'),
        },
        // Legacy aliases kept so any un-migrated markup still resolves.
        dark: '#0B1B2B',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 4px)',
        sm: 'calc(var(--radius) - 8px)',
      },
      fontFamily: {
        sans: ['"Inter Variable"', '"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['"Inter Variable"', '"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'ui-serif', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgb(15 23 42 / 0.04), 0 8px 24px -12px rgb(15 23 42 / 0.12)',
        lifted: '0 2px 8px rgb(15 23 42 / 0.06), 0 24px 48px -24px rgb(15 23 42 / 0.24)',
        lovable: '0 8px 30px -12px rgb(15 76 129 / 0.35)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out both',
      },
    },
  },
  plugins: [animate, typography],
};
