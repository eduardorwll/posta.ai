import { Camera01Icon, ShoppingBag01Icon, Settings01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Tabs } from 'expo-router';

import { useAppTheme } from '@/constants/theme';

export default function TabsLayout() {
  const { palette } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: palette.background },
        tabBarActiveTintColor: palette.highlight,
        tabBarInactiveTintColor: palette.paragraph,
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopColor: palette.border,
        },
      }}>
      <Tabs.Screen
        name="captura"
        options={{
          title: 'Capturar',
          tabBarIcon: ({ color, size }) => (
            <HugeiconsIcon icon={Camera01Icon} size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="produtos"
        options={{
          title: 'Meus Produtos',
          tabBarIcon: ({ color, size }) => (
            <HugeiconsIcon icon={ShoppingBag01Icon} size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="configuracao"
        options={{
          title: 'Configuração',
          tabBarIcon: ({ color, size }) => (
            <HugeiconsIcon icon={Settings01Icon} size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
    </Tabs>
  );
}
