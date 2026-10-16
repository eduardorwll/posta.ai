import { Platform } from 'react-native';
import { decode } from 'base64-arraybuffer';
import { ImageManipulator, manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { supabase, isSupabaseConfigured } from './supabase';
import type { Produto } from '@/types/product';

export function getApiBaseUrl(): string {
  return process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://supabase.co';
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

function normalizarUri(rawUri: string): string {
  let uri = rawUri;
  if (Platform.OS === 'android' && !uri.startsWith('file://') && !uri.startsWith('content://')) {
    uri = `file://${uri}`;
  }
  return uri;
}

function gerarUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Otimização e downsampling de imagem no nível nativo (C++/Java).
 * Reduz fotos de câmeras de alta resolução (50MP) para Full HD (1920px máx)
 * fora da heap JavaScript do motor Hermes, gerando a representação Base64/JPEG otimizada.
 */
async function otimizarFotoParaUpload(uri: string): Promise<{ base64?: string; uri: string }> {
  const safeUri = normalizarUri(uri);

  try {
    const context = ImageManipulator.manipulate(safeUri);
    const initialRef = await context.renderAsync();

    if (initialRef.width > 1920 || initialRef.height > 1920) {
      if (initialRef.width >= initialRef.height) {
        context.resize({ width: 1920 });
      } else {
        context.resize({ height: 1920 });
      }
      const rendered = await context.renderAsync();
      const result = await rendered.saveAsync({
        format: SaveFormat.JPEG,
        compress: 0.85,
        base64: true,
      });
      return { uri: result.uri, base64: result.base64 };
    }

    const result = await initialRef.saveAsync({
      format: SaveFormat.JPEG,
      compress: 0.85,
      base64: true,
    });
    return { uri: result.uri, base64: result.base64 };
  } catch {
    try {
      const fallback = await manipulateAsync(
        safeUri,
        [{ resize: { width: 1920 } }],
        { format: SaveFormat.JPEG, compress: 0.85, base64: true }
      );
      return { uri: fallback.uri, base64: fallback.base64 };
    } catch {
      return { uri: safeUri };
    }
  }
}

export interface EnviarProdutoParams {
  nome: string;
  condicao: string;
  categoria: string;
  observacoes_usuario: string;
  preco_usuario: number;
  fotos: string[];
}

/**
 * Módulo Profundo: cadastrarProduto
 * Upload direto de imagens no Supabase Storage com ArrayBuffer e persistência relacional no PostgreSQL.
 * Implementa rollback atômico: se a gravação no banco falhar, remove as fotos enviadas do bucket.
 */
export async function cadastrarProduto(params: EnviarProdutoParams): Promise<Produto> {
  if (!isSupabaseConfigured) {
    throw new ApiException(
      'Supabase não configurado. Adicione EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.',
      500
    );
  }

  // Checagem defensiva de sessão ativa: aborta antes do processamento de fotos para economizar rede móvel
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new ApiException(
      'Sessão expirada ou usuário não autenticado. Por favor, acesse sua conta novamente para cadastrar o produto.',
      401
    );
  }

  const produtoId = gerarUuid();
  const uploadedUrls: string[] = [];
  const uploadedPaths: string[] = [];

  try {
    // 1. Processar e fazer upload de todas as fotos para a pasta do vendedor {user_id}/{produto_id}/...
    for (let i = 0; i < params.fotos.length; i++) {
      const rawUri = params.fotos[i];
      const optimized = await otimizarFotoParaUpload(rawUri);
      const filePath = `${user.id}/${produtoId}/foto_${i}.jpg`;

      let arrayBuffer: ArrayBuffer;
      if (optimized.base64) {
        arrayBuffer = decode(optimized.base64);
      } else {
        const response = await fetch(optimized.uri);
        const blob = await response.blob();
        arrayBuffer = await blob.arrayBuffer();
      }

      const { error: uploadError } = await supabase.storage
        .from('produtos')
        .upload(filePath, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        throw new ApiException(`Erro no upload da foto ${i + 1}: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from('produtos')
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrlData.publicUrl);
      uploadedPaths.push(filePath);
    }

    // 2. Persistir registro na tabela 'produtos' no Supabase PostgreSQL com user_id
    const { data: row, error: dbError } = await supabase
      .from('produtos')
      .insert({
        id: produtoId,
        user_id: user.id,
        nome: params.nome.trim(),
        condicao: params.condicao,
        categoria: params.categoria,
        preco_usuario: params.preco_usuario,
        observacoes_usuario: params.observacoes_usuario?.trim() || '',
        fotos: uploadedUrls,
        status: 'pendente',
      })
      .select()
      .single();

    if (dbError) {
      throw new ApiException(`Erro ao salvar produto no banco: ${dbError.message}`);
    }

    return {
      id: row.id,
      created_at: row.created_at,
      user_id: row.user_id,
      nome: row.nome,
      condicao: row.condicao,
      categoria: row.categoria,
      observacoes_usuario: row.observacoes_usuario || '',
      preco_usuario: Number(row.preco_usuario),
      fotos: row.fotos || [],
      status: row.status,
      descricao_curta: row.descricao_curta,
      descricao_longa: row.descricao_longa,
      preco_medio_mercado: row.preco_medio_mercado ? Number(row.preco_medio_mercado) : undefined,
      preco_sugerido: row.preco_sugerido ? Number(row.preco_sugerido) : undefined,
    };
  } catch (error: any) {
    // Rollback defensivo: limpa fotos do Storage em caso de erro na transação
    if (uploadedPaths.length > 0) {
      await supabase.storage.from('produtos').remove(uploadedPaths).catch(() => {});
    }
    if (error instanceof ApiException) {
      throw error;
    }
    throw new ApiException(error?.message || 'Falha inesperada ao cadastrar produto', 500);
  }
}

// Alias de compatibilidade
export const enviarProduto = cadastrarProduto;

/**
 * Consulta o catálogo de produtos no Supabase ordenados por data decrescente
 * As regras de RLS garantem que apenas produtos do vendedor autenticado sejam retornados.
 */
export async function obterProdutos(): Promise<Produto[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return [];
  }

  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new ApiException(`Erro ao obter produtos: ${error.message}`);
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    created_at: row.created_at,
    user_id: row.user_id,
    nome: row.nome,
    condicao: row.condicao,
    categoria: row.categoria,
    observacoes_usuario: row.observacoes_usuario || '',
    preco_usuario: Number(row.preco_usuario),
    fotos: row.fotos || [],
    status: row.status,
    descricao_curta: row.descricao_curta,
    descricao_longa: row.descricao_longa,
    preco_medio_mercado: row.preco_medio_mercado ? Number(row.preco_medio_mercado) : undefined,
    preco_sugerido: row.preco_sugerido ? Number(row.preco_sugerido) : undefined,
  }));
}

/**
 * Consulta um produto específico por UUID
 */
export async function obterProduto(id: string): Promise<Produto> {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    throw new ApiException(error ? error.message : 'Produto não encontrado', 404);
  }

  return {
    id: data.id,
    created_at: data.created_at,
    user_id: data.user_id,
    nome: data.nome,
    condicao: data.condicao,
    categoria: data.categoria,
    observacoes_usuario: data.observacoes_usuario || '',
    preco_usuario: Number(data.preco_usuario),
    fotos: data.fotos || [],
    status: data.status,
    descricao_curta: data.descricao_curta,
    descricao_longa: data.descricao_longa,
    preco_medio_mercado: data.preco_medio_mercado ? Number(data.preco_medio_mercado) : undefined,
    preco_sugerido: data.preco_sugerido ? Number(data.preco_sugerido) : undefined,
  };
}

function extrairCaminhoStorage(urlOuPath: string): string | null {
  const marker = '/storage/v1/object/public/produtos/';
  const idx = urlOuPath.indexOf(marker);
  if (idx !== -1) {
    return urlOuPath.substring(idx + marker.length);
  }
  const altMarker = '/produtos/';
  const altIdx = urlOuPath.indexOf(altMarker);
  if (altIdx !== -1 && urlOuPath.startsWith('http')) {
    return urlOuPath.substring(altIdx + altMarker.length);
  }
  if (!urlOuPath.startsWith('http') && urlOuPath.includes('/')) {
    return urlOuPath;
  }
  return null;
}

/**
 * Atualiza campos de um produto existente no Supabase PostgreSQL
 */
export async function atualizarProduto(id: string, dados: Partial<Produto>): Promise<Produto> {
  const updatePayload: Record<string, any> = {};

  if (dados.nome !== undefined) updatePayload.nome = dados.nome.trim();
  if (dados.condicao !== undefined) updatePayload.condicao = dados.condicao;
  if (dados.categoria !== undefined) updatePayload.categoria = dados.categoria;
  if (dados.preco_usuario !== undefined) updatePayload.preco_usuario = dados.preco_usuario;
  if (dados.observacoes_usuario !== undefined) updatePayload.observacoes_usuario = dados.observacoes_usuario.trim();
  if (dados.status !== undefined) updatePayload.status = dados.status;
  if (dados.descricao_curta !== undefined) updatePayload.descricao_curta = dados.descricao_curta?.trim() || null;
  if (dados.descricao_longa !== undefined) updatePayload.descricao_longa = dados.descricao_longa?.trim() || null;
  if (dados.preco_medio_mercado !== undefined) updatePayload.preco_medio_mercado = dados.preco_medio_mercado;
  if (dados.preco_sugerido !== undefined) updatePayload.preco_sugerido = dados.preco_sugerido;
  if (dados.fotos !== undefined) updatePayload.fotos = dados.fotos;

  const { data: row, error } = await supabase
    .from('produtos')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error || !row) {
    throw new ApiException(error ? error.message : 'Falha ao atualizar produto');
  }

  return {
    id: row.id,
    created_at: row.created_at,
    user_id: row.user_id,
    nome: row.nome,
    condicao: row.condicao,
    categoria: row.categoria,
    observacoes_usuario: row.observacoes_usuario || '',
    preco_usuario: Number(row.preco_usuario),
    fotos: row.fotos || [],
    status: row.status,
    descricao_curta: row.descricao_curta,
    descricao_longa: row.descricao_longa,
    preco_medio_mercado: row.preco_medio_mercado ? Number(row.preco_medio_mercado) : undefined,
    preco_sugerido: row.preco_sugerido ? Number(row.preco_sugerido) : undefined,
  };
}

/**
 * Exclui um produto do banco de dados e remove suas fotos do Supabase Storage
 */
export async function removerProduto(id: string, fotos?: string[]): Promise<void> {
  let fotosParaDeletar = fotos;

  if (!fotosParaDeletar || fotosParaDeletar.length === 0) {
    try {
      const p = await obterProduto(id);
      fotosParaDeletar = p.fotos;
    } catch {
      // Continua se o produto já não puder ser lido
    }
  }

  const { error: dbError } = await supabase
    .from('produtos')
    .delete()
    .eq('id', id);

  if (dbError) {
    throw new ApiException(`Erro ao remover produto: ${dbError.message}`);
  }

  if (fotosParaDeletar && fotosParaDeletar.length > 0) {
    const filePaths = fotosParaDeletar
      .map(extrairCaminhoStorage)
      .filter((p): p is string => Boolean(p));

    if (filePaths.length > 0) {
      await supabase.storage.from('produtos').remove(filePaths).catch(() => {});
    }
  }
}


export interface TesteConexaoResult {
  success: boolean;
  status?: number;
  latencyMs: number;
  message: string;
}

/**
 * Probe de integridade e latência da conexão com o Supabase Cloud
 */
export async function testarConexaoApi(): Promise<TesteConexaoResult> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      latencyMs: 0,
      message: 'Configure as credenciais do Supabase no arquivo .env para testar.',
    };
  }

  const startTime = Date.now();
  try {
    const { error } = await supabase
      .from('produtos')
      .select('id', { count: 'exact', head: true });

    const latencyMs = Date.now() - startTime;

    if (error) {
      return {
        success: false,
        latencyMs,
        message: `Falha no Supabase: ${error.message}`,
      };
    }

    return {
      success: true,
      status: 200,
      latencyMs,
      message: 'Conexão com a Nuvem Supabase estabelecida com sucesso!',
    };
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    return {
      success: false,
      latencyMs,
      message: error?.message || 'Falha ao conectar com o Supabase Cloud.',
    };
  }
}

export interface EnriquecimentoIaResult {
  success: boolean;
  produto_id?: string;
  resultado?: {
    nome: string;
    descricao_curta: string;
    descricao_longa: string;
    categoria?: string;
    condicao_sugerida?: string;
    tags?: string[];
  };
  error?: string;
}

/**
 * Aciona o pipeline serverless de IA multimodal (Gemini 1.5 Flash-8B)
 * para gerar título comercial, descrição curta e descrição rica para marketplaces.
 */
export async function enriquecerProdutoComIa(produtoId: string): Promise<EnriquecimentoIaResult> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      error: 'Supabase não está configurado.',
    };
  }

  try {
    const { data, error } = await supabase.functions.invoke('enriquecer-produto', {
      body: { produto_id: produtoId },
    });

    if (error) {
      let detailMsg = error.message;
      try {
        if ('context' in error && (error as any).context && typeof (error as any).context.json === 'function') {
          const errBody = await (error as any).context.json();
          detailMsg = errBody?.error || errBody?.detalhes || JSON.stringify(errBody);
        }
      } catch {
        // Guarda defensiva
      }
      console.warn('[enriquecerProdutoComIa] Erro ao invocar Edge Function:', detailMsg);
      return {
        success: false,
        error: detailMsg || 'Falha ao processar anúncio com IA.',
      };
    }

    if (data?.error) {
      return {
        success: false,
        error: data.error,
      };
    }

    return {
      success: true,
      produto_id: data.produto_id,
      resultado: data.resultado,
    };
  } catch (err: any) {
    console.warn('[enriquecerProdutoComIa] Exceção na chamada de IA:', err);
    return {
      success: false,
      error: err?.message || 'Falha de comunicação com o servidor de IA.',
    };
  }
}

