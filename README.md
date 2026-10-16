# 📱 posta.ai

Hub de vendas multiplataforma C2C para catalogação e publicação de produtos em múltiplos canais.

## 🗺️ Roadmap de Evolução

Consulte o documento mestre [`ROADMAP.md`](file:///home/eduardorwll/Projects/posta-ai-app/ROADMAP.md) para detalhes completos sobre o planejamento das 5 etapas de arquitetura:
1. **Etapa 1:** Blindagem de Isolamento Local & Verificação RLS (Concluída)
2. **Etapa 2:** Pipeline de IA Multimodal de Custo Zero — Google Gemini 3.5 Flash-Lite (Concluída)
3. **Etapa 3:** Motor de Precificação e Inteligência de Mercado
4. **Etapa 4:** Human-in-the-Loop & Revisão de Anúncios
5. **Etapa 5:** Publicação Multicanal via RPA (Playwright Stealth)

---

## ⚡ Features

* **Navegação Gestual por Swipe & Animação Nativa de Slide:** Transição contínua e suave entre as abas (`Capturar` ⇄ `Meus Produtos` ⇄ `Configuração`) via Native Driver (GPU/RenderThread em 60/120 FPS), calibrada com gestos horizontais nativos (`react-native-gesture-handler`) e feedback tátil físico (`expo-haptics`) sem interferência na rolagem vertical.
* **Tela de Detalhes, Edição Manual & IA sob Demanda (`/produto/[id]`):** Carrossel paginado de fotos, edição manual de todos os campos (título, preço, condição, categoria, notas e descrições), botão de acionamento ou regeneração de anúncios com IA sem necessidade de fotografar novamente, e exclusão atômica.
* **Exclusão Atômica com Limpeza de Storage:** Exclusão coordenada que remove o registro do PostgreSQL e simultaneamente purga as fotos da pasta do vendedor no Supabase Storage CDN (`supabase.storage.from('produtos').remove(...)`).
* **Pipeline de IA Multimodal Serverless de Custo Zero (Gemini 3.5 Flash-Lite):** Edge Function Deno (`supabase/functions/enriquecer-produto/`) que processa fotos e dados do vendedor com **Google Gemini 3.5 Flash-Lite** no Free Tier ($0,00). Gera título comercial de alto impacto, descrição curta em tópicos e copywriting completo formatado em JSON estrito.
* **Rate Limiter Global no PostgreSQL & Hardening de Segurança:** Função atômica `consumir_quota_ia(5)` com bloqueio pessimista (`SELECT ... FOR UPDATE`), limitando as chamadas de IA a 5 requisições por minuto somadas em todo o sistema. Blindada contra DoS externo via `REVOKE EXECUTE` para `anon` e `authenticated`, com execução restrita à `service_role`, `search_path = public` estrito e bloqueio de listagem não autorizada no Storage CDN (`storage.objects`).
* **Autenticação Multi-Usuário & Deep Linking Mobile:** Fluxo nativo completo de autenticação (`Login`, `Cadastro` e `Logout` seguro) com suporte a Deep Linking (`postaaiapp://`) para confirmação de e-mail e recuperação de senha. Gerenciado com store Zustand persistente (`useAuthStore`) e guarda de navegação no Expo Router com prevenção de flicker via Splash Screen.
* **Isolamento Estrito por Vendedor (RLS Otimizado & Storage):** Cada vendedor tem acesso exclusivo aos seus próprios produtos no PostgREST com subqueries de alta performance `(select auth.uid()) = user_id`. Fotos armazenadas em caminhos isolados no Storage CDN (`{user_id}/{produto_id}/foto_{index}.jpg`) com políticas RLS no bucket `produtos`.
* **Purga Atômica de Cache e Memória no Logout:** Encerramento de sessão com limpeza imediata de produtos e rascunhos no `useProductStore` e `useDraftStore`, imune a quedas de rede.
* **Câmera In-App & Galeria com Pipeline Nativo:** Captura in-app (`CameraModal` com obturador silencioso e `quality: 0.85`) e seleção na galeria com downsampling e otimização nativos em C++/Java (`expo-image-manipulator`, máx 1920px Full HD e JPEG 0.85), blindando o dispositivo contra Out Of Memory (OOM).
* **Formulário de Catalogação com Rascunho Persistente:** Cadastro completo (nome, condição, categoria, valor BRL e observações) com persistência automática no AsyncStorage (`useDraftStore`) imune a quedas de rede e reinício de processos no Android.
* **Backend Serverless no Supabase Cloud:** Integração direta com Supabase Storage CDN (bucket `produtos`) e PostgREST, com checagem defensiva de sessão e rollback atômico de imagens em caso de erro na gravação.
* **Catálogo em Cards com IA em Tempo Real:** Listagem dos produtos cadastrados do vendedor autenticado, com miniatura da foto, título comercial, tags contextuais, destaque da IA (`✨ descricao_curta`), preço formatado e navegação direta ao produto ao tocar no card.
* **Navegação e Interface:** Navegação por abas com Expo Router (Capturar, Meus Produtos e Configurações com perfil do vendedor), Gluestack UI v5, NativeWind v5, feedback físico tátil (`expo-haptics`) e suporte dinâmico aos temas Claro, Escuro e Automático.
* **Governança CI/CD e Migrações Versionadas:** Padrão canônico da Supabase CLI com `supabase/config.toml`, migrações versionadas em `supabase/migrations/` e script de teste adversarial em `supabase/verify_isolation.sql`.

## ⚙️ Configuração do Supabase

1. Crie um projeto no painel do [Supabase](https://supabase.com).
2. Execute as migrações:
   - **Via Supabase CLI / CI/CD:** Utilize o comando `supabase db push`.
   - **Via Painel Web (SQL Editor):** Execute o script consolidado disponível em `supabase/schema.sql` (ou sequencialmente os arquivos em `supabase/migrations/`).
3. *(Opcional)* No SQL Editor, execute o script `supabase/verify_isolation.sql` para rodar a suíte automatizada de testes e verificar o isolamento das políticas de RLS.
4. Certifique-se de que o bucket público `produtos` foi provisionado no Supabase Storage.
5. Em **Authentication -> URL Configuration** no painel do Supabase:
   - **Site URL:** Configure como `postaaiapp://` (ou a URL do seu domínio).
   - **Redirect URLs:** Adicione `postaaiapp://*` (e `exp://*` caso esteja testando via Expo Go).
6. Configure a chave do Google AI Studio e faça o deploy da Edge Function:
   ```bash
   supabase secrets set GEMINI_API_KEY=sua-chave-do-google-ai-studio
   supabase functions deploy enriquecer-produto
   ```
7. Crie o arquivo `.env` na raiz do projeto (baseado em `.env.example`):

```bash
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

## 🚀 Como Executar o App

Instale as dependências do projeto e inicie o servidor de desenvolvimento via Expo:

```bash
bun install
bun start          # inicia o Expo Metro vinculado ao IP do Tailscale
bun run clean      # inicia limpando o cache
```

> [!NOTE]
> O comando `bun start` detecta automaticamente o IPv4 ativo da sua máquina na rede **Tailscale** (`100.110.221.21`), gerando o QR Code e o link do Expo Go pelo túnel VPN. Certifique-se de que o seu celular também está conectado à mesma conta do Tailscale.

Para verificar tipos TypeScript e regras de linter:

```bash
bun run typecheck  # tsc --noEmit
bun run lint       # expo lint
```