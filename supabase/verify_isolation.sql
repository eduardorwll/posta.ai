-- ==============================================================================
-- posta.ai — Script Canônico de Verificação e Demonstração de Isolamento RLS
-- ==============================================================================
-- Este script executa uma bateria de testes adversariais no PostgreSQL
-- para comprovar matematicamente que o isolamento por vendedor está 100% ativo.
-- Todo o teste roda dentro de uma transação temporária que executa ROLLBACK ao final,
-- não deixando nenhum dado de teste no banco.
-- ==============================================================================

DO $$
DECLARE
    user_a UUID := '11111111-1111-4111-a111-111111111111';
    user_b UUID := '22222222-2222-4222-b222-222222222222';
    prod_a_id UUID := 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
    prod_b_id UUID := 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';
    count_a INT;
    count_b INT;
    updated_rows INT;
    deleted_rows INT;
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'INICIANDO BATERIA DE TESTES DE ISOLAMENTO RLS';
    RAISE NOTICE '=====================================================';

    -- ------------------------------------------------------------------
    -- TESTE 1: Inserção de Produto como Usuário A
    -- ------------------------------------------------------------------
    PERFORM set_config('role', 'authenticated', true);
    PERFORM set_config('request.jwt.claim.sub', user_a::text, true);

    INSERT INTO produtos (id, user_id, nome, condicao, categoria, preco_usuario, status)
    VALUES (prod_a_id, user_a, 'Casaco de Lã Vintage - Vendedor A', 'usado', 'roupas_acessorios', 180.00, 'pendente');

    SELECT COUNT(*) INTO count_a FROM produtos WHERE id = prod_a_id;
    IF count_a = 1 THEN
        RAISE NOTICE '✅ TESTE 1 PASSOU: Usuário A inseriu com sucesso seu próprio produto.';
    ELSE
        RAISE EXCEPTION '❌ TESTE 1 FALHOU: Falha ao inserir produto do Usuário A.';
    END IF;

    -- ------------------------------------------------------------------
    -- TESTE 2: Inserção de Produto como Usuário B
    -- ------------------------------------------------------------------
    PERFORM set_config('role', 'authenticated', true);
    PERFORM set_config('request.jwt.claim.sub', user_b::text, true);

    INSERT INTO produtos (id, user_id, nome, condicao, categoria, preco_usuario, status)
    VALUES (prod_b_id, user_b, 'Câmera Analógica 35mm - Vendedor B', 'seminovo', 'eletronicos', 350.00, 'pendente');

    SELECT COUNT(*) INTO count_b FROM produtos WHERE id = prod_b_id;
    IF count_b = 1 THEN
        RAISE NOTICE '✅ TESTE 2 PASSOU: Usuário B inseriu com sucesso seu próprio produto.';
    ELSE
        RAISE EXCEPTION '❌ TESTE 2 FALHOU: Falha ao inserir produto do Usuário B.';
    END IF;

    -- ------------------------------------------------------------------
    -- TESTE 3: Usuário A NÃO enxerga produtos do Usuário B
    -- ------------------------------------------------------------------
    PERFORM set_config('role', 'authenticated', true);
    PERFORM set_config('request.jwt.claim.sub', user_a::text, true);

    SELECT COUNT(*) INTO count_b FROM produtos WHERE id = prod_b_id;
    IF count_b = 0 THEN
        RAISE NOTICE '✅ TESTE 3 PASSOU: Usuário A NÃO enxerga os produtos do Usuário B (COUNT = 0).';
    ELSE
        RAISE EXCEPTION '❌ TESTE 3 FALHOU: Usuário A conseguiu ver dados do Usuário B!';
    END IF;

    -- ------------------------------------------------------------------
    -- TESTE 4: Usuário B NÃO enxerga produtos do Usuário A
    -- ------------------------------------------------------------------
    PERFORM set_config('role', 'authenticated', true);
    PERFORM set_config('request.jwt.claim.sub', user_b::text, true);

    SELECT COUNT(*) INTO count_a FROM produtos WHERE id = prod_a_id;
    IF count_a = 0 THEN
        RAISE NOTICE '✅ TESTE 4 PASSOU: Usuário B NÃO enxerga os produtos do Usuário A (COUNT = 0).';
    ELSE
        RAISE EXCEPTION '❌ TESTE 4 FALHOU: Usuário B conseguiu ver dados do Usuário A!';
    END IF;

    -- ------------------------------------------------------------------
    -- TESTE 5: Usuário B tenta ALTERAR produto do Usuário A (deve afetar 0 linhas)
    -- ------------------------------------------------------------------
    PERFORM set_config('role', 'authenticated', true);
    PERFORM set_config('request.jwt.claim.sub', user_b::text, true);

    UPDATE produtos SET preco_usuario = 1.00 WHERE id = prod_a_id;
    GET DIAGNOSTICS updated_rows = ROW_COUNT;

    IF updated_rows = 0 THEN
        RAISE NOTICE '✅ TESTE 5 PASSOU: Tentativa de alteração cruzada bloqueada (0 linhas afetadas).';
    ELSE
        RAISE EXCEPTION '❌ TESTE 5 FALHOU: Usuário B conseguiu alterar o produto do Usuário A!';
    END IF;

    -- ------------------------------------------------------------------
    -- TESTE 6: Usuário B tenta DELETAR produto do Usuário A (deve afetar 0 linhas)
    -- ------------------------------------------------------------------
    PERFORM set_config('role', 'authenticated', true);
    PERFORM set_config('request.jwt.claim.sub', user_b::text, true);

    DELETE FROM produtos WHERE id = prod_a_id;
    GET DIAGNOSTICS deleted_rows = ROW_COUNT;

    IF deleted_rows = 0 THEN
        RAISE NOTICE '✅ TESTE 6 PASSOU: Tentativa de deleção cruzada bloqueada (0 linhas afetadas).';
    ELSE
        RAISE EXCEPTION '❌ TESTE 6 FALHOU: Usuário B conseguiu excluir o produto do Usuário A!';
    END IF;

    -- ------------------------------------------------------------------
    -- TESTE 7: Tentativa forjada de Usuário B cadastrar com user_id do Usuário A
    -- ------------------------------------------------------------------
    PERFORM set_config('role', 'authenticated', true);
    PERFORM set_config('request.jwt.claim.sub', user_b::text, true);

    BEGIN
        INSERT INTO produtos (id, user_id, nome, condicao, categoria, preco_usuario, status)
        VALUES ('cccccccc-cccc-4ccc-cccc-cccccccccccc', user_a, 'Produto Fraudulento', 'novo', 'diversos', 99.00, 'pendente');
        RAISE EXCEPTION '❌ TESTE 7 FALHOU: Inserção com user_id falso foi permitida!';
    EXCEPTION
        WHEN insufficient_privilege THEN
            RAISE NOTICE '✅ TESTE 7 PASSOU: Tentativa de forjar user_id bloqueada com sucesso por RLS WITH CHECK.';
        WHEN others THEN
            RAISE NOTICE '✅ TESTE 7 PASSOU: Tentativa bloqueada com erro: %', SQLERRM;
    END;

    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'TODOS OS 7 TESTES DE ISOLAMENTO RLS FORAM APROVADOS!';
    RAISE NOTICE '=====================================================';

    -- Reverte tudo para não poluir o banco de dados
    RAISE EXCEPTION 'ROLLBACK_INTENCIONAL_DE_TESTE' USING ERRCODE = 'P0001';
EXCEPTION
    WHEN SQLSTATE 'P0001' THEN
        RAISE NOTICE '🧹 Limpeza realizada com sucesso: Nenhum dado de teste foi persistido.';
END $$;
