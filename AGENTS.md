This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Regra Obrigatória: Aprovação Prévia de Modificações (Mandatory Pre-Approval)

**ATENÇÃO (Mandatório para todos os agentes de IA no projeto):**
Antes de executar qualquer prompt, rodar comandos que modifiquem o repositório ou fazer qualquer alteração no projeto (criar, editar ou apagar arquivos de código, componentes, configurações, pacotes ou documentação), o agente DEVE obrigatoriamente:
1. Limitar-se a operações de leitura e análise prévia (inspeção de arquivos, status, contexto).
2. Escrever e apresentar ao usuário uma **lista clara, concisa e estruturada** exatamente com o que será feito e quais arquivos/estruturas serão alterados.
3. **Aguardar a aprovação explícita do usuário** antes de aplicar qualquer alteração ou executar qualquer ação que modifique o estado do projeto.

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

