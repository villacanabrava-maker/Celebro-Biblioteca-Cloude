# DECISÕES ARQUITETURAIS

Registro de decisões importantes: problema, alternativas consideradas, pesquisa realizada,
decisão, motivo, consequências. Formato pedido em `docs/VISAO_PRODUTO.md` §44.

---

## 2026-09-17 — Fase 3+4 (código): "portão" de funções/views em `public`

**Problema.** A decisão de 2026-09-16 (ver entrada mais abaixo) manteve os schemas
`biblioteca`/`processamento`/`taxonomia`/`sistema` fora da lista de "Exposed schemas" do
Data API do Supabase, para não depender de um passo manual no painel. Chegada a hora de
escrever o código de verdade do `processar_obra()` e do upload, era preciso decidir como o
app alcança essas tabelas a partir do navegador/servidor sem exposição direta.

**Investiguei** se dava para mudar `pgrst.db_schemas` só por SQL (rodei
`select rolconfig from pg_roles where rolname='authenticator'` e não achei nada lá — no
Supabase hospedado isso é config de plataforma, não GUC de role acessível por SQL comum).
Sem essa rota, as opções eram: (1) pedir para o usuário mexer no painel, (2) rotear tudo por
`public`, como o Dicionário Mestre já previa (schema `aplicacao`: "views e funções seguras
destinadas à interface").

**Decisão.** Construí em `public` (única coisa exposta hoje, já usada pelo v1):
- **19 funções `SECURITY DEFINER`** (`autoral_*`) — o único caminho de escrita. Nenhuma
  confia em `usuario_id` vindo do cliente: todas usam `auth.uid()` internamente, com
  `search_path = ''` e nomes de tabela sempre qualificados por schema (proteção padrão
  contra sequestro de `search_path` em função `SECURITY DEFINER`). Toda referência a uma
  linha "pai" que não tem FK composta (tabela+usuário) garantida pelo banco — por exemplo
  `secao_pai_id`, `secao_id` de um fragmento, o alvo de um vetor — é conferida manualmente
  dentro da função antes do INSERT.
- **13 views `v_autoral_*`** — o único caminho de leitura, uma por tabela de domínio que a
  interface precisa consultar (obras, versões, execuções, etapas, documentos processados,
  seções, fragmentos, sínteses, elementos, evidências, relações, classificações e o
  vocabulário global de conceitos da taxonomia).

**Erro cometido e corrigido na hora (`get_advisors` depois de aplicar):**
1. Views criadas sem `security_invoker` rodam com o dono (`postgres`), que ignora RLS —
   ficam com o filtro `usuario_id = auth.uid()` escrito à mão dentro da view. Funciona, mas
   o linter do Supabase marca como **ERRO** ("Security Definer View"), porque é um padrão
   fácil de usar errado. Troquei pela alternativa recomendada: `GRANT SELECT` direto nas
   tabelas de domínio para `authenticated` + `ALTER VIEW ... SET (security_invoker = true)`
   — agora a view roda como quem está de fato logado, e quem decide quais linhas aparecem
   voltou a ser só a RLS "dono gerencia..." que já existia desde a Fase 1/2/3 (schemas
   continuam fora do Data API — só a view em `public` os alcança).
2. `revoke all on function ... from public` não bastou: o Supabase concede EXECUTE por
   padrão a `anon` e `authenticated` **individualmente** na criação (privilégio padrão do
   schema, não só via o pseudo-papel PUBLIC). Corrigido revogando de `anon` explicitamente
   e mantendo só `authenticated`. Depois da correção, `get_advisors` (security) ficou limpo
   a não ser por dois avisos aceitos conscientemente: `auth_leaked_password_protection`
   (pré-existente, fora de escopo) e "signed-in users can execute" nas 19 funções — que é
   exatamente a intenção (usuário autenticado é quem deve poder chamá-las).

**Consequência prática.** Todo acesso do app às tabelas do Cérebro Autoral passa por esse
portão. Um novo tipo de dado (Fase 5 em diante) precisa de uma nova função/view aqui — não
dá para simplesmente fazer `supabase.from('cerebro_autoral.algo')` do jeito que o v1 faz com
`public`.

---

## 2026-09-17 — Onde a tela de upload/processamento aparece no app

**Problema.** A Biblioteca (`/biblioteca`) já existe e funciona, ligada ao schema `public`
(v1). O Cérebro Autoral precisa de uma tela de upload própria (liga a
`biblioteca.obras`/`versoes_obras`, dispara o pipeline) — mas colocar isso dentro de
`/biblioteca` misturaria os dois sistemas de dados, e substituir `/biblioteca` de uma vez
trocaria a tela que o usuário já usa por uma ainda incompleta (só a Fase 3+4 está pronta;
Fases 5–12 do Cérebro Autoral ainda faltam).

**Perguntei ao usuário** (pergunta estruturada, três opções: aba nova avisada, substituir a
Biblioteca atual, ou construir só nos bastidores). **Resposta:** aba nova, avisada na tela
"Meu Cérebro".

**Decisão.** Rotas novas em `/autoral`, `/autoral/nova` e `/autoral/[obraId]`, dentro do
mesmo grupo de rotas `(app)` (aproveita o layout/top-bar/bottom-nav existentes), mas **sem**
entrada na bottom nav — o link de entrada é um banner ("Novo: Cérebro Autoral (beta)") na
tela `/cerebro`. `/biblioteca` continua 100% intocada. Quando o Cérebro Autoral tiver
superfície suficiente para substituir o v1 de verdade, isso vira uma decisão própria
("virada de chave"), não algo implícito nesta fase.

---

## 2026-09-17 — Simplificações conscientes desta entrega (Fase 3+4: código)

Para manter a entrega em um tamanho responsável, assumi alguns cortes deliberados,
documentados aqui para não serem confundidos com bugs:

- **Upload sempre cria obra nova** (nunca "nova versão de uma obra existente"). A
  duplicidade por hash já impede reenviar o mesmo arquivo duas vezes; "nova versão" de uma
  obra já cadastrada fica para quando a tela de edição de obras existir.
- **Identificação de estrutura é heurística**, não usa IA: reconhece markdown (`#`/`##`),
  "Parte N", "Capítulo N", "Seção N" e linhas curtas em CAIXA ALTA isoladas por linhas em
  branco, e monta no máximo 3 níveis (parte → capítulo → seção). Sem nenhum título
  detectado, a obra inteira vira uma única seção — nunca falha por falta de estrutura. Uma
  identificação de estrutura mais sofisticada (por IA) é candidata natural para a Fase 5/6.
- **Página de cada fragmento não é exata para PDF**: cada fragmento herda a página
  inicial/final da seção inteira a que pertence, não a página exata do parágrafo — suficiente
  para "ver a evidência na vizinhança certa", mas não para citar a página exata.
- **Elementos são extraídos por fragmento**, não deduplicados entre fragmentos (o mesmo tema
  citado em três parágrafos vira três `elementos`, ligados por `relacoes_elementos` quando a
  IA identifica conexão). Deduplicação/fusão de elementos é trabalho do motor taxonômico
  completo (Fase 5).
- **Resumo por retomada (resume) é por item nas etapas caras** (seções, fragmentos,
  sínteses, elementos+evidências, taxonomia, relações) — cada etapa confere o que já existe
  no banco antes de chamar a IA de novo — **exceto embeddings**, que não têm um jeito barato
  de conferir duplicidade (não há índice único por alvo em `processamento.vetores`); se essa
  etapa específica falhar no meio e for repetida, pode gerar embeddings duplicados para quem
  já tinha — custo de IA repetido, nunca dado incorreto.
- **Token de sessão em processamento muito longo**: o pipeline roda dentro de `after()` na
  mesma requisição do upload, usando a sessão do usuário (cookies). Para uma obra muito
  grande, se o processamento passar da validade do token de acesso (~1h), a etapa em
  andamento falha e fica registrada em `processamento.execucoes`/`etapas_execucao` — sem
  corromper nada —, mas ainda não existe um botão "tentar de novo" na interface (fica para
  quando o volume de uso justificar).

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

**Atualização (mesmo dia, ~23:26):** o usuário assinou o plano **Vercel Pro**, removendo o
limite diário. Ao forçar manualmente um novo deploy pela ferramenta de automação
(`create_git_project`), o build falhou com `Missing credentials ... OPENAI_API_KEY` — não é
falta da variável no painel, é que essa ferramenta, ao reutilizar um projeto já existente,
cria um deploy de **Preview**, não de **Production** (`target: null` na resposta da API).
As variáveis de ambiente do projeto estão marcadas só para o ambiente "Produção" (conforme
print enviado pelo usuário), então um deploy de Preview não enxerga nenhuma delas — a
OpenAI falha primeiro porque o SDK lança erro assim que é instanciado sem chave; o Supabase
não lançaria erro do mesmo jeito (só falharia depois, ao ser efetivamente usado).

**Decisão.** Deploys manuais de emergência (fora de um push) via essa ferramenta só devem
ser usados quando realmente não há como esperar um push normal — porque não respeitam o
ambiente "Produção". O caminho correto e já validado dezenas de vezes nesta sessão continua
sendo: commitar, dar `git push` na branch de produção (`claude/bold-pasteur-cfum8r`) e deixar
a integração GitHub→Vercel criar o deploy de produção de verdade automaticamente.

## 2026-09-16 — Fase 1 (Sistema + Taxonomia): lacunas preenchidas no dicionário

**Problema.** O Dicionário Mestre não especifica todos os detalhes de toda tabela — alguns
campos `estado` não têm vocabulário fechado definido (ex.: `taxonomia.conceitos.estado`,
`sistema.versoes_pipeline.estado`), e a ordem de migrations do próprio dicionário (§17)
prevê criar tabelas por schema primeiro e só depois as constraints/FKs que cruzam schemas —
o que significa que algumas colunas nascem sem FK e ganham a referência formal mais tarde.

**Decisões tomadas (documentadas aqui por não estarem explícitas no dicionário):**
- `sistema.versoes_pipeline.estado` e `taxonomia.conceitos.estado`/`taxonomia.versoes.estado`
  seguem o mesmo vocabulário usado em `cerebro_autoral.versoes` (`rascunho`/`ativa`/
  `arquivada` para versões; `ativo`/`obsoleto` para conceitos individuais) — por
  consistência com o resto do dicionário, não por estar escrito lá.
- `taxonomia.versoes` e `sistema.versoes_pipeline` ganharam uma linha semente "1.0" em
  estado `rascunho` — é só a fundação; a curadoria de conceitos reais da Taxonomia Mestre
  (dicionário §17, passo 17 "Seeds da Taxonomia Mestre") fica para quando o conteúdo for
  realmente definido, não nesta fase estrutural.
- `sistema.modelos_ia` foi semeado com os modelos que o app v1 já usa na prática
  (`gpt-4o-mini` para extração/análise/taxonomia/cérebro/redação/auditoria,
  `text-embedding-3-small` para embedding, 1536 dimensões — batendo com o `vector(1536)`
  já criado na Fase 0). Isso não é a escolha final de modelos por função (o dicionário §19
  lista isso como decisão deliberadamente adiada) — é só um catálogo funcional inicial,
  fácil de trocar depois sem mexer em código (a ideia central do `sistema.modelos_ia`).
- `taxonomia.classificacoes_elementos.elemento_id` foi criado como `uuid not null` **sem**
  FK para `processamento.elementos` (que ainda não existe). A FK será adicionada por uma
  migration própria assim que a Fase 4 (Documento Processado) criar essa tabela.

## 2026-09-16 — Fase 3: como executar o pipeline documental de forma durável

**Problema.** O Dicionário Mestre e a Arquitetura Técnica exigem que o `processar_obra()`
seja executado de forma durável: cada uma das 18 etapas precisa suportar retry, resume e
idempotência (docs/ARQUITETURA_TECNICA.md §17, §33-34), sem depender de uma única requisição
HTTP frágil. O documento de Plano de Construção também lista `Vercel Workflows` na stack
recomendada, mas explicitamente como algo "a avaliar" e pede pesquisa antes de adotar
qualquer tecnologia (docs/VISAO_PRODUTO.md §1-3: "pesquise antes de supor", "não invente
APIs", "confirme na documentação atual").

**Pesquisa realizada.** Consultei a documentação oficial atual da Vercel
(`vercel.com/docs/workflows`) em 2026-09-16. Confirmei que **Vercel Workflows** é um produto
real e atual: diretivas `'use workflow'`/`'use step'`, retries automáticos por etapa,
`sleep()`, e — particularmente relevante — hooks com `.resume()` para pausar um workflow
esperando aprovação humana (bateria certinho com a "revisão humana" do Motor de Reflexões,
Fase 10). Testei a instalação real (`npm i workflow`) neste projeto.

**O que encontrei.** A instalação (`workflow@4.0.1-beta.0` — o número da versão já denuncia
beta) trouxe **16 vulnerabilidades** (14 delas "high"), vindas de dependências transitivas
(`nanoid`, `undici`) desatualizadas nos pacotes `@workflow/core`, `@workflow/world-local` e
`@workflow/world-vercel`. Rodei `npm audit fix` e `npm audit fix --force`: não há correção
limpa — a única saída que o npm oferece é um **downgrade forçado para `workflow@2.0.6`**,
uma versão major inteira mais antiga. A instalação também trouxe adaptadores para Astro,
Nest, Nuxt, SvelteKit e Vite que este projeto não usa — sinal de um pacote "guarda-chuva"
ainda pouco maduro, não recortado para o que precisamos.

**Decisão.** **Não adotar Vercel Workflows agora.** Desinstalei o pacote
(`npm uninstall workflow`) e voltei o projeto para 0 vulnerabilidades. Em vez disso, a Fase 3
vai usar uma abordagem mais simples e inteiramente sob nosso controle:

1. Cada execução do `processar_obra()` roda dentro de uma única Vercel Function (Route
   Handler), com `maxDuration` alto — confirmado na documentação atual que, com o plano Pro
   (que o usuário já assinou) e Fluid Compute, `maxDuration` pode chegar a **1800 segundos
   (30 minutos)** por invocação, o que é folgado até para livros grandes.
2. `processamento.execucoes` e `processamento.etapas_execucao` (do próprio Dicionário
   Mestre) fazem o papel de "livro de bordo": cada etapa grava seu estado
   (`pendente`/`executando`/`concluida`/`falhou`) e uma `chave_idempotencia` antes de
   começar. Se a função cair no meio do caminho, uma nova chamada para a mesma execução
   confere `etapas_execucao` e pula direto para a primeira etapa ainda não concluída, em vez
   de recomeçar do zero — o mesmo resultado prático de "resume", só que decidido no nosso
   próprio código, sem depender de infraestrutura de terceiros ainda instável.

**Motivo.** Casa com o princípio do próprio projeto de "evitar complexidade desnecessária"
(docs/VISAO_PRODUTO.md §48) e "validar antes de persistir, testar antes de publicar" — betar
o motor de confiabilidade de todo o Cérebro Autoral num pacote com vulnerabilidades sem
correção limpa e claramente em fase beta seria o oposto disso. A tabela
`etapas_execucao` já prevista no dicionário entrega quase todo o valor prático (retry,
observabilidade, idempotência) sem esse risco.

**Consequências.** Documentos muito grandes que se aproximarem do limite de 30 minutos vão
precisar de uma solução mais sofisticada (dividir em múltiplas invocações encadeadas). Isso
não é um problema agora — fica registrado aqui para revisitar se/quando isso acontecer na
prática, e para reavaliar o Vercel Workflows futuramente, quando (e se) sair do beta com
dependências corrigidas.

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
