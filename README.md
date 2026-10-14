# 📱 posta.ai

Hub de vendas multiplataforma C2C para catalogação e publicação automatizada no Enjoei e Facebook Marketplace.

## ⚡ Features

* **Captura de Fotos:** Seleção de 1 a 5 fotos (câmera ou galeria) com qualidade original máxima (`quality: 1`, sem compressão ou redimensionamento) e recuperação de fotos pendentes após reinício da Activity no Android.
* **Catálogo em Cards:** Cadastro de nome, condição, categoria, valor e observações com acompanhamento visual por status (`pendente`, `processando_ia`, `aguardando_aprovacao`, `pronto`, `publicado`, `erro`).
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