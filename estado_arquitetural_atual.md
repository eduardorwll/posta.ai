# Estado Arquitetural Atual — posta.ai

> Fotografia do repositório `posta-ai-app` atualizada em 2026-10-15. Fase 3 concluída com arquitetura profissional orientada por **`api-scaffolding`**, **`fastapi-templates`**, **`ui-ux-pro-max`** e regras de engenharia de software canônicas (*Clean Architecture*, *APOSD*, *Release It!* e *Code Complete*).
> Fonte de contexto de negócio: `docs/documentacao_mestre_posta_ai.md`.

---

## 1. Visão Geral do Projeto & Identidade Visual

### 1.1 Propósito
O **posta.ai** é um hub **C2C** (*Consumer to Consumer*) para vendedores pessoa física e brechós independentes. O objetivo é reduzir o trabalho de anunciar o mesmo produto em várias plataformas (Enjoei, Facebook Marketplace, OLX, Mercado Livre): o usuário fotografa o item (1 a 5 fotos), informa nome, valor desejado, observações, condição e categoria, e o sistema (em fases futuras) enriquece o anúncio com IA, sugere preço de mercado e publica nos canais via automação.

**Hoje existe o app mobile funcional** com captura de fotos na qualidade original, recuperação de processos no Android, modelagem de dados completa, listagem local com busca instantânea em memória, **configuração dinâmica de endpoint com persistência segura**, **suporte completo a temas (Claro, Escuro e Automático)**, **feedback háptico físico** e **backend FastAPI com PostgreSQL** e arquitetura de repositório via Docker. A Fase 4 introduzirá o enriquecimento com IA, sugestão de preço de mercado e publicação multi-canal.

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
- Ícones em uso: `Camera01Icon`, `ShoppingBag01Icon`, `Settings01Icon` (abas), `Image01Icon`, `Delete02Icon` (PhotoGrid), `AlarmClockIcon`, `Loading03Icon`, `CheckmarkCircle02Icon`, `Alert02Icon`, `ServerIcon`, `RefreshIcon`, `ArrowDown01Icon`, `ArrowUp01Icon`, `SparklesIcon` (Configuração), `PackageIcon` (estado vazio).

### 1.4 Gluestack UI v5
- Componentes em `components/ui/` (raiz): `badge`, `box`, `button`, `card`, `form-control`, `gluestack-ui-provider`, `hstack`, `input`, `text`, `textarea`, `vstack`.
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
| Expo SDK | `~57.0.28` |
| React / React Native | `19.2.3` / `0.86.3` |
| Expo Router | `~57.0.26` |
| NativeWind / Tailwind CSS | `^5.0.0-rc.0` / `^4.3.3` |
| Gluestack | `@gluestack-ui/core ^5.0.15`, `utils ^5.0.6` |
| Zustand | `^5.0.15` |
| Hugeicons | `react-native ^1.0.16`, `core-free-icons ^4.3.5` |
| `expo-image` / `expo-image-picker` / `expo-secure-store` / `expo-haptics` | `~57.0.5` / `~57.0.20` / `~57.0.4` / `~57.0.3` |
| Reanimated / Worklets | `4.5.1` / `0.10.1` |
| TypeScript / ESLint | `~6.0.3` / `^9.0.0` |
| Python (Backend) | `3.13` (FastAPI `>=0.115`, `psycopg_pool>=3.2.3`, `pydantic>=2.9`, `pytest-asyncio>=0.24`) |
| PostgreSQL | `16-alpine` |

### 2.2 Mapa de Pastas

```text
posta-ai-app/
├── app.json                  # Configuração Expo (automatic, splash/adaptive icon #004643, plugins)
├── babel.config.js           # babel-preset-expo + nativewind/babel + module-resolver + worklets
├── bun.lock                  # Lockfile oficial do gerenciador de pacotes Bun
├── docker-compose.yml        # Serviços db (PostgreSQL 16) + backend (FastAPI com volume de testes)
├── metro.config.js           # withNativewind
├── pytest.ini                # Configuração de suíte de testes assíncronos do backend
├── tsconfig.json             # paths: "@/*" -> ./src/*, ./*  |  "@/assets/*" -> ./assets/*
├── eslint.config.js
├── estado_arquitetural_atual.md  # Este documento de referência
├── estado_atual.md           # Snapshot resumido e compilado
├── AGENTS.md                 # Regras de governança de IA, aprovação prévia e padrões Expo
├── CLAUDE.md                 # Referência para Claude Code às diretrizes de AGENTS.md
├── dev-start                 # Script de orquestração do ambiente de dev (Backend + Expo Metro)
├── dev-stop                  # Script para encerramento de todos os serviços de dev
├── backend-init              # Script bash para gerenciar containers Docker com healthcheck e logs
├── backend-stop              # Symlink para encerramento dos containers do backend
├── .agents/skills/           # Skills locais (api-scaffolding, fastapi-templates, ui-ux-pro-max, agent-rules-books)
├── backend/                  # API FastAPI (Python 3.13)
│   ├── Dockerfile            # Container com dependências de build (gcc, libpq-dev)
│   ├── requirements.txt      # fastapi, uvicorn, psycopg[binary,pool], pydantic, python-multipart, pytest
│   ├── tests/                # Suíte de testes automatizados com pytest-asyncio
│   │   ├── conftest.py       # Fixture async_client com ciclo de vida de pool
│   │   ├── test_health.py    # Teste de healthcheck
│   │   └── test_produtos.py  # Testes de upload, fotos, limites, busca e normalização de categoria
│   └── src/
│       ├── main.py           # App FastAPI + CORS + StaticFiles /storage + /health com probe de DB
│       ├── config.py         # Configurações de ambiente (DATABASE_URL, STORAGE_PATH)
│       ├── database.py       # Pool assíncrono psycopg 3 (AsyncConnectionPool), commit seguro e healthcheck
│       ├── repositories/     # Repository Pattern isolando persistência
│       │   └── product_repository.py # Repositório assíncrono de Produtos
│       ├── schemas/product.py # Pydantic V2 models espelhando o banco e types do mobile
│       └── routes/produtos.py # Rotas HTTP desacopladas com URLs dinâmicas para fotos
├── infra/
│   ├── init.sql              # pgcrypto, ENUMs, tabela produtos
│   └── volumes/
│       ├── pgdata/           # Volume persistente PostgreSQL (gitignored)
│       └── storage/          # Fotos dos produtos (gitignored)
├── components/ui/            # Gluestack UI v5 (raiz)
└── src/
    ├── app/
    │   ├── _layout.tsx       # GluestackUIProvider + ThemeProvider dinâmico + Stack
    │   ├── index.tsx         # <Redirect href="/(tabs)/captura" />
    │   └── (tabs)/
    │       ├── _layout.tsx   # Tabs com palette dinâmica e Hugeicons
    │       ├── captura.tsx   # Tela de cadastro (fotos + validações inline + envio real)
    │       ├── produtos.tsx  # Catálogo com busca em tempo real + skeleton loader + pull-to-refresh
    │       └── configuracao.tsx # Menu completo de preferências (Aparência, IA, Canais, Conexão)
    ├── components/           # AppHeader (RNText), ChipSelector, PhotoGrid, ProductCard (layout blindado)
    ├── constants/theme.ts    # Palettes, tokens semânticos e useAppTheme()
    ├── lib/
    │   ├── api.ts            # Cliente HTTP com normalização de URIs, detecção MIME e ApiException
    │   └── haptics.ts        # Módulo profundo de feedback tátil físico
    ├── store/useApiConfigStore.ts # Store de endpoint com padrão Tailscale (100.110.221.21:8000) e auto-migração
    ├── store/useThemeStore.ts # Store de tema com persistência em expo-secure-store
    ├── store/useProductStore.ts # Store de produtos com ações assíncronas
    └── types/product.ts      # Contratos canônicos sincronizados com o backend
```

---

## 3. Padrões de Backend (`api-scaffolding`)

1. **Separação em Camadas:**
   - **Rotas (`routes/produtos.py`)**: Validação de parâmetros HTTP, upload de fotos e formatação de resposta.
   - **Repositório (`repositories/product_repository.py`)**: Execução de SQL, transações, binding de parâmetros.
   - **Banco (`database.py`)**: Gerenciamento de pool assíncrono (`psycopg_pool.AsyncConnectionPool`) com abertura explícita (`open=False`) e verificação de saúde do banco no endpoint `/health`.
2. **URLs de Mídia Dinâmicas:** Fotos servidas via StaticFiles utilizam `request.base_url` para resolução em tempo de execução, garantindo funcionamento tanto em `localhost` quanto em rede móvel local ou Tailscale (`100.110.221.21:8000`).
3. **Resiliência e Rollback:** Falhas durante o processamento de imagens ou gravação em banco realizam a exclusão física do diretório temporário criado, prevenindo arquivos órfãos em disco.
4. **Normalização Inteligente de Enums:** O schema Pydantic implementa o método `_missing_` em `ProductCategory`, mapeando entradas amigáveis (ex: "Roupas e Calcados") automaticamente para os enums canônicos do banco (`roupas_acessorios`).

---

## 4. Próximos Passos

- **Validação de Fluxo E2E no Dispositivo:** Cadastrar produto completo a partir do dispositivo móvel com foto da câmera em alta qualidade e verificar atualização em tempo real no catálogo.
- **Fase 4 — Enriquecimento com IA:** Integração com LLMs multimodais para geração de título atraente, descrição curta, descrição longa para marketplace, estimativa de preço de mercado e sugestão de preço.
