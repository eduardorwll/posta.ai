import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { createURL, parse } from 'expo-linking';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useProductStore } from './useProductStore';
import { useDraftStore } from './useDraftStore';

export interface AuthState {
  user: User | null;
  session: Session | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // Ações
  initAuth: () => Promise<() => void>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; requiresEmailConfirmation?: boolean; error?: string }>;
  signOut: () => Promise<void>;
  handleDeepLink: (url: string) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}

let authSubscriptionCleanup: (() => void) | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isInitialized: false,
  isLoading: false,
  error: null,

  initAuth: async () => {
    // Se não estiver configurado o Supabase, marcamos como inicializado para não travar a UI
    if (!isSupabaseConfigured) {
      set({ isInitialized: true });
      return () => {};
    }

    // Se já houver uma subscription ativa, limpa a anterior antes de recriar
    if (authSubscriptionCleanup) {
      authSubscriptionCleanup();
      authSubscriptionCleanup = null;
    }

    try {
      // 1. Hidratação da sessão a partir do armazenamento persistente (AsyncStorage)
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!error && session) {
        set({ session, user: session.user, isInitialized: true });
      } else {
        set({ session: null, user: null, isInitialized: true });
      }
    } catch {
      set({ session: null, user: null, isInitialized: true });
    }

    // 2. Registro do listener reativo de alterações de estado de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user ?? null,
        isInitialized: true,
      });
    });

    authSubscriptionCleanup = () => {
      subscription.unsubscribe();
    };

    return authSubscriptionCleanup;
  },

  signInWithEmail: async (email, password) => {
    if (!isSupabaseConfigured) {
      const msg = 'Supabase não configurado. Verifique as variáveis de ambiente no arquivo .env.';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }

    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        set({ error: error.message, isLoading: false });
        return { success: false, error: error.message };
      }

      set({
        session: data.session,
        user: data.user,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (err: any) {
      const msg = err?.message || 'Falha ao autenticar. Tente novamente.';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  signUpWithEmail: async (email, password) => {
    if (!isSupabaseConfigured) {
      const msg = 'Supabase não configurado. Verifique as variáveis de ambiente no arquivo .env.';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }

    set({ isLoading: true, error: null });

    try {
      const redirectUrl = createURL('/') || 'postaaiapp://';

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        set({ error: error.message, isLoading: false });
        return { success: false, error: error.message };
      }

      // Se a confirmação de e-mail estiver ativa no projeto Supabase, data.session virá nula
      const requiresEmailConfirmation = !data.session;

      set({
        session: data.session,
        user: data.user,
        isLoading: false,
        error: null,
      });

      return {
        success: true,
        requiresEmailConfirmation,
      };
    } catch (err: any) {
      const msg = err?.message || 'Falha ao criar conta. Tente novamente.';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignora falha de rede ao deslogar para não reter usuário preso na tela
    } finally {
      // Limpeza atômica incondicional de produtos e rascunhos locais
      try {
        useProductStore.getState().resetProdutos();
        useDraftStore.getState().clearDraft();
      } catch {
        // Guarda defensiva
      }

      set({
        user: null,
        session: null,
        isLoading: false,
        error: null,
      });
    }
  },

  handleDeepLink: async (url: string) => {
    if (!url || !isSupabaseConfigured) {
      return { success: false };
    }

    const isAuthLink =
      url.includes('#access_token=') ||
      url.includes('?code=') ||
      url.includes('&code=') ||
      url.includes('token_hash=');

    if (!isAuthLink) {
      return { success: false };
    }

    set({ isLoading: true, error: null });

    try {
      // 1. Caso Implicit Flow (hash params: #access_token=...&refresh_token=...)
      if (url.includes('#')) {
        const hashPart = url.substring(url.indexOf('#') + 1);
        const params = new URLSearchParams(hashPart);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        if (access_token && refresh_token) {
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (error) {
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
          }

          set({
            session: data.session,
            user: data.session?.user ?? data.user ?? null,
            isLoading: false,
            error: null,
          });
          return { success: true };
        }
      }

      // 2. Caso PKCE Flow (?code=...) ou Token Hash (?token_hash=...&type=...)
      const parsed = parse(url);
      const code = parsed.queryParams?.code;
      if (typeof code === 'string') {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }

        set({
          session: data.session,
          user: data.session?.user ?? data.user ?? null,
          isLoading: false,
          error: null,
        });
        return { success: true };
      }

      const token_hash = parsed.queryParams?.token_hash;
      const type = parsed.queryParams?.type;
      if (typeof token_hash === 'string') {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: (type as any) || 'email',
        });

        if (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }

        set({
          session: data.session,
          user: data.session?.user ?? data.user ?? null,
          isLoading: false,
          error: null,
        });
        return { success: true };
      }

      set({ isLoading: false });
      return { success: false };
    } catch (err: any) {
      const msg = err?.message || 'Falha ao processar link de autenticação.';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
