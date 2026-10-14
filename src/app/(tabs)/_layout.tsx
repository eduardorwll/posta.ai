import { Camera01Icon, ShoppingBag01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Tabs } from 'expo-router';

import { Palette } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: Palette.background },
        tabBarActiveTintColor: Palette.highlight,
        tabBarInactiveTintColor: Palette.paragraph,
        tabBarStyle: { backgroundColor: Palette.surface, borderTopColor: Palette.surface },
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
    </Tabs>
  );
}
