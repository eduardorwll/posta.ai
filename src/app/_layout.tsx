import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { useAppTheme } from '@/constants/theme';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import '@/src/global.css';

// Previne fechamento antecipado da Splash Screen para evitar flicker visual de login
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const { isDark, palette } = useAppTheme();
  const initTheme = useThemeStore((state) => state.initTheme);
  const segments = useSegments();
  const router = useRouter();

  const isInitialized = useAuthStore((state) => state.isInitialized);
  const session = useAuthStore((state) => state.session);
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initTheme();
    const cleanupPromise = initAuth();
    return () => {
      cleanupPromise.then((cleanup) => cleanup?.());
    };
  }, [initTheme, initAuth]);

  useEffect(() => {
    if (!isInitialized) return;

    // Desoculta a Splash Screen após resolver a hidratação da sessão
    SplashScreen.hideAsync().catch(() => {});

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login' as any);
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)/captura' as any);
    }
  }, [isInitialized, session, segments, router]);

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
