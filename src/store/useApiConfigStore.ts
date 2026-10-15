import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'

const STORAGE_KEY = 'posta_ai_api_url'
const DEFAULT_API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000'

interface ApiConfigState {
  apiUrl: string
  isInitialized: boolean
  setApiUrl: (url: string) => Promise<void>
  resetApiUrl: () => Promise<void>
  initApiConfig: () => Promise<void>
}

export const useApiConfigStore = create<ApiConfigState>((set) => ({
  apiUrl: DEFAULT_API_URL,
  isInitialized: false,
  setApiUrl: async (url: string) => {
    try {
      const cleanUrl = url.trim().replace(/\/+$/, '')
      await SecureStore.setItemAsync(STORAGE_KEY, cleanUrl)
      set({ apiUrl: cleanUrl })
    } catch (error) {
      console.error('Erro ao salvar URL da API:', error)
      set({ apiUrl: url.trim().replace(/\/+$/, '') })
    }
  },
  resetApiUrl: async () => {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEY)
      set({ apiUrl: DEFAULT_API_URL })
    } catch (error) {
      console.error('Erro ao resetar URL da API:', error)
      set({ apiUrl: DEFAULT_API_URL })
    }
  },
  initApiConfig: async () => {
    try {
      const savedUrl = await SecureStore.getItemAsync(STORAGE_KEY)
      if (savedUrl) {
        set({ apiUrl: savedUrl, isInitialized: true })
      } else {
        set({ isInitialized: true })
      }
    } catch (error) {
      console.error('Erro ao carregar URL da API:', error)
      set({ isInitialized: true })
    }
  },
}))
