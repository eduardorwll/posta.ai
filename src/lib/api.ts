import { Platform } from 'react-native';
import type { Produto } from '@/types/product';
import { useApiConfigStore } from '@/store/useApiConfigStore';

export function getApiBaseUrl(): string {
  const url = useApiConfigStore.getState().apiUrl || 'http://100.110.221.21:8000';
  return url.trim().replace(/\/+$/, '');
}

export interface ApiError {
  message: string;
  detail?: string;
}

export class ApiException extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public detail?: string
  ) {
    super(message);
    this.name = 'ApiException';
    Object.setPrototypeOf(this, ApiException.prototype);
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `Erro ${response.status}`;
    let errorDetail: string | undefined;

    try {
      const errorData = await response.json();
      if (errorData) {
        if (typeof errorData.detail === 'string') {
          errorDetail = errorData.detail;
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
          errorDetail = errorMessage;
        } else if (errorData.message) {
          errorMessage = errorData.message;
          errorDetail = errorData.message;
        }
      }
    } catch {
      errorMessage = response.statusText || errorMessage;
    }

    throw new ApiException(errorMessage, response.status, errorDetail);
  }

  return response.json();
}

export interface EnviarProdutoParams {
  nome: string;
  condicao: string;
  categoria: string;
  observacoes_usuario: string;
  preco_usuario: number;
  fotos: string[];
}

export async function enviarProduto(params: EnviarProdutoParams): Promise<Produto> {
  const formData = new FormData();

  formData.append('nome', params.nome);
  formData.append('condicao', params.condicao);
  formData.append('categoria', params.categoria);
  formData.append('observacoes_usuario', params.observacoes_usuario);
  formData.append('preco_usuario', params.preco_usuario.toString());

  for (let i = 0; i < params.fotos.length; i++) {
    const rawUri = params.fotos[i];
    let uri = rawUri;
    // On Android, file URI must have a scheme like file:// or content://
    if (Platform.OS === 'android' && !uri.startsWith('file://') && !uri.startsWith('content://')) {
      uri = `file://${uri}`;
    }

    const filename = uri.split('/').pop() || `photo_${i}.jpg`;
    const cleanFilename = filename.split('?')[0];
    const match = /\.(\w+)$/.exec(cleanFilename);
    const ext = match ? match[1].toLowerCase() : 'jpg';
    let type = 'image/jpeg';
    if (ext === 'png') type = 'image/png';
    else if (ext === 'webp') type = 'image/webp';
    else if (ext === 'heic' || ext === 'heif') type = 'image/heic';
    const finalName = cleanFilename.includes('.') ? cleanFilename : `photo_${i}.${ext}`;

    formData.append('fotos', {
      uri,
      name: finalName,
      type,
    } as any);
  }

  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/produtos`, {
    method: 'POST',
    body: formData,
  });

  return handleResponse<Produto>(response);
}

export async function obterProdutos(): Promise<Produto[]> {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/produtos`);
  return handleResponse<Produto[]>(response);
}

export async function obterProduto(id: string): Promise<Produto> {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/produtos/${id}`);
  return handleResponse<Produto>(response);
}

export interface TesteConexaoResult {
  success: boolean;
  status?: number;
  latencyMs: number;
  message: string;
}

export async function testarConexaoApi(url: string): Promise<TesteConexaoResult> {
  const cleanUrl = url.trim().replace(/\/+$/, '');
  const startTime = Date.now();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${cleanUrl}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (response.ok) {
      return {
        success: true,
        status: response.status,
        latencyMs,
        message: 'Conexão bem-sucedida!',
      };
    } else {
      return {
        success: false,
        status: response.status,
        latencyMs,
        message: `Servidor respondeu com status ${response.status}`,
      };
    }
  } catch (error: any) {
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;
    let message = 'Falha ao conectar com o servidor';
    if (error.name === 'AbortError' || (error.message && error.message.toLowerCase().includes('cancel'))) {
      message = 'Tempo limite esgotado (> 5s). Verifique se o servidor está acessível na rede.';
    } else if (error.message) {
      message = error.message;
    }
    return {
      success: false,
      latencyMs,
      message,
    };
  }
}
