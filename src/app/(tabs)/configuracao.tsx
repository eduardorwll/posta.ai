import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApiConfigStore } from '@/store/useApiConfigStore';
import { useThemeStore, ThemeMode } from '@/store/useThemeStore';
import { testarConexaoApi } from '@/lib/api';
import { AppHeader } from '@/components/AppHeader';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  CheckmarkCircle02Icon,
  Alert02Icon,
  RefreshIcon,
  ServerIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Settings01Icon,
  SparklesIcon,
  ShoppingBag01Icon,
} from '@hugeicons/core-free-icons';
import { MaxContentWidth, useAppTheme, Spacing } from '@/constants/theme';
import { haptic } from '@/lib/haptics';

export default function ConfiguracaoScreen() {
  const insets = useSafeAreaInsets();
  const { apiUrl, setApiUrl, initApiConfig, isInitialized } = useApiConfigStore();
  const { themeMode, setThemeMode } = useThemeStore();
  const { palette } = useAppTheme();

  // States
  const [tomVoz, setTomVoz] = useState<'Direto' | 'Brechó' | 'Detalhado'>('Brechó');
  const [sugestaoPreco, setSugestaoPreco] = useState(true);

  // Advanced settings accordion state
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [urlMode, setUrlMode] = useState<'Padrao' | 'Personalizado'>('Padrao');
  const tailscaleUrl = 'http://100.110.221.21:8000';
  const [inputValue, setInputValue] = useState(apiUrl);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    status?: number;
    latencyMs: number;
    message: string;
  } | null>(null);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      initApiConfig().then(() => {
        const current = useApiConfigStore.getState().apiUrl;
        setInputValue(current);
        if (current === tailscaleUrl) {
          setUrlMode('Padrao');
        } else {
          setUrlMode('Personalizado');
        }
      });
    }
  }, [isInitialized, initApiConfig]);

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

  const handleToggleAccordion = () => {
    haptic.light();
    setAdvancedOpen(!advancedOpen);
  };

  const handleUrlModeChange = (mode: 'Padrao' | 'Personalizado') => {
    haptic.selection();
    setUrlMode(mode);
  };

  const handleTest = async () => {
    haptic.light();
    setTesting(true);
    setTestResult(null);
    const targetUrl = urlMode === 'Padrao' ? tailscaleUrl : inputValue;
    const result = await testarConexaoApi(targetUrl);
    setTestResult(result);
    setTesting(false);

    if (result.success) {
      haptic.success();
    } else {
      haptic.error();
    }
  };

  const handleSave = async () => {
    haptic.medium();
    const targetUrl = urlMode === 'Padrao' ? tailscaleUrl : inputValue;
    await setApiUrl(targetUrl);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const canaisVenda = [
    { nome: 'Enjoei', status: 'Em breve' },
    { nome: 'Mercado Livre', status: 'Em breve' },
    { nome: 'Facebook Marketplace', status: 'Em breve' },
    { nome: 'OLX', status: 'Em breve' },
  ];

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

        {/* Seção Configurações Avançadas (Accordion) */}
        <View style={{ backgroundColor: palette.surface, borderColor: palette.border }} className="rounded-2xl mb-4 border overflow-hidden">
          <TouchableOpacity
            onPress={handleToggleAccordion}
            className="p-4 flex-row items-center justify-between active:opacity-75"
          >
            <View className="flex-row items-center">
              <HugeiconsIcon icon={ServerIcon} size={22} color={palette.highlight} strokeWidth={2} />
              <Text style={{ color: palette.headline }} className="font-bold text-base ml-2">Configurações Avançadas</Text>
            </View>
            <HugeiconsIcon
              icon={advancedOpen ? ArrowUp01Icon : ArrowDown01Icon}
              size={20}
              color={palette.paragraph}
              strokeWidth={2}
            />
          </TouchableOpacity>

          {advancedOpen && (
            <View style={{ borderTopColor: palette.border }} className="px-4 pb-4 pt-1 border-t">
              <Text style={{ color: palette.paragraph }} className="text-xs mb-3">Selecione o tipo de conexão com o servidor:</Text>
              <View className="flex-row gap-2 mb-4">
                {(['Padrao', 'Personalizado'] as const).map((mode) => {
                  const isSelected = urlMode === mode;
                  return (
                    <TouchableOpacity
                      key={mode}
                      onPress={() => handleUrlModeChange(mode)}
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
                        {mode === 'Padrao' ? 'Padrão' : 'Personalizado'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {urlMode === 'Personalizado' && (
                <TextInput
                  style={{ backgroundColor: palette.background, color: palette.headline, borderColor: palette.border }}
                  className="border rounded-xl px-4 py-3 text-base mb-4"
                  placeholder="http://192.168.1.50:8000"
                  placeholderTextColor={palette.paragraphMuted}
                  value={inputValue}
                  onChangeText={setInputValue}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />
              )}

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={handleTest}
                  disabled={testing}
                  style={{ backgroundColor: palette.background, borderColor: palette.highlight }}
                  className="flex-1 border rounded-xl py-3 items-center justify-center flex-row active:opacity-75"
                >
                  {testing ? (
                    <ActivityIndicator size="small" color={palette.highlight} />
                  ) : (
                    <>
                      <HugeiconsIcon icon={RefreshIcon} size={18} color={palette.highlight} strokeWidth={2} />
                      <Text style={{ color: palette.highlight }} className="font-bold ml-2">Testar Conexão</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSave}
                  style={{ backgroundColor: palette.highlight }}
                  className="flex-1 rounded-xl py-3 items-center justify-center shadow-lg active:opacity-85"
                >
                  <Text style={{ color: palette.onHighlight }} className="font-bold">Salvar</Text>
                </TouchableOpacity>
              </View>

              {savedMessage && (
                <View style={{ backgroundColor: palette.background, borderColor: palette.success }} className="mt-3 border rounded-xl p-3 flex-row items-center">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} color={palette.success} strokeWidth={2} />
                  <Text style={{ color: palette.success }} className="font-semibold text-sm ml-2">Configuração salva com sucesso!</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {testResult && (
          <View
            style={{
              backgroundColor: palette.surface,
              borderColor: testResult.success ? palette.success : palette.danger,
            }}
            className="rounded-2xl p-4 mb-4 border"
          >
            <View className="flex-row items-center mb-2">
              <HugeiconsIcon
                icon={testResult.success ? CheckmarkCircle02Icon : Alert02Icon}
                size={22}
                color={testResult.success ? palette.success : palette.danger}
                strokeWidth={2}
              />
              <Text
                style={{ color: testResult.success ? palette.success : palette.danger }}
                className="font-bold text-base ml-2">
                {testResult.success ? 'Conexão Estabelecida' : 'Falha na Conexão'}
              </Text>
            </View>
            <Text style={{ color: palette.paragraph }} className="text-sm mb-1">{testResult.message}</Text>
            <View style={{ borderTopColor: palette.border }} className="flex-row justify-between mt-2 pt-2 border-t">
              <Text style={{ color: palette.paragraph }} className="text-xs">Latência: {testResult.latencyMs} ms</Text>
              {testResult.status && <Text style={{ color: palette.paragraph }} className="text-xs">Status HTTP: {testResult.status}</Text>}
            </View>
          </View>
        )}

        {/* Seção Sobre */}
        <View style={{ backgroundColor: `${palette.surface}80`, borderColor: palette.border }} className="rounded-2xl p-4 items-center border">
          <Text style={{ color: palette.paragraphMuted }} className="text-xs font-medium">posta.ai v1.0.0 (Fase 3)</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
