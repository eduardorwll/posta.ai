import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore, ThemeMode } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { testarConexaoApi, TesteConexaoResult } from '@/lib/api';
import { isSupabaseConfigured, supabaseUrl } from '@/lib/supabase';
import { AppHeader } from '@/components/AppHeader';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  CheckmarkCircle02Icon,
  Alert02Icon,
  RefreshIcon,
  CloudIcon,
  Settings01Icon,
  SparklesIcon,
  ShoppingBag01Icon,
  Database01Icon,
  UserIcon,
  Logout03Icon,
} from '@hugeicons/core-free-icons';
import { MaxContentWidth, useAppTheme, Spacing } from '@/constants/theme';
import { haptic } from '@/lib/haptics';

export default function ConfiguracaoScreen() {
  const insets = useSafeAreaInsets();
  const { themeMode, setThemeMode } = useThemeStore();
  const { palette } = useAppTheme();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const isAuthLoading = useAuthStore((state) => state.isLoading);

  const handleLogout = () => {
    haptic.warning();
    Alert.alert(
      'Encerrar Sessão',
      'Deseja realmente sair da sua conta de vendedor?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair da Conta',
          style: 'destructive',
          onPress: async () => {
            haptic.light();
            await signOut();
          },
        },
      ]
    );
  };

  // States
  const [tomVoz, setTomVoz] = useState<'Direto' | 'Brechó' | 'Detalhado'>('Brechó');
  const [sugestaoPreco, setSugestaoPreco] = useState(true);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TesteConexaoResult | null>(null);

  const handleThemeChange = (mode: ThemeMode) => {
    haptic.selection();
    setThemeMode(mode);
  };

  const handleTomVozChange = (tom: 'Direto' | 'Brechó' | 'Detalhado') => {
    haptic.selection();
    setTomVoz(tom);
  };

  const handleToggleSugestao = () => {
    haptic.selection();
    setSugestaoPreco(!sugestaoPreco);
  };

  const handleTest = async () => {
    haptic.light();
    setTesting(true);
    setTestResult(null);
    const result = await testarConexaoApi();
    setTestResult(result);
    setTesting(false);

    if (result.success) {
      haptic.success();
    } else {
      haptic.error();
    }
  };

  const canaisVenda = [
    { nome: 'Enjoei', status: 'Em breve' },
    { nome: 'Mercado Livre', status: 'Em breve' },
    { nome: 'Facebook Marketplace', status: 'Em breve' },
    { nome: 'OLX', status: 'Em breve' },
  ];

  // Friendly host presentation
  const displayHost = supabaseUrl
    ? supabaseUrl.replace(/^https?:\/\//, '')
    : 'Não configurado (.env)';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: palette.background }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.three,
          paddingBottom: insets.bottom + Spacing.four,
          paddingHorizontal: Spacing.four,
          maxWidth: MaxContentWidth,
          width: '100%',
          alignSelf: 'center',
        }}
        showsVerticalScrollIndicator={false}>
        <AppHeader subtitle="Configurações e Preferências" />
        <View style={{ height: Spacing.three }} />

        {/* Seção Perfil do Vendedor */}
        <View style={{ backgroundColor: palette.surface, borderColor: palette.border }} className="rounded-2xl p-4 mb-4 border">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center flex-1 mr-2">
              <View
                style={{ backgroundColor: `${palette.highlight}20` }}
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
              >
                <HugeiconsIcon icon={UserIcon} size={20} color={palette.highlight} strokeWidth={2} />
              </View>
              <View className="flex-1">
                <Text style={{ color: palette.headline }} className="font-bold text-base" numberOfLines={1}>
                  {user?.email || 'Vendedor Conectado'}
                </Text>
                <Text style={{ color: palette.paragraph }} className="text-xs">
                  Conta de vendedor ativa
                </Text>
              </View>
            </View>
            <View
              style={{
                backgroundColor: `${palette.success}20`,
                borderColor: `${palette.success}40`,
              }}
              className="px-2.5 py-1 rounded-full border flex-row items-center"
            >
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} color={palette.success} strokeWidth={2.5} />
              <Text style={{ color: palette.success }} className="text-[10px] font-bold ml-1">
                Autenticado
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleLogout}
            disabled={isAuthLoading}
            style={{
              backgroundColor: `${palette.tertiary}15`,
              borderColor: `${palette.tertiary}35`,
            }}
            className="rounded-xl py-2.5 px-4 items-center justify-center flex-row border active:opacity-75"
          >
            {isAuthLoading ? (
              <ActivityIndicator size="small" color={palette.tertiary} />
            ) : (
              <>
                <HugeiconsIcon icon={Logout03Icon} size={18} color={palette.tertiary} strokeWidth={2} />
                <Text style={{ color: palette.tertiary }} className="font-bold ml-2 text-sm">
                  Encerrar Sessão
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Seção Aparência */}
        <View style={{ backgroundColor: palette.surface, borderColor: palette.border }} className="rounded-2xl p-4 mb-4 border">
          <View className="flex-row items-center mb-3">
            <HugeiconsIcon icon={Settings01Icon} size={22} color={palette.highlight} strokeWidth={2} />
            <Text style={{ color: palette.headline }} className="font-bold text-base ml-2">Aparência</Text>
          </View>
          <Text style={{ color: palette.paragraph }} className="text-sm mb-3">Escolha o tema visual do aplicativo.</Text>
          <View className="flex-row gap-2">
            {[
              { label: 'Escuro', value: 'dark' },
              { label: 'Claro', value: 'light' },
              { label: 'Automático', value: 'system' },
            ].map((item) => {
              const isSelected = themeMode === item.value;
              return (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => handleThemeChange(item.value as ThemeMode)}
                  style={{
                    backgroundColor: isSelected ? palette.highlight : palette.background,
                    borderColor: isSelected ? palette.highlight : palette.border,
                  }}
                  className="flex-1 py-2.5 rounded-xl border items-center active:opacity-75"
                >
                  <Text
                    style={{
                      color: isSelected ? palette.onHighlight : palette.paragraph,
                    }}
                    className={`text-xs ${isSelected ? 'font-bold' : 'font-semibold'}`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Seção Criação de Anúncios / IA */}
        <View style={{ backgroundColor: palette.surface, borderColor: palette.border }} className="rounded-2xl p-4 mb-4 border">
          <View className="flex-row items-center mb-3">
            <HugeiconsIcon icon={SparklesIcon} size={22} color={palette.highlight} strokeWidth={2} />
            <Text style={{ color: palette.headline }} className="font-bold text-base ml-2">Criação de Anúncios & IA</Text>
          </View>
          <Text style={{ color: palette.paragraph }} className="text-sm mb-3">Tom de voz para geração automática de descrições:</Text>
          <View className="flex-row gap-2 mb-4">
            {(['Direto', 'Brechó', 'Detalhado'] as const).map((tom) => {
              const isSelected = tomVoz === tom;
              return (
                <TouchableOpacity
                  key={tom}
                  onPress={() => handleTomVozChange(tom)}
                  style={{
                    backgroundColor: isSelected ? palette.highlight : palette.background,
                    borderColor: isSelected ? palette.highlight : palette.border,
                  }}
                  className="flex-1 py-2 rounded-xl border items-center active:opacity-75"
                >
                  <Text
                    style={{
                      color: isSelected ? palette.onHighlight : palette.paragraph,
                    }}
                    className={`text-xs ${isSelected ? 'font-bold' : 'font-semibold'}`}
                  >
                    {tom}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            onPress={handleToggleSugestao}
            style={{ backgroundColor: palette.background, borderColor: palette.border }}
            className="flex-row items-center justify-between p-3 rounded-xl border active:opacity-75"
          >
            <Text style={{ color: palette.headline }} className="text-sm font-medium">Sugestão de Preço de Mercado</Text>
            <View
              style={{
                backgroundColor: sugestaoPreco ? palette.highlight : 'transparent',
                borderColor: sugestaoPreco ? palette.highlight : palette.border,
              }}
              className="w-6 h-6 rounded-lg items-center justify-center border"
            >
              {sugestaoPreco && <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} color={palette.onHighlight} strokeWidth={2.5} />}
            </View>
          </TouchableOpacity>
        </View>

        {/* Seção Canais de Venda */}
        <View style={{ backgroundColor: palette.surface, borderColor: palette.border }} className="rounded-2xl p-4 mb-4 border">
          <View className="flex-row items-center mb-3">
            <HugeiconsIcon icon={ShoppingBag01Icon} size={22} color={palette.highlight} strokeWidth={2} />
            <Text style={{ color: palette.headline }} className="font-bold text-base ml-2">Canais de Venda Integrados</Text>
          </View>
          <Text style={{ color: palette.paragraph }} className="text-sm mb-3">Plataformas de publicação multi-canal:</Text>
          <View className="gap-2">
            {canaisVenda.map((canal) => (
              <View key={canal.nome} style={{ backgroundColor: palette.background, borderColor: palette.border }} className="flex-row items-center justify-between px-3 py-2.5 rounded-xl border">
                <Text style={{ color: palette.headline }} className="text-sm font-medium">{canal.nome}</Text>
                <View style={{ backgroundColor: `${palette.highlight}20`, borderColor: `${palette.highlight}40` }} className="px-2.5 py-1 rounded-full border">
                  <Text style={{ color: palette.highlight }} className="text-[10px] font-bold">{canal.status}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Seção Backend Serverless (Supabase Cloud) */}
        <View style={{ backgroundColor: palette.surface, borderColor: palette.border }} className="rounded-2xl p-4 mb-4 border">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <HugeiconsIcon icon={CloudIcon} size={22} color={palette.highlight} strokeWidth={2} />
              <Text style={{ color: palette.headline }} className="font-bold text-base ml-2">Nuvem & Banco de Dados</Text>
            </View>
            <View
              style={{
                backgroundColor: isSupabaseConfigured ? `${palette.success}20` : `${palette.warning}20`,
                borderColor: isSupabaseConfigured ? `${palette.success}40` : `${palette.warning}40`,
              }}
              className="px-2.5 py-1 rounded-full border flex-row items-center"
            >
              <HugeiconsIcon
                icon={isSupabaseConfigured ? CheckmarkCircle02Icon : Alert02Icon}
                size={12}
                color={isSupabaseConfigured ? palette.success : palette.warning}
                strokeWidth={2.5}
              />
              <Text
                style={{ color: isSupabaseConfigured ? palette.success : palette.warning }}
                className="text-[10px] font-bold ml-1"
              >
                {isSupabaseConfigured ? 'Supabase Conectado' : 'Configuração Pendente'}
              </Text>
            </View>
          </View>

          <Text style={{ color: palette.paragraph }} className="text-xs mb-3">
            Arquitetura serverless conectada diretamente ao Supabase (PostgREST + Storage CDN).
          </Text>

          <View style={{ backgroundColor: palette.background, borderColor: palette.border }} className="p-3 rounded-xl border mb-3">
            <View className="flex-row items-center mb-1">
              <HugeiconsIcon icon={Database01Icon} size={16} color={palette.paragraphMuted} strokeWidth={2} />
              <Text style={{ color: palette.paragraphMuted }} className="text-xs ml-1.5 font-medium">Endpoint Ativo</Text>
            </View>
            <Text style={{ color: palette.headline }} className="text-xs font-mono select-all">
              {displayHost}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleTest}
            disabled={testing}
            style={{ backgroundColor: palette.highlight }}
            className="rounded-xl py-3 items-center justify-center flex-row shadow-sm active:opacity-85"
          >
            {testing ? (
              <ActivityIndicator size="small" color={palette.onHighlight} />
            ) : (
              <>
                <HugeiconsIcon icon={RefreshIcon} size={18} color={palette.onHighlight} strokeWidth={2} />
                <Text style={{ color: palette.onHighlight }} className="font-bold ml-2">
                  Testar Conexão Cloud
                </Text>
              </>
            )}
          </TouchableOpacity>

          {testResult && (
            <View
              style={{
                backgroundColor: palette.background,
                borderColor: testResult.success ? palette.success : palette.danger,
              }}
              className="rounded-xl p-3 mt-3 border"
            >
              <View className="flex-row items-center mb-1">
                <HugeiconsIcon
                  icon={testResult.success ? CheckmarkCircle02Icon : Alert02Icon}
                  size={18}
                  color={testResult.success ? palette.success : palette.danger}
                  strokeWidth={2}
                />
                <Text
                  style={{ color: testResult.success ? palette.success : palette.danger }}
                  className="font-bold text-sm ml-2">
                  {testResult.success ? 'Conexão Estabelecida' : 'Falha na Conexão'}
                </Text>
              </View>
              <Text style={{ color: palette.paragraph }} className="text-xs mt-1">{testResult.message}</Text>
              <View style={{ borderTopColor: palette.border }} className="flex-row justify-between mt-2 pt-2 border-t">
                <Text style={{ color: palette.paragraphMuted }} className="text-[11px]">Latência: {testResult.latencyMs} ms</Text>
                {testResult.status && <Text style={{ color: palette.paragraphMuted }} className="text-[11px]">Status HTTP: {testResult.status}</Text>}
              </View>
            </View>
          )}
        </View>

        {/* Seção Sobre */}
        <View style={{ backgroundColor: `${palette.surface}80`, borderColor: palette.border }} className="rounded-2xl p-4 items-center border">
          <Text style={{ color: palette.paragraphMuted }} className="text-xs font-medium">posta.ai v1.0.0 (Supabase Serverless)</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
