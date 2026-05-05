import type { Config } from 'tailwindcss';

/**
 * Tailwind CSS Configuration — Figma Design System (Material 3 Tokens).
 * Every color, spacing, font, and border-radius token is extracted
 * pixel-for-pixel from the provided Figma HTML mockups.
 */
const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      /* ========================================
         COLOR TOKENS — Material 3 Palette
         ======================================== */
      colors: {
        'primary-fixed': '#d9e2ff',
        'surface-container-high': '#e9e8e8',
        'primary': '#0057c2',
        'inverse-surface': '#2f3031',
        'surface-container-lowest': '#ffffff',
        'outline-variant': '#c1c6d7',
        'surface-tint': '#0059c7',
        'on-primary-container': '#fefcff',
        'surface-variant': '#e3e2e2',
        'surface-dim': '#dbdad9',
        'tertiary-container': '#9d6a00',
        'on-error': '#ffffff',
        'outline': '#727786',
        'surface-container-low': '#f4f3f3',
        'on-background': '#1b1c1c',
        'on-surface': '#1b1c1c',
        'secondary-fixed': '#88fd54',
        'on-secondary-fixed': '#062100',
        'surface-container-highest': '#e3e2e2',
        'inverse-primary': '#afc6ff',
        'on-secondary-fixed-variant': '#1a5200',
        'primary-fixed-dim': '#afc6ff',
        'surface-bright': '#faf9f9',
        'on-primary': '#ffffff',
        'error': '#ba1a1a',
        'tertiary-fixed-dim': '#ffba45',
        'secondary': '#266d00',
        'on-surface-variant': '#414755',
        'tertiary': '#7d5400',
        'error-container': '#ffdad6',
        'primary-container': '#006ef2',
        'on-tertiary': '#ffffff',
        'on-error-container': '#93000a',
        'tertiary-fixed': '#ffddb0',
        'on-tertiary-container': '#fffbff',
        'background': '#faf9f9',
        'on-secondary-container': '#287100',
        'surface': '#faf9f9',
        'on-primary-fixed': '#001a43',
        'inverse-on-surface': '#f2f0f0',
        'on-primary-fixed-variant': '#004398',
        'surface-container': '#efeded',
        'secondary-container': '#85fa51',
        'on-secondary': '#ffffff',
        'secondary-fixed-dim': '#6de039',
        'on-tertiary-fixed': '#281800',
        'on-tertiary-fixed-variant': '#614000',
      },

      /* ========================================
         BORDER RADIUS — Material 3
         ======================================== */
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '0.75rem',
      },

      /* ========================================
         SPACING TOKENS
         ======================================== */
      spacing: {
        'margin-page': '24px',
        'sm': '8px',
        'md': '16px',
        'xxl': '48px',
        'xs': '4px',
        'lg': '24px',
        'gutter': '16px',
        'unit': '4px',
        'xl': '32px',
      },

      /* ========================================
         FONT FAMILIES — Inter + Monospace
         ======================================== */
      fontFamily: {
        'h1': ['Inter', 'sans-serif'],
        'h2': ['Inter', 'sans-serif'],
        'h3': ['Inter', 'sans-serif'],
        'h4': ['Inter', 'sans-serif'],
        'h5': ['Inter', 'sans-serif'],
        'body-sm': ['Inter', 'sans-serif'],
        'body-md': ['Inter', 'sans-serif'],
        'body-lg': ['Inter', 'sans-serif'],
        'label-sm': ['Inter', 'sans-serif'],
        'label-md': ['Inter', 'sans-serif'],
        'mono-data': [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },

      /* ========================================
         FONT SIZE TOKENS — with lineHeight + fontWeight
         ======================================== */
      fontSize: {
        'h1': ['38px', { lineHeight: '46px', fontWeight: '600' }],
        'h2': ['30px', { lineHeight: '38px', fontWeight: '600' }],
        'h3': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'h4': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'h5': ['16px', { lineHeight: '24px', fontWeight: '600' }],
        'body-sm': ['12px', { lineHeight: '20px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '22px', fontWeight: '400' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-sm': ['12px', { lineHeight: '20px', fontWeight: '500' }],
        'label-md': ['14px', { lineHeight: '22px', fontWeight: '500' }],
        'mono-data': ['13px', { lineHeight: '20px', fontWeight: '400' }],
      },
    },
  },
  plugins: [],
};

export default config;
