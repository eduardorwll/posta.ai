-- ==============================================================================
-- Migração: Limitador Global de Taxa de IA (Gemini Hard Rate Limiter)
-- Versão: 20261016000000_ia_global_rate_limiter.sql
-- ==============================================================================
-- Garante matematicamente que é IMPOSSÍVEL exceder N chamadas por minuto
-- somando TODOS os usuários simultâneos do sistema.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.ia_rate_limiter (
    chave TEXT PRIMARY KEY,
    chamadas INT NOT NULL DEFAULT 0,
    janela_inicio TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insere o registro global caso ainda não exista
INSERT INTO public.ia_rate_limiter (chave, chamadas, janela_inicio)
VALUES ('gemini_global', 0, NOW())
ON CONFLICT (chave) DO NOTHING;

-- Habilita RLS na tabela para segurança
ALTER TABLE public.ia_rate_limiter ENABLE ROW LEVEL SECURITY;

-- Função atômica com trava de linha (SELECT ... FOR UPDATE) executada com permissões de serviço
CREATE OR REPLACE FUNCTION public.consumir_quota_ia(max_por_minuto INT DEFAULT 5)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    rec RECORD;
    agora TIMESTAMPTZ := NOW();
BEGIN
    -- Trava atômica serializada na linha única do limitador global
    SELECT * INTO rec 
    FROM public.ia_rate_limiter 
    WHERE chave = 'gemini_global' 
    FOR UPDATE;

    -- Se a janela atual já passou de 60 segundos, reinicia a contagem
    IF agora >= rec.janela_inicio + INTERVAL '60 seconds' THEN
        UPDATE public.ia_rate_limiter 
        SET chamadas = 1, janela_inicio = agora 
        WHERE chave = 'gemini_global';
        RETURN TRUE;
    END IF;

    -- Se já atingiu o limite estrito dentro da janela de 60s, bloqueia
    IF rec.chamadas >= max_por_minuto THEN
        RETURN FALSE;
    END IF;

    -- Caso contrário, incrementa a contagem de forma atômica
    UPDATE public.ia_rate_limiter 
    SET chamadas = rec.chamadas + 1 
    WHERE chave = 'gemini_global';

    RETURN TRUE;
END;
$$;

-- Notifica o PostgREST para recarregar o schema cache imediatamente
NOTIFY pgrst, 'reload schema';
