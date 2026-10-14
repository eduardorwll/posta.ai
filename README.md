# 📱 posta.ai

Hub de vendas multiplataforma C2C para catalogação e publicação automatizada no Enjoei e Facebook Marketplace.

## ⚡ Features

* **Captura Otimizada:** Seleção de 1 a 5 fotos com compressão local automática (1280x720 a 80%).
* **Catálogo em Cards:** Cadastro de valor e observações com acompanhamento visual por status (`pendente`, `processando_ia`, `aguardando_aprovacao`, `pronto`, `publicado`, `erro`).
* **Enriquecimento por IA:** Geração automática de títulos, descrições (Gemini Flash) e sugestão de preço médio de mercado.
* **Aprovação no Telegram:** Revisão rápida e disparo do anúncio com um clique.
* **Publicação via RPA:** Postagem automática nos marketplaces usando Playwright Headless com sessão persistente.

## 🐳 Como Subir o Docker

Configure o arquivo `.env` na raiz do projeto e inicie os containers em segundo plano:

```bash
docker compose up -d
```

Para acompanhar os logs de execução:

```bash
docker compose logs -f
```