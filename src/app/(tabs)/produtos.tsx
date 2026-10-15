import { PackageIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/AppHeader';
import { ProductCard } from '@/components/ProductCard';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { MaxContentWidth, useAppTheme, Spacing } from '@/constants/theme';
import { useProductStore } from '@/store/useProductStore';

export default function ProdutosScreen() {
  const insets = useSafeAreaInsets();
  const { produtos, isLoading, error, fetchProdutos } = useProductStore();
  const { palette } = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProdutos().catch(() => {});
  }, [fetchProdutos]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchProdutos();
    } catch {
      // erro já tratado no store
    } finally {
      setRefreshing(false);
    }
  }, [fetchProdutos]);

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <FlatList
        data={produtos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProductCard produto={item} />}
        ListHeaderComponent={<AppHeader subtitle="Meus produtos cadastrados." />}
        ListHeaderComponentStyle={{ marginBottom: Spacing.three }}
        ListEmptyComponent={
          isLoading && !refreshing ? (
            <VStack className="flex-1 items-center justify-center gap-3 py-16">
              <ActivityIndicator size="large" color={palette.highlight} />
              <Text style={{ color: palette.paragraph }} className="text-sm">Carregando produtos...</Text>
            </VStack>
          ) : error ? (
            <VStack className="flex-1 items-center justify-center gap-3 py-16">
              <HugeiconsIcon
                icon={PackageIcon}
                size={64}
                color={palette.tertiary}
                strokeWidth={1.5}
              />
              <Text style={{ color: palette.headline }} className="text-lg font-semibold">Erro ao carregar</Text>
              <Text style={{ color: palette.paragraph }} className="text-center text-sm">{error}</Text>
              <Text style={{ color: palette.paragraph }} className="text-center text-xs">
                Puxe para baixo para tentar novamente.
              </Text>
            </VStack>
          ) : (
            <VStack className="flex-1 items-center justify-center gap-3 py-16">
              <HugeiconsIcon
                icon={PackageIcon}
                size={64}
                color={palette.paragraph}
                strokeWidth={1.5}
              />
              <Text style={{ color: palette.headline }} className="text-lg font-semibold">
                Nenhum produto cadastrado
              </Text>
              <Text style={{ color: palette.paragraph }} className="text-center text-sm">
                Fotografe um produto na aba Capturar e ele aparecerá aqui.
              </Text>
            </VStack>
          )
        }
        ItemSeparatorComponent={() => <View style={{ height: Spacing.two }} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[palette.highlight]}
            tintColor={palette.highlight}
          />
        }
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
