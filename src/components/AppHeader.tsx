import { Image } from 'expo-image';

import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAppTheme } from '@/constants/theme';

type AppHeaderProps = { subtitle?: string };

/** Cabeçalho das telas principais: isotipo + título "posta.ai". */
export function AppHeader({ subtitle }: AppHeaderProps) {
  const { palette } = useAppTheme();

  return (
    <VStack className="gap-1">
      <HStack className="items-center gap-2">
        <Image
          source={require('@/assets/images/isotipo.png')}
          contentFit="contain"
          accessibilityLabel="Isotipo posta.ai"
          style={{ width: 48, height: 48 }}
        />
        <Text style={{ color: palette.headline }} className="text-3xl font-bold">posta.ai</Text>
      </HStack>
      {subtitle ? <Text style={{ color: palette.paragraph }} className="text-[15px]">{subtitle}</Text> : null}
    </VStack>
  );
}
