-- ==============================================================================
-- Migração: Hardening de Segurança e Resolução dos Alertas do Supabase Advisor
-- Versão: 20261016000001_security_hardening.sql
-- ==============================================================================
-- 1. function_search_path_mutable & anon/authenticated_security_definer_function_executable:
--    - Define search_path fixo em 'public' para prevenir ataques de sequestro de schema (CWE-426).
--    - Revoga EXECUTE de 'anon' e 'authenticated' para impedir que clientes esgotem a cota de IA.
--    - Garante permissão EXCLUSIVA de execução para a role 'service_role' (Edge Functions).
-- 2. public_bucket_allows_listing:
--    - Remove a política ampla de SELECT na tabela storage.objects que permitia scraping de pastas.
--    - Restringe SELECT de storage.objects apenas para a pasta do vendedor autenticado.
--    - Mantém URLs públicas de fotos funcionando via CDN nativo do bucket público.
-- 3. rls_auto_enable:
--    - Revoga permissão pública de execução caso a função exista no banco.
-- ==============================================================================

-- 1. Recria a função de quota com search_path seguro e blindado
CREATE OR REPLACE FUNCTION public.consumir_quota_ia(max_por_minuto INT DEFAULT 5)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    rec RECORD;
    agora TIMESTAMPTZ := NOW();
BEGIN
    SELECT * INTO rec 
    FROM public.ia_rate_limiter 
    WHERE chave = 'gemini_global' 
    FOR UPDATE;

    IF agora >= rec.janela_inicio + INTERVAL '60 seconds' THEN
        UPDATE public.ia_rate_limiter 
        SET chamadas = 1, janela_inicio = agora 
        WHERE chave = 'gemini_global';
        RETURN TRUE;
    END IF;

    IF rec.chamadas >= max_por_minuto THEN
        RETURN FALSE;
    END IF;

    UPDATE public.ia_rate_limiter 
    SET chamadas = rec.chamadas + 1 
    WHERE chave = 'gemini_global';

    RETURN TRUE;
END;
$$;

-- 2. Revoga acesso público e restringe execução do rate limiter EXCLUSIVAMENTE à service_role
REVOKE EXECUTE ON FUNCTION public.consumir_quota_ia(INT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.consumir_quota_ia(INT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.consumir_quota_ia(INT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.consumir_quota_ia(INT) TO service_role;

-- 3. Revoga acesso público à função utilitária rls_auto_enable (se existir)
DO $$ BEGIN
    REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.rls_auto_enable() TO postgres, service_role;
EXCEPTION
    WHEN undefined_function THEN null;
END $$;

-- 4. Corrige a política de listagem do bucket 'produtos' (evita scraping e listagem de fotos de terceiros)
DROP POLICY IF EXISTS "Fotos de produtos acessíveis publicamente" ON storage.objects;

-- Permite visualização/listagem via RLS apenas para o vendedor autenticado em sua respectiva pasta
DROP POLICY IF EXISTS "Vendedor visualiza e lista fotos de sua pasta" ON storage.objects;
CREATE POLICY "Vendedor visualiza e lista fotos de sua pasta"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'produtos' AND
        (storage.foldername(name))[1] = (select auth.uid())::text
    );

-- 5. Recarrega o cache de schemas do PostgREST imediatamente
NOTIFY pgrst, 'reload schema';
