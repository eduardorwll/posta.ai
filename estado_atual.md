# Estado Atual do Projeto — posta.ai

> Snapshot compilado em 2026-10-15. Implementado o **Tema Claro Real e Funcional** com store Zustand (`useThemeStore`), persistência via `expo-secure-store`, hook `useAppTheme()` e paletas dinâmicas integradas em todas as telas, componentes e navegação.

---

## 1. Status Geral de Funcionamento
- **Execução em Dispositivo:** **Aprovada** (Fase 2). App roda de forma fluida no dispositivo móvel, sem travamento na Splash Screen.
- **Tema Claro e Escuro Dinâmico:** Suporte completo a temas (`Escuro`, `Claro`, `Automático`), com persistência segura (`expo-secure-store`) e transição em tempo real na UI.
- **Identidade Visual no Topo (`AppHeader.tsx`):** Isotipo ampliado para 48×48 px para maior destaque e presença visual da marca.
- **Gerenciador de Pacotes:** **Bun** (`bun.lock`).
- **Validação de Código:**
  - `bunx tsc --noEmit`: 0 erros.
  - `bunx expo lint`: 0 erros (18 warnings de boilerplate do Gluestack UI v5).
- **Backend (Fase 3):**
  - API FastAPI com PostgreSQL 16 Alpine via `docker-compose.yml`.
  - Endpoints `POST /produtos` (multipart/form-data com fotos), `GET /produtos`, `GET /produtos/{id}`, `GET /health`.
  - Persistência de fotos em disco local (`/app/storage/produtos/{id}/`), servidas via StaticFiles em `/storage`.
  - Pool de conexões assíncrono com `psycopg[binary]` (sem ORM/SQLAlchemy).
  - CORS liberado para todas as origens.
  - Init SQL com `pgcrypto`, ENUMs e tabela `produtos` com UUID PK.
- **Mobile (Fase 3):**
  - `src/lib/api.ts`: cliente HTTP com base URL dinâmica gerenciada pela store `useApiConfigStore`.
  - `src/store/useApiConfigStore.ts`: store Zustand com persistência assíncrona via `expo-secure-store`, tendo `http://100.110.221.21:8000` (Tailscale) como padrão oficial do sistema.
  - `src/store/useThemeStore.ts`: store Zustand de tema com persistência assíncrona (`posta_ai_theme_mode`).
  - `src/app/(tabs)/configuracao.tsx`: menu completo de preferências com seções de Aparência conectada, IA/Anúncios, Canais de Venda e dropdown colapsável de Configurações Avançadas (Padrão / Personalizado), teste de conexão com latência e status HTTP.
  - `useProductStore.ts`: ações assíncronas `fetchProdutos()` e `cadastrarProduto()`, estados `isLoading` e `error`.
  - `captura.tsx`: envio real para a API com feedback de loading (botão desabilitado + texto "Enviando...") e tratamento de erros.
  - `produtos.tsx`: carregamento automático da API ao montar, Pull-to-Refresh, estados de loading/erro/vazio.
- **Gerenciamento de Mídia:**
  - Seleção de 1 a 5 fotos via câmera ou galeria com **qualidade original máxima** (`quality: 1`), sem compressão.
  - Recuperação de fotos após reinício da Activity no Android via `ImagePicker.getPendingResultAsync()`.
- **Scripts e Ferramentas Locais:**
  - `open-omni`: sobe OmniRoute daemon + Expo (`REACT_NATIVE_PACKAGER_HOSTNAME=100.110.221.21 bun expo start -c`) + OpenCode TUI.
  - `stop-omni`: encerra OmniRoute + Expo e libera a porta 8081.
- **Diretrizes e Governança de Agentes:**
  - Aprovação prévia obrigatória antes de qualquer alteração (`AGENTS.md`, `CLAUDE.md`, `~/.config/opencode/GLOBAL_RULES.md`).
  - Uso obrigatório de `bunx` em vez de `npx`.
  - Skill `omni-compression` para economia de tokens.

---

## 2. Formulário e Interface Concluídos

O app mobile possui o fluxo de cadastro, listagem e menu de preferências completo, integrado ao backend e com suporte a tema claro/escuro:
1. **Nome do Produto:** Campo de texto obrigatório (mínimo de 3 caracteres).
2. **Condição do Produto:** Chips (`Novo`, `Como novo`, `Seminovo`, `Usado`).
3. **Categoria / Nicho:** Chips (6 categorias).
4. **Preço e Observações:** Campo com conversão em BRL e textarea.
5. **Menu de Configurações (`configuracao.tsx`):** Ajuste de tema visual (`Escuro`, `Claro`, `Automático`), preferências de IA para anúncios, status de marketplaces parceiros e dropdown colapsável de Configurações Avançadas para ajuste do endpoint com padrão Tailscale (`100.110.221.21:8000`) ou endpoint personalizado.
6. **Card de Produto (`ProductCard.tsx`):** Miniatura da foto principal, nome, linha `Condição • Categoria`, preço em destaque, badge de status dinâmico.
7. **Envio Real:** `captura.tsx` envia dados + fotos via `multipart/form-data` para a API FastAPI.
8. **Listagem Real:** `produtos.tsx` carrega produtos da API ao montar, com Pull-to-Refresh e estados de loading/erro/vazio.

---

## 3. Arquitetura de Backend (Fase 3)

- **Docker Compose:** Serviço `db` (PostgreSQL 16 Alpine) + `backend` (FastAPI Python 3.13-slim).
- **Banco de Dados:** Tabela `produtos` com UUID PK (`gen_random_uuid()`), ENUMs de status/condição/categoria, índice em `created_at DESC`.
- **API FastAPI:** `POST /produtos` (multipart), `GET /produtos`, `GET /produtos/{id}`, `GET /health`. Fotos servidas em `/storage` via StaticFiles.
- **Cliente Mobile:** `src/lib/api.ts` com URL dinâmica obtida via `useApiConfigStore`.

---

## 4. Próximos Passos

- **Teste de Integração:** Subir `docker-compose up --build` e testar o fluxo completo (configuração de endpoint → cadastro → listagem → Pull-to-Refresh) no dispositivo.
- **Fase 4:** Enriquecimento com IA (descrição automática, sugestão de preço, publicação multi-canal).
