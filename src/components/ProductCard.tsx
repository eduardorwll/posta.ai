import {
  AlarmClockIcon,
  Alert02Icon,
  CheckmarkCircle02Icon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';

import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAppTheme } from '@/constants/theme';
import { haptic } from '@/lib/haptics';
import { CATEGORY_LABELS, CONDITION_LABELS, type Produto } from '@/types/product';

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatBRL(value: number) {
  return currency.format(value);
}

type StatusMetadata = {
  label: string;
  icon: typeof AlarmClockIcon;
  bgColor: string;
  textColor: string;
};

function resolveStatusMetadata(status: string, palette: ReturnType<typeof useAppTheme>['palette']): StatusMetadata {
  const normalized = status === 'processando_ia' ? 'em_processamento' : status;

  switch (normalized) {
    case 'pendente':
      return {
        label: 'Pendente',
        icon: AlarmClockIcon,
        bgColor: palette.warning,
        textColor: palette.onHighlight,
      };
    case 'em_processamento':
      return {
        label: 'Processando IA',
        icon: Loading03Icon,
        bgColor: '#0284c7',
        textColor: '#ffffff',
      };
    case 'pronto':
      return {
        label: 'Anúncio Pronto',
        icon: CheckmarkCircle02Icon,
        bgColor: palette.success,
        textColor: '#ffffff',
      };
    default:
      return {
        label: status.replace(/_/g, ' '),
        icon: Alert02Icon,
        bgColor: palette.surfaceSubtle,
        textColor: palette.paragraph,
      };
  }
}

export function ProductCard({
  produto,
  onPress,
}: {
  produto: Produto;
  onPress?: () => void;
}) {
  const { palette } = useAppTheme();
  const statusMeta = resolveStatusMetadata(produto.status, palette);
  const nome = produto.nome?.trim() || 'Produto sem título';

  const handlePress = () => {
    haptic.light();
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`Produto: ${nome}, preço ${formatBRL(produto.preco_usuario)}`}
      style={{
        backgroundColor: palette.surface,
        borderColor: palette.border,
      }}
      className="rounded-2xl p-3.5 border active:opacity-80">
      <HStack className="gap-3">
        {/* Foto de Capa do Produto */}
        <View
          style={{
            width: 88,
            height: 88,
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: palette.surfaceSubtle,
          }}>
          <Image
            source={{ uri: produto.fotos[0] }}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
            accessibilityLabel={`Foto de ${nome}`}
            style={{ width: '100%', height: '100%' }}
          />
        </View>

        {/* Informações Centrais do Produto */}
        <VStack className="flex-1 justify-between py-0.5">
          <VStack className="gap-0.5">
            <HStack className="items-start justify-between gap-2">
              <Text
                numberOfLines={1}
                style={{ color: palette.headline }}
                className="text-base font-bold flex-1">
                {nome}
              </Text>

              {/* Badge de Status Semântico */}
              <View
                style={{ backgroundColor: statusMeta.bgColor }}
                className="flex-row items-center gap-1 px-2.5 py-0.5 rounded-full">
                <HugeiconsIcon icon={statusMeta.icon} size={12} color={statusMeta.textColor} strokeWidth={2.4} />
                <Text
                  style={{ color: statusMeta.textColor }}
                  className="text-[11px] font-bold">
                  {statusMeta.label}
                </Text>
              </View>
            </HStack>

            <Text numberOfLines={1} style={{ color: palette.paragraphMuted }} className="text-xs">
              {[CONDITION_LABELS[produto.condicao], CATEGORY_LABELS[produto.categoria]]
                .filter(Boolean)
                .join(' • ')}
            </Text>
          </VStack>

          <HStack className="items-baseline justify-between pt-1">
            <Text style={{ color: palette.highlight }} className="text-lg font-black tracking-tight">
              {formatBRL(produto.preco_usuario)}
            </Text>

            {produto.observacoes_usuario ? (
              <Text numberOfLines={1} style={{ color: palette.paragraph }} className="text-xs max-w-[140px]">
                {produto.observacoes_usuario}
              </Text>
            ) : null}
          </HStack>
        </VStack>
      </HStack>
    </Pressable>
  );
}
