# Estado Atual do Projeto — posta.ai

> Snapshot compilado em 2026-10-16. Concluídas com sucesso a **Animação Nativa de Slide entre Abas**, **Navegação Gestual por Swipe**, **Container Raiz de Gestos (GestureHandlerRootView)**, **Edição Manual Completa**, **IA sob Demanda (Google Gemini 3.5 Flash-Lite)** e **Rate Limiter Global no PostgreSQL**:
> - **Skills & Frameworks Ativos:** `addyosmani/agent-skills` (`using-agent-skills`, `code-simplification`, `deprecation-and-migration`, `planning-and-task-breakdown`, `source-driven-development`), `ui-ux-pro-max`, `expo-native-ui`, `expo-router`, `expo-animation`, e regras canônicas de `ciembor/agent-rules-books` (*Clean Architecture*, *APOSD*, *Release It!*, *Code Complete*).
> - **Animação de Slide Fluida no TabsLayout:** Interpolação nativa de `translateX` via `sceneStyleInterpolator` e `transitionSpec` (timing de 220ms com cubic easing) no [`src/app/(tabs)/_layout.tsx`](file:///home/eduardorwll/Projects/posta-ai-app/src/app/(tabs)/_layout.tsx), executada 100% no Native Driver (GPU/RenderThread) em 60/120 FPS cravados sem corte seco.
> - **Container Raiz de Gestos (`GestureHandlerRootView`):** Integrado com `{ flex: 1 }` no ponto de entrada [`src/app/_layout.tsx`](file:///home/eduardorwll/Projects/posta-ai-app/src/app/_layout.tsx), garantindo suporte nativo a detectores de gestos sem erros de execução.
> - **Navegação Gestual por Swipe entre Abas:** Componente profundo [`SwipeableTabScreen.tsx`](file:///home/eduardorwll/Projects/posta-ai-app/src/components/SwipeableTabScreen.tsx) com `Gesture.Pan()` calibrado com limiares rápidos (`45px` e `250px/s`) e `failOffsetY` estrito (evitando qualquer interferência com rolagens verticais em `ScrollView` e `FlatList`) e feedback háptico (`haptic.selection()`).
> - **Tela Nativa de Detalhes, Edição e IA sob Demanda:** Rota [`src/app/produto/[id].tsx`](file:///home/eduardorwll/Projects/posta-ai-app/src/app/produto/[id].tsx) com carrossel paginado de fotos, edição manual de título, preço, condição, categoria, notas e descrições, botão de execução da IA sob demanda ("✨ Gerar Anúncio com IA" / "🔄 Regenerar com IA") e exclusão atômica.
> - **Exclusão Atômica com Limpeza de Storage:** Método [`removerProduto`](file:///home/eduardorwll/Projects/posta-ai-app/src/lib/api.ts) que exclui o registro no PostgreSQL e apaga todas as fotos associadas no Supabase Storage (`supabase.storage.from('produtos').remove(...)`).
> - **Pipeline Serverless com Gemini 3.5 Flash-Lite & Rate Limiter de Custo Zero:** Edge Function [`supabase/functions/enriquecer-produto/index.ts`](file:///home/eduardorwll/Projects/posta-ai-app/supabase/functions/enriquecer-produto/index.ts) com modelo canônico **`gemini-3.5-flash-lite`** do Google AI Studio e blindagem contra cobranças surpresa via função PostgreSQL `consumir_quota_ia(5)` com `SELECT ... FOR UPDATE` (máximo de 5 chamadas/minuto somadas entre todos os usuários).
> - **Diagnóstico e Saúde Perfeitos:** `bunx expo-doctor` com 21/21 verificações aprovadas, `bun run typecheck` com 0 erros e `bun run lint` 100% limpo.

---

## 1. Status Geral de Funcionamento

- **Execução em Dispositivo:** **Aprovada**. App roda de forma fluida no dispositivo móvel, sem travamento na Splash Screen.
- **Navegação Gestual Fluida:** Deslize lateral suave para alternar abas (`Capturar` ⇄ `Meus Produtos` ⇄ `Configuração`).
- **Edição & Regeneração de IA sem Re-fotografar:** O usuário pode testar a IA e editar textos diretamente no produto existente sem precisar tirar novas fotos.
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
  - Script SQL consolidado em `supabase/schema.sql` com tabela `ia_rate_limiter` e função `consumir_quota_ia(5)`.
  - Migração de segurança `20261016000001_security_hardening.sql` implementada:
    - Blindagem de `consumir_quota_ia` com `SET search_path = public` e revogação de permissões para roles públicas (`anon` e `authenticated`), restringindo a execução exclusivamente para `service_role` (Edge Functions) para eliminar risco de DoS.
    - Eliminação de risco de listagem/scraping público no Supabase Storage: remoção da política ampla de `SELECT` em `storage.objects` e restrição da listagem estritamente à pasta do vendedor autenticado, mantendo a entrega pública de mídia nativa via CDN.
    - Revogação defensiva de execução pública da função utilitária `rls_auto_enable`.
  - Edge Function `enriquecer-produto` configurada com `gemini-3.5-flash-lite`.
  - Cliente oficial `@supabase/supabase-js` em `src/lib/supabase.ts` com persistência de sessão assíncrona no `@react-native-async-storage/async-storage`.
  - **Blindagem de Rede & Resiliência de Autenticação:**
    - Middleware `customFetch` defensivo em `src/lib/supabase.ts` interceptando respostas HTML de gateway (Cloudflare 502/503/429, portais cativos ou proxies) e convertendo-as em JSON sintético, eliminando o erro fatal `JSON Parse error: Unexpected character: <` no motor Hermes.
    - Sanitizador centralizado `traduzirErroAuth` em `src/store/useAuthStore.ts` com mensagens amigáveis em português para limites de envio de e-mails, contas não confirmadas, credenciais incorretas e falhas de conexão.

---

## 2. Formulário e Interface Concluídos

1. **Autenticação:** Login e Cadastro nativos com validações inline, toggle de visibilidade de senha e feedback claro sobre e-mail de ativação.
2. **Navegação por Abas e Swipe:** Gestos suaves para alternar abas sem conflito com rolagens verticais.
3. **Perfil do Vendedor:** Exibição do e-mail autenticado e botão de encerramento de sessão seguro na tela de Configurações com purga atômica local.
4. **Cadastro de Produto:** Nome obrigatório, chips de condição, chips de categoria, preço em BRL, observações e até 5 fotos otimizadas.
5. **Detalhes e Edição (`/produto/[id]`):** Carrossel de fotos, geração/regeneração de IA sob demanda, edição manual de todos os campos e exclusão atômica.
6. **Isolamento de Dados:** Cada vendedor visualiza exclusivamente seus itens no catálogo e armazena fotos em sua pasta própria no bucket `produtos`.
7. **Catálogo:** Busca instantânea em memória, Pull-to-Refresh, badges contextuais, formatação de moeda e navegação direta ao produto ao tocar no card.
8. **Configurações:** Perfil do vendedor, temas Claro/Escuro/Automático, canais de venda e probe de integridade/latência com a nuvem.

---

## 3. Próximos Passos (Conforme ROADMAP.md)

- **Iniciar Etapa 3 — Motor de Precificação e Inteligência de Mercado:** Implementação de algoritmo de benchmark de preços de mercado C2C (Enjoei, Mercado Livre, OLX) e cálculo de preço ponderado por condição (`novo`, `como_novo`, `seminovo`, `usado`).
- **Apresentar Indicador Visual de Mercado:** Conectar o cálculo de preço sugerido ao card do produto e ao formulário de edição rápida em [`src/app/produto/[id].tsx`](file:///home/eduardorwll/Projects/posta-ai-app/src/app/produto/[id].tsx).

