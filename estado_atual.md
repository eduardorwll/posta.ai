# Estado Atual do Projeto — posta.ai

> Snapshot compilado em 2026-10-15. Concluída com sucesso a **Etapa 1: Blindagem de Isolamento Local & Verificação RLS**, **Blindagem de Repositório Público (.gitignore)**, **Otimização de Performance RLS (`(select auth.uid())`)** e **Deep Linking Mobile (`postaaiapp://`)**:
> - **Skills & Frameworks Ativos:** `addyosmani/agent-skills` (`using-agent-skills`, `code-simplification`, `deprecation-and-migration`, `planning-and-task-breakdown`, `source-driven-development`), `ui-ux-pro-max`, e regras canônicas de `ciembor/agent-rules-books` (*Clean Architecture*, *APOSD*, *Release It!*, *Code Complete*).
> - **Roadmap Oficial das 5 Fases:** Documentado em [`ROADMAP.md`](file:///home/eduardorwll/Projects/posta-ai-app/ROADMAP.md) como guia definitivo de engenharia do projeto.
> - **Segurança para Repositório Público:** `.gitignore` blindado contra artefatos internos da Supabase CLI (`supabase/.branches/`, `supabase/.temp/`, `supabase/.env` e `.supabase/`).
> - **Otimização de Performance RLS no PostgreSQL:** Políticas de RLS em `produtos` e `storage.objects` otimizadas de `auth.uid()` para a subquery `(select auth.uid()) = user_id`, executando a checagem via `InitPlan` uma única vez por consulta.
> - **Deep Linking Mobile para Confirmação de E-mail:** Configuração de `emailRedirectTo: createURL('/') || 'postaaiapp://'` e listener reativo `useLinkingURL()` em [`_layout.tsx`](file:///home/eduardorwll/Projects/posta-ai-app/src/app/_layout.tsx) acoplado a [`useAuthStore.handleDeepLink`](file:///home/eduardorwll/Projects/posta-ai-app/src/store/useAuthStore.ts), resolvendo redirecionamentos que travavam em `localhost`.
> - **Purga Atômica no Logout:** Limpeza incondicional de dados de produtos (`useProductStore.resetProdutos()`) e de rascunhos em cache (`useDraftStore.clearDraft()`) no bloco `finally` de `useAuthStore.signOut()`, imune a falhas de rede.
> - **Verificação Canônica de RLS:** Script transacional [`supabase/verify_isolation.sql`](file:///home/eduardorwll/Projects/posta-ai-app/supabase/verify_isolation.sql) executando bateria de 7 testes adversariais entre múltiplos usuários com `ROLLBACK` seguro.
> - **Notificação de Reload do PostgREST:** Inclusão de `NOTIFY pgrst, 'reload schema';` nas migrações SQL para eliminar discrepâncias no schema cache.
> - **Autenticação Nativa Multi-Usuário:** Store Zustand `useAuthStore` reativa com listener `onAuthStateChange`, hidratação via AsyncStorage, telas nativas de `(auth)/login` e `(auth)/cadastro` com suporte a confirmação de e-mail e logout seguro.
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

- **Execução do Script SQL no Supabase:** Executar `supabase/schema.sql` (ou `supabase/migrations/20261015000001_multi_user_auth.sql`) no SQL Editor do painel Supabase para aplicar a coluna `user_id` e o `NOTIFY pgrst, 'reload schema'`.
- **Iniciar Etapa 2 — Pipeline de IA Multimodal (Google Gemini Flash):** Criação da Edge Function / worker serverless para processamento de fotos e geração automática de título, descrição curta e descrição longa comercial.
