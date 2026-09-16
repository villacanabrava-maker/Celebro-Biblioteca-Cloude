# DECISÕES ARQUITETURAIS

Registro de decisões importantes: problema, alternativas consideradas, pesquisa realizada,
decisão, motivo, consequências. Formato pedido em `docs/VISAO_PRODUTO.md` §44.

---

## 2026-09-16 — Pivô para o "Cérebro Autoral": onde ele nasce

**Problema.** O usuário compartilhou 4 documentos (Dicionário Mestre de Dados e Taxonomia,
Arquitetura Técnica, Plano de Construção, Visão de Produto) descrevendo um produto muito
mais amplo — o "Cérebro Autoral" — do que o "Cérebro Biblioteca" construído nas fases 1–6
desta mesma conversa (schema `public`, 8 tabelas, já em produção na Vercel). Os documentos
pedem explicitamente "Regra Zero": nova conta GitHub, novo projeto Supabase, novo projeto
Vercel, tratando qualquer coisa anterior como mera referência de aprendizado.

**Alternativas consideradas.**
1. Criar de fato um novo repositório GitHub, novo projeto Supabase e novo projeto Vercel,
   em contas separadas.
2. Criar um novo repositório/projeto Supabase/projeto Vercel, mas dentro das mesmas contas
   já conectadas nesta sessão.
3. Continuar exatamente na mesma infraestrutura (mesmo repositório, mesmo projeto Supabase,
   mesmo projeto Vercel), implementando a nova arquitetura em schemas novos, lado a lado
   com o que já existe.

**Pergunta feita ao usuário.** Perguntei diretamente (via pergunta estruturada) qual dessas
alternativas ele queria, e o que fazer com o app já no ar.

**Decisão do usuário.** Resposta literal: os documentos servem para eu **entender tudo o
que deve ser implementado e como funciona** — não para eu recomeçar. "Você não deve fazer de
novo, você deve continuar onde está." Ou seja: alternativa 3.

**Decisão registrada.** Continuamos no mesmo repositório
(`villacanabrava-maker/Celebro-Biblioteca-Cloude`), no mesmo projeto Supabase
(`Celebro-Biblioteca-Cloude` / `xaxhxkmgrneutpenesdz`) e no mesmo projeto Vercel
(`cerebro-biblioteca-cloude`). O app "Cérebro Biblioteca" (schema `public`) permanece
intacto e no ar. A arquitetura do "Cérebro Autoral" é implementada em 8 schemas novos e
isolados (`biblioteca`, `processamento`, `taxonomia`, `cerebro_autoral`, `reflexoes`,
`auditoria`, `sistema`, `aplicacao` — criados na migration `fase0_fundacao_cerebro_autoral`
em 2026-09-16), sem tocar nas tabelas de `public`.

**Motivo.** O espírito da "Regra Zero" — nunca migrar o banco antigo, nunca reaproveitar
código antigo sem revisão, tratar decisões passadas como aprendizado — é satisfeito
tecnicamente por schemas isolados dentro do mesmo projeto: zero risco de misturar tabelas
antigas com as novas, zero reaproveitamento acidental. Uma conta/projeto literalmente novo
não traria benefício técnico adicional e exigiria trabalho extra (nova conexão GitHub App,
nova organização Supabase, novo time Vercel) sem necessidade real.

**Consequências.**
- Dois modelos de dados coexistem por um tempo: `public.*` (Cérebro Biblioteca, simples,
  em português+inglês misturado, já usado pela interface de hoje) e os 8 schemas novos
  (Cérebro Autoral, 100% em português, muito mais profundo).
- A interface (Next.js) vai, aos poucos, migrar cada tela do modelo simples para o modelo
  rico, fase por fase (mesma ordem dos documentos: Fundação → Sistema/Taxonomia →
  Biblioteca → Processamento → Cérebro Autoral → Reflexões), sem quebrar o que já funciona
  no meio do caminho.
- `docs/ESTADO_ATUAL.md` (a criar) vai registrar, a cada fase, qual fluxo já roda no
  schema novo e qual ainda roda no `public` antigo, para nunca ficar ambíguo.

---

## 2026-09-16 — Exposição dos novos schemas para a interface (Data API)

**Problema.** O Supabase (via PostgREST) só expõe automaticamente o schema `public` (e
`graphql_public`) para chamadas do `supabase-js` no navegador/servidor. Os 8 schemas novos
do Cérebro Autoral não ficam acessíveis à interface a menos que sejam explicitamente
adicionados em "Exposed schemas" (Configurações → API, no painel do Supabase) — uma ação
manual, feita uma vez, que só o dono da conta consegue realizar (nenhuma ferramenta de
automação tem acesso a essa configuração).

**Pesquisa realizada.** Consultei a documentação atual do Supabase
(`supabase.com/docs/guides/api/using-custom-schemas` e
`supabase.com/docs/guides/api/securing-your-api`) em 2026-09-16. Confirmado: expor um schema
customizado exige (1) adicioná-lo em "Exposed schemas" no painel e (2) rodar
`GRANT USAGE/SELECT/...` para os papéis `anon`/`authenticated`/`service_role`. Chamadas de
`execute_sql`/migrations feitas por mim (assistente) não passam pelo PostgREST — usam
conexão direta ao Postgres — então não são afetadas por essa configuração; só o **app**
(navegador/servidor Next.js usando `supabase-js`) precisaria disso.

**Alternativas consideradas.**
1. Pedir ao usuário para adicionar cada um dos 8 schemas em "Exposed schemas" — mais uma
   ação manual, como já aconteceu com as variáveis de ambiente da Vercel.
2. Manter os 8 schemas de domínio **não expostos** (mais seguros por padrão) e criar, no
   schema `aplicacao` (ou diretamente em `public`, que já é exposto), views e funções
   (`security definer` com RLS respeitada) que a interface consulta — exatamente o papel
   que o próprio Dicionário Mestre já reserva ao schema `aplicacao` ("views e funções
   seguras destinadas à interface, quando necessário").

**Decisão.** Alternativa 2. Os schemas `biblioteca`, `processamento`, `taxonomia`,
`cerebro_autoral`, `reflexoes`, `auditoria` e `sistema` permanecem **não expostos** — só
acessíveis via migrations/SQL administrativo e via funções/views seguras. A interface
Next.js só consulta `public` (onde já roda o Cérebro Biblioteca hoje) e, quando necessário,
views/RPCs específicas criadas para o Cérebro Autoral.

**Motivo.** Evita mais um passo manual repetido no painel do Supabase a cada novo schema;
é o padrão mais seguro por padrão (superfície de API mínima); e é literalmente o desenho que
o Dicionário Mestre já previu com o schema `aplicacao`.

**Consequências.** Cada funcionalidade nova do Cérebro Autoral precisa de uma função ou view
segura correspondente antes de a interface conseguir usá-la — isso já está previsto na
"Ordem recomendada das migrations" do dicionário (item 16: "Views e RPCs seguras no schema
`aplicacao`", depois de RLS/policies).

---

## 2026-09-16 — Função utilitária `atualizado_em` em `public`, não em `sistema`

**Decisão.** A função de trigger `definir_atualizado_em()` (equivalente ao `atualizado_em`
pedido pelo dicionário para toda tabela) foi criada em `public.definir_atualizado_em()`, e
não em `sistema` (que os documentos reservam para catálogo de modelos de IA, prompts,
pipeline e configurações do usuário — não para utilitários genéricos de banco).

**Motivo.** `public` já é exposto por padrão e a função tem `EXECUTE` revogado de
`anon`/`authenticated` (só roda via trigger), então não há ganho de segurança em movê-la
para um schema não exposto — e mantê-la em `public` evita duplicar a mesma função em cada
um dos 8 schemas novos.

---

## 2026-09-16 — Limite diário de deploys da Vercel (plano gratuito)

**Problema.** Por volta das 23:10–23:17 (horário do servidor), dois pushes seguidos
(`85a723e` — Fundação do Cérebro Autoral — e `79360a6` — redesenho visual) não dispararam
deploy automático. Ao tentar forçar manualmente, a Vercel retornou erro 402:
`"Resource is limited - try again in 24 hours (more than 100, code:
api-deployments-free-per-day)"`. Ou seja: o plano gratuito (Hobby) da Vercel permite no
máximo 100 deploys por dia, e essa cota se esgotou só nesta sessão (cada fase publicada
gerou pelo menos um deploy).

**Consequência prática.** O código de todas as fases, incluindo o redesenho visual, está
100% commitado e enviado ao GitHub — nada foi perdido. Mas o site publicado
(`cerebro-biblioteca-cloude-naninne.vercel.app`) ainda está rodando a versão da Fase 5
(commit `7f0da88`), sem a Fundação do Cérebro Autoral nem o redesenho visual, até a cota
resetar (~24h) ou até alguém disparar um novo deploy pelo painel da Vercel.

**Decisão.** A partir de agora, vou agrupar mais commits antes de cada push/deploy — em vez
de publicar a cada micro-etapa, publico ao final de blocos de trabalho maiores — para não
esgotar essa cota de novo. Se o ritmo de trabalho continuar intenso, vale considerar o plano
Vercel Pro (pago, sem esse limite diário) — decisão do usuário, não tomada aqui.

## Pendências em aberto (para decidir com o usuário mais adiante)

- Fluxo de Git com `main` protegida + `feature/*` + Pull Request + CI (hoje seguimos
  direto na branch de produção `claude/bold-pasteur-cfum8r`, conforme instrução do
  ambiente desta sessão).
- Se/quando configurar Supabase Branching (Preview de banco por PR).
- Modelo(s) exato(s) da OpenAI para cada motor (`MODELO_IA_EXTRACAO`, `_ANALISE`,
  `_CEREBRO`, `_REDACAO`, `_AUDITORIA`, `_EMBEDDING`) — adiado deliberadamente pelo próprio
  Dicionário Mestre (§19).
- Redesenho visual "o mais moderno possível" pedido pelo usuário — tratado como frente de
  trabalho separada, ainda não iniciada nesta sessão.
