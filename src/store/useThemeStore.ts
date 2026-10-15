import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'

export type ThemeMode = 'dark' | 'light' | 'system'

interface ThemeState {
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => Promise<void>
  initTheme: () => Promise<void>
}

const THEME_STORAGE_KEY = 'posta_ai_theme_mode'

export const useThemeStore = create<ThemeState>((set) => ({
  themeMode: 'dark',
  setThemeMode: async (mode: ThemeMode) => {
    try {
      await SecureStore.setItemAsync(THEME_STORAGE_KEY, mode)
      set({ themeMode: mode })
    } catch (error) {
      console.error('Erro ao salvar tema:', error)
      set({ themeMode: mode })
    }
  },
  initTheme: async () => {
    try {
      const stored = await SecureStore.getItemAsync(THEME_STORAGE_KEY)
      if (stored === 'dark' || stored === 'light' || stored === 'system') {
        set({ themeMode: stored })
      }
    } catch (error) {
      console.error('Erro ao carregar tema:', error)
    }
  },
}))
