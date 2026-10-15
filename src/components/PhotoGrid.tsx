import { Camera01Icon, Delete02Icon, Image01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAppTheme } from '@/constants/theme';
import { haptic } from '@/lib/haptics';

export type GridPhoto = { id: string; uri: string };

type PhotoGridProps = {
  photos: GridPhoto[];
  maxPhotos: number;
  isProcessing?: boolean;
  onAddFromCamera: () => void;
  onAddFromLibrary: () => void;
  onRemove: (id: string) => void;
};

const TILE = 100;

/**
 * Grid de 1 a `maxPhotos` fotos com:
 * - Destaque visual explícito da foto de capa (índice 0)
 * - Microinterações com feedback háptico (expo-haptics)
 * - Exclusão individual com área de toque acessível
 */
export function PhotoGrid({
  photos,
  maxPhotos,
  isProcessing = false,
  onAddFromCamera,
  onAddFromLibrary,
  onRemove,
}: PhotoGridProps) {
  const { palette } = useAppTheme();
  const canAdd = photos.length < maxPhotos;

  const handleRemove = (id: string) => {
    haptic.warning();
    onRemove(id);
  };

  const handleCamera = () => {
    haptic.light();
    onAddFromCamera();
  };

  const handleLibrary = () => {
    haptic.light();
    onAddFromLibrary();
  };

  return (
    <VStack className="gap-2">
      <HStack className="items-center justify-between">
        <Text style={{ color: palette.headline }} className="text-[15px] font-semibold">
          Fotos do Produto
        </Text>
        <Text
          style={[{ color: palette.paragraph }, { fontVariant: ['tabular-nums'] }]}
          className="text-xs font-medium">
          {photos.length} de {maxPhotos} adicionadas
        </Text>
      </HStack>

      <HStack className="flex-wrap gap-2">
        {photos.map((photo, index) => {
          const isCover = index === 0;

          return (
            <View
              key={photo.id}
              style={{
                width: TILE,
                height: TILE,
                borderRadius: 14,
                borderWidth: isCover ? 2 : 1,
                borderColor: isCover ? palette.highlight : palette.border,
                overflow: 'hidden',
              }}>
              <Image
                source={{ uri: photo.uri }}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
                accessibilityLabel={`Foto ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: palette.surface,
                }}
              />

              {/* Badge indicativo de Foto de Capa */}
              {isCover && (
                <View
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    left: 4,
                    backgroundColor: palette.badgeCover,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 6,
                  }}>
                  <Text
                    style={{ color: palette.onBadgeCover }}
                    className="text-[10px] font-black uppercase tracking-wider">
                    Capa
                  </Text>
                </View>
              )}

              {/* Botão de Exclusão Individual */}
              <Pressable
                onPress={() => handleRemove(photo.id)}
                accessibilityRole="button"
                accessibilityLabel={`Remover foto ${index + 1}`}
                hitSlop={10}
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: palette.danger,
                }}>
                <HugeiconsIcon icon={Delete02Icon} size={15} color="#ffffff" strokeWidth={2} />
              </Pressable>
            </View>
          );
        })}

        {canAdd && (
          <>
            <AddTile
              label="Câmera"
              icon={Camera01Icon}
              onPress={handleCamera}
              disabled={isProcessing}
            />
            <AddTile
              label="Galeria"
              icon={Image01Icon}
              onPress={handleLibrary}
              disabled={isProcessing}
            />
          </>
        )}
      </HStack>

      {isProcessing && (
        <HStack className="items-center gap-2 py-1">
          <ActivityIndicator color={palette.highlight} size="small" />
          <Text style={{ color: palette.paragraph }} className="text-xs">Processando foto original…</Text>
        </HStack>
      )}
    </VStack>
  );
}

function AddTile({
  label,
  icon,
  onPress,
  disabled,
}: {
  label: string;
  icon: typeof Camera01Icon;
  onPress: () => void;
  disabled: boolean;
}) {
  const { palette } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`Adicionar foto por ${label}`}
      style={{
        width: TILE,
        height: TILE,
        backgroundColor: palette.surface,
        borderColor: palette.border,
      }}
      className="rounded-2xl border-2 border-dashed items-center justify-center gap-1 active:opacity-60">
      <HugeiconsIcon icon={icon} size={22} color={palette.paragraph} strokeWidth={1.8} />
      <Text style={{ color: palette.paragraph }} className="text-xs font-medium">{label}</Text>
    </Pressable>
  );
}
