import {
  AlarmClockIcon,
  Alert02Icon,
  CheckmarkCircle02Icon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Image } from 'expo-image';

import { Badge, BadgeText } from '@/components/ui/badge';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAppTheme } from '@/constants/theme';
import { CATEGORY_LABELS, CONDITION_LABELS, type Produto, type ProductStatus } from '@/types/product';

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatBRL(value: number) {
  return currency.format(value);
}

type StatusConfig = {
  label: string;
  icon: typeof AlarmClockIcon;
  badgeClass: string;
  textClass: string;
  iconColor: string;
};

const STATUS_CONFIG: Record<string, StatusConfig> = {
  pendente: {
    label: 'Pendente',
    icon: AlarmClockIcon,
    badgeClass: 'bg-[#f9bc60]',
    textClass: 'text-[#001e1d]',
    iconColor: '#001e1d',
  },
  em_processamento: {
    label: 'Processando',
    icon: Loading03Icon,
    badgeClass: 'bg-[#22d3ee]',
    textClass: 'text-[#001e1d]',
    iconColor: '#001e1d',
  },
  pronto: {
    label: 'Pronto',
    icon: CheckmarkCircle02Icon,
    badgeClass: 'bg-[#4ade80]',
    textClass: 'text-[#001e1d]',
    iconColor: '#001e1d',
  },
};

const STATUS_ALIASES: Partial<Record<ProductStatus, string>> = {
  processando_ia: 'em_processamento',
};

const FALLBACK_STATUS: StatusConfig = {
  label: 'Status',
  icon: Alert02Icon,
  badgeClass: 'bg-[#abd1c6]',
  textClass: 'text-[#001e1d]',
  iconColor: '#001e1d',
};

function getStatusConfig(status: string): StatusConfig {
  const key = STATUS_ALIASES[status as ProductStatus] ?? status;
  if (STATUS_CONFIG[key]) return STATUS_CONFIG[key];
  const label = status.replace(/_/g, ' ');
  return { ...FALLBACK_STATUS, label: label.charAt(0).toUpperCase() + label.slice(1) };
}

export function ProductCard({ produto }: { produto: Produto }) {
  const { palette } = useAppTheme();
  const status = getStatusConfig(produto.status);
  const nome = produto.nome?.trim() || 'Produto sem título';

  return (
    <HStack style={{ backgroundColor: palette.surface, borderColor: palette.border }} className="gap-3 rounded-2xl p-3 border">
      <Image
        source={{ uri: produto.fotos[0] }}
        contentFit="cover"
        accessibilityLabel="Foto do produto"
        style={{ width: 88, height: 88, borderRadius: 12, backgroundColor: palette.background }}
      />
      <VStack className="flex-1 justify-between gap-1">
        <Text numberOfLines={1} style={{ color: palette.headline }} className="text-base font-semibold">
          {nome}
        </Text>
        <Text numberOfLines={1} style={{ color: palette.paragraph }} className="text-xs">
          {[CONDITION_LABELS[produto.condicao], CATEGORY_LABELS[produto.categoria]]
            .filter(Boolean)
            .join(' • ')}
        </Text>
        <Text style={{ color: palette.highlight }} className="text-lg font-bold">{formatBRL(produto.preco_usuario)}</Text>
        {produto.observacoes_usuario ? (
          <Text numberOfLines={2} style={{ color: palette.paragraph }} className="text-sm">
            {produto.observacoes_usuario}
          </Text>
        ) : null}
      </VStack>
      <Badge className={`${status.badgeClass} self-start flex-row items-center gap-1.5 px-2.5 py-1 rounded-full`}>
        <HugeiconsIcon icon={status.icon} size={14} color={status.iconColor} strokeWidth={2.2} />
        <BadgeText className={`${status.textClass} text-xs font-bold`}>{status.label}</BadgeText>
      </Badge>
    </HStack>
  );
}
