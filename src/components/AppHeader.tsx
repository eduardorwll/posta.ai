import { Image } from 'expo-image';
import { Text as RNText, View } from 'react-native';

import { useAppTheme } from '@/constants/theme';

type AppHeaderProps = { subtitle?: string };

/** Cabeçalho das telas principais: isotipo + título "posta.ai". */
export function AppHeader({ subtitle }: AppHeaderProps) {
  const { palette } = useAppTheme();

  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Image
          source={require('@/assets/images/isotipo.png')}
          contentFit="contain"
          accessibilityLabel="Isotipo posta.ai"
          style={{ width: 44, height: 44 }}
        />
        <RNText
          style={{
            color: palette.headline,
            fontSize: 28,
            fontWeight: '800',
            lineHeight: 34,
            includeFontPadding: false,
          }}>
          posta.ai
        </RNText>
      </View>
      {subtitle ? (
        <RNText
          style={{
            color: palette.paragraph,
            fontSize: 14,
            lineHeight: 20,
            includeFontPadding: false,
          }}>
          {subtitle}
        </RNText>
      ) : null}
    </View>
  );
}
