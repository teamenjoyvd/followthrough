import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // ── Terra semantic aliases (direct hex for one-off utility classes) ──
        terra: {
          primary: '#4a7c59',
          'primary-container': '#78a886',
          'primary-fixed': '#c8e8d0',
          'on-primary': '#ffffff',
          'on-primary-container': '#d8f0de',
          surface: '#faf6f0',
          'surface-container': '#f0ece4',
          'surface-container-low': '#f5f1ea',
          'surface-container-high': '#eae6de',
          'surface-container-highest': '#e4e0d8',
          'on-surface': '#2e3230',
          'on-surface-variant': '#4a4e4a',
          tertiary: '#705c30',
          'tertiary-container': '#c4a66a',
          'tertiary-fixed': '#f8e0a8',
          'on-tertiary-container': '#554020',
          outline: '#74796e',
          'outline-variant': '#c4c8bc',
          'snooze-from': '#2e4d37',
          'snooze-to': '#1c3022',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',            // 12px
        md: 'calc(var(--radius) - 2px)', // 10px
        sm: 'calc(var(--radius) - 4px)', // 8px
        xl: 'calc(var(--radius) + 4px)', // 16px
        '2xl': 'calc(var(--radius) + 8px)', // 20px
        full: '9999px',
      },
      fontFamily: {
        headline: ['var(--font-literata)', 'Georgia', 'serif'],
        body: ['var(--font-nunito-sans)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-nunito-sans)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
