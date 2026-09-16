# Cérebro Biblioteca → Cérebro Autoral

Seu acervo. Sua inteligência. Novas reflexões.

> Este README é o painel de acompanhamento do projeto. Toda fase concluída é
> registrada aqui, em português simples, para que qualquer pessoa (mesmo sem
> conhecimento técnico) consiga entender o que já existe e o que falta.

## 📖 Leia primeiro: o projeto cresceu

Em 2026-09-16, o usuário compartilhou 4 documentos definindo uma visão de produto
**muito mais ampla**: o **Cérebro Autoral** — um sistema que aprende não só os temas do que
você escreve, mas a *metodologia* do seu pensamento (como você argumenta, estrutura,
transita entre ideias, conclui), para ajudar a escrever novas reflexões realmente suas.

Essa visão completa está documentada, na íntegra, em `docs/`:

- [`docs/VISAO_PRODUTO.md`](docs/VISAO_PRODUTO.md) — o que estamos construindo e como
  trabalhamos juntos.
- [`docs/ARQUITETURA_TECNICA.md`](docs/ARQUITETURA_TECNICA.md) — como o sistema funciona
  por dentro.
- [`docs/DICIONARIO_MESTRE_DADOS.md`](docs/DICIONARIO_MESTRE_DADOS.md) — cada tabela, campo
  e vocabulário do banco de dados.
- [`docs/PLANO_IMPLEMENTACAO.md`](docs/PLANO_IMPLEMENTACAO.md) — a ordem de construção.
- [`docs/DECISOES.md`](docs/DECISOES.md) — decisões importantes e por quê.
- [`docs/ESTADO_ATUAL.md`](docs/ESTADO_ATUAL.md) — **o roteiro de fases atualizado**, com
  o que já está pronto no Cérebro Autoral.

O que este README continua guardando abaixo é o histórico da **primeira versão** (o
"Cérebro Biblioteca" simples, fases 1–5, já em produção) — que segue no ar, intacta,
enquanto o Cérebro Autoral é construído por cima, em paralelo.

## Decisões já tomadas

| Decisão | Escolha |
|---|---|
| Nome do app | **Cérebro Biblioteca** |
| Público | **Multiusuário** — cada pessoa tem sua própria biblioteca, cérebro e reflexões, totalmente privados |
| IA usada | **OpenAI (GPT)** — chamadas feitas só pelo servidor, a chave nunca aparece no navegador |
| Entrada de documentos | **Upload manual** pelo app (sem sincronização automática de pastas) |
| Hospedagem | **Vercel** (deploy automático a partir do GitHub) |
| Banco de dados / autenticação / arquivos | **Supabase** (Postgres + Auth + Storage) |

## Status das fases (v1 — "Cérebro Biblioteca", schema `public`)

> A partir daqui, o roteiro de fases oficial passa a ser `docs/ESTADO_ATUAL.md`.
> Esta seção fica como registro histórico da v1.

- [x] **Fase 1 — Scaffold, design system e layout base**
  Projeto Next.js criado; paleta de cores e componentes visuais extraídos das
  imagens de referência; navegação inferior (Início, Biblioteca, Cérebro,
  Reflexão, Reflexões); páginas de Login e Início com visual já fiel ao
  design; telas de espera para as demais seções.
- [x] **Fase 2 — Supabase: schema multiusuário + autenticação**
  8 tabelas com isolamento por usuário (RLS), bucket de arquivos privado,
  login/cadastro/logout reais (e-mail/senha; Google exige configurar o
  provedor no painel do Supabase). Zero avisos de segurança no banco.
- [x] **Fase 3 — Biblioteca: upload real + detalhe do documento**
  Upload de arquivo ou texto para o Supabase Storage; listagem com filtros
  por tipo e busca; página de detalhe com abas (Resumo, Conteúdo, Memórias,
  Anotações), metadados, editar e excluir; busca funcional em `/buscar`.
- [x] **Fase 4 — Integração com a OpenAI**
  Resumo, tema principal, temas e memórias gerados automaticamente após o
  upload (e sob demanda com "Gerar novamente"). Suporta extração de texto
  de `.txt`, `.md`, `.pdf` e `.docx` — outros formatos (ex.: `.epub`,
  imagens) ainda não têm extração automática.
- [x] **Fase 5 — Meu Cérebro**
  Análise agregada por IA (estilo de escrita, temas recorrentes, forma de
  pensar, 6 abas) a partir das memórias já extraídas. Exige pelo menos 3
  memórias; pode ser atualizada a qualquer momento.
- [ ] **Fase 6 — Criar Reflexão + Minhas Reflexões** — *pausada*
  Estava em andamento quando os 4 documentos do Cérebro Autoral chegaram.
  Decisão: o Motor de Reflexões "de verdade" (com plano, auditoria e revisão
  humana) nasce direto no Cérebro Autoral, então a versão simples em
  `public` não será finalizada. Ver `docs/DECISOES.md`.
- [ ] **Fase 7 — Configurações + publicação**
  Página de configurações. O app já está publicado ao vivo na Vercel desde
  a Fase 3.

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
- Deploy (Vercel): projeto `cerebro-biblioteca-cloude` — **no ar**, build
  passando, variáveis de ambiente configuradas.
  Link: https://cerebro-biblioteca-cloude-naninne.vercel.app (a Vercel pode
  pedir para você confirmar login na sua conta — é a proteção padrão do
  time, não afeta o uso normal)
