import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Utilitário seguro e desacoplado de feedback háptico.
 * Implementa o padrão de "Módulo Profundo" (APOSD):
 * os componentes visuais chamam métodos semânticos simples, enquanto
 * toda a proteção contra falhas de plataforma e chamadas assíncronas fica encapsulada.
 */

async function triggerSafe(action: () => Promise<void>): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await action();
  } catch {
    // Falha silenciosa em simuladores ou dispositivos sem motor tátil
  }
}

export const haptic = {
  /** Toque leve para seleção de opções, chips, tabs e switches */
  selection: () => triggerSafe(() => Haptics.selectionAsync()),

  /** Impacto tátil suave para cliques de botões secundários */
  light: () => triggerSafe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),

  /** Impacto tátil médio para ações primárias e confirmações */
  medium: () => triggerSafe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),

  /** Notificação tátil de sucesso (ex: produto salvo com sucesso) */
  success: () => triggerSafe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),

  /** Notificação tátil de aviso/alerta (ex: remoção de foto) */
  warning: () => triggerSafe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),

  /** Notificação tátil de erro (ex: validação com falha) */
  error: () => triggerSafe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};
