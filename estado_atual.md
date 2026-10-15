# Estado Atual do Projeto — posta.ai

> Snapshot compilado em 2026-10-15. Implementadas com sucesso a **UI Nativa de Alta Fidelidade (Etapa 1)** e a **Arquitetura de Backend com Padrões `api-scaffolding` e Testes Automatizados (Etapa 2)**:
> - **Skills & Frameworks Ativos:** `ui-ux-pro-max`, `api-scaffolding`, `fastapi-templates`, e regras canônicas de `ciembor/agent-rules-books` (*Clean Architecture*, *APOSD*, *Release It!*, *Code Complete*).
> - **UI Nativa de Alta Fidelidade (`src/lib/haptics.ts`, `PhotoGrid.tsx`, `ProductCard.tsx`, `produtos.tsx`, `captura.tsx`):** Tokens semânticos, haptics físicos (`expo-haptics`), badge de capa, busca instantânea em memória e tema dinâmico.
> - **Backend FastAPI & PostgreSQL Operacionais (Docker):** Containers `posta-ai-backend` e `posta-ai-db` ativos e saudáveis.
> - **Pydantic V2 & Contratos Canônicos (`schemas/product.py`):** Enums sincronizados com o banco e mobile, campos opcionais de IA e mapeamento inteligente `_missing_`.
> - **Repository Pattern (`ProductRepository`):** Acesso a dados desacoplado das rotas HTTP, com transações atômicas seguras (`commit` em mutações) e rollback de arquivos em falhas.
> - **URLs Dinâmicas para Fotos:** Resolução via `request.base_url` para compatibilidade total com testes em rede local/Tailscale.
> - **Suíte de Testes Automatizados (100% Verde):** 6 testes cobrindo healthcheck, validações de foto, criação, listagem e compatibilidade legada rodando via `pytest-asyncio`.

---

## 1. Status Geral de Funcionamento
- **Execução em Dispositivo:** **Aprovada** (Fase 2 & 3). App roda de forma fluida no dispositivo móvel, sem travamento na Splash Screen.
- **UI Nativa de Alta Fidelidade & Haptics:** Suporte completo a feedback físico (`expo-haptics`), tokens semânticos e busca instantânea.
- **Tema Claro e Escuro Dinâmico:** Suporte completo a temas (`Escuro`, `Claro`, `Automático`), com persistência segura (`expo-secure-store`) e transição em tempo real na UI.
- **Identidade Visual no Topo (`AppHeader.tsx`):** Isotipo ampliado para 48×48 px para maior destaque e presença visual da marca.
- **Gerenciador de Pacotes:** **Bun** (`bun.lock`).
- **Validação de Código:**
  - `bunx tsc --noEmit`: 0 erros.
  - `bunx expo lint`: 0 erros (18 warnings de boilerplate do Gluestack UI v5).
  - Suíte de Testes Backend: 6 passed (100% de sucesso).
- **Backend (Fase 3 - Concluída e Replanejada):**
  - API FastAPI assíncrona com PostgreSQL 16 Alpine via `docker-compose.yml`.
  - Endpoints `POST /produtos` (multipart/form-data com fotos), `GET /produtos`, `GET /produtos/{id}`, `GET /health` (com verificação de banco).
  - Persistência de fotos em disco local (`/app/storage/produtos/{id}/`), servidas via StaticFiles em `/storage`.
  - Pool de conexões assíncrono com `psycopg[binary,pool]>=3.2.3` (`AsyncConnectionPool`).
  - Resolução dinâmica de URLs para fotos sem hardcoded `localhost`.
  - Repositório `ProductRepository` isolando SQL de rotas HTTP.
- **Mobile (Fase 3):**
  - `src/lib/api.ts`: cliente HTTP com base URL dinâmica gerenciada pela store `useApiConfigStore`.
  - `src/store/useApiConfigStore.ts`: store Zustand com persistência assíncrona via `expo-secure-store`, tendo `http://100.110.221.21:8000` (Tailscale) como padrão oficial do sistema.
  - `src/store/useThemeStore.ts`: store Zustand de tema com persistência assíncrona (`posta_ai_theme_mode`).
  - `src/app/(tabs)/configuracao.tsx`: menu completo de preferências com seções de Aparência conectada, IA/Anúncios, Canais de Venda e dropdown colapsável de Configurações Avançadas (Padrão / Personalizado), teste de conexão com latência e status HTTP.
  - `useProductStore.ts`: ações assíncronas `fetchProdutos()` e `cadastrarProduto()`, estados `isLoading` e `error`.
  - `captura.tsx`: envio real para a API com feedback de loading (botão desabilitado + texto "Enviando...") e tratamento de erros.
  - `produtos.tsx`: carregamento automático da API ao montar, Pull-to-Refresh, estados de loading/erro/vazio.
- **Scripts e Ferramentas Locais:**
  - `dev-start` (`bun run dev`): orquestra inicialização do backend Docker e do Expo Metro com IP Tailscale (`100.110.221.21`).
  - `dev-stop` (`bun run dev:stop`): encerra com segurança o Expo Metro (porta 8081) e os containers Docker.
  - `backend-init` (`bun run backend:up`): gerencia containers Docker do PostgreSQL e FastAPI.
  - `backend-stop` (`bun run backend:down`): encerra containers do backend.
  - `bun run test:backend`: executa a suíte de testes assíncronos do backend (`pytest-asyncio`).

---

## 2. Formulário e Interface Concluídos

O app mobile possui o fluxo de cadastro, listagem e menu de preferências completo, integrado ao backend e com suporte a tema claro/escuro:
1. **Nome do Produto:** Campo de texto obrigatório (mínimo de 3 caracteres).
2. **Condição do Produto:** Chips (`Novo`, `Como novo`, `Seminovo`, `Usado`).
3. **Categoria / Nicho:** Chips (6 categorias canônicas).
4. **Preço e Observações:** Campo com conversão em BRL e textarea.
5. **Menu de Configurações (`configuracao.tsx`):** Ajuste de tema visual (`Escuro`, `Claro`, `Automático`), preferências de IA para anúncios, status de marketplaces parceiros e dropdown colapsável de Configurações Avançadas para ajuste do endpoint com padrão Tailscale (`100.110.221.21:8000`) ou endpoint personalizado.
6. **Card de Produto (`ProductCard.tsx`):** Miniatura da foto principal, nome, linha `Condição • Categoria`, preço em destaque, badge de status semântico.
7. **Envio Real:** `captura.tsx` envia dados + fotos via `multipart/form-data` para a API FastAPI.
8. **Listagem Real:** `produtos.tsx` carrega produtos da API ao montar, com busca em tempo real, Pull-to-Refresh e estados de loading/erro/vazio.

---

## 3. Arquitetura de Backend Replanejada (`api-scaffolding`)

- **Docker Compose:** Serviço `db` (PostgreSQL 16 Alpine com healthcheck) + `backend` (FastAPI Python 3.13-slim com volume de testes).
- **Banco de Dados:** Tabela `produtos` com UUID PK (`gen_random_uuid()`), ENUMs canônicos de status/condição/categoria, índice em `created_at DESC`.
- **API FastAPI:** `POST /produtos` (multipart), `GET /produtos`, `GET /produtos/{id}`, `GET /health` (com verificação de integridade do pool).
- **Repository Pattern:** `ProductRepository` cuidando de queries, commits e rollback.
- **Suíte de Testes:** Executável diretamente com `docker exec posta-ai-backend pytest -v /app/tests`.

---

## 4. Próximos Passos

- **Validação de Fluxo E2E no Dispositivo:** Realizar cadastro de produto com foto real pelo celular via Tailscale e verificar aparição instantânea no catálogo.
- **Fase 4 — Enriquecimento com IA:** Integração com LLMs multimodais para geração de título atraente, descrição curta, descrição longa para marketplace, estimativa de preço de mercado e sugestão de preço.
