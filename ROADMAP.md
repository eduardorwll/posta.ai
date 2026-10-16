# 🗺️ Roadmap Estratégico de Engenharia — posta.ai

Este documento consolida o planejamento mestre, a arquitetura e os entregáveis técnicos das próximas etapas de evolução do **posta.ai**, servindo como guia permanente para retomada, auditoria e execução por agentes de software e desenvolvedores humanos.

---

## Visão Geral das Etapas

```mermaid
flowchart LR
    E1["Etapa 1: Blindagem de Isolamento & RLS"] --> E2["Etapa 2: IA Multimodal (Gemini Flash)"]
    E2 --> E3["Etapa 3: Precificação Inteligente"]
    E3 --> E4["Etapa 4: Human-in-the-Loop & Aprovação"]
    E4 --> E5["Etapa 5: Publicação RPA Multicanal"]
```

---

## 🔒 Etapa 1: Blindagem de Isolamento Local & Verificação RLS

> **Status:** Em Execução | **Prioridade:** Máxima (Segurança e Integridade)

### Objetivos
- Garantir que nenhum vendedor consiga acessar, visualizar ou manipular dados e mídias de outro vendedor.
- Eliminar qualquer persistência residual de dados em memória volátil (heap do Hermes) ou armazenamento local (`AsyncStorage`) ao encerrar a sessão, inclusive offline.
- Criar suíte formal de testes SQL adversarial simulando múltiplos usuários no Supabase.

### Entregáveis Técnicos
1. **Script de Verificação RLS (`supabase/verify_isolation.sql`):**
   - Transação atômica (`BEGIN; ... ROLLBACK;`) executável no Supabase SQL Editor.
   - Simulação determinística de dois vendedores (`Usuario_A` e `Usuario_B`) via JWT context (`auth.uid()`).
   - Teste de `SELECT`, `INSERT`, `UPDATE`, `DELETE` e rejeição de acessos forjados.
2. **Reforço de Integridade DDL:**
   - Adição de `NOTIFY pgrst, 'reload schema';` ao final de todas as migrações SQL para invalidar o schema cache obsoleto do PostgREST.
   - Reforço da restrição `NOT NULL DEFAULT auth.uid()` na coluna `user_id` de `produtos`.
3. **Purga Atômica no Logout Mobile:**
   - Inclusão de `resetProdutos()` no [`useProductStore`](file:///home/eduardorwll/Projects/posta-ai-app/src/store/useProductStore.ts).
   - Execução incondicional de limpeza de `useProductStore` e [`useDraftStore`](file:///home/eduardorwll/Projects/posta-ai-app/src/store/useDraftStore.ts) no bloco `finally` de `useAuthStore.signOut()`.

---

## 🧠 Etapa 2: Fase 4A — Pipeline de IA Multimodal (Google Gemini Flash)

> **Status:** Planejada | **Dependência:** Etapa 1

### Objetivos
- Converter fotos e observações sucintas digitadas pelo vendedor em títulos atraentes e descrições ricas em SEO para marketplaces.
- Operar via arquitetura serverless de baixo custo utilizando **Google Gemini 2.5 / 1.5 Flash**.

### Entregáveis Técnicos
1. **Orquestrador Serverless (Supabase Edge Function):**
   - Trigger ou endpoint seguro acionado após o cadastro do produto.
   - Leitura das fotos no Storage CDN (`{user_id}/{produto_id}/foto_*.jpg`).
   - Prompt de Visão Computacional extraindo atributos físicos (cor, tecido/material, estilo, estado de conservação visível e marca).
   - Retorno estruturado em JSON Schema:
     - `nome`: Título comercial objetivo e de alto clique (máx 60 caracteres).
     - `descricao_curta`: Destaques em tópicos para redes sociais e previews de busca.
     - `descricao_longa`: Copywriting completo de vendas com sugestão de medidas, estado e gatilhos de decisão.
2. **Transição de Ciclo de Vida do Produto:**
   - `status`: `'pendente'` ➔ `'processando_ia'` ➔ `'aguardando_aprovacao'`.
3. **Feedback em Tempo Real no App:**
   - Atualização reativa do card do produto com indicador de progresso e badge de status dinâmico.

---

## 💰 Etapa 3: Fase 4B — Motor de Precificação e Inteligência de Mercado

> **Status:** Planejada | **Dependência:** Etapa 2

### Objetivos
- Ajudar o vendedor pessoa física a precificar competitivamente, evitando anunciar por valores que demorem meses para vender ou abaixo do mercado.

### Entregáveis Técnicos
1. **Algoritmo de Benchmark de Preços:**
   - Consulta a listagens de itens equivalentes e raspagem estruturada (Enjoei, Mercado Livre, OLX).
   - Eliminação estatística de outliers (produtos falsos ou acessórios incompatíveis).
2. **Cálculo de Preço Ponderado:**
   - Ponderação com base na condição do item (`novo`, `como_novo`, `seminovo`, `usado`).
   - Preenchimento de `preco_medio_mercado` e `preco_sugerido`.
3. **Componente de Comparação Visual no App:**
   - Indicador visual mostrando a diferença percentual entre o valor desejado pelo usuário (`preco_usuario`) e o preço médio do mercado.

---

## 🤝 Etapa 4: Fase 4C — Human-in-the-Loop & Revisão de Anúncios

> **Status:** Planejada | **Dependência:** Etapas 2 e 3

### Objetivos
- Garantir que nenhum anúncio seja publicado sem a validação ou ajuste explícito do vendedor.

### Entregáveis Técnicos
1. **Tela de Detalhes e Edição Rápida no Mobile:**
   - Visualização do anúncio completo com carrossel de fotos originais em alta definição.
   - Edição rápida em linha do título, descrição curta e descrição longa geradas pela IA.
   - Adoção imediata do `preco_sugerido` com um toque ou manutenção do `preco_usuario`.
   - Botão de confirmação "Aprovar para Publicação" (transição para `status = 'pronto'`).
2. **Canal Opcional via Telegram:**
   - Bot de notificações com card interativo e botões Inline (`[✅ Aprovar]`, `[✏️ Editar no App]`).

---

## 🤖 Etapa 5: Fase 5 — Publicação Multicanal via RPA (Playwright Stealth)

> **Status:** Planejada | **Dependência:** Etapa 4

### Objetivos
- Automatizar o preenchimento de formulários e upload de fotos nas plataformas C2C que não fornecem APIs públicas (Enjoei e Facebook Marketplace).

### Entregáveis Técnicos
1. **Worker Autônomo com Playwright Stealth:**
   - Sessões persistentes com cookies autenticados (`storage_state.json`).
   - Download de mídia via barramento local ou URL assinada do Storage CDN.
   - Digitação simulada com atrasos humanos aleatórios e emulação de viewport móvel/desktop.
2. **Resiliência e Tratamento de Erros:**
   - Em caso de CAPTCHA ou bloqueio: captura de screenshot automático, envio de alerta imediato no Telegram e atualização do produto para `status = 'erro'`.
   - Em caso de sucesso: captura da URL pública do anúncio gerado e transição para `status = 'publicado'`.

---

## 📈 Critérios de Governança e Qualidade para Cada Etapa

Cada fase deste roadmap segue obrigatoriamente:
- **TypeScript Strict:** 0 erros no `bun run typecheck`.
- **Expo Linter:** 0 erros no `bun run lint`.
- **Expo Doctor:** 21/21 verificações aprovadas.
- **Isolamento de Segurança:** Nenhuma query sem conferência estrita de permissão `auth.uid() = user_id`.
- **Sincronização Documental:** Atualização contínua de `estado_atual.md`, `estado_arquitetural_atual.md` e `tasks/todo.md`.
