import type { ThemeName } from '@/domain/models';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  primary: string;
  primaryStrong: string;
  primarySoft: string;
  accent: string;
  warning: string;
  border: string;
  onPrimary: string;
  onSoft: string;
  onAccent: string;
}

export interface AppTheme {
  name: ThemeName;
  label: string;
  statusBarStyle: 'light' | 'dark';
  colors: ThemeColors;
}

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 22,
  pill: 999,
} as const;

export const themes: Record<ThemeName, AppTheme> = {
  'verde-activo': {
    name: 'verde-activo',
    label: 'Verde activo',
    statusBarStyle: 'dark',
    colors: {
      background: '#F4F7F5',
      surface: '#FFFFFF',
      surfaceElevated: '#FFFFFF',
      text: '#14241E',
      textSecondary: '#587066',
      primary: '#177453',
      primaryStrong: '#177453',
      primarySoft: '#DDEFE7',
      accent: '#C8EE72',
      warning: '#FFBD72',
      border: '#D9E5DE',
      onPrimary: '#FFFFFF',
      onSoft: '#14241E',
      onAccent: '#14241E',
    },
  },
  'grafito-naranja': {
    name: 'grafito-naranja',
    label: 'Grafito naranja',
    statusBarStyle: 'light',
    colors: {
      background: '#202326',
      surface: '#2B2F32',
      surfaceElevated: '#353A3E',
      text: '#F7F7F5',
      textSecondary: '#B4BAB8',
      primary: '#ED682B',
      primaryStrong: '#FF8040',
      primarySoft: '#353A3E',
      accent: '#FACB65',
      warning: '#FACB65',
      border: '#454B50',
      onPrimary: '#202326',
      onSoft: '#F7F7F5',
      onAccent: '#202326',
    },
  },
};

export const defaultThemeName: ThemeName = 'verde-activo';
