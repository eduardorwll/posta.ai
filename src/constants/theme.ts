/**
 * Abaixo estão as cores utilizadas no aplicativo posta.ai.
 * Suporta modo escuro e modo claro com a identidade visual do projeto.
 */

import '@/global.css';

import { Platform, useColorScheme } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';

export const Colors = {
  light: {
    text: '#002926',
    background: '#f2f7f5',
    backgroundElement: '#ffffff',
    backgroundSelected: '#e2ece9',
    textSecondary: '#4a6f68',
  },
  dark: {
    text: '#fffffe',
    background: '#004643',
    backgroundElement: '#001e1d',
    backgroundSelected: '#003330',
    textSecondary: '#abd1c6',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

export const Palettes = {
  dark: {
    background: '#004643',
    surface: '#001e1d',
    surfaceSubtle: '#003330',
    headline: '#fffffe',
    paragraph: '#abd1c6',
    paragraphMuted: '#7ea79d',
    highlight: '#f9bc60',
    onHighlight: '#001e1d',
    tertiary: '#e16162',
    border: 'rgba(171, 209, 198, 0.2)',
    borderSubtle: 'rgba(171, 209, 198, 0.1)',
    success: '#2ec4b6',
    warning: '#f9bc60',
    danger: '#e16162',
    badgeCover: '#f9bc60',
    onBadgeCover: '#001e1d',
  },
  light: {
    background: '#f2f7f5',
    surface: '#ffffff',
    surfaceSubtle: '#e8f1ee',
    headline: '#002926',
    paragraph: '#4a6f68',
    paragraphMuted: '#6b8f88',
    highlight: '#004643',
    onHighlight: '#ffffff',
    tertiary: '#dc2626',
    border: 'rgba(0, 70, 67, 0.12)',
    borderSubtle: 'rgba(0, 70, 67, 0.06)',
    success: '#0f766e',
    warning: '#d97706',
    danger: '#dc2626',
    badgeCover: '#004643',
    onBadgeCover: '#ffffff',
  },
} as const;

/** Paleta oficial padrão (dark) para compatibilidade retroativa. */
export const Palette = Palettes.dark;

export type AppPalette = typeof Palettes.dark;

export function useAppTheme() {
  const { themeMode } = useThemeStore();
  const systemColorScheme = useColorScheme();

  const isDark =
    themeMode === 'system'
      ? systemColorScheme !== 'light'
      : themeMode !== 'light';

  const palette = isDark ? Palettes.dark : Palettes.light;

  return {
    themeMode,
    isDark,
    palette,
  };
}
