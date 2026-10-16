import { Stack } from 'expo-router';
import { useAppTheme } from '@/constants/theme';

export default function AuthLayout() {
  const { palette } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: palette.background },
        animation: 'slide_from_right',
      }}
    />
  );
}
