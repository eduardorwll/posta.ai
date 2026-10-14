# Estado Arquitetural Atual — posta.ai

> Fotografia do repositório `posta-ai-app` atualizada em 2026-10-14, compilando a modelagem de dados da Fase 2 com fotos em resolução máxima (`quality: 1`, sem compressão), validação estática e pendência de teste em dispositivo.
> Fonte de contexto de negócio: `docs/documentacao_mestre_posta_ai.md`.

---

## 1. Visão Geral do Projeto & Identidade Visual

### 1.1 Propósito
O **posta.ai** é um hub **C2C** (*Consumer to Consumer*) para vendedores pessoa física e brechós independentes. O objetivo é reduzir o trabalho de anunciar o mesmo produto em várias plataformas (Enjoei, Facebook Marketplace, OLX, Mercado Livre): o usuário fotografa o item (1 a 5 fotos), informa nome, valor desejado, observações, condição e categoria, e o sistema (em fases futuras) enriquece o anúncio com IA, sugere preço de mercado e publica nos canais via automação.

**Hoje existe o app mobile funcional** com captura de fotos na qualidade original, recuperação de processos no Android, modelagem de dados completa e listagem local em memória. A Fase 3 introduzirá o backend (FastAPI) e a persistência em banco de dados (PostgreSQL).

### 1.2 Paleta de Cores
Definida em `Palette` (`src/constants/theme.ts`) e aplicada nas telas e componentes (via `Palette` ou classes arbitrárias do NativeWind, ex.: `bg-[#001e1d]`).

| Token | Hex | Uso |
|---|---|---|
| `background` | `#004643` | Fundo principal das telas, `sceneStyle` das abas, splash e adaptive icon |
| `surface` | `#001e1d` | TabBar, cards, inputs/textarea, tiles de adicionar foto, chips inativos |
| `headline` | `#fffffe` | Títulos, textos digitados, chip selecionado |
| `paragraph` | `#abd1c6` | Labels, placeholders, textos secundários, aba inativa, borda tracejada |
| `highlight` | `#f9bc60` | Botão principal (CTA), borda de input em foco, aba ativa, borda de chip ativo, preço no card, badge "Pendente" |
| `onHighlight` | `#001e1d` | Texto (negrito) sobre o CTA e no badge |
| `tertiary` | `#e16162` | Excluir foto, mensagens de erro/validação |

### 1.3 Ícones
- `@hugeicons/react-native` (`HugeiconsIcon`) + `@hugeicons/core-free-icons`.
- Ícones em uso: `Camera01Icon`, `ShoppingBag01Icon` (abas), `Image01Icon`, `Delete02Icon` (PhotoGrid), `AlarmClockIcon`, `Loading03Icon`, `CheckmarkCircle02Icon`, `Alert02Icon` (badges dinâmicos), `PackageIcon` (estado vazio).
- Renderizados com `strokeWidth` entre 1.5 e 2.

### 1.4 Gluestack UI v5
- Componentes copiados em `components/ui/` (raiz): `badge`, `box`, `button`, `card`, `form-control`, `gluestack-ui-provider`, `hstack`, `input`, `text`, `textarea`, `vstack`.
- Estilização via NativeWind v5 + Tailwind CSS v4 (`tva` do `@gluestack-ui/utils`).

### 1.5 Identidade e Assets
- Fontes vetoriais: `assets/posta.ai.icon/icon.svg` e `isotipo.svg`.
- PNGs derivados em `assets/images/`: `icon.png` (1024, sem alpha), `splash-icon.png`, `android-icon-foreground.png`, `favicon.png`, `isotipo.png` (256, consumido no `AppHeader`).
- O app não importa `.svg` em runtime, evitando instabilidade de carregamento no bundle nativo.

---

## 2. Arquitetura Atual e Estrutura de Pastas

### 2.1 Stack e Versões (conforme `package.json`)

| Tecnologia | Versão |
|---|---|
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
| `expo-image` / `expo-image-picker` | `~57.0.5` / `~57.0.20` |
| Reanimated / Worklets | `4.5.1` / `0.10.1` |
| TypeScript / ESLint | `~6.0.3` / `^9.0.0` |

*Nota:* `expo-image-manipulator` e `src/lib/compress-image.ts` foram removidos do projeto.

### 2.2 Mapa de Pastas

```text
posta-ai-app/
├── app.json                  # Configuração Expo (dark, splash/adaptive icon #004643, plugins)
├── babel.config.js           # babel-preset-expo + nativewind/babel + module-resolver + worklets
├── metro.config.js           # withNativewind
├── postcss.config.mjs        # Tailwind v4
├── tsconfig.json             # paths: "@/*" -> ./src/*, ./*  |  "@/assets/*" -> ./assets/*
├── eslint.config.js
├── estado_arquitetural_atual.md  # Este documento de referência
├── estado_atual.md           # Snapshot resumido e compilado
├── AGENTS.md                 # Regras de manutenção do projeto
├── docs/documentacao_mestre_posta_ai.md   # Visão de negócio e arquitetura-alvo
├── assets/
│   ├── posta.ai.icon/        # SVGs originais (icon, isotipo)
│   └── images/               # PNGs consumidos pelo Expo
├── components/ui/            # Gluestack UI v5 (raiz)
└── src/
    ├── app/
    │   ├── _layout.tsx       # GluestackUIProvider (dark) + ThemeProvider + StatusBar light + Stack
    │   ├── index.tsx         # <Redirect href="/(tabs)/captura" />
    │   └── (tabs)/
    │       ├── _layout.tsx   # Tabs: Capturar / Meus Produtos
    │       ├── captura.tsx   # Tela de cadastro (fotos sem compressão, nome, condição, categoria, preço, obs)
    │       └── produtos.tsx  # Listagem + estado vazio
    ├── components/           # AppHeader, ChipSelector, PhotoGrid, ProductCard
    ├── constants/theme.ts    # Palette + tokens do template
    ├── store/useProductStore.ts # Store Zustand em memória
    ├── types/product.ts      # Contratos Produto, ProductStatus, ProductCondition, ProductCategory
    └── global.css            # Tokens Tailwind/Gluestack
```

### 2.3 Responsabilidades dos Componentes

| Arquivo | Responsabilidade |
|---|---|
| `src/app/_layout.tsx` | Provider Gluestack em modo dark, tema de navegação com a paleta, `StatusBar style="light"`, `Stack` sem header. Splash screen desacoplada de travas assíncronas. |
| `src/app/(tabs)/_layout.tsx` | `Tabs` do Expo Router com ícones Hugeicons; TabBar `#001e1d`, ativa `#f9bc60`, inativa `#abd1c6`. |
| `src/app/(tabs)/captura.tsx` | Permissões, captura (câmera/galeria com `quality: 1`), `processAssets` sem compressão, recuperação de fotos via `ImagePicker.getPendingResultAsync` ao montar a tela, formulário (nome, condição, categoria, valor em R$ e observações), validação e `addProduto`. |
| `src/app/(tabs)/produtos.tsx` | `FlatList` dos produtos da store; estado vazio estilizado com ícone `PackageIcon`. |
| `src/components/ChipSelector.tsx` | Componente reutilizável de seleção em chips horizontais (wrap) com destaque na seleção (`#f9bc60`). |
| `src/components/PhotoGrid.tsx` | Grid de fotos com preview (`expo-image`), botões Câmera/Galeria (borda tracejada), exclusão individual. Limite de 5 fotos. |
| `src/components/ProductCard.tsx` | Card com miniatura, título, tags "Condição • Categoria", preço formatado em `#f9bc60`, observações e badge de status dinâmico. |
| `src/components/AppHeader.tsx` | Isotipo (`isotipo.png`) + título "posta.ai" + subtítulo opcional. |
| `src/store/useProductStore.ts` | Store Zustand em memória: `produtos` e `addProduto`. |
| `src/types/product.ts` | Tipos `ProductStatus`, `ProductCondition`, `ProductCategory`, `Produto` e dicionários de labels (`CONDITION_LABELS`, `CATEGORY_LABELS`). |

---

## 3. O que JÁ ESTÁ Implementado e Funcionando

- **Execução em Dispositivo Validada:** O aplicativo roda com estabilidade no **Expo Go** e development builds, sem travamento na Splash.
- **Formulário Completo de Cadastro:**
  - 1 a 5 fotos com qualidade máxima original (`quality: 1`, sem compressão).
  - Campo "Nome do Produto" (obrigatório, mínimo de 3 caracteres).
  - Seletor de Condição (`novo`, `como_novo`, `seminovo`, `usado`) via chips de 1 toque.
  - Seletor de Categoria (`roupas_acessorios`, `eletronicos`, `livros`, `instrumentos_musicais`, `casa_decoracao`, `diversos`) via chips.
  - Campo "Valor Desejado (R$)" com conversão e validação numérica.
  - Campo "Observações do Usuário" (textarea).
- **Estabilidade no Android:**
  - Recuperação de fotos via `ImagePicker.getPendingResultAsync()` se o Android matar a MainActivity durante a captura.
- **Listagem e Cards:**
  - `ProductCard` exibindo miniatura, título destacado, linha descritiva `"Condição • Categoria"`, preço em destaque e badge de status dinâmico (`Pendente`, `Processando`, `Pronto`, etc.).
- **Conformidade de Código:**
  - `npx tsc --noEmit`: 0 erros.
  - `npx expo lint`: 0 erros (18 warnings de boilerplate do Gluestack).

---

## 4. Pendências e Próximas Fases

### 4.1 Validação em Aparelho da Remoção da Compressão
- **Teste em execução:** Testar no aparelho com "Não manter atividades" (*Don't keep activities*) ativado e 5 fotos em resolução total para avaliar se o `expo-image` e o heap nativo suportam a renderização sem OOM.
- **Plano de contingência:** Se houver crash por pressão de RAM, persistir os originais em disco com `expo-file-system` e renderizar miniaturas leves na UI.

### 4.2 Fase 3 — Persistência e Backend
- Configuração do Docker Compose (PostgreSQL 16 Alpine).
- API FastAPI com endpoints `/produtos` para persistência real dos dados.
- Conexão do app com o backend HTTP.
