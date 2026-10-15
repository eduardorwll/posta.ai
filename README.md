# 📱 posta.ai

Hub de vendas multiplataforma C2C para catalogação e publicação de produtos em múltiplos canais.

## ⚡ Features

* **Captura de Fotos:** Seleção de 1 a 5 fotos (câmera ou galeria) com qualidade original máxima (`quality: 1`, sem compressão ou redimensionamento) e recuperação de fotos pendentes após reinício da Activity no Android.
* **Formulário de Catalogação:** Cadastro de nome do produto, seleção rápida de condição (novo, como novo, seminovo, usado), categoria (roupas, eletrônicos, livros, instrumentos, casa, diversos), valor em BRL e observações.
* **Catálogo em Cards:** Listagem dos produtos cadastrados com miniatura da foto, título, tags contextuais (`Condição • Categoria`), preço formatado em destaque e badge de status dinâmico (`pendente`, `processando_ia`, `pronto`, etc.).
* **Navegação e Interface:** Navegação por abas com Expo Router (Capturar e Meus Produtos), Gluestack UI v5, NativeWind v5 e suporte nativo ao tema escuro oficial da marca.

## 🚀 Como Executar o App

Instale as dependências do projeto e inicie o servidor de desenvolvimento via Expo Go:

```bash
bun install
bunx expo start
```

Para verificar tipos TypeScript e regras de linter:

```bash
bunx tsc --noEmit
bunx expo lint
```