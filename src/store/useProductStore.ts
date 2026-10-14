import { create } from 'zustand';

import type { Produto } from '@/types/product';

export type NovoProduto = Pick<Produto, 'nome' | 'condicao' | 'categoria' | 'fotos' | 'observacoes_usuario' | 'preco_usuario'>;

interface ProductState {
  produtos: Produto[];
  addProduto: (produto: NovoProduto) => Produto;
}

function generateId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  );
}

export const useProductStore = create<ProductState>((set) => ({
  produtos: [],
  addProduto: (novo) => {
    const produto: Produto = {
      ...novo,
      id: generateId(),
      created_at: new Date().toISOString(),
      status: 'pendente',
    };
    // Mais recentes primeiro.
    set((state) => ({ produtos: [produto, ...state.produtos] }));
    return produto;
  },
}));
