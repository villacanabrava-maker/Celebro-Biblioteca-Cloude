# Cérebro Biblioteca

Seu acervo. Sua inteligência. Novas reflexões.

Aplicativo pessoal onde você guarda documentos (livros, cartas, relatos, textos),
recebe resumos e temas gerados por IA, descobre o que a IA aprendeu sobre você
("Meu Cérebro") e transforma conteúdos externos em reflexões próprias.

> Este README é o painel de acompanhamento do projeto. Toda fase concluída é
> registrada aqui, em português simples, para que qualquer pessoa (mesmo sem
> conhecimento técnico) consiga entender o que já existe e o que falta.

## Decisões já tomadas

| Decisão | Escolha |
|---|---|
| Nome do app | **Cérebro Biblioteca** |
| Público | **Multiusuário** — cada pessoa tem sua própria biblioteca, cérebro e reflexões, totalmente privados |
| IA usada | **OpenAI (GPT)** — chamadas feitas só pelo servidor, a chave nunca aparece no navegador |
| Entrada de documentos | **Upload manual** pelo app (sem sincronização automática de pastas) |
| Hospedagem | **Vercel** (deploy automático a partir do GitHub) |
| Banco de dados / autenticação / arquivos | **Supabase** (Postgres + Auth + Storage) |

## Status das fases

- [x] **Fase 1 — Scaffold, design system e layout base**
  Projeto Next.js criado; paleta de cores e componentes visuais extraídos das
  imagens de referência; navegação inferior (Início, Biblioteca, Cérebro,
  Reflexão, Reflexões); páginas de Login e Início com visual já fiel ao
  design; telas de espera para as demais seções.
- [x] **Fase 2 — Supabase: schema multiusuário + autenticação**
  8 tabelas com isolamento por usuário (RLS), bucket de arquivos privado,
  login/cadastro/logout reais (e-mail/senha; Google exige configurar o
  provedor no painel do Supabase). Zero avisos de segurança no banco.
- [ ] **Fase 3 — Biblioteca: upload real + detalhe do documento**
  Enviar arquivos de verdade para o Supabase Storage, listar, filtrar e
  buscar a biblioteca, ver os detalhes de cada documento.
- [ ] **Fase 4 — Integração com a OpenAI**
  Geração automática de resumo, temas e "memórias" (trechos-chave) de cada
  documento enviado.
- [ ] **Fase 5 — Meu Cérebro**
  Painel com o que a IA aprendeu sobre o usuário (estilo de escrita, temas
  recorrentes, forma de pensar), sempre com evidências rastreáveis.
- [ ] **Fase 6 — Criar Reflexão + Minhas Reflexões**
  Fluxo guiado de 7 passos para transformar conteúdo externo em reflexão
  pessoal, e histórico de reflexões por status.
- [ ] **Fase 7 — Configurações + publicação**
  Página de configurações e o app publicado ao vivo na Vercel.

## Como rodar o projeto localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha com os valores reais
(o `.env.local` nunca é enviado ao GitHub — está protegido pelo `.gitignore`).

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
OPENAI_API_KEY=
```

## Stack técnica

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** para estilo
- Componentes de interface construídos à mão no estilo shadcn/ui (com Radix
  UI por baixo), porque o registro oficial `ui.shadcn.com` está bloqueado
  pela política de rede deste ambiente de desenvolvimento
- **Supabase**: banco de dados Postgres, autenticação e armazenamento de
  arquivos
- **OpenAI**: geração de resumos, temas, memórias e reflexões
- **Vercel**: hospedagem e deploy automático

## Estrutura de pastas

```
src/
  app/
    login/            → tela de login
    (app)/             → área logada (com navegação inferior)
      inicio/          → painel inicial
      biblioteca/       → biblioteca de documentos
      cerebro/          → "Meu Cérebro"
      reflexao/         → criar reflexão
      reflexoes/        → histórico de reflexões
      configuracoes/    → configurações
      buscar/           → busca geral
  components/
    ui/                → componentes básicos (botão, card, tag, aba...)
    layout/             → navegação, barra superior, logo
  lib/                  → funções utilitárias e integrações (Supabase, etc.)
```

## Links do projeto

- Repositório: https://github.com/villacanabrava-maker/Celebro-Biblioteca-Cloude
- Banco de dados (Supabase): projeto `Celebro-Biblioteca-Cloude`
- Deploy (Vercel): projeto `cerebro-biblioteca-cloude` — **pendente**: faltam
  as variáveis de ambiente de produção (veja "Ação pendente" abaixo)

## ⚠️ Ação pendente: variáveis de ambiente na Vercel

O deploy na Vercel falha até estas 3 variáveis serem cadastradas lá (eu não
tenho permissão de ferramenta para fazer isso por você — só o painel da
Vercel permite). Passo a passo:

1. Acesse https://vercel.com/naninne/cerebro-biblioteca-cloude/settings/environment-variables
2. Adicione, marcando **Production**, **Preview** e **Development** em cada uma:

   | Nome | Valor |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xaxhxkmgrneutpenesdz.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_3xT0uqJxsiD2LcMOtcM3Jg_DZk0sX7K` |
   | `OPENAI_API_KEY` | (a chave da OpenAI que você me enviou no chat) |

3. Me avise que terminou — eu disparo um novo deploy na hora.

Essa é a única etapa manual que só você consegue fazer; todo o resto eu
continuo sozinho.
