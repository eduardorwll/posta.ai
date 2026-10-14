# Estado Atual do Projeto

App posta.ai em React Native/Expo. Já temos o app/index.tsx capturando fotos, comprimindo e pedindo permissões. Preciso agora implementar Tabs e Zustand.

---

## Contexto Técnico Atual

### Ambiente e Dependências
- **Expo SDK:** 57 (~57.0.28) com React 19.2.3 e React Native 0.86.3.
- **Roteamento:** Expo Router (~57.0.26) localizado na pasta `src/app/`.
- **Validação de Código:** ESLint 9 (`eslint.config.js`) e TypeScript configurados e validados (`npx expo lint` e `npx tsc --noEmit` passando sem erros).
- **Scripts Aprovados:** `unrs-resolver@1.12.2` aprovado no `package.json`.

### Recursos Implementados
1. **Configuração de Permissões (`app.json`):**
   - Plugin `expo-image-picker` adicionado com descrições em português para acesso à câmera e galeria de fotos.

2. **Compressão de Imagens (`src/lib/compress-image.ts`):**
   - Utiliza a API orientada a objetos do SDK 57 (`ImageManipulator.manipulate`).
   - Redimensionamento respeitando limite de 1280x720 mantendo a proporção (sem esticar ou ampliar imagens menores).
   - Compressão em JPEG com qualidade 80%.

3. **Tela de Captura e Registro (`src/app/index.tsx`):**
   - Fundo claro com layout responsivo e limpo.
   - Seleção de 1 a 5 fotos via Câmera nativa ou Galeria usando `expo-image-picker`.
   - Compressão local imediata após a seleção de cada foto.
   - Grid de miniaturas com preview via `expo-image`, botão de exclusão individual e botão para adicionar fotos adicionais até o limite de 5.
   - Campo de texto livre de múltiplas linhas ("Observações do Usuário").
   - Ação de "Salvar" que:
     - Gera o payload JSON e imprime via `console.log`.
     - Dispara `Alert.alert` nativo com feedback de sucesso ("Sucesso", "Produto pronto para processamento!").
     - Reseta os estados e oculta o teclado para nova captura.

---

## Próximos Passos (Tabs e Zustand)

1. **Estado Global (Zustand):**
   - Instalação do pacote `zustand`.
   - Criação da store `src/store/useProductStore.ts` com tipagem completa de produto:
     - `id: string`
     - `imagens: string[]`
     - `observacoes: string`
     - `preco: number`
     - `status: 'pendente'`
     - `created_at: string`
   - Ação `addProduto(produto)` para persistência em memória local.

2. **Navegação (Expo Router Tabs):**
   - Criação da estrutura de abas `src/app/(tabs)/_layout.tsx`.
   - Configuração das duas abas:
     - **Capturar:** Ícone de câmera.
     - **Meus Produtos:** Ícone de lista/cards.
   - Ajuste da rota raiz `src/app/index.tsx` para redirecionamento suave para `/(tabs)/captura`.

3. **Refatoração da Tela de Captura (`src/app/(tabs)/captura.tsx`):**
   - Migração do código atual de captura.
   - Adição do campo numérico de "Valor (R$)".
   - Atualização da função de salvar para alimentar o Zustand via `addProduto` antes do alerta de sucesso e limpeza dos campos.

4. **Tela de Listagem de Produtos (`src/app/(tabs)/produtos.tsx`):**
   - Leitura dos produtos salvos na store.
   - Estado vazio com mensagem amigável ("Nenhum produto cadastrado").
   - `FlatList` com cards modernos contendo thumbnail da primeira foto, preço em destaque, trecho das observações e badge de status "Pendente".
