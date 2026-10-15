import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/AppHeader';
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
import { MaxContentWidth, useAppTheme, Spacing } from '@/constants/theme';
import { useProductStore } from '@/store/useProductStore';
import { ApiException } from '@/lib/api';
import {
  CATEGORY_LABELS,
  CONDITION_LABELS,
  type ProductCategory,
  type ProductCondition,
} from '@/types/product';

const MAX_PHOTOS = 5;

type PhotoSource = 'camera' | 'library';

const MIN_NAME_LENGTH = 3;

function parsePrice(raw: string) {
  const text = raw.trim();
  if (!text) return NaN;
  const normalized = text.includes(',') ? text.replace(/\./g, '').replace(',', '.') : text;
  return Number(normalized);
}

export default function CapturaScreen() {
  const insets = useSafeAreaInsets();
  const { cadastrarProduto, isLoading, clearError } = useProductStore();
  const { palette } = useAppTheme();

  const [photos, setPhotos] = useState<GridPhoto[]>([]);
  const [nome, setNome] = useState('');
  const [condicao, setCondicao] = useState<ProductCondition>('usado');
  const [categoria, setCategoria] = useState<ProductCategory>('diversos');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const remaining = MAX_PHOTOS - photos.length;
  const nomeInvalid = submitted && nome.trim().length < MIN_NAME_LENGTH;
  const priceValue = parsePrice(price);
  const priceInvalid = submitted && !(priceValue > 0);
  const photosInvalid = submitted && photos.length === 0;

  async function ensurePermission(source: PhotoSource) {
    const response =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (response.granted) return true;

    const target = source === 'camera' ? 'à câmera' : 'às fotos';
    Alert.alert(
      'Permissão necessária',
      `Para cadastrar produtos, permita o acesso ${target} nas configurações do aparelho.`,
      response.canAskAgain
        ? [{ text: 'OK' }]
        : [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Abrir configurações', onPress: () => Linking.openSettings() },
          ]
    );
    return false;
  }

  async function processAssets(assets: ImagePicker.ImagePickerAsset[]) {
    setIsProcessing(true);
    try {
      const newPhotos: GridPhoto[] = [];
      for (const asset of assets) {
        newPhotos.push({ uri: asset.uri, id: `${Date.now()}-${newPhotos.length}` });
      }
      setPhotos((current) => [...current, ...newPhotos].slice(0, MAX_PHOTOS));
    } catch (e) {
      console.error('Falha ao processar fotos', e);
      setError('Não foi possível processar as fotos. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  }

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
  }, []);

  async function pickPhotos(source: PhotoSource) {
    if (remaining <= 0) return;
    setError(null);

    if (!(await ensurePermission(source))) return;

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            selectionLimit: remaining,
            orderedSelection: true,
            quality: 1,
          });

    if (result.canceled) return;

    await processAssets(result.assets.slice(0, remaining));
  }

  function removePhoto(id: string) {
    setPhotos((current) => current.filter((p) => p.id !== id));
  }

  function resetForm() {
    setPhotos([]);
    setNome('');
    setCondicao('usado');
    setCategoria('diversos');
    setPrice('');
    setNotes('');
    setSubmitted(false);
    setError(null);
    clearError();
  }

  async function onSubmit() {
    Keyboard.dismiss();
    setSubmitted(true);
    setError(null);

    const trimmedName = nome.trim();
    if (trimmedName.length < MIN_NAME_LENGTH || !(priceValue > 0) || photos.length === 0) {
      return;
    }

    try {
      const trimmedNotes = notes.trim();
      await cadastrarProduto({
        nome: trimmedName,
        condicao,
        categoria,
        preco_usuario: priceValue,
        observacoes_usuario: trimmedNotes,
        fotos: photos.map((p) => p.uri),
      });

      Alert.alert('Sucesso', 'Produto cadastrado com sucesso!', [
        { text: 'OK', onPress: resetForm },
      ]);
    } catch (e) {
      const message =
        e instanceof ApiException ? e.message : 'Não foi possível cadastrar o produto. Tente novamente.';
      setError(message);
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
          paddingBottom: insets.bottom + Spacing.four,
          paddingHorizontal: Spacing.four,
          maxWidth: MaxContentWidth,
          width: '100%',
          alignSelf: 'center',
        }}
        showsVerticalScrollIndicator={false}>
        <AppHeader subtitle="Cadastre um novo item para venda" />
        <View style={{ height: Spacing.three }} />

        <VStack className="gap-4">
          <PhotoGrid
            photos={photos}
            maxPhotos={MAX_PHOTOS}
            isProcessing={isProcessing}
            onAddFromCamera={() => pickPhotos('camera')}
            onAddFromLibrary={() => pickPhotos('library')}
            onRemove={removePhoto}
          />
          {photosInvalid && (
            <Text style={{ color: palette.tertiary }} className="text-xs font-medium">
              Adicione pelo menos 1 foto do produto.
            </Text>
          )}

          <FormControl isInvalid={nomeInvalid}>
            <FormControlLabel>
              <FormControlLabelText style={{ color: palette.paragraph }} className="text-[15px] font-semibold">
                Nome do Produto <Text style={{ color: palette.highlight }}>*</Text>
              </FormControlLabelText>
            </FormControlLabel>
            <Input
              style={{ backgroundColor: palette.surface, borderColor: nomeInvalid ? palette.tertiary : palette.border }}
              className="rounded-xl border h-12 px-3">
              <InputField
                style={{ color: palette.headline }}
                placeholder="Ex.: Jaqueta Jeans Vintage Levi's"
                placeholderTextColor={palette.paragraph}
                value={nome}
                onChangeText={setNome}
                returnKeyType="next"
              />
            </Input>
            <FormControlError>
              <FormControlErrorText style={{ color: palette.tertiary }} className="text-xs">
                Informe o nome do produto (mínimo de 3 caracteres).
              </FormControlErrorText>
            </FormControlError>
          </FormControl>

          <VStack className="gap-2">
            <Text style={{ color: palette.paragraph }} className="text-[15px] font-semibold">
              Condição <Text style={{ color: palette.highlight }}>*</Text>
            </Text>
            <ChipSelector options={CONDITION_LABELS} value={condicao} onChange={setCondicao} />
          </VStack>

          <VStack className="gap-2">
            <Text style={{ color: palette.paragraph }} className="text-[15px] font-semibold">
              Categoria / Nicho <Text style={{ color: palette.highlight }}>*</Text>
            </Text>
            <ChipSelector options={CATEGORY_LABELS} value={categoria} onChange={setCategoria} />
          </VStack>

          <FormControl isInvalid={priceInvalid}>
            <FormControlLabel>
              <FormControlLabelText style={{ color: palette.paragraph }} className="text-[15px] font-semibold">
                Valor Desejado (R$) <Text style={{ color: palette.highlight }}>*</Text>
              </FormControlLabelText>
            </FormControlLabel>
            <Input
              style={{ backgroundColor: palette.surface, borderColor: priceInvalid ? palette.tertiary : palette.border }}
              className="rounded-xl border h-12 px-3">
              <InputField
                style={{ color: palette.headline }}
                placeholder="0,00"
                placeholderTextColor={palette.paragraph}
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
                returnKeyType="done"
              />
            </Input>
            <FormControlError>
              <FormControlErrorText style={{ color: palette.tertiary }} className="text-xs">
                Informe um valor válido maior que zero.
              </FormControlErrorText>
            </FormControlError>
          </FormControl>

          <FormControl>
            <FormControlLabel>
              <FormControlLabelText style={{ color: palette.paragraph }} className="text-[15px] font-semibold">
                Observações do Usuário
              </FormControlLabelText>
            </FormControlLabel>
            <Textarea
              style={{ backgroundColor: palette.surface, borderColor: palette.border }}
              className="rounded-xl border p-3 h-28">
              <TextareaInput
                style={{ color: palette.headline }}
                placeholder="Detalhes, defeitos, medidas ou observações sobre o item..."
                placeholderTextColor={palette.paragraph}
                value={notes}
                onChangeText={setNotes}
                textAlignVertical="top"
              />
            </Textarea>
          </FormControl>

          {error && (
            <Text style={{ color: palette.tertiary }} className="text-sm font-medium text-center">
              {error}
            </Text>
          )}

          <Button
            onPress={onSubmit}
            disabled={isLoading || isProcessing}
            style={{ backgroundColor: palette.highlight }}
            className="rounded-xl h-14 items-center justify-center mt-2">
            <ButtonText style={{ color: palette.onHighlight }} className="text-base font-bold">
              {isLoading ? 'Cadastrando produto...' : 'Cadastrar Anúncio'}
            </ButtonText>
          </Button>
        </VStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
