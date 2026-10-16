-- ==============================================================================
-- posta.ai — Script Canônico Consolidado de Setup para Supabase Cloud
-- Execute este script no SQL Editor do seu projeto Supabase (Dashboard -> SQL Editor)
-- Inclui suporte completo a Multi-Usuário, RLS e Isolamento de Fotos por Vendedor.
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
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
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

-- Garantir coluna user_id caso a tabela já existisse
DO $$ BEGIN
    ALTER TABLE produtos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
EXCEPTION
    WHEN others THEN null;
END $$;

-- Índices de Catálogo e Desempenho
CREATE INDEX IF NOT EXISTS idx_produtos_created_at ON produtos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_produtos_user_created ON produtos(user_id, created_at DESC);

-- 4. Row Level Security (RLS) na Tabela de Produtos
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura pública de produtos" ON produtos;
DROP POLICY IF EXISTS "Permitir inserção de produtos" ON produtos;
DROP POLICY IF EXISTS "Permitir atualização de produtos" ON produtos;
DROP POLICY IF EXISTS "Vendedores visualizam apenas seus próprios produtos" ON produtos;
DROP POLICY IF EXISTS "Vendedores inserem apenas seus próprios produtos" ON produtos;
DROP POLICY IF EXISTS "Vendedores atualizam apenas seus próprios produtos" ON produtos;
DROP POLICY IF EXISTS "Vendedores removem apenas seus próprios produtos" ON produtos;

-- Políticas de isolamento restrito por vendedor autenticado
CREATE POLICY "Vendedores visualizam apenas seus próprios produtos"
    ON produtos FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Vendedores inserem apenas seus próprios produtos"
    ON produtos FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Vendedores atualizam apenas seus próprios produtos"
    ON produtos FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Vendedores removem apenas seus próprios produtos"
    ON produtos FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = user_id);

-- 5. Configuração do Bucket 'produtos' no Supabase Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('produtos', 'produtos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas de Acesso ao Storage com isolamento de pasta {user_id}/{produto_id}/...
DROP POLICY IF EXISTS "Fotos de produtos públicas para leitura" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload de fotos de produtos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir remoção de fotos de produtos" ON storage.objects;
DROP POLICY IF EXISTS "Fotos de produtos acessíveis publicamente" ON storage.objects;
DROP POLICY IF EXISTS "Vendedor faz upload de fotos em sua pasta" ON storage.objects;
DROP POLICY IF EXISTS "Vendedor remove fotos de sua pasta" ON storage.objects;
DROP POLICY IF EXISTS "Vendedor atualiza fotos de sua pasta" ON storage.objects;

CREATE POLICY "Fotos de produtos acessíveis publicamente"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'produtos');

CREATE POLICY "Vendedor faz upload de fotos em sua pasta"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'produtos' AND
        (storage.foldername(name))[1] = (select auth.uid())::text
    );

CREATE POLICY "Vendedor atualiza fotos de sua pasta"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'produtos' AND
        (storage.foldername(name))[1] = (select auth.uid())::text
    )
    WITH CHECK (
        bucket_id = 'produtos' AND
        (storage.foldername(name))[1] = (select auth.uid())::text
    );

CREATE POLICY "Vendedor remove fotos de sua pasta"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'produtos' AND
        (storage.foldername(name))[1] = (select auth.uid())::text
    );

-- 6. Força recarga imediata do cache de schemas do PostgREST
NOTIFY pgrst, 'reload schema';
