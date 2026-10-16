import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text as RNText,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  ArrowLeft01Icon,
  SparklesIcon,
  RefreshIcon,
  Delete02Icon,
  CheckmarkCircle02Icon,
  ShoppingBag01Icon,
  Tag01Icon,
} from '@hugeicons/core-free-icons';

import { useAppTheme, Spacing, MaxContentWidth } from '@/constants/theme';
import { haptic } from '@/lib/haptics';
import { obterProduto } from '@/lib/api';
import { useProductStore } from '@/store/useProductStore';
import { ChipSelector } from '@/components/ChipSelector';
import { Button, ButtonText } from '@/components/ui/button';
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { Input, InputField } from '@/components/ui/input';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import {
  CATEGORY_LABELS,
  CONDITION_LABELS,
  type ProductCategory,
  type ProductCondition,
  type Produto,
} from '@/types/product';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function parsePrice(raw: string): number {
  const text = raw.trim();
  if (!text) return NaN;
  const normalized = text.includes(',') ? text.replace(/\./g, '').replace(',', '.') : text;
  return Number(normalized);
}

export default function ProdutoDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { palette } = useAppTheme();

  const produtos = useProductStore((state) => state.produtos);
  const atualizarProduto = useProductStore((state) => state.atualizarProduto);
  const removerProduto = useProductStore((state) => state.removerProduto);
  const enriquecerProduto = useProductStore((state) => state.enriquecerProduto);

  // Procura o produto no store ou estado local
  const storeProduto = produtos.find((p) => p.id === id);
  const [localProduto, setLocalProduto] = useState<Produto | null>(storeProduto || null);
  const [isLoadingDirect, setIsLoadingDirect] = useState(!storeProduto);

  // Campos do formulário de edição inicializados a partir do store
  const [nome, setNome] = useState(storeProduto?.nome || '');
  const [preco, setPreco] = useState(storeProduto?.preco_usuario ? String(storeProduto.preco_usuario) : '');
  const [condicao, setCondicao] = useState<ProductCondition>(storeProduto?.condicao || 'como_novo');
  const [categoria, setCategoria] = useState<ProductCategory>(storeProduto?.categoria || 'diversos');
  const [observacoes, setObservacoes] = useState(storeProduto?.observacoes_usuario || '');
  const [descricaoCurta, setDescricaoCurta] = useState(storeProduto?.descricao_curta || '');
  const [descricaoLonga, setDescricaoLonga] = useState(storeProduto?.descricao_longa || '');

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Busca o produto caso a página tenha sido aberta diretamente (ex: reload ou link)
  useEffect(() => {
    let active = true;
    if (!storeProduto && id) {
      obterProduto(id)
        .then((prod) => {
          if (active) {
            setLocalProduto(prod);
            setIsLoadingDirect(false);
            setNome(prod.nome || '');
            setPreco(prod.preco_usuario ? String(prod.preco_usuario) : '');
            setCondicao(prod.condicao || 'como_novo');
            setCategoria(prod.categoria || 'diversos');
            setObservacoes(prod.observacoes_usuario || '');
            setDescricaoCurta(prod.descricao_curta || '');
            setDescricaoLonga(prod.descricao_longa || '');
          }
        })
        .catch(() => {
          if (active) {
            setIsLoadingDirect(false);
          }
        });
    }
    return () => {
      active = false;
    };
  }, [id, storeProduto]);

  const produtoAtual = storeProduto || localProduto;
  const isProcessandoIa = produtoAtual?.status === 'processando_ia';

  const precoValor = parsePrice(preco);
  const isNomeInvalido = submitted && nome.trim().length < 3;
  const isPrecoInvalido = submitted && !(precoValor > 0);

  // Ação de acionar a Inteligência Artificial sob demanda
  const handleAcionarIa = useCallback(async () => {
    if (!id || isProcessandoIa) return;
    haptic.medium();
    try {
      await enriquecerProduto(id);
      const prodAtualizado = useProductStore.getState().produtos.find((p) => p.id === id);
      if (prodAtualizado) {
        if (prodAtualizado.nome) setNome(prodAtualizado.nome);
        if (prodAtualizado.descricao_curta) setDescricaoCurta(prodAtualizado.descricao_curta);
        if (prodAtualizado.descricao_longa) setDescricaoLonga(prodAtualizado.descricao_longa);
      }
      haptic.success();
    } catch {
      haptic.error();
      Alert.alert(
        'Falha ao gerar anúncio',
        'Não foi possível conectar ao serviço de IA. Verifique sua conexão e tente novamente.'
      );
    }
  }, [id, isProcessandoIa, enriquecerProduto]);

  // Ação de salvar alterações manuais
  const handleSalvar = async () => {
    setSubmitted(true);
    if (!id || !produtoAtual) return;

    if (nome.trim().length < 3 || !(precoValor > 0)) {
      haptic.error();
      return;
    }

    setIsSaving(true);
    try {
      await atualizarProduto(id, {
        nome: nome.trim(),
        preco_usuario: precoValor,
        condicao,
        categoria,
        observacoes_usuario: observacoes.trim(),
        descricao_curta: descricaoCurta.trim() || undefined,
        descricao_longa: descricaoLonga.trim() || undefined,
      });

      haptic.success();
      Alert.alert('Sucesso', 'Produto atualizado com sucesso no catálogo!');
    } catch (err: any) {
      haptic.error();
      Alert.alert('Erro ao salvar', err?.message || 'Falha ao salvar alterações.');
    } finally {
      setIsSaving(false);
    }
  };

  // Ação de exclusão permanente com confirmação
  const handleExcluir = () => {
    if (!id || !produtoAtual) return;
    haptic.warning();

    Alert.alert(
      'Excluir Produto',
      `Tem certeza que deseja excluir "${produtoAtual.nome || 'este produto'}" permanentemente? As fotos e o anúncio serão removidos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await removerProduto(id, produtoAtual.fotos);
              haptic.success();
              router.back();
            } catch (err: any) {
              haptic.error();
              Alert.alert('Erro ao excluir', err?.message || 'Não foi possível excluir o produto.');
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (isLoadingDirect) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: palette.background,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 12,
        }}>
        <ActivityIndicator size="large" color={palette.highlight} />
        <RNText style={{ color: palette.paragraph, fontSize: 14 }}>
          Carregando informações do produto...
        </RNText>
      </View>
    );
  }

  if (!produtoAtual) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: palette.background,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
          gap: 16,
        }}>
        <HugeiconsIcon icon={ShoppingBag01Icon} size={56} color={palette.paragraphMuted} strokeWidth={1.5} />
        <RNText
          style={{
            color: palette.headline,
            fontSize: 18,
            fontWeight: '700',
            textAlign: 'center',
          }}>
          Produto não encontrado
        </RNText>
        <RNText
          style={{
            color: palette.paragraph,
            fontSize: 14,
            textAlign: 'center',
          }}>
          Este item pode ter sido excluído ou não pertence à sua conta.
        </RNText>
        <Button
          onPress={() => router.back()}
          style={{ backgroundColor: palette.highlight }}
          className="rounded-xl px-6 h-12 mt-2">
          <ButtonText style={{ color: palette.onHighlight }} className="text-sm font-bold">
            Voltar ao Catálogo
          </ButtonText>
        </Button>
      </View>
    );
  }

  const fotos = produtoAtual.fotos || [];
  const temFotos = fotos.length > 0;
  const jaTemIa = Boolean(produtoAtual.descricao_curta || produtoAtual.descricao_longa);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: palette.background }}>
      {/* Header Superior Nativo */}
      <View
        style={{
          paddingTop: insets.top + Spacing.two,
          paddingBottom: Spacing.two,
          paddingHorizontal: Spacing.four,
          borderBottomWidth: 1,
          borderBottomColor: palette.border,
          backgroundColor: palette.surface,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Pressable
          onPress={() => {
            haptic.light();
            router.back();
          }}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Voltar ao catálogo"
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: palette.surfaceSubtle,
          }}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color={palette.headline} strokeWidth={2} />
        </Pressable>

        <VStack className="items-center">
          <RNText
            style={{
              color: palette.headline,
              fontSize: 16,
              fontWeight: '700',
              includeFontPadding: false,
            }}>
            Editar Produto
          </RNText>
          <RNText
            style={{
              color: palette.paragraphMuted,
              fontSize: 11,
              includeFontPadding: false,
            }}>
            {jaTemIa ? 'Com suporte de IA' : 'Edição manual e IA'}
          </RNText>
        </VStack>

        <Pressable
          onPress={handleExcluir}
          disabled={isDeleting}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Excluir produto"
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `${palette.danger}15`,
          }}>
          <HugeiconsIcon icon={Delete02Icon} size={20} color={palette.danger} strokeWidth={2} />
        </Pressable>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: insets.bottom + Spacing.five,
          maxWidth: MaxContentWidth,
          width: '100%',
          alignSelf: 'center',
        }}
        showsVerticalScrollIndicator={false}>
        {/* Carrossel de Fotos do Produto */}
        {temFotos ? (
          <View style={{ marginBottom: Spacing.three }}>
            <FlatList
              data={fotos}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, index) => `foto-${index}`}
              onMomentumScrollEnd={(e) => {
                const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                setActivePhotoIndex(newIndex);
              }}
              renderItem={({ item, index }) => (
                <View style={{ width: SCREEN_WIDTH, height: 260, backgroundColor: palette.surfaceSubtle }}>
                  <Image
                    source={{ uri: item }}
                    contentFit="cover"
                    transition={200}
                    cachePolicy="memory-disk"
                    style={{ width: '100%', height: '100%' }}
                  />
                  {index === 0 && (
                    <View
                      style={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        backgroundColor: `${palette.surface}E6`,
                        borderRadius: 8,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderWidth: 1,
                        borderColor: palette.border,
                      }}>
                      <RNText
                        style={{
                          color: palette.headline,
                          fontSize: 11,
                          fontWeight: '700',
                          includeFontPadding: false,
                        }}>
                        Foto Principal (Capa)
                      </RNText>
                    </View>
                  )}
                </View>
              )}
            />

            {/* Indicador de Páginas das Fotos */}
            {fotos.length > 1 && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 10,
                }}>
                {fotos.map((_, i) => (
                  <View
                    key={`dot-${i}`}
                    style={{
                      width: activePhotoIndex === i ? 18 : 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: activePhotoIndex === i ? palette.highlight : palette.border,
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        ) : null}

        <View style={{ paddingHorizontal: Spacing.four, gap: Spacing.four }}>
          {/* Card de Inteligência Artificial Multimodal */}
          <View
            style={{
              backgroundColor: isProcessandoIa ? `${palette.highlight}10` : palette.surface,
              borderColor: isProcessandoIa ? palette.highlight : palette.border,
              borderWidth: 1,
              borderRadius: 20,
              padding: 16,
              gap: 12,
            }}>
            <HStack className="items-center justify-between">
              <HStack className="items-center gap-2.5">
                <View
                  style={{
                    backgroundColor: isProcessandoIa ? palette.highlight : `${palette.highlight}20`,
                    borderRadius: 12,
                    padding: 8,
                  }}>
                  <HugeiconsIcon
                    icon={SparklesIcon}
                    size={20}
                    color={isProcessandoIa ? palette.onHighlight : palette.highlight}
                    strokeWidth={2}
                  />
                </View>
                <VStack>
                  <RNText
                    style={{
                      color: palette.headline,
                      fontSize: 15,
                      fontWeight: '700',
                      includeFontPadding: false,
                    }}>
                    Inteligência Artificial Multimodal
                  </RNText>
                  <RNText
                    style={{
                      color: palette.paragraphMuted,
                      fontSize: 12,
                      includeFontPadding: false,
                    }}>
                    Google Gemini 3.5 Flash-Lite (Custo Zero)
                  </RNText>
                </VStack>
              </HStack>

              {jaTemIa && !isProcessandoIa && (
                <View
                  style={{
                    backgroundColor: `${palette.success}20`,
                    borderRadius: 12,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                  }}>
                  <RNText
                    style={{
                      color: palette.success,
                      fontSize: 11,
                      fontWeight: '700',
                      includeFontPadding: false,
                    }}>
                    Enriquecido
                  </RNText>
                </View>
              )}
            </HStack>

            <RNText
              style={{
                color: palette.paragraph,
                fontSize: 13,
                lineHeight: 18,
                includeFontPadding: false,
              }}>
              {isProcessandoIa
                ? 'Analisando as fotos com visão computacional e gerando títulos e descrições vendedoras...'
                : jaTemIa
                ? 'Você pode rodar novamente a IA para gerar novas sugestões ou editar os textos gerados abaixo.'
                : 'Analise as fotos deste produto para gerar automaticamente o título comercial e a descrição rica sem precisar recadastrar.'}
            </RNText>

            <Button
              onPress={handleAcionarIa}
              disabled={isProcessandoIa || isSaving || isDeleting}
              style={{
                backgroundColor: isProcessandoIa ? palette.surfaceSubtle : palette.highlight,
              }}
              className="rounded-xl h-12 flex-row items-center justify-center gap-2 active:opacity-85">
              {isProcessandoIa ? (
                <>
                  <ActivityIndicator size="small" color={palette.highlight} />
                  <ButtonText style={{ color: palette.highlight }} className="text-sm font-bold">
                    Gerando Anúncio com IA...
                  </ButtonText>
                </>
              ) : (
                <>
                  <HugeiconsIcon
                    icon={jaTemIa ? RefreshIcon : SparklesIcon}
                    size={18}
                    color={palette.onHighlight}
                    strokeWidth={2.2}
                  />
                  <ButtonText style={{ color: palette.onHighlight }} className="text-sm font-bold">
                    {jaTemIa ? 'Regenerar Anúncio com IA' : 'Gerar Anúncio com IA'}
                  </ButtonText>
                </>
              )}
            </Button>
          </View>

          {/* Formulário de Edição Manual de Campos */}
          <VStack className="gap-4">
            {/* Título Comercial */}
            <FormControl isInvalid={isNomeInvalido}>
              <FormControlLabel>
                <FormControlLabelText style={{ color: palette.headline, fontWeight: '700', fontSize: 14 }}>
                  Título do Produto
                </FormControlLabelText>
              </FormControlLabel>
              <Input
                style={{
                  backgroundColor: palette.surface,
                  borderColor: isNomeInvalido ? palette.danger : palette.border,
                }}
                className="rounded-xl h-12 px-3 border mt-1">
                <InputField
                  value={nome}
                  onChangeText={setNome}
                  placeholder="Ex: Teclado Mecânico RGB Wireless"
                  placeholderTextColor={palette.paragraphMuted}
                  style={{ color: palette.headline, fontSize: 14 }}
                />
              </Input>
              {isNomeInvalido && (
                <FormControlError>
                  <FormControlErrorText style={{ color: palette.danger, fontSize: 12 }}>
                    Informe um título com pelo menos 3 caracteres.
                  </FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>

            {/* Preço de Venda */}
            <FormControl isInvalid={isPrecoInvalido}>
              <FormControlLabel>
                <FormControlLabelText style={{ color: palette.headline, fontWeight: '700', fontSize: 14 }}>
                  Preço Desejado (R$)
                </FormControlLabelText>
              </FormControlLabel>
              <Input
                style={{
                  backgroundColor: palette.surface,
                  borderColor: isPrecoInvalido ? palette.danger : palette.border,
                }}
                className="rounded-xl h-12 px-3 border mt-1">
                <InputField
                  value={preco}
                  onChangeText={setPreco}
                  placeholder="0,00"
                  keyboardType="numeric"
                  placeholderTextColor={palette.paragraphMuted}
                  style={{ color: palette.headline, fontSize: 14 }}
                />
              </Input>
              {isPrecoInvalido && (
                <FormControlError>
                  <FormControlErrorText style={{ color: palette.danger, fontSize: 12 }}>
                    Informe um valor válido maior que zero.
                  </FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>

            {/* Condição do Item */}
            <VStack className="gap-1.5">
              <RNText style={{ color: palette.headline, fontWeight: '700', fontSize: 14, includeFontPadding: false }}>
                Condição do Item
              </RNText>
              <ChipSelector
                options={CONDITION_LABELS}
                value={condicao}
                onChange={setCondicao}
              />
            </VStack>

            {/* Categoria */}
            <VStack className="gap-1.5">
              <RNText style={{ color: palette.headline, fontWeight: '700', fontSize: 14, includeFontPadding: false }}>
                Categoria
              </RNText>
              <ChipSelector
                options={CATEGORY_LABELS}
                value={categoria}
                onChange={setCategoria}
              />
            </VStack>

            {/* Observações Originais */}
            <VStack className="gap-1.5">
              <RNText style={{ color: palette.headline, fontWeight: '700', fontSize: 14, includeFontPadding: false }}>
                Observações e Detalhes Originais
              </RNText>
              <Textarea
                style={{
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                }}
                className="rounded-xl p-3 border">
                <TextareaInput
                  value={observacoes}
                  onChangeText={setObservacoes}
                  placeholder="Detalhes sobre defeitos, tempo de uso, acessórios inclusos..."
                  placeholderTextColor={palette.paragraphMuted}
                  style={{ color: palette.headline, fontSize: 13 }}
                  multiline
                  numberOfLines={3}
                />
              </Textarea>
            </VStack>

            {/* Descrição Curta (IA / Manual) */}
            <VStack className="gap-1.5">
              <HStack className="items-center justify-between">
                <RNText style={{ color: palette.headline, fontWeight: '700', fontSize: 14, includeFontPadding: false }}>
                  Descrição Curta (Gancho de Venda)
                </RNText>
                <HugeiconsIcon icon={Tag01Icon} size={16} color={palette.paragraphMuted} strokeWidth={2} />
              </HStack>
              <Textarea
                style={{
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                }}
                className="rounded-xl p-3 border">
                <TextareaInput
                  value={descricaoCurta}
                  onChangeText={setDescricaoCurta}
                  placeholder="Resumo chamativo para prévia de busca e redes sociais..."
                  placeholderTextColor={palette.paragraphMuted}
                  style={{ color: palette.headline, fontSize: 13 }}
                  multiline
                  numberOfLines={2}
                />
              </Textarea>
            </VStack>

            {/* Descrição Longa (IA / Manual) */}
            <VStack className="gap-1.5">
              <RNText style={{ color: palette.headline, fontWeight: '700', fontSize: 14, includeFontPadding: false }}>
                Descrição Completa para Marketplaces
              </RNText>
              <Textarea
                style={{
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                  minHeight: 120,
                }}
                className="rounded-xl p-3 border">
                <TextareaInput
                  value={descricaoLonga}
                  onChangeText={setDescricaoLonga}
                  placeholder="Texto rico com especificações técnicas, estado de conservação e apelo de venda..."
                  placeholderTextColor={palette.paragraphMuted}
                  style={{ color: palette.headline, fontSize: 13 }}
                  multiline
                  numberOfLines={6}
                />
              </Textarea>
            </VStack>

            {/* Botões de Ação Final */}
            <VStack className="gap-3 mt-3">
              <Button
                onPress={handleSalvar}
                disabled={isSaving || isProcessandoIa || isDeleting}
                style={{ backgroundColor: palette.highlight }}
                className="rounded-2xl h-14 items-center justify-center active:opacity-85">
                <HStack className="items-center gap-2">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} color={palette.onHighlight} strokeWidth={2.2} />
                  <ButtonText style={{ color: palette.onHighlight }} className="text-base font-bold">
                    {isSaving ? 'Salvando Alterações...' : 'Salvar Alterações'}
                  </ButtonText>
                </HStack>
              </Button>

              <Pressable
                onPress={handleExcluir}
                disabled={isDeleting || isSaving}
                accessibilityRole="button"
                accessibilityLabel="Excluir este anúncio"
                style={{
                  borderColor: `${palette.danger}40`,
                  backgroundColor: `${palette.danger}08`,
                }}
                className="rounded-2xl h-12 border items-center justify-center flex-row gap-2 active:opacity-75">
                <HugeiconsIcon icon={Delete02Icon} size={18} color={palette.danger} strokeWidth={2} />
                <RNText
                  style={{
                    color: palette.danger,
                    fontWeight: '700',
                    fontSize: 14,
                    includeFontPadding: false,
                  }}>
                  {isDeleting ? 'Excluindo Produto...' : 'Excluir Este Anúncio'}
                </RNText>
              </Pressable>
            </VStack>
          </VStack>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
