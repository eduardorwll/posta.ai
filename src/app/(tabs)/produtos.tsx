import { PackageIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/AppHeader';
import { ProductCard } from '@/components/ProductCard';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { MaxContentWidth, Palette, Spacing } from '@/constants/theme';
import { useProductStore } from '@/store/useProductStore';

export default function ProdutosScreen() {
  const insets = useSafeAreaInsets();
  const produtos = useProductStore((state) => state.produtos);

  return (
    <View style={{ flex: 1, backgroundColor: Palette.background }}>
      <FlatList
        data={produtos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProductCard produto={item} />}
        ListHeaderComponent={<AppHeader subtitle="Meus produtos cadastrados." />}
        ListHeaderComponentStyle={{ marginBottom: Spacing.three }}
        ListEmptyComponent={
          <VStack className="flex-1 items-center justify-center gap-3 py-16">
            <HugeiconsIcon icon={PackageIcon} size={64} color={Palette.paragraph} strokeWidth={1.5} />
            <Text className="text-lg font-semibold text-[#fffffe]">Nenhum produto cadastrado</Text>
            <Text className="text-center text-sm text-[#abd1c6]">
              Fotografe um produto na aba Capturar e ele aparecerá aqui.
            </Text>
          </VStack>
        }
        ItemSeparatorComponent={() => <View style={{ height: Spacing.two }} />}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          flexGrow: 1,
          width: '100%',
          maxWidth: MaxContentWidth,
          alignSelf: 'center',
          paddingTop: insets.top + Spacing.three,
          paddingBottom: Spacing.four,
          paddingHorizontal: Spacing.four,
        }}
      />
    </View>
  );
}
