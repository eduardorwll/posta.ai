import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
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
import { MaxContentWidth, Palette, Spacing } from '@/constants/theme';
import { useProductStore } from '@/store/useProductStore';
import {
  CATEGORY_LABELS,
  CONDITION_LABELS,
  type ProductCategory,
  type ProductCondition,
} from '@/types/product';

const MAX_PHOTOS = 5;

type PhotoSource = 'camera' | 'library';

/** Converte "1.234,56" / "12,5" / "12.5" em número. Retorna NaN se inválido. */
const MIN_NAME_LENGTH = 3;

function parsePrice(raw: string) {
  const text = raw.trim();
  if (!text) return NaN;
  const normalized = text.includes(',') ? text.replace(/\./g, '').replace(',', '.') : text;
  return Number(normalized);
}

export default function CapturaScreen() {
  const insets = useSafeAreaInsets();
  const addProduto = useProductStore((state) => state.addProduto);

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

  // Android pode matar a MainActivity enquanto câmera/galeria estão abertas;
  // ao reiniciar, recupera o resultado perdido.
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

    // quality: 1 preserva a qualidade máxima original sem compressão no picker.
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

    // Garante o limite mesmo em aparelhos que ignoram selectionLimit.
    await processAssets(result.assets.slice(0, remaining));
  }

  function removePhoto(id: string) {
    setPhotos((current) => current.filter((photo) => photo.id !== id));
  }

  function handleSave() {
    setSubmitted(true);
    if (photos.length === 0 || nome.trim().length < MIN_NAME_LENGTH || !(priceValue > 0)) return;

    addProduto({
      nome: nome.trim(),
      condicao,
      categoria,
      fotos: photos.map((photo) => photo.uri),
      observacoes_usuario: notes.trim(),
      preco_usuario: priceValue,
    });

    // No react-native-web o Alert.alert não exibe nada; usa o alert do navegador.
    if (process.env.EXPO_OS === 'web') {
      window.alert('Sucesso\n\nProduto pronto para processamento!');
    } else {
      Alert.alert('Sucesso', 'Produto pronto para processamento!');
    }

    Keyboard.dismiss();
    setPhotos([]);
    setNome('');
    setCondicao('usado');
    setCategoria('diversos');
    setPrice('');
    setNotes('');
    setError(null);
    setSubmitted(false);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Palette.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={{
          flexGrow: 1,
          width: '100%',
          maxWidth: MaxContentWidth,
          alignSelf: 'center',
          paddingTop: insets.top + Spacing.three,
          paddingBottom: Spacing.five,
          paddingHorizontal: Spacing.four,
          gap: Spacing.four,
        }}>
        <AppHeader subtitle="Fotografe, descreva e publique seus produtos." />

        <VStack className="gap-2">
          <PhotoGrid
            photos={photos}
            maxPhotos={MAX_PHOTOS}
            isProcessing={isProcessing}
            onAddFromCamera={() => pickPhotos('camera')}
            onAddFromLibrary={() => pickPhotos('library')}
            onRemove={removePhoto}
          />
          {photosInvalid && (
            <Text className="text-sm text-[#e16162]">Adicione ao menos 1 foto.</Text>
          )}
        </VStack>

        <FormControl isInvalid={nomeInvalid}>
          <FormControlLabel>
            <FormControlLabelText className="text-[#abd1c6]">Nome do Produto</FormControlLabelText>
          </FormControlLabel>
          <Input className="h-12 rounded-xl border-[#001e1d] bg-[#001e1d] data-[focus=true]:border-[#f9bc60] data-[invalid=true]:border-[#e16162]">
            <InputField
              value={nome}
              onChangeText={setNome}
              maxLength={80}
              autoCapitalize="sentences"
              placeholder="Ex: Jaqueta jeans Zara"
              placeholderTextColor={Palette.paragraph}
              className="text-[#fffffe]"
            />
          </Input>
          <FormControlError>
            <FormControlErrorText className="text-[#e16162]">
              Informe o nome do produto (mín. {MIN_NAME_LENGTH} caracteres).
            </FormControlErrorText>
          </FormControlError>
        </FormControl>

        <FormControl>
          <FormControlLabel>
            <FormControlLabelText className="text-[#abd1c6]">Condição</FormControlLabelText>
          </FormControlLabel>
          <ChipSelector options={CONDITION_LABELS} value={condicao} onChange={setCondicao} />
        </FormControl>

        <FormControl>
          <FormControlLabel>
            <FormControlLabelText className="text-[#abd1c6]">Categoria</FormControlLabelText>
          </FormControlLabel>
          <ChipSelector options={CATEGORY_LABELS} value={categoria} onChange={setCategoria} />
        </FormControl>

        <FormControl isInvalid={priceInvalid}>
          <FormControlLabel>
            <FormControlLabelText className="text-[#abd1c6]">Valor Desejado (R$)</FormControlLabelText>
          </FormControlLabel>
          <Input className="h-12 rounded-xl border-[#001e1d] bg-[#001e1d] data-[focus=true]:border-[#f9bc60] data-[invalid=true]:border-[#e16162]">
            <InputField
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              placeholder="0,00"
              placeholderTextColor={Palette.paragraph}
              className="text-[#fffffe]"
            />
          </Input>
          <FormControlError>
            <FormControlErrorText className="text-[#e16162]">
              Informe um valor maior que zero.
            </FormControlErrorText>
          </FormControlError>
        </FormControl>

        <FormControl>
          <FormControlLabel>
            <FormControlLabelText className="text-[#abd1c6]">Observações do Usuário</FormControlLabelText>
          </FormControlLabel>
          <Textarea className="min-h-32 rounded-xl border-[#001e1d] bg-[#001e1d] data-[focus=true]:border-[#f9bc60]">
            <TextareaInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Ex: usado 2x, marca Zara"
              placeholderTextColor={Palette.paragraph}
              className="text-[#fffffe]"
            />
          </Textarea>
        </FormControl>

        {error && (
          <Text selectable className="text-center text-sm text-[#e16162]">
            {error}
          </Text>
        )}

        <Button
          onPress={handleSave}
          isDisabled={isProcessing}
          className="h-14 rounded-xl bg-[#f9bc60] data-[active=true]:bg-[#f9bc60]/90">
          <ButtonText className="text-base font-bold text-[#001e1d]">Salvar</ButtonText>
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
