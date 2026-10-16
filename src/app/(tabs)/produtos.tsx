import {
  Cancel01Icon,
  PackageIcon,
  PlusSignIcon,
  Search01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  Text as RNText,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/AppHeader';
import { ProductCard } from '@/components/ProductCard';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { MaxContentWidth, Spacing, useAppTheme } from '@/constants/theme';
import { haptic } from '@/lib/haptics';
import { useProductStore } from '@/store/useProductStore';
import { CATEGORY_LABELS, CONDITION_LABELS } from '@/types/product';

/**
 * Tela de listagem de produtos com:
 * - Busca instantânea em memória por título, categoria e condição
 * - Skeleton visual durante o carregamento inicial (ui-ux-pro-max)
 * - Empty states com call-to-action acionável
 * - Pull-to-refresh nativo com feedback tátil
 */
export default function ProdutosScreen() {
  const insets = useSafeAreaInsets();
  const { produtos, isLoading, error, fetchProdutos } = useProductStore();
  const { palette } = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProdutos().catch(() => {});
  }, [fetchProdutos]);

  const onRefresh = useCallback(async () => {
    haptic.light();
    setRefreshing(true);
    try {
      await fetchProdutos();
    } catch {
      // erro já tratado e armazenado no store
    } finally {
      setRefreshing(false);
    }
  }, [fetchProdutos]);

  // Filtro instantâneo em memória (Clean Code / Local Reasoning)
  const filteredProdutos = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return produtos;

    return produtos.filter((p) => {
      const matchName = p.nome?.toLowerCase().includes(query);
      const matchDesc = p.descricao_curta?.toLowerCase().includes(query);
      const matchNotes = p.observacoes_usuario?.toLowerCase().includes(query);
      const matchCategory = CATEGORY_LABELS[p.categoria]?.toLowerCase().includes(query);
      const matchCondition = CONDITION_LABELS[p.condicao]?.toLowerCase().includes(query);
      return matchName || matchDesc || matchNotes || matchCategory || matchCondition;
    });
  }, [produtos, searchQuery]);

  const handleClearSearch = () => {
    haptic.light();
    setSearchQuery('');
  };

  const handleGoToCaptura = () => {
    haptic.medium();
    router.push('/(tabs)/captura');
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <FlatList
        data={filteredProdutos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProductCard produto={item} />}
        ListHeaderComponent={
          <VStack className="gap-3 mb-3">
            <AppHeader subtitle="Catálogo de produtos cadastrados para venda" />

            {/* Barra de Busca em Tempo Real (Apenas se houver itens ou se estiver buscando) */}
            {(produtos.length > 0 || searchQuery.length > 0) && (
              <VStack className="gap-1.5">
                <HStack
                  style={{
                    backgroundColor: palette.surface,
                    borderColor: palette.border,
                  }}
                  className="rounded-2xl border px-3 h-12 items-center gap-2">
                  <HugeiconsIcon icon={Search01Icon} size={18} color={palette.paragraphMuted} strokeWidth={2} />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Buscar por nome, categoria ou detalhe..."
                    placeholderTextColor={palette.paragraphMuted}
                    style={{
                      flex: 1,
                      color: palette.headline,
                      fontSize: 14,
                    }}
                    returnKeyType="search"
                  />
                  {searchQuery.length > 0 && (
                    <Pressable
                      onPress={handleClearSearch}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel="Limpar busca">
                      <HugeiconsIcon icon={Cancel01Icon} size={18} color={palette.paragraph} strokeWidth={2} />
                    </Pressable>
                  )}
                </HStack>

                {searchQuery.length > 0 && (
                  <RNText
                    style={{
                      color: palette.paragraphMuted,
                      fontSize: 12,
                      lineHeight: 16,
                      includeFontPadding: false,
                      paddingHorizontal: 4,
                    }}>
                    Exibindo {filteredProdutos.length} de {produtos.length} produtos
                  </RNText>
                )}
              </VStack>
            )}
          </VStack>
        }
        ListEmptyComponent={
          isLoading && !refreshing ? (
            <VStack className="gap-3 py-2">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </VStack>
          ) : error ? (
            <VStack
              style={{ backgroundColor: palette.surface, borderColor: palette.border }}
              className="items-center justify-center gap-3 py-12 px-6 rounded-3xl border my-4">
              <HugeiconsIcon
                icon={PackageIcon}
                size={56}
                color={palette.danger}
                strokeWidth={1.5}
              />
              <RNText
                style={{
                  color: palette.headline,
                  fontSize: 18,
                  fontWeight: '700',
                  lineHeight: 24,
                  textAlign: 'center',
                  includeFontPadding: false,
                }}>
                Erro ao carregar catálogo
              </RNText>
              <RNText
                style={{
                  color: palette.paragraph,
                  fontSize: 13,
                  lineHeight: 18,
                  textAlign: 'center',
                  includeFontPadding: false,
                  maxWidth: 280,
                }}>
                {error}
              </RNText>
              <Button
                onPress={onRefresh}
                style={{ backgroundColor: palette.highlight }}
                className="rounded-xl px-5 h-11 mt-2">
                <ButtonText style={{ color: palette.onHighlight }} className="text-sm font-bold">
                  Tentar Novamente
                </ButtonText>
              </Button>
            </VStack>
          ) : searchQuery.length > 0 ? (
            <VStack
              style={{ backgroundColor: palette.surface, borderColor: palette.border }}
              className="items-center justify-center gap-3 py-12 px-6 rounded-3xl border my-4">
              <HugeiconsIcon
                icon={Search01Icon}
                size={48}
                color={palette.paragraphMuted}
                strokeWidth={1.5}
              />
              <RNText
                style={{
                  color: palette.headline,
                  fontSize: 16,
                  fontWeight: '600',
                  lineHeight: 22,
                  textAlign: 'center',
                  includeFontPadding: false,
                }}>
                Nenhum produto encontrado
              </RNText>
              <RNText
                style={{
                  color: palette.paragraph,
                  fontSize: 13,
                  lineHeight: 18,
                  textAlign: 'center',
                  includeFontPadding: false,
                  maxWidth: 260,
                }}>
                Nenhum item corresponde ao termo &quot;{searchQuery}&quot;.
              </RNText>
              <Button
                onPress={handleClearSearch}
                style={{ backgroundColor: palette.surfaceSubtle }}
                className="rounded-xl px-4 h-10 mt-1">
                <ButtonText style={{ color: palette.headline }} className="text-xs font-semibold">
                  Limpar filtro de busca
                </ButtonText>
              </Button>
            </VStack>
          ) : (
            <VStack
              style={{ backgroundColor: palette.surface, borderColor: palette.border }}
              className="items-center justify-center gap-3 py-14 px-6 rounded-3xl border my-4">
              <HugeiconsIcon
                icon={PackageIcon}
                size={64}
                color={palette.paragraphMuted}
                strokeWidth={1.5}
              />
              <RNText
                style={{
                  color: palette.headline,
                  fontSize: 18,
                  fontWeight: '700',
                  lineHeight: 24,
                  textAlign: 'center',
                  includeFontPadding: false,
                }}>
                Nenhum produto cadastrado
              </RNText>
              <RNText
                style={{
                  color: palette.paragraph,
                  fontSize: 14,
                  lineHeight: 20,
                  textAlign: 'center',
                  includeFontPadding: false,
                  maxWidth: 300,
                }}>
                Tire fotos e cadastre itens para gerar anúncios com inteligência artificial para seus canais de venda.
              </RNText>
              <Button
                onPress={handleGoToCaptura}
                style={{ backgroundColor: palette.highlight }}
                className="rounded-xl px-6 h-12 mt-3 flex-row items-center gap-2">
                <HugeiconsIcon icon={PlusSignIcon} size={18} color={palette.onHighlight} strokeWidth={2.4} />
                <ButtonText style={{ color: palette.onHighlight }} className="text-sm font-bold">
                  Cadastrar Primeiro Produto
                </ButtonText>
              </Button>
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
          paddingBottom: Spacing.five,
          paddingHorizontal: Spacing.four,
        }}
      />
    </View>
  );
}

/** Componente de Skeleton para loading com baixa carga cognitiva (ui-ux-pro-max) */
function SkeletonCard() {
  const { palette } = useAppTheme();

  return (
    <HStack
      style={{
        backgroundColor: palette.surface,
        borderColor: palette.borderSubtle,
      }}
      className="rounded-2xl p-3.5 border gap-3 items-center opacity-70">
      <View
        style={{
          width: 88,
          height: 88,
          borderRadius: 12,
          backgroundColor: palette.surfaceSubtle,
        }}
      />
      <VStack className="flex-1 gap-2.5">
        <View style={{ height: 16, width: '70%', backgroundColor: palette.surfaceSubtle, borderRadius: 6 }} />
        <View style={{ height: 12, width: '45%', backgroundColor: palette.surfaceSubtle, borderRadius: 4 }} />
        <View style={{ height: 18, width: '35%', backgroundColor: palette.surfaceSubtle, borderRadius: 6 }} />
      </VStack>
    </HStack>
  );
}
