/**
 * AG Grid v35 Theming API configuration.
 * Replaces the legacy CSS import approach (ag-theme-alpine.css).
 * Uses the built-in Quartz theme with Figma design token overrides.
 */
import { themeQuartz } from 'ag-grid-community';

/**
 * Custom AG Grid theme matching the Price Management Figma design system.
 * Color tokens aligned with Surface/Primary/OnSurface palette.
 */
export const appGridTheme = themeQuartz.withParams({
  /* Base */
  backgroundColor: '#ffffff',
  foregroundColor: '#1b1c1c',
  borderColor: '#e9e8e8',
  borderRadius: 4,

  /* Header */
  headerBackgroundColor: '#f4f3f3',
  headerFontSize: 12,
  headerFontWeight: 500,

  /* Rows */
  oddRowBackgroundColor: 'transparent',
  rowHoverColor: '#f4f3f3',
  selectedRowBackgroundColor: 'rgba(0, 87, 194, 0.08)',
  rowBorderColor: '#e9e8e8',

  /* Typography */
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
});
