# Estado Arquitetural Atual — posta.ai

> Fotografia do repositório `posta-ai-app` atualizada em 2026-10-15. Fase 3 concluída com arquitetura profissional orientada por **`addyosmani/agent-skills`** (`code-simplification`, `deprecation-and-migration`, `planning-and-task-breakdown`, `source-driven-development`), **`ui-ux-pro-max`** e regras de engenharia de software canônicas (*Clean Architecture*, *APOSD*, *Release It!* e *Code Complete*).
> Fonte de contexto de negócio: `docs/documentacao_mestre_posta_ai.md`.

---

## 1. Visão Geral do Projeto & Identidade Visual

### 1.1 Propósito
O **posta.ai** é um hub **C2C** (*Consumer to Consumer*) para vendedores pessoa física e brechós independentes. O objetivo é reduzir o trabalho de anunciar o mesmo produto em várias plataformas (Enjoei, Facebook Marketplace, OLX, Mercado Livre): o usuário fotografa o item (1 a 5 fotos), informa nome, valor desejado, observações, condição e categoria, e o sistema (em fases futuras) enriquece o anúncio com IA, sugere preço de mercado e publica nos canais via automação.

**Hoje existe o app mobile funcional** com captura de fotos na qualidade original, recuperação de processos no Android, modelagem de dados completa, listagem com busca instantânea em memória, **suporte completo a temas (Claro, Escuro e Automático)**, **feedback háptico físico** e **arquitetura 100% Serverless no Supabase Cloud** com PostgREST e Storage CDN. A Fase 4 introduzirá o enriquecimento com IA, sugestão de preço de mercado e publicação multi-canal.

### 1.2 Paleta de Cores Dinâmica (`useAppTheme`)
Definida em `Palettes` (`src/constants/theme.ts`) e consumida dinamicamente via hook `useAppTheme()` em todas as telas, componentes e navegação.

| Token | Hex (Dark) | Hex (Light) | Uso |
|---|---|---|---|
| `background` | `#004643` | `#f2f7f5` | Fundo principal das telas, `sceneStyle` das abas |
| `surface` | `#001e1d` | `#ffffff` | TabBar, cards, inputs/textarea, tiles de adicionar foto, chips inativos |
| `headline` | `#fffffe` | `#002926` | Títulos, textos digitados, chip selecionado |
| `paragraph` | `#abd1c6` | `#4a6f68` | Labels, placeholders, textos secundários, aba inativa, borda tracejada |
| `highlight` | `#f9bc60` | `#004643` | Botão principal (CTA), borda de input em foco, aba ativa, borda de chip ativo, preço no card, badge "Pendente" |
| `onHighlight` | `#001e1d` | `#ffffff` | Texto (negrito) sobre o CTA e no badge |
| `tertiary` | `#e16162` | `#dc2626` | Excluir foto, mensagens de erro/validação |

Tokens Semânticos Adicionais: `badgeCover` (`#f59e0b`), `success` (`#10b981`), `warning` (`#f59e0b`), `danger` (`#ef4444`), `surfaceSubtle`, `borderSubtle`.

### 1.3 Ícones
- `@hugeicons/react-native` (`HugeiconsIcon`) + `@hugeicons/core-free-icons`.
- Ícones em uso: `Camera01Icon`, `ShoppingBag01Icon`, `Settings01Icon` (abas), `Image01Icon`, `Delete02Icon` (PhotoGrid), `AlarmClockIcon`, `Loading03Icon`, `CheckmarkCircle02Icon`, `Alert02Icon`, `CloudIcon`, `Database01Icon`, `RefreshIcon`, `SparklesIcon` (Configuração), `PackageIcon` (estado vazio).

### 1.4 Gluestack UI v5
- Componentes enxutos em `components/ui/` (raiz): `button`, `form-control`, `gluestack-ui-provider`, `hstack`, `input`, `text`, `textarea`, `vstack`. (Componentes mortos `box`, `card` e `badge` foram purgados).
- Estilização via NativeWind v5 + Tailwind CSS v4 (`tva` do `@gluestack-ui/utils`).

### 1.5 Identidade e Assets
- Fontes vetoriais: `assets/posta.ai.icon/icon.svg` e `isotipo.svg`.
- PNGs derivados em `assets/images/`: `icon.png` (1024, sem alpha), `splash-icon.png`, `android-icon-foreground.png`, `favicon.png`, `isotipo.png` (256, consumido no `AppHeader` em 48×48 px).

---

## 2. Arquitetura Atual e Estrutura de Pastas

### 2.1 Stack e Versões (conforme `package.json`)

| Tecnologia | Versão |
|---|---|
| Gerenciador de Pacotes | **Bun** `1.4.0` (`bun.lock`) |
| Expo SDK | `~57.0.30` |
| React / React Native | `19.2.3` / `0.86.3` |
| Expo Router | `~57.0.28` |
| Supabase SDK | `@supabase/supabase-js ^2.118.0` |
| Buffer Parsing | `base64-arraybuffer ^1.0.2` |
| NativeWind / Tailwind CSS | `^5.0.0-rc.0` / `^4.3.3` |
| Gluestack | `@gluestack-ui/core ^5.0.15`, `utils ^5.0.6` |
| Zustand | `^5.0.15` |
| Persistência Local | `@react-native-async-storage/async-storage 2.2.0`, `expo-secure-store ~57.0.4` |
| Hugeicons | `react-native ^1.0.16`, `core-free-icons ^4.3.5` |
| Câmera & Imagens | `expo-camera ~57.0.6`, `expo-image ~57.0.5`, `expo-image-picker ~57.0.20`, `expo-image-manipulator ~57.0.21`, `expo-file-system ~57.0.7` |
| Feedback Tátil | `expo-haptics ~57.0.3` |
| Reanimated / Worklets | `4.5.1` / `0.10.1` |
| TypeScript / ESLint | `~6.0.3` / `^9.0.0` |

### 2.2 Mapa de Pastas

```text
posta-ai-app/
├── app.json                  # Configuração Expo (automatic, splash/adaptive icon #004643, plugins)
├── babel.config.js           # babel-preset-expo + nativewind/babel + module-resolver + worklets
├── bun.lock                  # Lockfile oficial do gerenciador de pacotes Bun
├── metro.config.js           # withNativewind (limpo, sem blocklists de containers)
├── tsconfig.json             # paths: "@/*" -> ./src/*, ./*  |  "@/assets/*" -> ./assets/*
├── eslint.config.js
├── tasks/                    # Gestão de tarefas e governança (planning-and-task-breakdown)
│   └── todo.md               # Checklist granular de tarefas executáveis do projeto
├── ROADMAP.md                # Roadmap perene das 5 etapas do posta.ai
├── estado_arquitetural_atual.md  # Este documento de referência
├── estado_atual.md           # Snapshot resumido e compilado
├── AGENTS.md                 # Regras de governança de IA, aprovação prévia, protocolo de tarefas e padrões Expo
├── CLAUDE.md                 # Referência para Claude Code às diretrizes de AGENTS.md
├── .env.example              # Modelo canônico de variáveis de ambiente do Supabase
├── .env                      # Arquivo de variáveis locais (gitignored)
├── .agents/skills/           # Skills locais (addyosmani/agent-skills, ui-ux-pro-max, agent-rules-books)
├── supabase/
│   ├── config.toml           # Configuração canônica da Supabase CLI para CI/CD
│   ├── schema.sql            # Script SQL canônico consolidado (tabelas, enums, storage, RLS e multi-usuário)
│   ├── verify_isolation.sql  # Script canônico de teste e validação adversarial de RLS
│   └── migrations/           # Migrações versionadas para deploys rastreáveis
│       ├── 20261015000000_init_schema.sql     # Migração base inicial
│       └── 20261015000001_multi_user_auth.sql # Adição de user_id, índice composto e isolamento RLS
├── components/ui/            # Gluestack UI v5 enxuto (button, input, textarea, form-control, hstack, vstack, text)
└── src/
    ├── app/
    │   ├── _layout.tsx       # RootLayout: Gluestack + ThemeProvider + useAuthStore guarda de rotas + Splash control
    │   ├── index.tsx         # Redirecionamento condicional baseado na sessão ativa
    │   ├── (auth)/           # Grupo de rotas públicas de autenticação
    │   │   ├── _layout.tsx   # Stack layout temático para autenticação
    │   │   ├── login.tsx     # Tela nativa de login com e-mail/senha e validações inline
    │   │   └── cadastro.tsx  # Tela de criação de conta com instruções amigáveis de confirmação por e-mail
    │   └── (tabs)/
    │       ├── _layout.tsx   # Tabs com palette dinâmica e Hugeicons
    │       ├── captura.tsx   # Tela de cadastro (fotos + validações inline + envio real isolado)
    │       ├── produtos.tsx  # Catálogo com busca em tempo real + skeleton loader + pull-to-refresh
    │       └── configuracao.tsx # Menu de preferências (Perfil do vendedor, Logout, Aparência, IA, Monitor Supabase)
    ├── components/           # AppHeader (RNText), CameraModal (câmera in-app CameraView), ChipSelector, PhotoGrid, ProductCard
    ├── constants/theme.ts    # Palettes, tokens semânticos e useAppTheme()
    ├── lib/
    │   ├── api.ts            # Módulo profundo de produtos (Storage isolado {user_id}/{produto_id}/... + PostgREST + rollback)
    │   ├── haptics.ts        # Módulo profundo de feedback tátil físico
    │   └── supabase.ts       # Cliente Supabase singleton com AsyncStorage e checagem defensiva
    ├── store/useAuthStore.ts # Store Zustand de autenticação com onAuthStateChange e persistência no AsyncStorage
    ├── store/useDraftStore.ts # Store de rascunho com persistência em AsyncStorage para resiliência no Android
    ├── store/useThemeStore.ts # Store de tema com persistência em expo-secure-store
    ├── store/useProductStore.ts # Store de produtos com ações assíncronas
    └── types/product.ts      # Contratos canônicos de produtos e enums (com user_id)
```

---

## 3. Padrões de Arquitetura Serverless & Multi-Usuário

1. **Módulo Profundo de API (`src/lib/api.ts`):**
   - Preserva uma interface pública simples e estável: `cadastrarProduto(dados, fotos)`, `obterProdutos()`, `obterProduto(id)` e `testarConexaoApi()`.
   - As telas e stores consomem esses métodos sem conhecer os detalhes internos do Supabase.
   - **Checagem Defensiva de Sessão:** Valida `supabase.auth.getUser()` antes de processar qualquer imagem ou iniciar uploads, abortando precocemente em caso de token expirado e poupando banda do plano de dados móvel do vendedor.
2. **Pipeline Nativo de Upload com Isolamento por Vendedor:**
   - Otimização e downsampling fora da heap JavaScript com `expo-image-manipulator` (limite de 1920px Full HD e compressão JPEG 0.85).
   - Conversão segura para `ArrayBuffer` via `base64-arraybuffer`, compatível com o engine Hermes do React Native.
   - Streaming direto para o bucket `produtos` no Supabase Storage CDN sob a pasta do usuário autenticado: `{user_id}/{produto_id}/foto_{index}.jpg`.
   - Obtenção da URL pública no CDN Supabase (`getPublicUrl`).
   - Inserção do registro na tabela `produtos` via PostgREST vinculado ao `user_id`.
   - **Rollback Atômico:** Em caso de erro na gravação do banco de dados, o módulo remove automaticamente as fotos recém-enviadas da pasta do vendedor, prevenindo arquivos órfãos.
3. **Segurança e Isolamento em Banco e Storage (RLS):**
   - A tabela `produtos` possui Row Level Security (RLS) estrita: `SELECT`, `INSERT`, `UPDATE` e `DELETE` restritos a `(select auth.uid()) = user_id`.
   - **Otimização InitPlan:** O encapsulamento de `(select auth.uid())` em subquery instrui o otimizador do PostgreSQL a executar a checagem via `InitPlan` uma única vez por query, em vez de avaliar `auth.uid()` linha a linha.
   - O bucket `produtos` possui política de inserção, atualização e remoção validando `(storage.foldername(name))[1] = (select auth.uid())::text`.
   - Índice composto `idx_produtos_user_created ON produtos(user_id, created_at DESC)` acelera as buscas do catálogo do vendedor.
4. **Resiliência, Deep Linking e Persistência no Mobile:**
   - Formulário imune ao Low Memory Killer do Android via `useDraftStore` no `AsyncStorage`.
   - Autenticação e sessão persistentes via `AsyncStorage` e listener reativo `onAuthStateChange`.
   - **Deep Linking Nativo (`postaaiapp://`):** Integração com `expo-linking` (`useLinkingURL()`, `createURL('/')` e `parse()`). Em [`useAuthStore.handleDeepLink`](file:///home/eduardorwll/Projects/posta-ai-app/src/store/useAuthStore.ts), suporta fluxos implícitos (`#access_token=...`), fluxo PKCE (`?code=...`) e verificação OTP (`?token_hash=...`), eliminando falhas de redirecionamento para `localhost`.
   - Prevenção de flicker visual na inicialização via controle explícito de `SplashScreen.preventAutoHideAsync()` e `SplashScreen.hideAsync()`.
   - Preferências de tema persistidas com segurança no `expo-secure-store`.

---

## 4. Próximos Passos

- **Validação de Fluxo E2E no Dispositivo:** Cadastrar produto completo a partir do dispositivo móvel com foto da câmera em alta qualidade e verificar atualização em tempo real no catálogo.
- **Fase 4 — Enriquecimento com IA:** Integração com modelos multimodais para geração de título atraente, descrição curta, descrição longa para marketplace, estimativa de preço de mercado e sugestão de preço.
