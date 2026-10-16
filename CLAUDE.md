# Diretrizes do Projeto posta.ai

Este projeto segue rigorosamente as diretrizes documentadas em [AGENTS.md](./AGENTS.md).

Todos os agentes de IA devem consultar e respeitar as regras definidas em `AGENTS.md`, incluindo obrigatoriamente:
- **Aprovação Prévia de Modificações:** Antes de executar qualquer ação ou comando que altere arquivos ou configurações do projeto, apresentar a lista do que será feito e aguardar aprovação explícita do usuário.
- **Protocolo Obrigatório de Alterações de Código e Rotina de Engenharia:** Em qualquer demanda com alteração de código, cumprir as 4 fases: (1) Levantamento e diagnóstico inicial em leitura, (2) Pergunta obrigatória de gatilho ao usuário sobre rodar a rotina de engenharia/checklist, (3) Execução da rotina com as skills de escalabilidade/refatoração, checklist estruturado e checklist granular de tarefas (`tasks/todo.md` via `planning-and-task-breakdown`) quando confirmada, e (4) Aprovação prévia da lista atômica de arquivos e do checklist de tarefas antes de qualquer escrita.
- **Uso Sistemático de Skills e Padrões de Engenharia:** Aplicar obrigatoriamente as skills de engenharia de software de Addy Osmani (`addyosmani/agent-skills`), livros canônicos de arquitetura (`ciembor/agent-rules-books`), UI/UX (`ui-ux-pro-max`, `expo-native-ui`) e backend (`api-scaffolding`, `fastapi-templates`).
- **Manutenção contínua da documentação:** Manter `estado_atual.md` e `estado_arquitetural_atual.md` sempre sincronizados com as mudanças.
