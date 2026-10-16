# Checklist de Tarefas: Limpeza de Slop & Migração para Supabase Cloud

Plano de tarefas executáveis governado pelas skills `code-simplification`, `deprecation-and-migration` e `planning-and-task-breakdown`.

## Tarefas Mapeadas

- [x] **Task 1: Expurgo de Slop, Código Morto e Dependências Fantasmas**
  - [x] Remover 11 dependências não utilizadas no package.json.
  - [x] Remover `components/ui/box/`, `components/ui/card/`, `components/ui/badge/`.
  - [x] Remover `scripts/reset-project.js`, `scripts/`, `venv/` e `.pytest_cache/`.
  - *Critério de Verificação:* `bun install` e `bunx tsc --noEmit` (0 erros). (Concluído)

- [x] **Task 2: Instalação das Dependências do Supabase**
  - [x] Instalar `@supabase/supabase-js` e `base64-arraybuffer`.
  - *Critério de Verificação:* `bunx tsc --noEmit` (0 erros). (Concluído)

- [x] **Task 3: Script Canônico de Setup do Supabase (`supabase/schema.sql`)**
  - [x] Criar script com pgcrypto, ENUMs, tabela `produtos`, bucket `produtos` e RLS policies.
  - *Critério de Verificação:* Conferência estrutural do SQL. (Concluído)

- [x] **Task 4: Configuração de Ambiente e Cliente Supabase (`src/lib/supabase.ts`)**
  - [x] Criar `.env.example`, `.env` e inicializador seguro com `AsyncStorage`.
  - *Critério de Verificação:* `bunx tsc --noEmit` (0 erros). (Concluído)

- [x] **Task 5: Refatoração do Deep Module de Produtos (`src/lib/api.ts`)**
  - [x] Substituir chamadas locais por Supabase Storage e PostgREST.
  - [x] Implementar upload com ArrayBuffer e rollback atômico em falha.
  - *Critério de Verificação:* `bunx tsc --noEmit` e `bunx expo lint`. (Concluído)

- [x] **Task 6: Adaptação da Tela de Configurações (`src/app/(tabs)/configuracao.tsx`)**
  - [x] Atualizar teste de latência e conexão para apontar para o Supabase Cloud.
  - *Critério de Verificação:* `bunx tsc --noEmit` e `bunx expo lint`. (Concluído)

- [x] **Task 7: Eliminação da Infraestrutura Local Legada**
  - [x] Parar e encerrar containers Docker locais (`posta-ai-backend`, `posta-ai-db`).
  - [x] Remover `backend/`, `infra/`, `docker-compose.yml`, `pytest.ini`, `dev-start`, `dev-stop`, `backend-init`, `backend-stop`.
  - [x] Limpar scripts de backend no `package.json` e simplificar `metro.config.js`.
  - *Critério de Verificação:* `bunx expo-doctor` e `bunx tsc --noEmit`. (Concluído)

- [x] **Task 8: Sincronização Documental & Registro Final**
  - [x] Atualizar `estado_atual.md`, `estado_arquitetural_atual.md`, `README.md` e `tasks/todo.md`.
  - *Critério de Verificação:* `bunx tsc --noEmit` e `bunx expo lint` com 0 erros. (Concluído)

## Configuração Tailscale Metro

- [x] **Task 9: Injeção Dinâmica de IP Tailscale nos Scripts do Expo (`package.json`)**
  - [x] Atualizar scripts `start`, `dev`, `clean`, `android` e `ios` com `REACT_NATIVE_PACKAGER_HOSTNAME`.
  - *Critério de Verificação:* Execução de teste do script `bun start --help` e verificação de hostname. (Concluído)

- [x] **Task 10: Atualização de Variáveis e Documentação (`.env.example`, `README.md`, `estado_atual.md`)**
  - [x] Documentar variável `REACT_NATIVE_PACKAGER_HOSTNAME` em `.env.example`.
  - [x] Atualizar guia de execução em `README.md` e snapshots de estado.
  - *Critério de Verificação:* `bunx tsc --noEmit` e `bunx expo-doctor`. (Concluído)

## Autenticação Multi-Usuário e Migrações CI/CD (Supabase)

- [x] **Task 11: Configuração da Supabase CLI e Migrações Versionadas**
  - [x] Criar `supabase/config.toml` para padronização CI/CD.
  - [x] Criar `supabase/migrations/20261015000000_init_schema.sql` (schema base).
  - [x] Criar `supabase/migrations/20261015000001_multi_user_auth.sql` (adição de `user_id`, índice composto e RLS restrito na tabela e no storage).
  - [x] Sincronizar `supabase/schema.sql` com o estado canônico completo.
  - *Critério de Verificação:* Validação de sintaxe SQL e integridade das políticas RLS. (Concluído)

- [x] **Task 12: Store Zustand de Autenticação (`src/store/useAuthStore.ts`)**
  - [x] Implementar store de autenticação com persistência de sessão e `onAuthStateChange`.
  - [x] Ações: `signIn`, `signUp`, `signOut`, `initAuth` e estados `user`, `session`, `isInitialized`, `isLoading`, `error`.
  - *Critério de Verificação:* `bun run typecheck` com 0 erros. (Concluído)

- [x] **Task 13: Telas Nativas de Login e Cadastro (`src/app/(auth)/...`)**
  - [x] Criar layout de autenticação `src/app/(auth)/_layout.tsx`.
  - [x] Criar tela de Login `src/app/(auth)/login.tsx` com paleta dinâmica, haptics e validações.
  - [x] Criar tela de Cadastro `src/app/(auth)/cadastro.tsx` com aviso de confirmação de e-mail e haptics.
  - *Critério de Verificação:* `bun run typecheck` e `bun run lint`. (Concluído)

- [x] **Task 14: Proteção de Rotas e Prevenção de Flicker (`src/app/_layout.tsx`)**
  - [x] Integrar `useAuthStore` ao layout raiz.
  - [x] Adicionar guarda de navegação redirecionando não autenticados para `/(auth)/login` e autenticados para `/(tabs)/captura`.
  - [x] Prevenir flicker na inicialização mantendo estado de carregamento até `isInitialized`.
  - *Critério de Verificação:* `bun run typecheck` e `bun run lint`. (Concluído)

- [x] **Task 15: Isolamento Multi-Usuário no Módulo Profundo (`src/lib/api.ts`)**
  - [x] Checagem defensiva de sessão ativa com `supabase.auth.getUser()`.
  - [x] Upload de fotos estruturado por pasta de usuário: `{user_id}/{produto_id}/foto_{i}.jpg`.
  - [x] Gravação de `user_id` no registro da tabela `produtos`.
  - *Critério de Verificação:* `bun run typecheck` e `bun run lint`. (Concluído)

- [x] **Task 16: Seção de Perfil e Logout na Tela de Configurações (`src/app/(tabs)/configuracao.tsx`)**
  - [x] Exibir e-mail e status do vendedor conectado.
  - [x] Botão de Logout seguro com confirmação e feedback tátil (`expo-haptics`).
  - *Critério de Verificação:* `bun run typecheck` e `bun run lint`. (Concluído)

- [x] **Task 17: Sincronização Documental & Validação de Qualidade Final**
  - [x] Atualizar `estado_atual.md`, `estado_arquitetural_atual.md`, `README.md` e `tasks/todo.md`.
  - *Critério de Verificação:* `bun run typecheck`, `bun run lint` e `bunx expo-doctor` 100% aprovados. (Concluído)

## Etapa 1: Blindagem de Isolamento Local & Verificação RLS

- [x] **Task 18: Registro Permanente do Roadmap das 5 Etapas (`ROADMAP.md`)**
  - [x] Criar `ROADMAP.md` detalhando objetivos, arquitetura, fluxos e entregáveis das Etapas 1 a 5.
  - *Critério de Verificação:* Conferência de completude e referências com a documentação mestre. (Concluído)

- [x] **Task 19: Script Canônico de Verificação RLS (`supabase/verify_isolation.sql`)**
  - [x] Criar script transacional com simulação de `Usuario_A` e `Usuario_B` via JWT claims.
  - [x] Testar isolamento estrito de leitura, escrita, atualização e deleção cruzada.
  - *Critério de Verificação:* Validação de sintaxe SQL no PostgreSQL/Supabase. (Concluído)

- [x] **Task 20: Reforço nas Migrações SQL e Recarga de Schema PostgREST**
  - [x] Adicionar comando `NOTIFY pgrst, 'reload schema';` ao final de `20261015000001_multi_user_auth.sql` e `supabase/schema.sql`.
  - [x] Reforçar trava `NOT NULL DEFAULT auth.uid()` na coluna `user_id`.
  - *Critério de Verificação:* Inspeção de conformidade DDL. (Concluído)

- [x] **Task 21: Limpeza Atômica de Memória e Cache no Logout**
  - [x] Adicionar método `resetProdutos: () => void` em `src/store/useProductStore.ts`.
  - [x] Invocar limpeza de `useProductStore` e `useDraftStore` no `finally` de `useAuthStore.signOut()`.
  - *Critério de Verificação:* `bun run typecheck` e `bun run lint`. (Concluído)

- [x] **Task 22: Sincronização Documental & Validação de Qualidade**
  - [x] Atualizar `estado_atual.md`, `estado_arquitetural_atual.md`, `README.md` e `tasks/todo.md`.
  - *Critério de Verificação:* `bun run typecheck`, `bun run lint` e `bunx expo-doctor` 100% aprovados. (Concluído)

## Blindagem de Segurança e Deep Linking Mobile

- [x] **Task 23: Reforço de Segurança no `.gitignore` para a Supabase CLI**
  - [x] Adicionar `supabase/.branches/`, `supabase/.temp/`, `supabase/.env` e `.supabase/` ao `.gitignore`.
  - *Critério de Verificação:* `git status` e verificação de regras de ignore. (Concluído)

- [x] **Task 24: Otimização de Performance de RLS no PostgreSQL (`(select auth.uid())`)**
  - [x] Atualizar `supabase/schema.sql` e `20261015000001_multi_user_auth.sql` com subquery `(select auth.uid())`.
  - *Critério de Verificação:* Validação de sintaxe e isolamento RLS conferidos. (Concluído)

- [x] **Task 25: Implementação de Deep Linking para Confirmação de E-mail (`postaaiapp://`)**
  - [x] Configurar `options.emailRedirectTo: createURL('/') || 'postaaiapp://'` em `src/store/useAuthStore.ts`.
  - [x] Adicionar método `handleDeepLink(url: string)` em `useAuthStore.ts` tratando `token_hash`, `code` e hash params (`access_token`/`refresh_token`).
  - [x] Conectar listener `useLinkingURL()` no `RootLayout` (`src/app/_layout.tsx`).
  - *Critério de Verificação:* `bun run typecheck` e `bun run lint`. (Concluído)

- [x] **Task 26: Sincronização Documental & Validação de Qualidade Final**
  - [x] Atualizar `estado_atual.md`, `estado_arquitetural_atual.md`, `README.md` e `tasks/todo.md`.
  - *Critério de Verificação:* `bun run typecheck`, `bun run lint` e `bunx expo-doctor` 100% aprovados. (Concluído)

## Etapa 2: Pipeline de IA Multimodal de Custo Mínimo (Gemini 1.5 Flash-8B)

- [x] **Task 27: Atualização do ROADMAP.md com a Arquitetura de Custo Mínimo**
  - [x] Atualizar Etapa 2 em `ROADMAP.md` especificando `gemini-1.5-flash-8b` / `gemini-2.0-flash-lite`, Free Tier e métricas de custo.
  - *Critério de Verificação:* Documento sincronizado e consistente. (Concluído)

- [x] **Task 28: Criação da Supabase Edge Function (`enriquecer-produto`)**
  - [x] Criar estrutura `supabase/functions/enriquecer-produto/index.ts` em Deno/TypeScript.
  - [x] Implementar verificação de autenticação JWT do vendedor proprietário do produto.
  - [x] Implementar chamada REST ao Google Gemini com `response_schema` estrito (título comercial, descrição curta, descrição longa, categoria e tags).
  - [x] Atualizar registro na tabela `produtos` (`nome`, `descricao_curta`, `descricao_longa`, `status`).
  - *Critério de Verificação:* Validação de sintaxe Deno/TypeScript e contratos JSON. (Concluído)

- [x] **Task 29: Extensão do Módulo Profundo de API no Mobile (`src/lib/api.ts`)**
  - [x] Adicionar método `enriquecerProdutoComIa(produtoId: string)` consumindo a Edge Function via `supabase.functions.invoke`.
  - [x] Adicionar salvaguardas para rede offline ou indisponibilidade da IA.
  - *Critério de Verificação:* `bun run typecheck` e `bun run lint`. (Concluído)

- [x] **Task 30: Ajustes no Catálogo e Feedback Visual no Mobile**
  - [x] Atualizar `src/app/(tabs)/captura.tsx` para acionar opcionalmente ou automaticamente a IA após o envio bem-sucedido.
  - [x] Atualizar `src/components/ProductCard.tsx` e `src/app/(tabs)/produtos.tsx` para exibir badges animados e textos gerados pela IA.
  - *Critério de Verificação:* `bun run typecheck` e `bun run lint`. (Concluído)

- [x] **Task 31: Sincronização Documental & Validação de Qualidade Final**
  - [x] Atualizar `estado_atual.md`, `estado_arquitetural_atual.md`, `README.md` e `tasks/todo.md`.
  - *Critério de Verificação:* `bun run typecheck`, `bun run lint` e `bunx expo-doctor` 100% aprovados. (Concluído)

## Navegação Gestual, Edição Completa e IA sob Demanda

- [x] **Task 32: Módulo Profundo de Edição e Exclusão (`src/lib/api.ts` e `useProductStore.ts`)**
  - [x] Adicionar métodos `atualizarProduto(id, dados)` e `removerProduto(id, fotos)` em `src/lib/api.ts`.
  - [x] Adicionar ações equivalentes no Zustand em `src/store/useProductStore.ts`.
  - *Critério de Verificação:* `bun run typecheck` e `bun run lint`. (Concluído)

- [x] **Task 33: Componente de Navegação Gestual por Deslize (`SwipeableTabScreen.tsx`)**
  - [x] Criar container `src/components/SwipeableTabScreen.tsx` usando `Gesture.Pan()` com limites estritos de ativação.
  - [x] Integrar o container em `src/app/(tabs)/captura.tsx`, `src/app/(tabs)/produtos.tsx` e `src/app/(tabs)/configuracao.tsx`.
  - *Critério de Verificação:* Teste de navegação e ausência de conflitos com rolagem vertical. (Concluído)

- [x] **Task 34: Tela Nativa de Detalhes, Edição Manual, IA sob Demanda e Exclusão (`src/app/produto/[id].tsx`)**
  - [x] Criar rota dinâmica `src/app/produto/[id].tsx` com header temático e carrossel de fotos.
  - [x] Implementar botão de ação "✨ Gerar Anúncio com IA" acionando `enriquecerProduto(id)` com loading reativo.
  - [x] Implementar formulário de edição de título, preço, condição, categoria, observações e textos de IA.
  - [x] Implementar botão de exclusão com alerta de confirmação e limpeza de storage.
  - [x] Conectar clique no `ProductCard.tsx` para navegar até a nova tela de produto.
  - *Critério de Verificação:* `bun run typecheck` e `bun run lint`. (Concluído)

- [x] **Task 35: Sincronização Documental & Validação de Qualidade Final**
  - [x] Atualizar `estado_atual.md`, `estado_arquitetural_atual.md`, `README.md` e `tasks/todo.md`.
  - *Critério de Verificação:* `bun run typecheck`, `bun run lint` e `bunx expo-doctor` 100% aprovados. (Concluído)

## Blindagem do Root Layout & Container de Gestos

- [x] **Task 36: Integração do Container Nativo de Gestos no Root Layout (`src/app/_layout.tsx`)**
  - [x] Importar e envolver árvore com `GestureHandlerRootView` (`flex: 1`) eliminando o `Render Error`.
  - *Critério de Verificação:* `bun run typecheck` e `bun run lint`. (Concluído)

- [x] **Task 37: Sincronização Documental & Validação de Qualidade Final**
  - [x] Atualizar `estado_atual.md`, `estado_arquitetural_atual.md`, `README.md` e `tasks/todo.md`.
  - *Critério de Verificação:* `bun run typecheck`, `bun run lint` e `bunx expo-doctor` 100% aprovados. (Concluído)

## Animação de Transição Nativa (Slide entre Abas)

- [x] **Task 38: Implementação da Animação Nativa de Slide no `TabsLayout` (`src/app/(tabs)/_layout.tsx`)**
  - [x] Configurar `transitionSpec` (timing de 220ms com cubic easing) e `sceneStyleInterpolator` com interpolação de `translateX` no Native Driver.
  - *Critério de Verificação:* `bun run typecheck` e `bun run lint`. (Concluído)

- [x] **Task 39: Calibração de Sensibilidade do Gesto em `SwipeableTabScreen.tsx`**
  - [x] Ajustar limiares de distância (`45px`) e velocidade (`250px/s`) para resposta imediata ao swipe, mantendo `failOffsetY` para blindar a rolagem vertical.
  - *Critério de Verificação:* `bun run typecheck` e `bun run lint`. (Concluído)

- [x] **Task 40: Sincronização Documental & Validação de Qualidade Final**
  - [x] Atualizar `estado_atual.md`, `estado_arquitetural_atual.md`, `README.md` e `tasks/todo.md`.
  - *Critério de Verificação:* `bun run typecheck`, `bun run lint` e `bunx expo-doctor` 100% aprovados. (Concluído)

## Hardening de Segurança e Mitigação do Supabase Advisor

- [x] **Task 41: Elaboração da Migração de Segurança (`supabase/migrations/20261016000001_security_hardening.sql`)**
  - [x] Blindar `consumir_quota_ia` com `SET search_path = public` e revogar execução de `PUBLIC`, `anon` e `authenticated`.
  - [x] Conceder `GRANT EXECUTE` exclusivamente para `service_role` (Edge Functions).
  - [x] Revogar permissões públicas de execução de `rls_auto_enable` com tratamento defensivo de exceção.
  - [x] Remover política ampla de `SELECT` em `storage.objects` e restringir listagem RLS à pasta do vendedor autenticado.
  - *Critério de Verificação:* Criação e validação do script SQL da migração. (Concluído)

- [x] **Task 42: Sincronização do Script Consolidado Canônico (`supabase/schema.sql`)**
  - [x] Atualizar definições de `storage.objects` e `consumir_quota_ia` no `schema.sql` canônico.
  - *Critério de Verificação:* Conferência de paridade estrutural entre schema consolidado e migração. (Concluído)

- [x] **Task 43: Sincronização Documental & Validação de Qualidade Final**
  - [x] Atualizar `estado_atual.md`, `estado_arquitetural_atual.md` e `tasks/todo.md`.
  - *Critério de Verificação:* `bun run typecheck`, `bun run lint` e `bunx expo-doctor` 100% aprovados. (Concluído)

## Etapa 3: Motor de Precificação e Inteligência de Mercado

- [ ] **Task 44: Expansão do Schema da Edge Function `enriquecer-produto`**
  - [ ] Adicionar campos de precificação no `responseSchema` do Gemini 3.5 Flash-Lite (`preco_medio_mercado`, `preco_minimo_mercado`, `preco_maximo_mercado`, `justificativa_preco`).
  - [ ] Implementar algoritmo determinístico de depreciação por condição (`FATORES_CONDICAO`) em TypeScript Deno.
  - [ ] Sanitização defensiva contra valores inválidos e gravação atômica de `preco_medio_mercado` e `preco_sugerido`.
  - *Critério de Verificação:* Chamada da Edge Function retornando campos numéricos coerentes gravados na tabela `produtos`.

- [ ] **Task 45: Atualização de Contratos TypeScript e Helpers de Mercado**
  - [ ] Estender `src/types/product.ts` com campos opcionais de faixa de mercado e justificativa.
  - [ ] Criar função utilitária `calcularCompetitividadePreco(precoUsuario, precoSugerido)`.
  - *Critério de Verificação:* `bun run typecheck` com 0 erros.

- [ ] **Task 46: Criação do Componente Nativo `MarketPriceGauge.tsx`**
  - [ ] Régua gráfica intuitiva com destaque de cor semântica para a competitividade do preço (Super Competitivo, Preço Justo, Acima da Média).
  - [ ] Botão "Adotar Preço Sugerido (R$ X,XX)" com microinteração e feedback háptico.
  - *Critério de Verificação:* Renderização consistente em temas Claro e Escuro.

- [ ] **Task 47: Integração na Tela de Edição (`src/app/produto/[id].tsx`)**
  - [ ] Posicionar o `MarketPriceGauge` logo abaixo do campo de valor desejado.
  - [ ] Atualização em tempo real da competitividade conforme o vendedor altera o preço manualmente.
  - *Critério de Verificação:* Teste interativo de edição e preenchimento automático.

- [ ] **Task 48: Tag de Inteligência de Mercado no Card do Catálogo (`ProductCard.tsx`)**
  - [ ] Exibir badge sutil contextual quando houver preço de mercado calculado (ex: `🔥 Preço Competitivo`).
  - *Critério de Verificação:* `bun run lint` e visualização fluida no catálogo.

- [ ] **Task 49: Sincronização Documental e Validação de Qualidade**
  - [ ] Atualizar `ROADMAP.md`, `tasks/todo.md`, `estado_atual.md` e `estado_arquitetural_atual.md`.
  - *Critério de Verificação:* `bun run typecheck`, `bun run lint` e `bunx expo-doctor` 100% aprovados.

---

## Checkpoints de Validação

- [x] **Checkpoint 1 (Após Tasks 1 e 2):** Slop e dependências fantasmas eliminados, Supabase SDK instalado e TypeScript 100% limpo.
- [x] **Checkpoint 2 (Após Tasks 3 e 4):** Script SQL pronto para o editor do Supabase, variáveis de ambiente e cliente Supabase inicializados.
- [x] **Checkpoint 3 (Após Tasks 5 e 6):** Deep module e tela de configuração apontando para a nuvem Supabase com typecheck/lint verdes.
- [x] **Checkpoint 4 (Após Tasks 7 e 8):** Código e infra legados removidos, repositório 100% Serverless, documentação e checklist concluídos.
- [x] **Checkpoint 5 (Após Tasks 11 e 12):** Migrações canônicas versionadas para Supabase CLI e Store Zustand de autenticação implementada.
- [x] **Checkpoint 6 (Após Tasks 13 e 14):** Telas nativas de Login e Cadastro funcionais, com roteamento protegido e splash/flicker blindados.
- [x] **Checkpoint 7 (Após Tasks 15, 16 e 17):** Storage e PostgREST isolados por vendedor, gestão de perfil em configurações e suíte de linters/typecheck 100% verde.
- [x] **Checkpoint 8 (Após Tasks 18 a 22):** Roadmap perene documentado, script de verificação RLS criado, reload de PostgREST padronizado e limpeza de logout offline blindada.
- [x] **Checkpoint 9 (Após Tasks 23 a 26):** Gitignore blindado contra artefatos Supabase, RLS otimizado com (select auth.uid()) e Deep Linking mobile configurado.
- [x] **Checkpoint 10 (Após Tasks 27 a 31):** Edge Function de IA Gemini 1.5 Flash-8B criada, módulo profundo no mobile acoplado e feedback visual integrado.
- [x] **Checkpoint 11 (Após Tasks 32 a 35):** Navegação por swipe entre abas ativa, edição manual de produtos, enriquecimento de IA sob demanda e exclusão atômica operacionais.
- [x] **Checkpoint 12 (Após Tasks 36 e 37):** Container GestureHandlerRootView configurado na raiz com flex: 1, eliminando o erro de GestureDetector em tempo de execução.
- [x] **Checkpoint 13 (Após Tasks 38 a 40):** Animação de slide contínuo horizontal entre abas ativa via Native Driver com interpolação dinâmica de translateX e calibração fina de gestos.
- [x] **Checkpoint 14 (Após Tasks 41 a 43):** Hardening de segurança implementado contra avisos do Supabase Advisor (DoS em quota de IA neutralizado, listagem pública no storage fechada, search_path fixado).
- [ ] **Checkpoint 15 (Após Tasks 44 a 49):** Motor de precificação C2C ativo via Gemini 3.5 Flash-Lite com cálculo determinístico de depreciação, régua de mercado e adoção rápida no mobile.



