-- ==============================================================================
-- Migração Inicial: Schema Base do posta.ai
-- Versão: 20261015000000_init_schema.sql
-- ==============================================================================

-- 1. Extensões
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tipos ENUM Canônicos
DO $$ BEGIN
    CREATE TYPE status_produto AS ENUM (
        'pendente',
        'processando_ia',
        'aguardando_aprovacao',
        'pronto',
        'publicado',
        'erro'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE condicao_produto AS ENUM (
        'novo',
        'como_novo',
        'seminovo',
        'usado'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE categoria_produto AS ENUM (
        'roupas_acessorios',
        'eletronicos',
        'livros',
        'instrumentos_musicais',
        'casa_decoracao',
        'diversos'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Tabela Principal de Produtos
CREATE TABLE IF NOT EXISTS produtos (
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

-- Índice para ordenação rápida no catálogo
CREATE INDEX IF NOT EXISTS idx_produtos_created_at ON produtos(created_at DESC);

-- 4. Row Level Security (RLS) Inicial na Tabela de Produtos
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura pública de produtos" ON produtos;
CREATE POLICY "Permitir leitura pública de produtos"
    ON produtos FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Permitir inserção de produtos" ON produtos;
CREATE POLICY "Permitir inserção de produtos"
    ON produtos FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualização de produtos" ON produtos;
CREATE POLICY "Permitir atualização de produtos"
    ON produtos FOR UPDATE
    USING (true);

-- 5. Configuração do Bucket 'produtos' no Supabase Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('produtos', 'produtos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas Iniciais de Acesso ao Storage
DROP POLICY IF EXISTS "Fotos de produtos públicas para leitura" ON storage.objects;
CREATE POLICY "Fotos de produtos públicas para leitura"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'produtos');

DROP POLICY IF EXISTS "Permitir upload de fotos de produtos" ON storage.objects;
CREATE POLICY "Permitir upload de fotos de produtos"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'produtos');

DROP POLICY IF EXISTS "Permitir remoção de fotos de produtos" ON storage.objects;
CREATE POLICY "Permitir remoção de fotos de produtos"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'produtos');
