import { create } from 'zustand';

import type { Produto } from '@/types/product';
import { enviarProduto, obterProdutos, enriquecerProdutoComIa, type EnviarProdutoParams } from '@/lib/api';

export type NovoProduto = Pick<Produto, 'nome' | 'condicao' | 'categoria' | 'fotos' | 'observacoes_usuario' | 'preco_usuario'>;

interface ProductState {
  produtos: Produto[];
  isLoading: boolean;
  error: string | null;
  fetchProdutos: () => Promise<void>;
  cadastrarProduto: (produto: EnviarProdutoParams) => Promise<Produto>;
  enriquecerProduto: (produtoId: string) => Promise<void>;
  clearError: () => void;
  resetProdutos: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  produtos: [],
  isLoading: false,
  error: null,

  fetchProdutos: async () => {
    set({ isLoading: true, error: null });
    try {
      const produtos = await obterProdutos();
      set({ produtos, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar produtos';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  cadastrarProduto: async (produto: EnviarProdutoParams) => {
    set({ isLoading: true, error: null });
    try {
      const novoProduto = await enviarProduto(produto);
      set((state) => ({
        produtos: [novoProduto, ...state.produtos],
        isLoading: false,
      }));
      return novoProduto;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao cadastrar produto';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  enriquecerProduto: async (produtoId: string) => {
    // 1. Marca o produto localmente como 'processando_ia'
    set((state) => ({
      produtos: state.produtos.map((p) =>
        p.id === produtoId ? { ...p, status: 'processando_ia' as const } : p
      ),
    }));

    try {
      const res = await enriquecerProdutoComIa(produtoId);
      if (res.success && res.resultado) {
        // 2. Atualiza localmente com os dados gerados pela IA
        set((state) => ({
          produtos: state.produtos.map((p) =>
            p.id === produtoId
              ? {
                  ...p,
                  nome: res.resultado?.nome || p.nome,
                  descricao_curta: res.resultado?.descricao_curta || p.descricao_curta,
                  descricao_longa: res.resultado?.descricao_longa || p.descricao_longa,
                  status: 'pronto' as const,
                }
              : p
          ),
        }));
      } else {
        // Em caso de indisponibilidade da IA, reverte para 'pendente'
        set((state) => ({
          produtos: state.produtos.map((p) =>
            p.id === produtoId ? { ...p, status: 'pendente' as const } : p
          ),
        }));
      }
    } catch {
      set((state) => ({
        produtos: state.produtos.map((p) =>
          p.id === produtoId ? { ...p, status: 'pendente' as const } : p
        ),
      }));
    }
  },

  clearError: () => set({ error: null }),
  resetProdutos: () => set({ produtos: [], isLoading: false, error: null }),
}));
