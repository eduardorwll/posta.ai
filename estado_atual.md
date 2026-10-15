# Estado Atual do Projeto — posta.ai

> Snapshot compilado em 2026-10-14. Fase 2 do app mobile concluída com suporte a qualidade máxima original (`quality: 1`, sem compressão). Pronto para a validação em dispositivo e subsequente início da Fase 3 (Backend FastAPI + PostgreSQL + Docker).

---

## 1. Status Geral de Funcionamento
- **Execução em Dispositivo:** **Aprovada.** O app está rodando de forma fluida no dispositivo móvel, sem travamento na Splash Screen.
- **Gerenciador de Pacotes:** Migrado com sucesso de `npm` para **`bun`** (`bun.lock` gerado e `package-lock.json` removido).
- **Validação de Código:**
  - `bunx tsc --noEmit`: 0 erros (compilação TypeScript 100% íntegra).
  - `bunx expo lint`: 0 erros (apenas 18 warnings automáticos de import duplicado do Gluestack UI v5).
- **Gerenciamento de Mídia:**
  - Seleção de 1 a 5 fotos via câmera ou galeria com **qualidade original máxima** (`quality: 1`).
  - **Compressão e redimensionamento removidos:** `src/lib/compress-image.ts` e o pacote `expo-image-manipulator` foram eliminados do projeto para preservar a integridade total das fotos destinadas aos anúncios online.
  - Processamento sequencial mantido e recuperação de fotos após reinício da Activity no Android via `ImagePicker.getPendingResultAsync()`.
- **Scripts e Ferramentas Locais:**
  - Inicialização do Expo: otimizada para execução direta via `bun expo start` / `bun start` e `bun run start:clean` (com flag `-c`).
  - `open-omni`: script utilitário para subir o daemon do `omniroute` em segundo plano, iniciar o servidor de desenvolvimento Expo (`REACT_NATIVE_PACKAGER_HOSTNAME=100.110.221.21 bun expo start -c`) em background e abrir a TUI do `opencode` com permissões automáticas (`--auto`).
  - `stop-omni` / `open-omni --stop`: encerra com segurança tanto o servidor OmniRoute quanto o servidor Expo e libera a porta `8081`.
- **Diretrizes e Governança de Agentes:**
  - Adicionada regra obrigatória em `AGENTS.md` e `CLAUDE.md` exigindo que qualquer agente de IA apresente previamente a lista detalhada do que será feito e aguarde a aprovação explícita do usuário antes de fazer qualquer alteração no projeto.
  - Uso obrigatório de `bunx` em vez de `npx` devido à presença do `bun.lock`.
  - Adicionada e configurada a skill de otimização de tokens do OmniRoute (`omni-compression`) tanto globalmente (`~/.agents/skills/omni-compression`) quanto no projeto (`.agents/skills/omni-compression`), com obrigatoriedade de uso para economia de tokens e compressão de logs de execução.
  - Configurado o OpenCode com auto-aprovação de ferramentas (`"permission": "allow"` e flag `--auto`), blindado globalmente por `~/.config/opencode/GLOBAL_RULES.md` para garantir que o agente sempre requisite aprovação explícita antes de qualquer alteração.

---

## 2. Formulário e Interface Concluídos

O app mobile possui o fluxo de cadastro e listagem completo:
1. **Nome do Produto:** Campo de texto obrigatório (mínimo de 3 caracteres) no cadastro, exibido em destaque no card de listagem.
2. **Condição do Produto:** Chips de seleção rápida (`Novo`, `Como novo`, `Seminovo`, `Usado`).
3. **Categoria / Nicho:** Chips de seleção rápida (`Roupas e Acessórios`, `Eletrônicos`, `Livros`, `Instrumentos`, `Casa e Decoração`, `Diversos`).
4. **Preço e Observações:** Campo com máscara/conversão em BRL e textarea para notas adicionais.
5. **Card de Produto (`ProductCard.tsx`):**
   - Miniatura da foto principal.
   - Nome do produto.
   - Linha sutil de contexto: `Condição • Categoria` (ex.: "Seminovo • Eletrônicos").
   - Preço formatado em destaque (`#f9bc60`).
   - Badge de status dinâmico (`Pendente`, `Processando`, `Pronto`, etc.).
6. **Limpeza do Projeto:** Hooks legados órfãos, componentes não utilizados do template Expo e o módulo `expo-image-manipulator` foram removidos. A pasta de assets está padronizada em `assets/posta.ai.icon/`.

---

## 3. Pendência Imediata de Teste (Fase 2)

- **Validação em Aparelho:** Executar teste no dispositivo físico com development build, opção "Não manter atividades" (*Don't keep activities*) ativada, câmera e galeria com até 5 fotos em resolução total (`quality: 1`), monitorando via `adb logcat`.
  - *Fallback arquitetural:* Se houver instabilidade por pressão de memória nativa com fotos pesadas (ex.: 50MP), a próxima etapa será persistir os arquivos originais diretamente em disco (`expo-file-system`) e gerar miniaturas leves para consumo da UI.

---

## 4. Próximo Marco: Fase 3 (Persistência & Backend)

Com o contrato de dados fechado no app:
- **Infraestrutura:** `docker-compose.yml` com PostgreSQL 16 Alpine.
- **API FastAPI:** Endpoints `POST /produtos` e `GET /produtos`.
- **Integração:** Conectar o app ao backend para persistência duradoura.
