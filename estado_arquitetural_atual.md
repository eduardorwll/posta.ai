# Estado Arquitetural Atual — posta.ai

> Fotografia do repositório `posta-ai-app` atualizada em 2026-10-15. Fase 3 implementada: backend FastAPI + PostgreSQL via Docker, cliente HTTP dinâmico no mobile, store de configuração com `expo-secure-store`, teste de conexão em tempo real, aba de configuração e **Tema Claro Real e Funcional** com store Zustand (`useThemeStore`), persistência segura e hook `useAppTheme()`.
> Fonte de contexto de negócio: `docs/documentacao_mestre_posta_ai.md`.

---

## 1. Visão Geral do Projeto & Identidade Visual

### 1.1 Propósito
O **posta.ai** é um hub **C2C** (*Consumer to Consumer*) para vendedores pessoa física e brechós independentes. O objetivo é reduzir o trabalho de anunciar o mesmo produto em várias plataformas (Enjoei, Facebook Marketplace, OLX, Mercado Livre): o usuário fotografa o item (1 a 5 fotos), informa nome, valor desejado, observações, condição e categoria, e o sistema (em fases futuras) enriquece o anúncio com IA, sugere preço de mercado e publica nos canais via automação.

**Hoje existe o app mobile funcional** com captura de fotos na qualidade original, recuperação de processos no Android, modelagem de dados completa, listagem local em memória, **configuração dinâmica de endpoint com persistência segura**, **suporte completo a temas (Claro, Escuro e Automático)** e **backend FastAPI com PostgreSQL** para persistência real via Docker. A Fase 4 introduzirá o enriquecimento com IA, sugestão de preço de mercado e publicação multi-canal.

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

### 1.3 Ícones
- `@hugeicons/react-native` (`HugeiconsIcon`) + `@hugeicons/core-free-icons`.
- Ícones em uso: `Camera01Icon`, `ShoppingBag01Icon`, `Settings01Icon` (abas), `Image01Icon`, `Delete02Icon` (PhotoGrid), `AlarmClockIcon`, `Loading03Icon`, `CheckmarkCircle02Icon`, `Alert02Icon`, `ServerIcon`, `RefreshIcon`, `ArrowDown01Icon`, `ArrowUp01Icon`, `SparklesIcon` (Configuração), `PackageIcon` (estado vazio).
- Renderizados com `strokeWidth` entre 1.5 e 2.

### 1.4 Gluestack UI v5
- Componentes copiados em `components/ui/` (raiz): `badge`, `box`, `button`, `card`, `form-control`, `gluestack-ui-provider`, `hstack`, `input`, `text`, `textarea`, `vstack`.
- Estilização via NativeWind v5 + Tailwind CSS v4 (`tva` do `@gluestack-ui/utils`).

### 1.5 Identidade e Assets
- Fontes vetoriais: `assets/posta.ai.icon/icon.svg` e `isotipo.svg`.
- PNGs derivados em `assets/images/`: `icon.png` (1024, sem alpha), `splash-icon.png`, `android-icon-foreground.png`, `favicon.png`, `isotipo.png` (256, consumido no `AppHeader` em 48×48 px).
- O app não importa `.svg` em runtime, evitando instabilidade de carregamento no bundle nativo.

---

## 2. Arquitetura Atual e Estrutura de Pastas

### 2.1 Stack e Versões (conforme `package.json`)

| Tecnologia | Versão |
|---|---|
| Gerenciador de Pacotes | **Bun** `1.4.0` (`bun.lock`) |
| Expo SDK | `~57.0.28` |
| React / React DOM | `19.2.3` |
| React Native | `0.86.3` |
| Expo Router | `~57.0.26` |
| NativeWind | `^5.0.0-rc.0` (+ `react-native-css ^3.0.7`) |
| Tailwind CSS / `@tailwindcss/postcss` | `^4.3.3` |
| Gluestack | `@gluestack-ui/core ^5.0.15`, `utils ^5.0.6` |
| Zustand | `^5.0.15` |
| Hugeicons | `react-native ^1.0.16`, `core-free-icons ^4.3.5` |
| `react-native-svg` | `^15.15.5` |
| `expo-image` / `expo-image-picker` / `expo-secure-store` | `~57.0.5` / `~57.0.20` / `~57.0.4` |
| Reanimated / Worklets | `4.5.1` / `0.10.1` |
| TypeScript / ESLint | `~6.0.3` / `^9.0.0` |

*Nota:* `expo-image-manipulator` e `src/lib/compress-image.ts` foram removidos do projeto. O projeto foi migrado de `npm` para `bun` (`bun.lock`).

### 2.2 Mapa de Pastas

```text
posta-ai-app/
├── app.json                  # Configuração Expo (automatic, splash/adaptive icon #004643, plugins)
├── babel.config.js           # babel-preset-expo + nativewind/babel + module-resolver + worklets
├── bun.lock                  # Lockfile oficial do gerenciador de pacotes Bun
├── docker-compose.yml        # Serviços db (PostgreSQL 16 Alpine) + backend (FastAPI)
├── metro.config.js           # withNativewind
├── postcss.config.mjs        # Tailwind v4
├── tsconfig.json             # paths: "@/*" -> ./src/*, ./*  |  "@/assets/*" -> ./assets/*
├── eslint.config.js
├── estado_arquitetural_atual.md  # Este documento de referência
├── estado_atual.md           # Snapshot resumido e compilado
├── AGENTS.md                 # Regras de manutenção do projeto, aprovação prévia e otimização de tokens (omni-compression)
├── CLAUDE.md                 # Referência para Claude Code às diretrizes de AGENTS.md
├── open-omni (open-omni.sh)   # Script bash para inicialização do ambiente (OmniRoute daemon + Expo via 'bun expo start -c' com REACT_NATIVE_PACKAGER_HOSTNAME + OpenCode com --auto)
├── stop-omni (stop-omni.sh)   # Script bash para encerramento dos serviços locais (OmniRoute daemon e Expo)
├── opencode.json             # Configuração e contexto do OpenCode (permissões automáticas sob governança prévia)
├── .agents/skills/           # Skills locais para os agentes (Expo, EAS, Gluestack e omni-compression)
├── docs/documentacao_mestre_posta_ai.md   # Visão de negócio e arquitetura-alvo
├── assets/
│   ├── posta.ai.icon/        # SVGs originais (icon, isotipo)
│   └── images/               # PNGs consumidos pelo Expo
├── backend/                  # API FastAPI (Python 3.13)
│   ├── Dockerfile
│   ├── requirements.txt      # fastapi, uvicorn, psycopg, pydantic, python-multipart
│   └── src/
│       ├── main.py           # App FastAPI + CORS + StaticFiles /storage + /health
│       ├── config.py         # Variáveis de ambiente
│       ├── database.py       # Pool de conexões async (psycopg)
│       ├── schemas/product.py # Pydantic models espelhando product.ts
│       └── routes/produtos.py # POST/GET /produtos
├── infra/
│   ├── init.sql              # pgcrypto, ENUMs, tabela produtos
│   └── volumes/
│       ├── pgdata/           # Volume persistente PostgreSQL
│       └── storage/          # Fotos dos produtos
├── components/ui/            # Gluestack UI v5 (raiz)
└── src/
    ├── app/
    │   ├── _layout.tsx       # GluestackUIProvider dinâmico + ThemeProvider dinâmico + StatusBar dinâmica + Stack
    │   ├── index.tsx         # <Redirect href="/(tabs)/captura" />
    │   └── (tabs)/
    │       ├── _layout.tsx   # Tabs: Capturar / Meus Produtos / Configuração com palette dinâmica
    │       ├── captura.tsx   # Tela de cadastro (fotos + envio real via API) com palette dinâmica
    │       ├── produtos.tsx  # Listagem da API + Pull-to-Refresh com palette dinâmica
    │       └── configuracao.tsx # Tela de configuração de tema, IA, canais e endpoint com palette dinâmica
    ├── components/           # AppHeader, ChipSelector, PhotoGrid, ProductCard
    ├── constants/theme.ts    # Palettes (dark/light), useAppTheme() hook e tokens semânticos
    ├── lib/
    │   ├── api.ts            # Cliente HTTP dinâmico + testarConexaoApi()
    │   └── haptics.ts        # Utilitário de feedback físico tátil (expo-haptics)
    ├── store/useApiConfigStore.ts # Store Zustand com persistência em expo-secure-store
    ├── store/useThemeStore.ts # Store Zustand de tema com persistência em expo-secure-store
    ├── store/useProductStore.ts # Store Zustand com ações assíncronas (fetch/cadastrar)
    ├── types/product.ts      # Contratos Produto, ProductStatus, ProductCondition, ProductCategory
    └── global.css            # Tokens Tailwind/Gluestack
```

### 2.3 Responsabilidades dos Componentes

| Arquivo | Responsabilidade |
|---|---|
| `src/app/_layout.tsx` | Provider Gluestack em modo dinâmico, tema de navegação com a paleta dinâmica, `StatusBar` dinâmica, `Stack` sem header. Inicialização do tema via `useThemeStore` e da API via `useApiConfigStore`. |
| `src/app/(tabs)/_layout.tsx` | `Tabs` do Expo Router com ícones Hugeicons; TabBar e cores dinâmicas via `useAppTheme()`. |
| `src/app/(tabs)/captura.tsx` | Permissões, captura (câmera/galeria com `quality: 1`), formulário com validações inline (`palette.danger`), teclado decimal e feedback háptico. |
| `src/app/(tabs)/produtos.tsx` | `FlatList` com busca instantânea em memória, skeleton loader, empty states acionáveis, Pull-to-Refresh e feedback tátil. |
| `src/app/(tabs)/configuracao.tsx` | Menu de preferências com seções de Aparência conectada (`Escuro`, `Claro`, `Automático`), IA/Anúncios, Canais de Venda e Configurações Avançadas com haptics e status semânticos. |
| `src/components/ChipSelector.tsx` | Componente reutilizável de seleção em chips com paleta dinâmica e feedback tátil `haptic.selection()`. |
| `src/components/PhotoGrid.tsx` | Grid de fotos com destaque visual de Foto de Capa (índice 0), preview (`expo-image`), exclusão individual e feedback háptico. |
| `src/components/ProductCard.tsx` | Card com miniatura, título, linha `"Condição • Categoria"`, preço, badges de status semânticos, cache de disco/memória e resposta tátil ao toque. |
| `src/components/AppHeader.tsx` | Isotipo (`isotipo.png` em 48×48 px) + título "posta.ai" + subtítulo opcional com paleta dinâmica. |
| `src/lib/haptics.ts` | Módulo profundo encapsulando `expo-haptics` com tratamento à prova de falhas para Web/Android/iOS. |
| `src/lib/api.ts` | Cliente HTTP com URL dinâmica obtida via `useApiConfigStore`, upload multipart de fotos e função `testarConexaoApi()`. |
| `src/store/useApiConfigStore.ts` | Store Zustand com persistência assíncrona via `expo-secure-store`, padrão Tailscale `100.110.221.21:8000`. |
| `src/store/useThemeStore.ts` | Store Zustand de tema com persistência assíncrona via `expo-secure-store` (`posta_ai_theme_mode`). |
| `src/store/useProductStore.ts` | Store Zustand com ações assíncronas: `fetchProdutos()`, `cadastrarProduto()`, estados `isLoading` e `error`. |
| `src/types/product.ts` | Tipos `ProductStatus`, `ProductCondition`, `ProductCategory`, `Produto` e dicionários de labels. |

---

## 3. O que JÁ ESTÁ Implementado e Funcionando

- **Execução em Dispositivo Validada:** O aplicativo roda com estabilidade no **Expo Go** e development builds, sem travamento na Splash.
- **Tema Claro Real e Funcional:**
  - Store Zustand `useThemeStore` com persistência segura (`expo-secure-store`) sob a chave `posta_ai_theme_mode`.
  - Hook `useAppTheme()` em `src/constants/theme.ts` gerenciando os modos `dark`, `light` e `system`.
  - Paletas completas para modo escuro (`#004643`) e modo claro (`#f2f7f5`) aplicadas em todas as telas, componentes e navegação.
- **Formulário Completo de Cadastro:**
  - 1 a 5 fotos com qualidade máxima original (`quality: 1`, sem compressão).
  - Campo "Nome do Produto" (obrigatório, mínimo de 3 caracteres).
  - Seletor de Condição (`novo`, `como_novo`, `seminovo`, `usado`) via chips.
  - Seletor de Categoria (6 categorias) via chips.
  - Campo "Valor Desejado (R$)" com conversão e validação numérica.
  - Campo "Observações do Usuário" (textarea).
- **Configuração de Servidor e Conectividade:**
  - Aba de configuração com input de URL e atalhos rápidos.
  - Persistência segura da URL utilizando `expo-secure-store`.
  - Teste de conexão em tempo real (`GET /health`) com cálculo de latência e status HTTP.
- **Listagem e Cards:**
  - `ProductCard` exibindo miniatura, título destacado, linha descritiva `"Condição • Categoria"`, preço em destaque e badge de status dinâmico.
- **Backend FastAPI (Fase 3):**
  - `POST /produtos`: recebe dados + fotos via `multipart/form-data`, salva em disco e insere no PostgreSQL com status `pendente`.
  - `GET /produtos`: lista em ordem decrescente de criação com URLs completas das fotos.
  - `GET /produtos/{id}`: busca produto por ID.
  - `GET /health`: verificação de saúde e latência.
  - Fotos servidas via StaticFiles em `/storage`.
  - CORS liberado para todas as origens.
- **Conformidade de Código:**
  - `bunx tsc --noEmit`: 0 erros.
  - `bunx expo lint`: 0 erros (warnings de boilerplate do Gluestack).

---

## 4. Próximos Passos

- **Teste de Integração Backend (Fase 3):** Subir `docker-compose up --build` e testar o fluxo completo no dispositivo.
- **Fase 4 — Enriquecimento com IA:** Descrição automática, sugestão de preço de mercado e publicação multi-canal.
