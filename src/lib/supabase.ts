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
    // Injeta cabeçalhos canônicos de API (Accept e User-Agent) para prevenir bloqueios anti-bot
    const headers = new Headers(init?.headers);
    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json, text/plain, */*');
    }
    if (!headers.has('User-Agent')) {
      headers.set('User-Agent', 'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 posta-ai/1.0');
    }

    const modifiedInit = {
      ...init,
      headers,
    };

    const response = await fetch(input, modifiedInit);

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
        // Extrai o título da página HTML com limite de segurança
        const snippet = rawText.slice(0, 1500);
        const titleMatch = snippet.match(/<title[^>]*>(.*?)<\/title>/i);
        const pageTitle = titleMatch ? titleMatch[1].replace(/[\r\n\t]+/g, ' ').trim() : '';

        console.warn(`[Supabase customFetch Intercepted] Status: ${response.status} | Title: "${pageTitle}" | URL:`, typeof input === 'string' ? input : (input as any)?.url);

        let msgAmigavel = 'Instabilidade temporária na conexão com o servidor. Tente novamente em instantes.';
        const lowerRaw = snippet.toLowerCase();

        if (response.status === 403 || lowerRaw.includes('cloudflare') || lowerRaw.includes('access denied') || lowerRaw.includes('just a moment')) {
          msgAmigavel = `Acesso bloqueado por segurança (HTTP ${response.status}${pageTitle ? `: ${pageTitle}` : ''}). Se estiver com VPN ativa ou no Wi-Fi da universidade, tente alternar para dados móveis (4G/5G).`;
        } else if (lowerRaw.includes('captive') || lowerRaw.includes('portal') || lowerRaw.includes('hotspot') || lowerRaw.includes('autentica')) {
          msgAmigavel = `Rede Wi-Fi interceptou a conexão (${pageTitle || 'Portal Cativo'}). Verifique sua conexão ou use dados móveis.`;
        } else if (response.status === 429 || lowerRaw.includes('rate limit')) {
          msgAmigavel = 'Limite temporário de requisições atingido no Supabase (HTTP 429). Aguarde alguns instantes e tente novamente.';
        } else if (response.status >= 500 && response.status <= 504) {
          msgAmigavel = `Servidor indisponível temporariamente (HTTP ${response.status}${pageTitle ? `: ${pageTitle}` : ''}). Tente em instantes.`;
        } else if (pageTitle) {
          msgAmigavel = `Erro de rede (HTTP ${response.status}: ${pageTitle}). Verifique sua conexão.`;
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
