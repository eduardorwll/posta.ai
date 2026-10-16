import React from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { router } from 'expo-router';

import { haptic } from '@/lib/haptics';

interface SwipeableTabScreenProps {
  children: React.ReactNode;
  previousTab?: string;
  nextTab?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Envolve a tela de aba com detecção de gesto de deslize lateral (swipe)
 * para transição rápida entre abas com feedback tátil (haptics).
 *
 * Configurado com failOffsetY estrito para priorizar rolagens verticais nativas
 * em ScrollViews e FlatLists sem interrupções indesejadas.
 */
export function SwipeableTabScreen({
  children,
  previousTab,
  nextTab,
  style,
}: SwipeableTabScreenProps) {
  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-35, 35])
    .failOffsetY([-18, 18])
    .onEnd((event) => {
      const distanceThreshold = 55;
      const velocityThreshold = 350;

      // Deslize da direita para a esquerda (próxima aba)
      if ((event.translationX < -distanceThreshold || event.velocityX < -velocityThreshold) && nextTab) {
        haptic.selection();
        router.navigate(nextTab as any);
      }
      // Deslize da esquerda para a direita (aba anterior)
      else if ((event.translationX > distanceThreshold || event.velocityX > velocityThreshold) && previousTab) {
        haptic.selection();
        router.navigate(previousTab as any);
      }
    });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, style]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
