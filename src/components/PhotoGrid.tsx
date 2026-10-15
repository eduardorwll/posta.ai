import { Camera01Icon, Delete02Icon, Image01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAppTheme } from '@/constants/theme';

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

/** Grid de 1 a `maxPhotos` fotos com preview, exclusão individual e botões de adicionar. */
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

  return (
    <VStack className="gap-2">
      <Text style={{ color: palette.headline }} className="text-[15px] font-semibold">
        Fotos{' '}
        <Text style={[{ color: palette.paragraph }, { fontVariant: ['tabular-nums'] }]}>
          ({photos.length}/{maxPhotos})
        </Text>
      </Text>

      <HStack className="flex-wrap gap-2">
        {photos.map((photo, index) => (
          <View key={photo.id} style={{ width: TILE, height: TILE }}>
            <Image
              source={{ uri: photo.uri }}
              contentFit="cover"
              accessibilityLabel={`Foto ${index + 1}`}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 12,
                backgroundColor: palette.surface,
              }}
            />
            <Pressable
              onPress={() => onRemove(photo.id)}
              accessibilityRole="button"
              accessibilityLabel={`Remover foto ${index + 1}`}
              hitSlop={8}
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 28,
                height: 28,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: palette.tertiary,
              }}>
              <HugeiconsIcon icon={Delete02Icon} size={16} color={palette.onHighlight} strokeWidth={1.8} />
            </Pressable>
          </View>
        ))}

        {canAdd && (
          <>
            <AddTile
              label="Câmera"
              icon={Camera01Icon}
              onPress={onAddFromCamera}
              disabled={isProcessing}
            />
            <AddTile
              label="Galeria"
              icon={Image01Icon}
              onPress={onAddFromLibrary}
              disabled={isProcessing}
            />
          </>
        )}
      </HStack>

      {isProcessing && (
        <HStack className="items-center gap-2">
          <ActivityIndicator color={palette.highlight} />
          <Text style={{ color: palette.paragraph }} className="text-sm">Processando fotos…</Text>
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
      className="rounded-2xl border-2 border-dashed items-center justify-center gap-1 active:opacity-70">
      <HugeiconsIcon icon={icon} size={24} color={palette.paragraph} strokeWidth={1.8} />
      <Text style={{ color: palette.paragraph }} className="text-xs font-medium">{label}</Text>
    </Pressable>
  );
}
