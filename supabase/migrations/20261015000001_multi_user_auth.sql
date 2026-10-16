-- ==============================================================================
-- Migração: Autenticação Multi-Usuário e Isolamento RLS por Vendedor
-- Versão: 20261015000001_multi_user_auth.sql
-- ==============================================================================

-- 1. Adição da coluna user_id vinculada a auth.users
ALTER TABLE produtos 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();

-- 2. Índice composto para aceleração de consultas do catálogo por usuário e data
CREATE INDEX IF NOT EXISTS idx_produtos_user_created ON produtos(user_id, created_at DESC);

-- 3. Atualização das Políticas de Row Level Security (RLS) na Tabela de Produtos
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura pública de produtos" ON produtos;
DROP POLICY IF EXISTS "Permitir inserção de produtos" ON produtos;
DROP POLICY IF EXISTS "Permitir atualização de produtos" ON produtos;
DROP POLICY IF EXISTS "Vendedores visualizam apenas seus próprios produtos" ON produtos;
DROP POLICY IF EXISTS "Vendedores inserem apenas seus próprios produtos" ON produtos;
DROP POLICY IF EXISTS "Vendedores atualizam apenas seus próprios produtos" ON produtos;
DROP POLICY IF EXISTS "Vendedores removem apenas seus próprios produtos" ON produtos;

-- Vendedor autenticado visualiza apenas seus produtos
CREATE POLICY "Vendedores visualizam apenas seus próprios produtos"
    ON produtos FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

-- Vendedor autenticado insere produtos vinculados estritamente ao seu user_id
CREATE POLICY "Vendedores inserem apenas seus próprios produtos"
    ON produtos FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

-- Vendedor autenticado atualiza apenas seus próprios produtos
CREATE POLICY "Vendedores atualizam apenas seus próprios produtos"
    ON produtos FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- Vendedor autenticado remove apenas seus próprios produtos
CREATE POLICY "Vendedores removem apenas seus próprios produtos"
    ON produtos FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = user_id);

-- 4. Isolamento no Supabase Storage (Bucket 'produtos')
-- Estrutura de caminhos obrigatória: {user_id}/{produto_id}/foto_{index}.jpg

DROP POLICY IF EXISTS "Fotos de produtos públicas para leitura" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload de fotos de produtos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir remoção de fotos de produtos" ON storage.objects;
DROP POLICY IF EXISTS "Fotos de produtos acessíveis publicamente" ON storage.objects;
DROP POLICY IF EXISTS "Vendedor faz upload de fotos em sua pasta" ON storage.objects;
DROP POLICY IF EXISTS "Vendedor remove fotos de sua pasta" ON storage.objects;
DROP POLICY IF EXISTS "Vendedor atualiza fotos de sua pasta" ON storage.objects;

-- Leitura pública das fotos do bucket 'produtos' (para exibição no app e compartilhamento)
CREATE POLICY "Fotos de produtos acessíveis publicamente"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'produtos');

-- Upload permitido apenas se o primeiro segmento do caminho corresponder ao UUID do usuário autenticado
CREATE POLICY "Vendedor faz upload de fotos em sua pasta"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'produtos' AND
        (storage.foldername(name))[1] = (select auth.uid())::text
    );

-- Atualização de foto restrita à pasta do próprio usuário
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

-- Exclusão de foto restrita à pasta do próprio usuário
CREATE POLICY "Vendedor remove fotos de sua pasta"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'produtos' AND
        (storage.foldername(name))[1] = (select auth.uid())::text
    );

-- 5. Força recarga imediata do cache de schemas do PostgREST
NOTIFY pgrst, 'reload schema';
