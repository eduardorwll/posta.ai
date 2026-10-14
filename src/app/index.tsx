import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Keyboard,
  Linking,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { compressImage, type CompressedImage } from '@/lib/compress-image';

const MAX_PHOTOS = 5;

/** Paleta clara fixa da tela (requisito: fundo claro). */
const palette = {
  background: '#F7F7F8',
  surface: '#FFFFFF',
  border: '#E3E3E8',
  text: '#111114',
  textSecondary: '#6B6B76',
  primary: '#208AEF',
  primaryPressed: '#1A72C7',
  onPrimary: '#FFFFFF',
  danger: '#D93025',
  disabled: '#C7C7CC',
};

type Photo = CompressedImage & { id: string };
type PhotoSource = 'camera' | 'library';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = MAX_PHOTOS - photos.length;
  const hasPhotos = photos.length > 0;

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

  async function pickPhotos(source: PhotoSource) {
    if (remaining <= 0) return;
    setError(null);

    if (!(await ensurePermission(source))) return;

    // quality: 1 evita compressão dupla — a compressão é feita pelo ImageManipulator.
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
    const assets = result.assets.slice(0, remaining);

    setIsProcessing(true);
    try {
      const compressed = await Promise.all(
        assets.map((asset) => compressImage(asset.uri, asset.width, asset.height))
      );
      setPhotos((current) =>
        [
          ...current,
          ...compressed.map((image, index) => ({
            ...image,
            id: `${Date.now()}-${index}`,
          })),
        ].slice(0, MAX_PHOTOS)
      );
    } catch (e) {
      console.error('Falha ao comprimir imagens', e);
      setError('Não foi possível processar as fotos. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  }

  function chooseSource() {
    // Na web não há câmera nativa via picker: abre direto a seleção de arquivos.
    if (process.env.EXPO_OS === 'web') {
      pickPhotos('library');
      return;
    }

    const title = `Adicionar fotos (${photos.length}/${MAX_PHOTOS})`;

    if (process.env.EXPO_OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title,
          options: ['Tirar foto', 'Escolher da galeria', 'Cancelar'],
          cancelButtonIndex: 2,
        },
        (index) => {
          if (index === 0) pickPhotos('camera');
          if (index === 1) pickPhotos('library');
        }
      );
      return;
    }

    Alert.alert(title, undefined, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Galeria', onPress: () => pickPhotos('library') },
      { text: 'Câmera', onPress: () => pickPhotos('camera') },
    ]);
  }

  function removePhoto(id: string) {
    setPhotos((current) => current.filter((photo) => photo.id !== id));
  }

  function handleSave() {
    const payload = {
      imagens: photos.map((photo) => photo.uri),
      observacoes: notes.trim(),
    };
    console.log(JSON.stringify(payload, null, 2));

    // No react-native-web o Alert.alert não exibe nada; usa o alert do navegador.
    if (process.env.EXPO_OS === 'web') {
      window.alert('Sucesso\n\nProduto pronto para processamento!');
    } else {
      Alert.alert('Sucesso', 'Produto pronto para processamento!');
    }

    // Volta ao estado inicial, pronto para o próximo produto.
    Keyboard.dismiss();
    setPhotos([]);
    setNotes('');
    setError(null);
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.background }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      automaticallyAdjustKeyboardInsets
      contentContainerStyle={{
        flexGrow: 1,
        width: '100%',
        maxWidth: MaxContentWidth,
        alignSelf: 'center',
        paddingTop: insets.top + Spacing.four,
        paddingBottom: insets.bottom + BottomTabInset + Spacing.four,
        paddingHorizontal: Spacing.four,
        gap: Spacing.four,
      }}>
      <View style={{ gap: Spacing.one }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: palette.text }}>posta.ai</Text>
        <Text style={{ fontSize: 15, color: palette.textSecondary }}>
          Fotografe, descreva e publique seus produtos.
        </Text>
      </View>

      {!hasPhotos ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.three }}>
          {isProcessing ? (
            <ProcessingIndicator />
          ) : (
            <>
              <PrimaryButton label="Cadastrar Novo Produto" onPress={chooseSource} large />
              <Text style={{ fontSize: 13, color: palette.textSecondary, textAlign: 'center' }}>
                Adicione de 1 a {MAX_PHOTOS} fotos pela câmera ou galeria.
              </Text>
            </>
          )}
        </View>
      ) : (
        <>
          <View style={{ gap: Spacing.two }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: palette.text }}>
              Fotos{' '}
              <Text style={{ color: palette.textSecondary, fontVariant: ['tabular-nums'] }}>
                ({photos.length}/{MAX_PHOTOS})
              </Text>
            </Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two }}>
              {photos.map((photo, index) => (
                <View key={photo.id} style={{ width: 100, height: 100 }}>
                  <Image
                    source={{ uri: photo.uri }}
                    contentFit="cover"
                    accessibilityLabel={`Foto ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: 12,
                      backgroundColor: palette.border,
                    }}
                  />
                  <Pressable
                    onPress={() => removePhoto(photo.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Remover foto ${index + 1}`}
                    hitSlop={8}
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>✕</Text>
                  </Pressable>
                </View>
              ))}

              {remaining > 0 && (
                <Pressable
                  onPress={chooseSource}
                  disabled={isProcessing}
                  accessibilityRole="button"
                  accessibilityLabel="Adicionar mais fotos"
                  style={({ pressed }) => ({
                    width: 100,
                    height: 100,
                    borderRadius: 12,
                    borderCurve: 'continuous',
                    borderWidth: 1.5,
                    borderStyle: 'dashed',
                    borderColor: palette.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: pressed ? '#EAF3FD' : palette.surface,
                  })}>
                  {isProcessing ? (
                    <ActivityIndicator color={palette.primary} />
                  ) : (
                    <Text style={{ color: palette.primary, fontSize: 28, fontWeight: '300' }}>+</Text>
                  )}
                </Pressable>
              )}
            </View>
          </View>

          <View style={{ gap: Spacing.two }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: palette.text }}>
              Observações do Usuário
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Ex: usado 2x, marca Zara"
              placeholderTextColor={palette.textSecondary}
              multiline
              textAlignVertical="top"
              accessibilityLabel="Observações do Usuário"
              style={{
                minHeight: 120,
                padding: Spacing.three,
                fontSize: 16,
                color: palette.text,
                backgroundColor: palette.surface,
                borderWidth: 1,
                borderColor: palette.border,
                borderRadius: 12,
                borderCurve: 'continuous',
              }}
            />
          </View>

          <PrimaryButton
            label="Salvar"
            onPress={handleSave}
            disabled={isProcessing || photos.length === 0}
          />
        </>
      )}

      {error && (
        <Text selectable style={{ color: palette.danger, fontSize: 14, textAlign: 'center' }}>
          {error}
        </Text>
      )}
    </ScrollView>
  );
}

function PrimaryButton({
  label,
  onPress,
  disabled = false,
  large = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  large?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => ({
        alignSelf: large ? 'center' : 'stretch',
        alignItems: 'center',
        paddingVertical: large ? 18 : 16,
        paddingHorizontal: large ? Spacing.five : Spacing.four,
        borderRadius: 14,
        borderCurve: 'continuous',
        backgroundColor: disabled
          ? palette.disabled
          : pressed
            ? palette.primaryPressed
            : palette.primary,
        boxShadow: disabled ? undefined : '0 4px 12px rgba(32, 138, 239, 0.25)',
      })}>
      <Text style={{ color: palette.onPrimary, fontSize: large ? 18 : 17, fontWeight: '600' }}>
        {label}
      </Text>
    </Pressable>
  );
}

function ProcessingIndicator() {
  return (
    <View style={{ alignItems: 'center', gap: Spacing.two }}>
      <ActivityIndicator size="large" color={palette.primary} />
      <Text style={{ color: palette.textSecondary, fontSize: 14 }}>Comprimindo fotos…</Text>
    </View>
  );
}
