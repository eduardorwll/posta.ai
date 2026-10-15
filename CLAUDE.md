# Diretrizes do Projeto posta.ai

Este projeto segue rigorosamente as diretrizes documentadas em [AGENTS.md](./AGENTS.md).

Todos os agentes (Claude, Antigravity, OpenCode, etc.) devem consultar e respeitar as regras definidas em `AGENTS.md`, incluindo obrigatoriamente:
- **Aprovação Prévia de Modificações:** Antes de executar qualquer ação ou comando que altere arquivos ou configurações do projeto, apresentar a lista do que será feito e aguardar aprovação explícita do usuário.
- **Otimização de Tokens com OmniRoute:** Utilizar mandatoriamente a skill `omni-compression` para economia de tokens e compressão de logs de execução.
- **Manutenção contínua da documentação:** Manter `estado_atual.md` e `estado_arquitetural_atual.md` sempre sincronizados com as mudanças.
