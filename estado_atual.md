# Estado Atual do Projeto — posta.ai

> Snapshot compilado em 2026-10-15. Concluídas com sucesso a **Etapa 1: Blindagem de Isolamento Local & Verificação RLS** e a **Etapa 2: Pipeline de IA Multimodal de Custo Mínimo (Google Gemini 1.5 Flash-8B)**:
> - **Skills & Frameworks Ativos:** `addyosmani/agent-skills` (`using-agent-skills`, `code-simplification`, `deprecation-and-migration`, `planning-and-task-breakdown`, `source-driven-development`), `ui-ux-pro-max`, e regras canônicas de `ciembor/agent-rules-books` (*Clean Architecture*, *APOSD*, *Release It!*, *Code Complete*).
> - **Pipeline de IA Multimodal Serverless:** Supabase Edge Function [`supabase/functions/enriquecer-produto/index.ts`](file:///home/eduardorwll/Projects/posta-ai-app/supabase/functions/enriquecer-produto/index.ts) com Deno, integrando com **Google Gemini 1.5 Flash-8B** no Free Tier ($0,00 até 1.500 produtos/dia ou ~R$ 0,0008 por anúncio) via `response_schema` JSON estrito.
> - **Módulo Profundo & Reatividade no Mobile:** Método [`enriquecerProdutoComIa`](file:///home/eduardorwll/Projects/posta-ai-app/src/lib/api.ts) e ação reativa [`useProductStore.enriquecerProduto`](file:///home/eduardorwll/Projects/posta-ai-app/src/store/useProductStore.ts) que atualiza o estado para `processando_ia` e em seguida `pronto` com título, descrição curta e descrição longa comercial gerados.
> - **Card e Catálogo Inteligentes:** [`ProductCard.tsx`](file:///home/eduardorwll/Projects/posta-ai-app/src/components/ProductCard.tsx) com badge contextual animado (`Gerando com IA...`, `Anúncio Pronto`) e exibição em tempo real do destaque de copywriting comercial (`✨ descricao_curta`), além de busca instantânea pelo texto da IA em [`produtos.tsx`](file:///home/eduardorwll/Projects/posta-ai-app/src/app/(tabs)/produtos.tsx).
> - **Segurança para Repositório Público:** `.gitignore` blindado contra artefatos internos da Supabase CLI e chaves de IA armazenadas estritamente nos Secrets da Edge Function.
> - **Otimização de Performance RLS no PostgreSQL:** Políticas de RLS em `produtos` e `storage.objects` com subquery `(select auth.uid()) = user_id` (otimização `InitPlan`).
> - **Deep Linking Mobile:** Suporte nativo `postaaiapp://` via `useLinkingURL()` em [`_layout.tsx`](file:///home/eduardorwll/Projects/posta-ai-app/src/app/_layout.tsx) para confirmação de e-mail e recuperação de senha.
> - **Diagnóstico e Saúde Perfeitos:** `bunx expo-doctor` com 21/21 verificações aprovadas, `bun run typecheck` com 0 erros e `bun run lint` 100% limpo.

---

## 1. Status Geral de Funcionamento

- **Execução em Dispositivo:** **Aprovada**. App roda de forma fluida no dispositivo móvel, sem travamento na Splash Screen.
- **Autenticação Multi-Usuário:** Fluxo completo e reativo com persistência no AsyncStorage (`useAuthStore`).
- **Isolamento Local Blindado:** Nenhuma informação de inventário ou rascunho de fotos sobrevive ao logout, prevenindo vazamentos em aparelhos compartilhados.
- **UI Nativa de Alta Fidelidade & Haptics:** Suporte completo a feedback físico (`expo-haptics`), tokens semânticos e busca instantânea.
- **Tema Claro e Escuro Dinâmico:** Suporte completo a temas (`Escuro`, `Claro`, `Automático`), com persistência segura (`expo-secure-store`) e transição em tempo real na UI.
- **Identidade Visual no Topo (`AppHeader.tsx`):** Isotipo em 48×48 px com destaque visual da marca.
- **Gerenciador de Pacotes:** **Bun** (`bun.lock`).
- **Validação de Código:**
  - `bun run typecheck` (`tsc --noEmit`): 0 erros.
  - `bunx expo-doctor`: 21/21 verificações aprovadas (100% em conformidade com o SDK 57).
  - `bun run lint`: 0 erros.
- **Backend & Nuvem (Supabase Cloud Serverless & CI/CD):**
  - Diretório canônico `supabase/migrations/` com migrações SQL versionadas, reload automático de schema do PostgREST e `supabase/config.toml` para automação via Supabase CLI.
  - Script SQL consolidado em `supabase/schema.sql` pronto para execução direta no painel Supabase.
  - Script de teste adversarial em `supabase/verify_isolation.sql`.
  - Cliente oficial `@supabase/supabase-js` em `src/lib/supabase.ts` com persistência de sessão assíncrona no `@react-native-async-storage/async-storage`.
  - Variáveis de ambiente padronizadas: `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

---

## 2. Formulário e Interface Concluídos

1. **Autenticação:** Login e Cadastro nativos com validações inline, toggle de visibilidade de senha e feedback claro sobre e-mail de ativação.
2. **Perfil do Vendedor:** Exibição do e-mail autenticado e botão de encerramento de sessão seguro na tela de Configurações com purga atômica local.
3. **Cadastro de Produto:** Nome obrigatório, chips de condição, chips de categoria, preço em BRL, observações e até 5 fotos otimizadas.
4. **Isolamento de Dados:** Cada vendedor visualiza exclusivamente seus itens no catálogo e armazena fotos em sua pasta própria no bucket `produtos`.
5. **Catálogo:** Busca instantânea em memória, Pull-to-Refresh, badges contextuais e formatação de moeda.
6. **Configurações:** Perfil do vendedor, temas Claro/Escuro/Automático, canais de venda e probe de integridade/latência com a nuvem.

---

## 3. Próximos Passos (Conforme ROADMAP.md)

- **Deploy da Edge Function e Configuração de Secret:** Realizar o deploy com `supabase functions deploy enriquecer-produto` e definir a chave da IA com `supabase secrets set GEMINI_API_KEY=sua_chave`.
- **Iniciar Etapa 3 — Motor de Precificação e Inteligência de Mercado:** Implementação de benchmark de preços e cálculo de preço sugerido para vendedores C2C.
