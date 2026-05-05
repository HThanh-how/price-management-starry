/**
 * AG Grid v35 Theming API configuration.
 * Replaces the legacy CSS import approach (ag-theme-alpine.css).
 * Uses the built-in Quartz theme with minimal safe overrides.
 */
import { themeQuartz } from 'ag-grid-community';

/**
 * Custom AG Grid theme matching the Price Management Figma design system.
 * Only uses params confirmed to exist in AG Grid v35 ThemeDefaultParams.
 */
export const appGridTheme = themeQuartz.withParams({
  backgroundColor: '#ffffff',
  foregroundColor: '#1b1c1c',
  borderColor: '#e9e8e8',
  borderRadius: 4,
  headerBackgroundColor: '#f4f3f3',
  oddRowBackgroundColor: 'transparent',
  rowHoverColor: '#f4f3f3',
  selectedRowBackgroundColor: 'rgba(0, 87, 194, 0.08)',
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
});
