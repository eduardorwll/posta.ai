import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = (process.env.EXPO_PUBLIC_SUPABASE_URL || '').trim().replace(/\/+$/, '');
export const supabaseAnonKey = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '').trim();

/**
 * Validação defensiva de configuração:
 * Identifica se as variáveis de ambiente reais foram preenchidas no .env
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('your-anon-key')
);

/**
 * Interceptor defensivo de rede para o cliente Supabase.
 * Previne erros de parsing fatal no Hermes ('JSON Parse error: Unexpected character: <')
 * quando gateways Cloudflare, portais cativos ou servidores retornam páginas HTML (502, 503, 504, 429)
 * em vez de respostas JSON formatadas.
 */
const customFetch: typeof fetch = async (input, init) => {
  try {
    const response = await fetch(input, init);

    // Se a requisição foi bem-sucedida (status 2xx ou 3xx), passa diretamente sem overhead
    if (response.ok) {
      return response;
    }

    const contentType = (response.headers.get('content-type') || '').toLowerCase();

    // Se o status for de erro e o conteúdo for HTML ou texto plano
    if (contentType.includes('text/html') || contentType.includes('text/plain')) {
      const rawText = await response.text();

      // Se começar com tag HTML ou doctype (ex: <!DOCTYPE html>, <html>, etc.)
      if (rawText.trim().startsWith('<')) {
        let msgAmigavel = 'Instabilidade temporária na conexão com o servidor. Tente novamente em instantes.';
        if (response.status === 429) {
          msgAmigavel = 'Limite temporário de requisições atingido. Aguarde alguns instantes e tente novamente.';
        } else if (response.status >= 500 && response.status <= 504) {
          msgAmigavel = 'Servidor temporariamente indisponível. Aguarde alguns instantes e tente novamente.';
        }

        return new Response(
          JSON.stringify({
            message: msgAmigavel,
            msg: msgAmigavel,
            error: 'gateway_error',
            status: response.status,
          }),
          {
            status: response.status,
            statusText: response.statusText,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Se não era HTML, recria a resposta para os parsers normais
      return new Response(rawText, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    }

    return response;
  } catch (err: any) {
    console.warn('[Supabase customFetch] Falha de rede:', err?.message);
    throw err;
  }
};

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    global: {
      fetch: customFetch,
    },
  }
);
