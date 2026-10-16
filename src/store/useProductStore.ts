import { create } from 'zustand';

import type { Produto } from '@/types/product';
import { enviarProduto, obterProdutos, type EnviarProdutoParams } from '@/lib/api';

export type NovoProduto = Pick<Produto, 'nome' | 'condicao' | 'categoria' | 'fotos' | 'observacoes_usuario' | 'preco_usuario'>;

interface ProductState {
  produtos: Produto[];
  isLoading: boolean;
  error: string | null;
  fetchProdutos: () => Promise<void>;
  cadastrarProduto: (produto: EnviarProdutoParams) => Promise<Produto>;
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

  clearError: () => set({ error: null }),
  resetProdutos: () => set({ produtos: [], isLoading: false, error: null }),
}));
