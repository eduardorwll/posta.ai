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
  UserAdd01Icon,
  Alert02Icon,
  CheckmarkCircle02Icon,
  Login03Icon,
} from '@hugeicons/core-free-icons';

import { useAppTheme, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/store/useAuthStore';
import { haptic } from '@/lib/haptics';
import { AppHeader } from '@/components/AppHeader';

export default function CadastroScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { palette } = useAppTheme();

  const signUpWithEmail = useAuthStore((state) => state.signUpWithEmail);
  const isLoading = useAuthStore((state) => state.isLoading);
  const authError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [emailConfirmationSent, setEmailConfirmationSent] = useState(false);

  const handleCadastro = async () => {
    setLocalError(null);
    clearError();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      haptic.warning();
      setLocalError('Informe seu e-mail para cadastrar.');
      return;
    }
    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      haptic.warning();
      setLocalError('Informe um e-mail válido.');
      return;
    }
    if (!password || password.length < 6) {
      haptic.warning();
      setLocalError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      haptic.warning();
      setLocalError('As senhas digitadas não coincidem.');
      return;
    }

    haptic.light();
    const result = await signUpWithEmail(trimmedEmail, password);

    if (result.success) {
      haptic.success();
      if (result.requiresEmailConfirmation) {
        setEmailConfirmationSent(true);
      }
      // Se não exigiu confirmação, o RootLayout já detectará a sessão criada e redirecionará
    } else {
      haptic.error();
      setLocalError(result.error || 'Falha ao criar conta.');
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
          <AppHeader subtitle="Crie sua conta de vendedor para anunciar e gerenciar produtos." />
        </View>

        {emailConfirmationSent ? (
          /* Card de Confirmação de E-mail Enviada */
          <View
            style={{
              backgroundColor: palette.surface,
              borderColor: palette.success,
              borderWidth: 1.5,
              borderRadius: 24,
              padding: Spacing.four,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 10,
              elevation: 2,
              alignItems: 'center',
            }}>
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: `${palette.success}20`,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: Spacing.three,
              }}>
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={32} color={palette.success} strokeWidth={2.2} />
            </View>

            <RNText
              style={{
                color: palette.headline,
                fontSize: 20,
                fontWeight: '700',
                lineHeight: 26,
                textAlign: 'center',
                marginBottom: 8,
                includeFontPadding: false,
              }}>
              Quase lá! Verifique seu e-mail
            </RNText>

            <RNText
              style={{
                color: palette.paragraph,
                fontSize: 14,
                lineHeight: 21,
                textAlign: 'center',
                marginBottom: Spacing.four,
                includeFontPadding: false,
              }}>
              Enviamos um link de confirmação para{' '}
              <RNText style={{ fontWeight: '700', color: palette.headline }}>{email}</RNText>.
              Por favor, acesse sua caixa de entrada e clique no link para ativar seu acesso.
            </RNText>

            <TouchableOpacity
              onPress={() => {
                haptic.selection();
                clearError();
                router.replace('/(auth)/login' as any);
              }}
              activeOpacity={0.85}
              style={{
                backgroundColor: palette.highlight,
                borderRadius: 14,
                height: 50,
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <HugeiconsIcon icon={Login03Icon} size={20} color={palette.onHighlight} strokeWidth={2} />
              <RNText
                style={{
                  color: palette.onHighlight,
                  fontSize: 16,
                  fontWeight: '700',
                  marginLeft: 8,
                  includeFontPadding: false,
                }}>
                Ir para o Login
              </RNText>
            </TouchableOpacity>
          </View>
        ) : (
          /* Formulário de Criação de Conta */
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
              Criar Conta de Vendedor
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
                Senha (mínimo 6 dígitos)
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
                  placeholder="Crie sua senha segura"
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

            {/* Campo Confirmar Senha */}
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
                Confirmar Senha
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
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (localError || authError) {
                      setLocalError(null);
                      clearError();
                    }
                  }}
                  placeholder="Repita sua senha"
                  placeholderTextColor={palette.paragraphMuted}
                  secureTextEntry={!showConfirmPassword}
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
                    setShowConfirmPassword(!showConfirmPassword);
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={{ padding: 4 }}>
                  <HugeiconsIcon
                    icon={showConfirmPassword ? ViewOffSlashIcon : ViewIcon}
                    size={18}
                    color={palette.paragraphMuted}
                    strokeWidth={1.8}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Botão Cadastrar */}
            <TouchableOpacity
              onPress={handleCadastro}
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
                  <HugeiconsIcon icon={UserAdd01Icon} size={20} color={palette.onHighlight} strokeWidth={2} />
                  <RNText
                    style={{
                      color: palette.onHighlight,
                      fontSize: 16,
                      fontWeight: '700',
                      marginLeft: 8,
                      includeFontPadding: false,
                    }}>
                    Criar Conta
                  </RNText>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Rodapé: Voltar ao Login */}
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
            Já tem uma conta?{' '}
          </RNText>
          <TouchableOpacity
            onPress={() => {
              haptic.selection();
              clearError();
              router.replace('/(auth)/login' as any);
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
              Entrar
            </RNText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
