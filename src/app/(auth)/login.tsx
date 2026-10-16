import React, { useState } from 'react';
import {
  View,
  Text as RNText,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Mail01Icon,
  LockIcon,
  ViewIcon,
  ViewOffSlashIcon,
  Login03Icon,
  Alert02Icon,
} from '@hugeicons/core-free-icons';

import { useAppTheme, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/store/useAuthStore';
import { haptic } from '@/lib/haptics';
import { AppHeader } from '@/components/AppHeader';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { palette } = useAppTheme();

  const signInWithEmail = useAuthStore((state) => state.signInWithEmail);
  const isLoading = useAuthStore((state) => state.isLoading);
  const authError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLocalError(null);
    clearError();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      haptic.warning();
      setLocalError('Informe seu e-mail para continuar.');
      return;
    }
    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      haptic.warning();
      setLocalError('Informe um e-mail válido.');
      return;
    }
    if (!password) {
      haptic.warning();
      setLocalError('Informe sua senha.');
      return;
    }

    haptic.light();
    const result = await signInWithEmail(trimmedEmail, password);

    if (result.success) {
      haptic.success();
      // O listener do useAuthStore no RootLayout redirecionará automaticamente
    } else {
      haptic.error();
      setLocalError(result.error || 'Falha ao autenticar.');
    }
  };

  const errorMessage = localError || authError;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: palette.background }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingTop: insets.top + Spacing.four,
          paddingBottom: insets.bottom + Spacing.four,
          paddingHorizontal: Spacing.four,
          maxWidth: MaxContentWidth,
          width: '100%',
          alignSelf: 'center',
        }}
        showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: Spacing.five }}>
          <AppHeader subtitle="Acesse sua conta para anunciar produtos nos marketplaces." />
        </View>

        {/* Card do Formulário de Login */}
        <View
          style={{
            backgroundColor: palette.surface,
            borderColor: palette.border,
            borderWidth: 1,
            borderRadius: 24,
            padding: Spacing.four,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 2,
          }}>
          <RNText
            style={{
              color: palette.headline,
              fontSize: 20,
              fontWeight: '700',
              lineHeight: 26,
              marginBottom: Spacing.three,
              includeFontPadding: false,
            }}>
            Entrar como Vendedor
          </RNText>

          {/* Banner de Erro */}
          {errorMessage && (
            <View
              style={{
                backgroundColor: `${palette.danger}15`,
                borderColor: `${palette.danger}40`,
                borderWidth: 1,
                borderRadius: 12,
                padding: Spacing.three,
                marginBottom: Spacing.three,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <HugeiconsIcon icon={Alert02Icon} size={18} color={palette.danger} strokeWidth={2} />
              <RNText
                style={{
                  color: palette.danger,
                  fontSize: 13,
                  fontWeight: '600',
                  lineHeight: 18,
                  marginLeft: 8,
                  flex: 1,
                  includeFontPadding: false,
                }}>
                {errorMessage}
              </RNText>
            </View>
          )}

          {/* Campo E-mail */}
          <View style={{ marginBottom: Spacing.three }}>
            <RNText
              style={{
                color: palette.headline,
                fontSize: 14,
                fontWeight: '600',
                lineHeight: 20,
                marginBottom: 6,
                includeFontPadding: false,
              }}>
              E-mail
            </RNText>
            <View
              style={{
                backgroundColor: palette.background,
                borderColor: palette.border,
                borderWidth: 1,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 12,
                height: 48,
              }}>
              <HugeiconsIcon icon={Mail01Icon} size={20} color={palette.paragraphMuted} strokeWidth={1.8} />
              <TextInput
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (localError || authError) {
                    setLocalError(null);
                    clearError();
                  }
                }}
                placeholder="seu.email@exemplo.com"
                placeholderTextColor={palette.paragraphMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={{
                  flex: 1,
                  marginLeft: 10,
                  color: palette.headline,
                  fontSize: 15,
                  includeFontPadding: false,
                }}
              />
            </View>
          </View>

          {/* Campo Senha */}
          <View style={{ marginBottom: Spacing.four }}>
            <RNText
              style={{
                color: palette.headline,
                fontSize: 14,
                fontWeight: '600',
                lineHeight: 20,
                marginBottom: 6,
                includeFontPadding: false,
              }}>
              Senha
            </RNText>
            <View
              style={{
                backgroundColor: palette.background,
                borderColor: palette.border,
                borderWidth: 1,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 12,
                height: 48,
              }}>
              <HugeiconsIcon icon={LockIcon} size={20} color={palette.paragraphMuted} strokeWidth={1.8} />
              <TextInput
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (localError || authError) {
                    setLocalError(null);
                    clearError();
                  }
                }}
                placeholder="Sua senha secreta"
                placeholderTextColor={palette.paragraphMuted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                style={{
                  flex: 1,
                  marginLeft: 10,
                  color: palette.headline,
                  fontSize: 15,
                  includeFontPadding: false,
                }}
              />
              <TouchableOpacity
                onPress={() => {
                  haptic.selection();
                  setShowPassword(!showPassword);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{ padding: 4 }}>
                <HugeiconsIcon
                  icon={showPassword ? ViewOffSlashIcon : ViewIcon}
                  size={18}
                  color={palette.paragraphMuted}
                  strokeWidth={1.8}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Botão de Entrar */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
            style={{
              backgroundColor: palette.highlight,
              borderRadius: 14,
              height: 50,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: palette.highlight,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 3,
            }}>
            {isLoading ? (
              <ActivityIndicator size="small" color={palette.onHighlight} />
            ) : (
              <>
                <HugeiconsIcon icon={Login03Icon} size={20} color={palette.onHighlight} strokeWidth={2} />
                <RNText
                  style={{
                    color: palette.onHighlight,
                    fontSize: 16,
                    fontWeight: '700',
                    marginLeft: 8,
                    includeFontPadding: false,
                  }}>
                  Entrar
                </RNText>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Rodapé: Navegar para Cadastro */}
        <View
          style={{
            marginTop: Spacing.four,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
          }}>
          <RNText
            style={{
              color: palette.paragraph,
              fontSize: 14,
              includeFontPadding: false,
            }}>
            Ainda não tem conta?{' '}
          </RNText>
          <TouchableOpacity
            onPress={() => {
              haptic.selection();
              clearError();
              router.push('/(auth)/cadastro' as any);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <RNText
              style={{
                color: palette.highlight,
                fontSize: 14,
                fontWeight: '700',
                textDecorationLine: 'underline',
                includeFontPadding: false,
              }}>
              Criar conta grátis
            </RNText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
