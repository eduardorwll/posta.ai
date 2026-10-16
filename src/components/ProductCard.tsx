import {
  AlarmClockIcon,
  Alert02Icon,
  CheckmarkCircle02Icon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Image } from 'expo-image';
import { Pressable, Text as RNText, View } from 'react-native';

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
  switch (status) {
    case 'pendente':
      return {
        label: 'Pendente',
        icon: AlarmClockIcon,
        bgColor: palette.warning,
        textColor: palette.onHighlight,
      };
    case 'processando_ia':
    case 'em_processamento':
      return {
        label: 'Gerando com IA...',
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
    case 'erro':
      return {
        label: 'Erro IA',
        icon: Alert02Icon,
        bgColor: palette.tertiary,
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
      className="rounded-2xl p-3 border active:opacity-80">
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {/* Foto de Capa do Produto */}
        <View
          style={{
            width: 88,
            height: 88,
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: palette.surfaceSubtle,
            flexShrink: 0,
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
        <View style={{ flex: 1, justifyContent: 'space-between', paddingVertical: 1 }}>
          <View>
            {/* Linha de Título e Badge de Status */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <RNText
                numberOfLines={1}
                style={{
                  color: palette.headline,
                  fontSize: 15,
                  fontWeight: '700',
                  lineHeight: 20,
                  flex: 1,
                  includeFontPadding: false,
                }}>
                {nome}
              </RNText>

              {/* Badge de Status Semântico Bounded */}
              <View
                style={{
                  backgroundColor: statusMeta.bgColor,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 999,
                  flexShrink: 0,
                  alignSelf: 'flex-start',
                }}>
                <HugeiconsIcon icon={statusMeta.icon} size={11} color={statusMeta.textColor} strokeWidth={2.4} />
                <RNText
                  style={{
                    color: statusMeta.textColor,
                    fontSize: 10,
                    fontWeight: '700',
                    lineHeight: 13,
                    includeFontPadding: false,
                  }}>
                  {statusMeta.label}
                </RNText>
              </View>
            </View>

            {/* Subtítulo: Condição e Categoria */}
            <RNText
              numberOfLines={1}
              style={{
                color: palette.paragraphMuted,
                fontSize: 12,
                lineHeight: 16,
                marginTop: 3,
                includeFontPadding: false,
              }}>
              {[CONDITION_LABELS[produto.condicao], CATEGORY_LABELS[produto.categoria]]
                .filter(Boolean)
                .join(' • ')}
            </RNText>

            {/* Destaque Comercial gerado pela IA */}
            {produto.descricao_curta ? (
              <RNText
                numberOfLines={1}
                style={{
                  color: palette.paragraph,
                  fontSize: 11,
                  fontStyle: 'italic',
                  lineHeight: 15,
                  marginTop: 2,
                  includeFontPadding: false,
                }}>
                ✨ {produto.descricao_curta}
              </RNText>
            ) : null}
          </View>

          {/* Linha Inferior: Preço e Observações */}
          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 4 }}>
            <RNText
              style={{
                color: palette.highlight,
                fontSize: 16,
                fontWeight: '900',
                lineHeight: 20,
                letterSpacing: -0.5,
                includeFontPadding: false,
              }}>
              {formatBRL(produto.preco_usuario)}
            </RNText>

            {produto.observacoes_usuario ? (
              <RNText
                numberOfLines={1}
                style={{
                  color: palette.paragraph,
                  fontSize: 11,
                  lineHeight: 15,
                  maxWidth: 130,
                  includeFontPadding: false,
                }}>
                {produto.observacoes_usuario}
              </RNText>
            ) : null}
          </View>
        </View>
      </View>
    </Pressable>
  );
}
