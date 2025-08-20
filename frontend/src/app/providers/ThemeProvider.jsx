// src/app/providers/ThemeProvider.jsx
import { CssBaseline, ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material';
import { useMemo } from 'react';

const palette = {
  mode: 'dark',
  primary: {
    main: '#22C55E', // emerald 500
    dark: '#16A34A',
    light: '#86EFAC',
    contrastText: '#06140B',
  },
  success: { main: '#22C55E' },
  warning: { main: '#F59E0B' },
  error: { main: '#EF4444' },
  divider: '#1A1F1D',
  background: {
    default: '#0B0F10', // near-black
    paper: '#0F1412', // card surface
  },
  text: {
    primary: '#E5E7EB',
    secondary: '#9CA3AF',
    disabled: '#6B7280',
  },
};

export default function ThemeProvider({ children }) {
  const theme = useMemo(
    () =>
      createTheme({
        cssVariables: true,
        palette,
        shape: { borderRadius: 14 },
        typography: {
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
          button: { textTransform: 'none', fontWeight: 600 },
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              ':root': {
                colorScheme: 'dark',
                '--divider': palette.divider,
              },
              body: {
                backgroundColor: palette.background.default,
                color: palette.text.primary,
              },
              '::selection': {
                background: 'rgba(34,197,94,0.25)',
              },
            },
          },
          MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
              root: {
                borderRadius: 12,
              },
              contained: {
                boxShadow: '0 8px 24px rgba(34,197,94,0.25)',
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                backgroundColor: palette.background.paper,
                border: `1px solid ${palette.divider}`,
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
          MuiLink: {
            styleOverrides: { root: { color: palette.primary.main } },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: 'rgba(11,15,16,0.7)',
                backdropFilter: 'blur(8px)',
                borderBottom: `1px solid ${palette.divider}`,
              },
            },
          },
        },
      }),
    []
  );

  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  );
}
