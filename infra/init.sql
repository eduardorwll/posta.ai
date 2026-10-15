-- Ativar extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tipos ENUM
CREATE TYPE status_produto AS ENUM (
    'pendente',
    'processando_ia',
    'aguardando_aprovacao',
    'pronto',
    'publicado',
    'erro'
);

CREATE TYPE condicao_produto AS ENUM (
    'novo',
    'como_novo',
    'seminovo',
    'usado'
);

CREATE TYPE categoria_produto AS ENUM (
    'roupas_acessorios',
    'eletronicos',
    'livros',
    'instrumentos_musicais',
    'casa_decoracao',
    'diversos'
);

-- Tabela principal
CREATE TABLE produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fotos TEXT[] NOT NULL DEFAULT '{}',
    observacoes_usuario TEXT DEFAULT '',
    preco_usuario NUMERIC(10,2) NOT NULL,
    status status_produto NOT NULL DEFAULT 'pendente',
    condicao condicao_produto NOT NULL,
    categoria categoria_produto NOT NULL,
    nome TEXT,
    descricao_curta TEXT,
    descricao_longa TEXT,
    preco_medio_mercado NUMERIC(10,2),
    preco_sugerido NUMERIC(10,2)
);

-- Índice para ordenação
CREATE INDEX idx_produtos_created_at ON produtos(created_at DESC);