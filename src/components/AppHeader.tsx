import { Image } from 'expo-image';

import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

type AppHeaderProps = { subtitle?: string };

/** Cabeçalho das telas principais: isotipo + título "posta.ai". */
export function AppHeader({ subtitle }: AppHeaderProps) {
  return (
    <VStack className="gap-1">
      <HStack className="items-center gap-2">
        <Image
          source={require('@/assets/images/isotipo.png')}
          contentFit="contain"
          accessibilityLabel="Isotipo posta.ai"
          style={{ width: 36, height: 36 }}
        />
        <Text className="text-3xl font-bold text-[#fffffe]">posta.ai</Text>
      </HStack>
      {subtitle ? <Text className="text-[15px] text-[#abd1c6]">{subtitle}</Text> : null}
    </VStack>
  );
}
