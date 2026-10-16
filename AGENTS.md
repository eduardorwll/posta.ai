This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Regra Obrigatória: Aprovação Prévia de Modificações (Mandatory Pre-Approval)

**ATENÇÃO (Mandatório para todos os agentes de IA no projeto):**
Antes de executar qualquer prompt, rodar comandos que modifiquem o repositório ou fazer qualquer alteração no projeto (criar, editar ou apagar arquivos de código, componentes, configurações, pacotes ou documentação), o agente DEVE obrigatoriamente:
1. Limitar-se a operações de leitura e análise prévia (inspeção de arquivos, status, contexto).
2. Escrever e apresentar ao usuário uma **lista clara, concisa e estruturada** exatamente com o que será feito e quais arquivos/estruturas serão alterados.
3. **Aguardar a aprovação explícita do usuário** antes de aplicar qualquer alteração ou executar qualquer ação que modifique o estado do projeto.

## Regra Obrigatória: Protocolo de Alterações de Código e Rotina de Engenharia (Code Change & Engineering Gate)

**ATENÇÃO (Mandatório e Global para todos os agentes em chamadas com alteração de código):**
Em qualquer interação onde o usuário solicitar ou mencionar alterações em código (criar, editar, refatorar, apagar arquivos, componentes, configurações, pacotes ou schemas — não aplicável a pesquisas puras, dúvidas conceituais ou sugestões informativas), o agente DEVE seguir estritamente o seguinte ciclo:

1. **Fase 1: Levantamento e Diagnóstico Inicial (Apenas Leitura):**
   - O agente analisa arquivos, logs, tipos e dependências.
   - Apresenta um resumo técnico conciso do diagnóstico e a abordagem preliminar.

2. **Fase 2: Pergunta Obrigatória de Gatilho de Engenharia:**
   - Antes de propor ou redigir qualquer diff ou código, o agente DEVE OBRIGATORIAMENTE perguntar:
     > *"Deseja rodar a rotina completa de engenharia com skills para escalabilidade, refatoração e checklist estruturado de pré-lançamento antes de prosseguir?"*

3. **Fase 3: Execução da Rotina de Engenharia (quando confirmada):**
   - Submeter o plano às skills do projeto:
     - `a-philosophy-of-software-design` (módulos profundos e interfaces simples)
     - `doubt-driven-development` (escrutínio adversarial e modos de falha ocultos)
     - `performance-optimization` (RAM mobile, rede, concorrência)
     - `release-it` (resiliência, limites e timeouts)
   - Gerar e apresentar o **Checklist Estruturado** (`shipping-and-launch` / `code-review-and-quality`) com os eixos: UX/Mobile, Memória/Pipeline, Contratos de API/Rede, Backend/Resiliência e Governança/Git.
   - **Obrigatoriedade de Checklist de Tarefas (`planning-and-task-breakdown`):** Formular o checklist granular de tarefas executáveis e rastreáveis (`tasks/todo.md`) contendo descrição, critérios de aceitação específicos, comandos de verificação, dependências, arquivos tocados e checkpoints entre fases.

4. **Fase 4: Aprovação Prévia Obrigatória:**
   - Apresentar a lista exata e atômica de arquivos a serem modificados e o checklist de tarefas a ser executado (`tasks/todo.md`).
   - Aguardar o "sim" / aprovação explícita do usuário antes de tocar em qualquer arquivo do repositório.
   - Durante a execução, manter o checklist `tasks/todo.md` sincronizado com cada tarefa concluída.

## Regra Obrigatória: Uso Sistemático de Skills e Padrões de Engenharia (Mandatory Skills Usage)

**ATENÇÃO (Mandatório para todos os agentes de IA no projeto):**
O agente DEVE obrigatoriamente consultar e aplicar as skills instaladas em `.agents/skills/` para validar, estruturar e executar qualquer trabalho no repositório antes de propor ou aplicar modificações:

1. **Framework de Engenharia de Software de Addy Osmani (`addyosmani/agent-skills`):**
   - **`using-agent-skills`**: Router e meta-skill para mapear a demanda para o fluxo de trabalho correto.
   - **`source-driven-development`**: Ancorar qualquer decisão técnica em documentação primária e oficial (Expo, React Native, FastAPI, Pydantic, W3C), nunca em memória desatualizada.
   - **`spec-driven-development` & `planning-and-task-breakdown`**: Especificar objetivos, contratos e dependências atômicas antes de codificar.
   - **`doubt-driven-development`**: Submeter qualquer plano a escrutínio adversarial prévio (questionar suposições e prever modos de falha).
   - **`incremental-implementation`**: Aplicar alterações em fatias verticais finas, atômicas e testáveis.
   - **`debugging-and-error-recovery`**: Investigação disciplinada e metódica de causas-raízes (loop vermelho, minimização e teste de hipóteses falsificáveis).
   - **`code-simplification` & `code-review-and-quality`**: Revisão multi-eixo (legibilidade, segurança, performance e arquitetura) antes de finalizar.
   - **`documentation-and-adrs`**: Registro de decisões de design técnico e sincronização documental contínua.

2. **Princípios Canônicos de Arquitetura (`ciembor/agent-rules-books`):**
   - **`clean-code` & `clean-architecture`**: Nomes expressivos, funções pequenas, responsabilidade única (SRP) e separação estrita de regras de negócio de frameworks ou UI.
   - **`a-philosophy-of-software-design` (APOSD)**: Módulos profundos (interfaces simples ocultando implementações robustas) e combate à complexidade.
   - **`code-complete`**: Programação defensiva, clareza semântica e rotinas robustas.
   - **`release-it`**: Circuit breakers, timeouts explícitos, tratamento de quedas de rede e resiliência em produção.

3. **Interface de Usuário, Mobile & UI/UX (Obrigatório em telas, componentes e estilos):**
   - **`ui-ux-pro-max` & `expo-native-ui`**: Design semântico com tokens de tema, tipografia sem truncamento (`includeFontPadding: false`), contraste acessível e ergonomia móvel nativa.
   - **`expo-animation` & `expo-haptics`**: Microinterações físicas responsivas para feedback tátil.
   - **`gluestack-ui-v5`**: Padronização com NativeWind v5 e Tailwind CSS v4.

4. **Backend, Dados & APIs (Obrigatório em rotas, modelos e banco):**
   - **`api-scaffolding` & `fastapi-templates`**: Padrões REST profissionais assíncronos, Repository Pattern, schemas Pydantic V2 e suítes de testes automatizados com `pytest-asyncio`.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## Documentation upkeep (mandatory for all agents)

- The project state docs are `estado_atual.md` (short snapshot), `estado_arquitetural_atual.md` (full architecture/state) and `README.md` (features/usage).
- Before starting a task, read `estado_arquitetural_atual.md` and `estado_atual.md`.
- After ANY change that affects behavior, features, file structure, components, types, dependencies, palette or pending tasks, update these docs in the same task, keeping them complete and consistent with each other and with the code. Verify they are up to date before declaring a task done.
- Do not leave removed files, renamed folders or finished tasks described as pending.

