import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text as RNText,
  View,
} from 'react-native';
import {
  CameraRotated01Icon,
  Cancel01Icon,
  FlashIcon,
  FlashOffIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { CameraView, useCameraPermissions, type CameraType, type FlashMode } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/constants/theme';
import { haptic } from '@/lib/haptics';

interface CameraModalProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (uri: string) => void;
}

export function CameraModal({ visible, onClose, onCapture }: CameraModalProps) {
  const insets = useSafeAreaInsets();
  const { palette } = useAppTheme();
  const [permission, requestPermission] = useCameraPermissions();

  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [isCapturing, setIsCapturing] = useState(false);

  function toggleCameraFacing() {
    haptic.selection();
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  function toggleFlash() {
    haptic.selection();
    setFlash((current) => (current === 'off' ? 'on' : 'off'));
  }

  async function handleTakePicture() {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      haptic.medium();

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        shutterSound: false,
        skipProcessing: false,
      });

      if (photo?.uri) {
        haptic.success();
        onCapture(photo.uri);
        onClose();
      }
    } catch (error) {
      console.error('Falha ao capturar foto pela câmera in-app:', error);
      haptic.error();
    } finally {
      setIsCapturing(false);
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}>
      <View style={styles.container}>
        {!permission?.granted ? (
          <View style={[styles.permissionContainer, { paddingTop: insets.top + 20 }]}>
            <Pressable
              onPress={onClose}
              style={[styles.iconButton, { alignSelf: 'flex-start', marginLeft: 20 }]}>
              <HugeiconsIcon icon={Cancel01Icon} size={24} color="#ffffff" strokeWidth={2} />
            </Pressable>

            <View style={styles.permissionContent}>
              <RNText style={styles.permissionTitle}>Permissão de Câmera</RNText>
              <RNText style={styles.permissionDescription}>
                O posta.ai precisa de acesso à câmera para você fotografar seus produtos com alta
                resolução sem sair do app.
              </RNText>
              <Pressable
                onPress={requestPermission}
                style={[styles.primaryButton, { backgroundColor: palette.highlight }]}>
                <RNText style={[styles.primaryButtonText, { color: palette.onHighlight }]}>
                  Permitir Acesso à Câmera
                </RNText>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={StyleSheet.absoluteFill}>
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing={facing}
              flash={flash}
              mode="picture"
            />

            {/* Guia Visual de Enquadramento */}
            <View style={styles.viewfinderContainer} pointerEvents="none">
              <View style={styles.viewfinder}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
              </View>
            </View>

            {/* Barra Superior */}
            <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
              <Pressable onPress={onClose} style={styles.iconButton}>
                <HugeiconsIcon icon={Cancel01Icon} size={24} color="#ffffff" strokeWidth={2} />
              </Pressable>

              <Pressable onPress={toggleFlash} style={styles.iconButton}>
                <HugeiconsIcon
                  icon={flash === 'on' ? FlashIcon : FlashOffIcon}
                  size={24}
                  color={flash === 'on' ? palette.highlight : '#ffffff'}
                  strokeWidth={2}
                />
              </Pressable>
            </View>

            {/* Barra Inferior com Disparador */}
            <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }]}>
              {/* Botão de Alternar Câmera */}
              <Pressable onPress={toggleCameraFacing} style={styles.iconButton}>
                <HugeiconsIcon
                  icon={CameraRotated01Icon}
                  size={26}
                  color="#ffffff"
                  strokeWidth={2}
                />
              </Pressable>

              {/* Botão de Disparo */}
              <Pressable
                onPress={handleTakePicture}
                disabled={isCapturing}
                style={[
                  styles.shutterRing,
                  { borderColor: palette.highlight },
                  isCapturing && { opacity: 0.6 },
                ]}>
                {isCapturing ? (
                  <ActivityIndicator size="small" color={palette.highlight} />
                ) : (
                  <View style={styles.shutterInner} />
                )}
              </Pressable>

              {/* Placeholder balanceador para centralizar o botão */}
              <View style={{ width: 48, height: 48 }} />
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 40,
    backgroundColor: '#001e1d',
  },
  permissionContent: {
    paddingHorizontal: 28,
    alignItems: 'center',
    gap: 16,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fffffe',
    textAlign: 'center',
  },
  permissionDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: '#abd1c6',
    textAlign: 'center',
  },
  primaryButton: {
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
  },
  viewfinderContainer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinder: {
    width: '84%',
    aspectRatio: 1,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 6,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 6,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 6,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 6,
  },
});
