import { Camera01Icon, Delete02Icon, Image01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Palette } from '@/constants/theme';

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
  const canAdd = photos.length < maxPhotos;

  return (
    <VStack className="gap-2">
      <Text className="text-[15px] font-semibold text-[#fffffe]">
        Fotos{' '}
        <Text className="text-[#abd1c6]" style={{ fontVariant: ['tabular-nums'] }}>
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
                backgroundColor: Palette.surface,
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
                backgroundColor: Palette.tertiary,
              }}>
              <HugeiconsIcon icon={Delete02Icon} size={16} color={Palette.headline} strokeWidth={1.8} />
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
          <ActivityIndicator color={Palette.highlight} />
          <Text className="text-sm text-[#abd1c6]">Comprimindo fotos…</Text>
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
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`Adicionar foto pela ${label.toLowerCase()}`}
      style={({ pressed }) => ({
        width: TILE,
        height: TILE,
        borderRadius: 12,
        borderCurve: 'continuous',
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: Palette.paragraph,
        backgroundColor: Palette.surface,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
      })}>
      <HugeiconsIcon icon={icon} size={28} color={Palette.paragraph} strokeWidth={1.8} />
      <Text className="text-xs text-[#abd1c6]">{label}</Text>
    </Pressable>
  );
}
