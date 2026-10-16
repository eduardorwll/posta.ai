import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  Text as RNText,
  View,
} from 'react-native';
import { Alert02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/AppHeader';
import { CameraModal } from '@/components/CameraModal';
import { ChipSelector } from '@/components/ChipSelector';
import { PhotoGrid, type GridPhoto } from '@/components/PhotoGrid';
import { Button, ButtonText } from '@/components/ui/button';
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { VStack } from '@/components/ui/vstack';
import { MaxContentWidth, Spacing, useAppTheme } from '@/constants/theme';
import { haptic } from '@/lib/haptics';
import { useDraftStore } from '@/store/useDraftStore';
import { useProductStore } from '@/store/useProductStore';
import {
  CATEGORY_LABELS,
  CONDITION_LABELS,
} from '@/types/product';

const MAX_PHOTOS = 5;
const MIN_NAME_LENGTH = 3;
type PhotoSource = 'camera' | 'library';

function parsePrice(raw: string): number {
  const text = raw.trim();
  if (!text) return NaN;
  const normalized = text.includes(',') ? text.replace(/\./g, '').replace(',', '.') : text;
  return Number(normalized);
}

/**
 * Tela de captura e catalogação de produtos:
 * - Fotos em resolução original máxima (quality: 1)
 * - Persistência automática de rascunho (useDraftStore) resistente a reinicializações
 * - Identificação visual da Foto de Capa (índice 0)
 * - Validações visuais inline com mensagens semânticas
 * - Feedback físico háptico ao salvar e validar (Clean Code + Release It!)
 */
export default function CapturaScreen() {
  const insets = useSafeAreaInsets();
  const { cadastrarProduto, isLoading, clearError } = useProductStore();
  const { palette } = useAppTheme();

  const {
    nome,
    condicao,
    categoria,
    price,
    notes,
    photos,
    setNome,
    setCondicao,
    setCategoria,
    setPrice,
    setNotes,
    addPhotos,
    removePhoto,
    clearDraft,
  } = useDraftStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const remaining = MAX_PHOTOS - photos.length;
  const priceValue = parsePrice(price);

  // Regras de validação (Clean Code / Single Level of Abstraction)
  const isNomeInvalid = submitted && nome.trim().length < MIN_NAME_LENGTH;
  const isPriceInvalid = submitted && !(priceValue > 0);
  const isPhotosInvalid = submitted && photos.length === 0;

  async function ensurePermission(source: PhotoSource): Promise<boolean> {
    const response =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (response.granted) return true;

    const target = source === 'camera' ? 'à câmera' : 'às fotos';
    Alert.alert(
      'Permissão necessária',
      `Para catalogar produtos, permita o acesso ${target} nas configurações do seu celular.`,
      response.canAskAgain
        ? [{ text: 'OK' }]
        : [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Abrir configurações', onPress: () => Linking.openSettings() },
          ]
    );
    return false;
  }

  const processAssets = useCallback(
    async (assets: ImagePicker.ImagePickerAsset[]) => {
      setIsProcessing(true);
      try {
        const newPhotos: GridPhoto[] = assets.map((asset, idx) => ({
          uri: asset.uri,
          id: `${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        }));

        addPhotos(newPhotos);
      } catch (e) {
        console.error('Falha ao processar fotos', e);
        setServerError('Não foi possível carregar a imagem. Tente novamente.');
      } finally {
        setIsProcessing(false);
      }
    },
    [addPhotos]
  );

  useEffect(() => {
    let active = true;
    (async () => {
      const pending = await ImagePicker.getPendingResultAsync();
      if (!active || !pending || !('canceled' in pending)) return;
      if (!pending.canceled && pending.assets) {
        await processAssets(pending.assets.slice(0, MAX_PHOTOS));
      }
    })().catch((e) => console.error('Falha ao recuperar foto pendente', e));
    return () => {
      active = false;
    };
  }, [processAssets]);

  function handleCameraCapture(uri: string) {
    if (remaining <= 0) return;
    addPhotos([
      {
        id: `${Date.now()}-camera-${Math.random().toString(36).slice(2, 6)}`,
        uri,
      },
    ]);
  }

  async function pickPhotosFromLibrary() {
    if (remaining <= 0) return;
    setServerError(null);

    if (!(await ensurePermission('library'))) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      orderedSelection: true,
      quality: 1,
    });

    if (result.canceled) return;
    await processAssets(result.assets.slice(0, remaining));
  }

  function resetForm() {
    clearDraft();
    setSubmitted(false);
    setServerError(null);
    clearError();
  }

  async function onSubmit() {
    Keyboard.dismiss();
    setSubmitted(true);
    setServerError(null);

    const trimmedName = nome.trim();
    const isValid = trimmedName.length >= MIN_NAME_LENGTH && priceValue > 0 && photos.length > 0;

    if (!isValid) {
      haptic.error();
      return;
    }

    try {
      haptic.light();
      await cadastrarProduto({
        nome: trimmedName,
        condicao,
        categoria,
        preco_usuario: priceValue,
        observacoes_usuario: notes.trim(),
        fotos: photos.map((p) => p.uri),
      });

      haptic.success();
      Alert.alert('Sucesso!', 'Produto cadastrado com sucesso no catálogo.', [
        { text: 'OK', onPress: resetForm },
      ]);
    } catch (e: any) {
      haptic.error();
      let message = e?.detail || e?.message;
      if (!message || message === 'Network request failed') {
        message = 'Não foi possível conectar ao servidor. Verifique a URL em Configurações e sua conexão de rede.';
      }
      setServerError(message);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: palette.background }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.three,
          paddingBottom: insets.bottom + Spacing.five,
          paddingHorizontal: Spacing.four,
          maxWidth: MaxContentWidth,
          width: '100%',
          alignSelf: 'center',
        }}
        showsVerticalScrollIndicator={false}>
        <AppHeader subtitle="Cadastre um novo item com fotos de alta qualidade" />
        <View style={{ height: Spacing.three }} />

        <VStack className="gap-5">
          {/* Seletor de Fotos com Foto de Capa */}
          <VStack className="gap-1.5">
            <PhotoGrid
              photos={photos}
              maxPhotos={MAX_PHOTOS}
              isProcessing={isProcessing}
              onAddFromCamera={() => {
                if (remaining > 0) setIsCameraOpen(true);
              }}
              onAddFromLibrary={pickPhotosFromLibrary}
              onRemove={removePhoto}
            />
            {isPhotosInvalid && (
              <Text style={{ color: palette.danger }} className="text-xs font-semibold px-0.5">
                É obrigatório adicionar pelo menos 1 foto do produto.
              </Text>
            )}
          </VStack>

          {/* Nome do Produto */}
          <FormControl isInvalid={isNomeInvalid}>
            <FormControlLabel>
              <FormControlLabelText style={{ color: palette.paragraph }} className="text-[14px] font-semibold">
                Título do Item <Text style={{ color: palette.highlight }}>*</Text>
              </FormControlLabelText>
            </FormControlLabel>
            <Input
              style={{
                backgroundColor: palette.surface,
                borderColor: isNomeInvalid ? palette.danger : palette.border,
              }}
              className="rounded-2xl border h-13 px-3.5">
              <InputField
                style={{ color: palette.headline }}
                placeholder="Ex.: Jaqueta Jeans Vintage Levi's Original"
                placeholderTextColor={palette.paragraphMuted}
                value={nome}
                onChangeText={setNome}
                returnKeyType="next"
              />
            </Input>
            <FormControlError>
              <FormControlErrorText style={{ color: palette.danger }} className="text-xs font-medium">
                O título precisa ter pelo menos 3 caracteres.
              </FormControlErrorText>
            </FormControlError>
          </FormControl>

          {/* Condição do Item */}
          <VStack className="gap-2">
            <Text style={{ color: palette.paragraph }} className="text-[14px] font-semibold">
              Condição <Text style={{ color: palette.highlight }}>*</Text>
            </Text>
            <ChipSelector options={CONDITION_LABELS} value={condicao} onChange={setCondicao} />
          </VStack>

          {/* Categoria / Nicho */}
          <VStack className="gap-2">
            <Text style={{ color: palette.paragraph }} className="text-[14px] font-semibold">
              Categoria Principal <Text style={{ color: palette.highlight }}>*</Text>
            </Text>
            <ChipSelector options={CATEGORY_LABELS} value={categoria} onChange={setCategoria} />
          </VStack>

          {/* Preço de Venda */}
          <FormControl isInvalid={isPriceInvalid}>
            <FormControlLabel>
              <FormControlLabelText style={{ color: palette.paragraph }} className="text-[14px] font-semibold">
                Preço Desejado (R$) <Text style={{ color: palette.highlight }}>*</Text>
              </FormControlLabelText>
            </FormControlLabel>
            <Input
              style={{
                backgroundColor: palette.surface,
                borderColor: isPriceInvalid ? palette.danger : palette.border,
              }}
              className="rounded-2xl border h-13 px-3.5">
              <InputField
                style={{ color: palette.headline }}
                placeholder="0,00"
                placeholderTextColor={palette.paragraphMuted}
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
                returnKeyType="done"
              />
            </Input>
            <FormControlError>
              <FormControlErrorText style={{ color: palette.danger }} className="text-xs font-medium">
                Informe um valor numérico válido maior que zero.
              </FormControlErrorText>
            </FormControlError>
          </FormControl>

          {/* Observações Livres */}
          <FormControl>
            <FormControlLabel>
              <FormControlLabelText style={{ color: palette.paragraph }} className="text-[14px] font-semibold">
                Detalhes e Observações para a IA
              </FormControlLabelText>
            </FormControlLabel>
            <Textarea
              style={{ backgroundColor: palette.surface, borderColor: palette.border }}
              className="rounded-2xl border p-3.5 h-28">
              <TextareaInput
                style={{ color: palette.headline }}
                placeholder="Ex.: Tamanho G, pequeno desgaste no bolso esquerdo, botões originais..."
                placeholderTextColor={palette.paragraphMuted}
                value={notes}
                onChangeText={setNotes}
                textAlignVertical="top"
              />
            </Textarea>
          </FormControl>

          {/* Mensagem de Erro do Servidor */}
          {serverError && (
            <View
              style={{
                backgroundColor: `${palette.danger}15`,
                borderColor: palette.danger,
                borderWidth: 1,
                borderRadius: 16,
                padding: 14,
                marginVertical: 4,
              }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <HugeiconsIcon icon={Alert02Icon} size={18} color={palette.danger} strokeWidth={2.2} />
                <RNText
                  style={{
                    color: palette.danger,
                    fontSize: 14,
                    fontWeight: '700',
                    lineHeight: 18,
                    includeFontPadding: false,
                  }}>
                  Falha ao cadastrar
                </RNText>
              </View>
              <RNText
                style={{
                  color: palette.headline,
                  fontSize: 12,
                  lineHeight: 18,
                  includeFontPadding: false,
                  paddingLeft: 26,
                }}>
                {serverError}
              </RNText>
            </View>
          )}

          {/* Botão de Envio */}
          <Button
            onPress={onSubmit}
            disabled={isLoading || isProcessing}
            style={{ backgroundColor: palette.highlight }}
            className="rounded-2xl h-14 items-center justify-center mt-1 active:opacity-85">
            <ButtonText style={{ color: palette.onHighlight }} className="text-base font-bold">
              {isLoading ? 'Salvando produto e fotos…' : 'Salvar no Catálogo'}
            </ButtonText>
          </Button>
        </VStack>
      </ScrollView>

      <CameraModal
        visible={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </KeyboardAvoidingView>
  );
}
