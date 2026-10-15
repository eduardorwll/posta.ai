import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { useAppTheme } from '@/constants/theme';
import { useThemeStore } from '@/store/useThemeStore';
import { useApiConfigStore } from '@/store/useApiConfigStore';
import '@/src/global.css';

export default function RootLayout() {
  const { isDark, palette } = useAppTheme();
  const initTheme = useThemeStore((state) => state.initTheme);
  const initApiConfig = useApiConfigStore((state) => state.initApiConfig);

  useEffect(() => {
    initTheme();
    initApiConfig();
  }, [initTheme, initApiConfig]);

  const baseTheme = isDark ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      background: palette.background,
      card: palette.surface,
      border: palette.border,
      primary: palette.highlight,
      text: palette.headline,
    },
  };

  return (
    <GluestackUIProvider mode={isDark ? 'dark' : 'light'}>
      <ThemeProvider value={navigationTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </GluestackUIProvider>
  );
}
