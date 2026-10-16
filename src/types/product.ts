export type ProductStatus =
  | 'pendente'
  | 'processando_ia'
  | 'aguardando_aprovacao'
  | 'pronto'
  | 'publicado'
  | 'erro';

export type ProductCondition = 'novo' | 'como_novo' | 'seminovo' | 'usado';

export type ProductCategory =
  | 'roupas_acessorios'
  | 'eletronicos'
  | 'livros'
  | 'instrumentos_musicais'
  | 'casa_decoracao'
  | 'diversos';

export const CONDITION_LABELS: Record<ProductCondition, string> = {
  novo: 'Novo',
  como_novo: 'Como novo',
  seminovo: 'Seminovo',
  usado: 'Usado',
};

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  roupas_acessorios: 'Roupas e Acessórios',
  eletronicos: 'Eletrônicos',
  livros: 'Livros',
  instrumentos_musicais: 'Instrumentos',
  casa_decoracao: 'Casa e Decoração',
  diversos: 'Diversos',
};

export interface Produto {
  id: string;
  created_at: string;
  user_id?: string;
  fotos: string[];
  observacoes_usuario: string;
  preco_usuario: number;
  status: ProductStatus;
  condicao: ProductCondition;
  categoria: ProductCategory;
  nome?: string;
  descricao_curta?: string;
  descricao_longa?: string;
  preco_medio_mercado?: number;
  preco_sugerido?: number;
}
