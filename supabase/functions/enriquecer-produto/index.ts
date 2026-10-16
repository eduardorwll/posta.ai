import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Conversor seguro de ArrayBuffer para base64 em blocos para evitar estouro de pilha
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  const chunkSize = 8192;
  for (let i = 0; i < len; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + chunkSize, len)));
  }
  return btoa(binary);
}

serve(async (req: Request) => {
  // 1. Tratamento de requisições preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY') ?? '';
    const geminiModel = Deno.env.get('GEMINI_MODEL') ?? 'gemini-1.5-flash-8b';

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Configuração do Supabase incompleta na Edge Function.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({
          error:
            'Chave GEMINI_API_KEY não configurada nos secrets do Supabase. Configure com: supabase secrets set GEMINI_API_KEY=sua_chave',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Validação da Autenticação do Usuário via JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Cabeçalho de autorização não fornecido.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Cliente com permissões de serviço para consulta e atualização
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Valida o usuário que fez a requisição
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Token de autenticação inválido ou expirado.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Extração e Validação do Payload
    const body = await req.json().catch(() => ({}));
    const produtoId = body.produto_id;

    if (!produtoId) {
      return new Response(
        JSON.stringify({ error: 'O campo produto_id é obrigatório.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Busca do Produto e Verificação de Posse (Isolamento RLS)
    const { data: produto, error: produtoError } = await supabaseAdmin
      .from('produtos')
      .select('*')
      .eq('id', produtoId)
      .eq('user_id', user.id)
      .single();

    if (produtoError || !produto) {
      return new Response(
        JSON.stringify({ error: 'Produto não encontrado ou você não tem permissão para alterá-lo.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Marca produto como 'processando_ia'
    await supabaseAdmin
      .from('produtos')
      .update({ status: 'processando_ia' })
      .eq('id', produtoId);

    // 6. Download e Otimização das Fotos para o Gemini (258 tokens por foto)
    const fotos = Array.isArray(produto.fotos) ? produto.fotos.slice(0, 5) : [];
    const imageParts = [];

    for (const fotoUrl of fotos) {
      try {
        const res = await fetch(fotoUrl);
        if (res.ok) {
          const buffer = await res.arrayBuffer();
          const base64Data = arrayBufferToBase64(buffer);
          const mimeType = res.headers.get('content-type') || 'image/jpeg';
          imageParts.push({
            inlineData: {
              mimeType,
              data: base64Data,
            },
          });
        }
      } catch (err) {
        console.warn(`[enriquecer-produto] Falha ao carregar foto ${fotoUrl}:`, err);
      }
    }

    // 7. Montagem do Prompt de Visão Computacional para e-Commerce C2C
    const promptText = `Você é um especialista sênior em e-commerce e venda de itens de moda, brechó e eletrônicos em plataformas C2C (Enjoei, Mercado Livre, OLX e Facebook Marketplace).
Analise as fotos anexadas deste item e as observações fornecidas pelo vendedor para criar um anúncio atraente, profissional e altamente vendável.

DADOS FORNECIDOS PELO VENDEDOR:
- Nome/identificação inicial: "${produto.nome || 'Não informado'}"
- Observações: "${produto.observacoes_usuario || 'Nenhuma'}"
- Categoria declarada: "${produto.categoria}"
- Condição declarada: "${produto.condicao}"
- Preço desejado: "R$ ${produto.preco_usuario}"

DIRETRIZES OBRIGATÓRIAS:
1. nome: Título objetivo, claro e de alto clique (máximo 60 caracteres). Sem pontuações excessivas.
2. descricao_curta: Destaque em 2 a 3 linhas com os principais diferenciais e estilo da peça.
3. descricao_longa: Copywriting completo para marketplace com: detalhes do item, estado visual real de conservação, sugestão de ocasiões/estilo e apelo de fechamento de venda.
4. categoria: Sugira a categoria mais adequada dentre as opções permitidas.
5. condicao_sugerida: Sugira a condição com base nas fotos.
6. tags: 5 a 8 palavras-chave e termos de busca mais procurados.`;

    // 8. Chamada à API do Google Gemini com Structured Outputs (JSON Schema Estrito)
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;

    const geminiPayload = {
      contents: [
        {
          role: 'user',
          parts: [
            ...imageParts,
            { text: promptText },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            nome: {
              type: 'STRING',
              description: 'Título comercial atraente para marketplace, máximo 60 caracteres',
            },
            descricao_curta: {
              type: 'STRING',
              description: 'Resumo em 2 a 3 linhas destacando os pontos fortes do produto',
            },
            descricao_longa: {
              type: 'STRING',
              description: 'Descrição comercial completa para e-commerce (estado, detalhes, estilo e gatilhos)',
            },
            categoria: {
              type: 'STRING',
              enum: [
                'roupas_acessorios',
                'calcados',
                'bolsas_malas',
                'relogios_joias',
                'eletronicos',
                'casa_decoracao',
                'outros',
              ],
              description: 'Categoria que melhor classifica o item',
            },
            condicao_sugerida: {
              type: 'STRING',
              enum: ['novo', 'como_novo', 'seminovo', 'usado'],
              description: 'Condição avaliada visualmente com base no desgaste das fotos',
            },
            tags: {
              type: 'ARRAY',
              items: { type: 'STRING' },
              description: 'Palavras-chave e tags de busca para marketplaces',
            },
          },
          required: ['nome', 'descricao_curta', 'descricao_longa'],
        },
      },
    };

    const geminiResponse = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('[enriquecer-produto] Erro na API do Gemini:', errorText);

      // Reverte status para 'pendente' ou 'erro' para não prender o produto
      await supabaseAdmin
        .from('produtos')
        .update({ status: 'pendente' })
        .eq('id', produtoId);

      return new Response(
        JSON.stringify({ error: 'Falha ao processar imagens com a IA. Tente novamente mais tarde.', detalhes: errorText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const geminiJson = await geminiResponse.json();
    const candidateText = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('Resposta vazia da API do Gemini.');
    }

    const resultadoIa = JSON.parse(candidateText);

    // 9. Atualização Atômica do Produto com Conteúdo Enriquecido
    const { error: updateError } = await supabaseAdmin
      .from('produtos')
      .update({
        nome: resultadoIa.nome || produto.nome,
        descricao_curta: resultadoIa.descricao_curta,
        descricao_longa: resultadoIa.descricao_longa,
        status: 'pronto',
      })
      .eq('id', produtoId);

    if (updateError) {
      console.error('[enriquecer-produto] Erro ao gravar dados no banco:', updateError);
      throw updateError;
    }

    // 10. Resposta de Sucesso
    return new Response(
      JSON.stringify({
        success: true,
        produto_id: produtoId,
        resultado: resultadoIa,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[enriquecer-produto] Exceção inesperada:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Erro interno no processamento da IA.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
