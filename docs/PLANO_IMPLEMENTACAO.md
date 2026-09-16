# PLANO DE CONSTRUÇÃO — CÉREBRO AUTORAL

> Cópia oficial do "Plano de Construção" enviado pelo usuário em 2026-09-16, com uma nota
> de aplicação prática no topo (a decisão real de infraestrutura tomada nesta conversa está
> em `docs/DECISOES.md`).

## Nota de aplicação (2026-09-16)

O documento original abaixo pede "Regra Zero": novo GitHub, novo Supabase, novo Vercel. Na
prática, o usuário confirmou nesta conversa que devemos **continuar na infraestrutura já
conectada** (repositório `villacanabrava-maker/Celebro-Biblioteca-Cloude`, projeto Supabase
`Celebro-Biblioteca-Cloude` / `xaxhxkmgrneutpenesdz`, projeto Vercel
`cerebro-biblioteca-cloude`). O espírito da "Regra Zero" — não migrar automaticamente o
banco antigo, não reaproveitar Edge Functions antigas, tratar decisões anteriores como
aprendizado — é respeitado através de **schemas novos e isolados** (`biblioteca`,
`processamento`, `taxonomia`, `cerebro_autoral`, `reflexoes`, `auditoria`, `sistema`,
`aplicacao`) que convivem, sem se misturar, com o schema `public` do app "Cérebro
Biblioteca" (fases 1–6, já em produção). Ver `docs/DECISOES.md` para o detalhamento.

---

## REGRA ZERO (texto original)

Este é um projeto completamente novo. Nenhum banco ou deploy anterior será migrado
automaticamente. Nenhuma tabela anterior será considerada parte deste sistema. Nenhuma Edge
Function anterior será reaproveitada diretamente. O aplicativo anterior serve apenas como
referência histórica de produto e aprendizado.

# 1. Objetivo

Construir do zero um aplicativo cujo principal ativo seja o **Cérebro Autoral**: o sistema
deve aprender, a partir das obras do usuário, metodologia de pensamento, interpretação,
associação, argumentação, escrita, arquitetura narrativa e de parágrafo, formas de abertura,
transição e conclusão, recursos retóricos, identidade linguística, relação entre
experiências e conceitos, metodologia de revisão e evolução intelectual — para construir
novas reflexões personalizadas.

# 2. Macrofluxo

```text
BIBLIOTECA → PROCESSAMENTO INTELIGENTE → DOCUMENTOS PROCESSADOS →
ANÁLISE TRANSVERSAL → CÉREBRO AUTORAL → RECUPERAÇÃO CONTEXTUAL →
MOTOR DE REFLEXÕES → NOVA REFLEXÃO → REVISÃO DO AUTOR → APRENDIZADO CONTROLADO
```

# 3–6. Conexão às plataformas e stack

GitHub, Supabase e Vercel — ver nota de aplicação acima. Stack: Next.js/React/TypeScript,
Supabase PostgreSQL, Supabase Auth, Supabase Storage, pgvector, PostgreSQL Full Text
Search, OpenAI API, Vercel, GitHub.

O projeto antigo pode ser estudado apenas para responder: o que funcionou? o que deu
problema? quais bugs já descobrimos? quais padrões de segurança deram certo? quais decisões
de interface foram boas? quais problemas de concorrência já ocorreram? quais erros de
prompt devemos evitar? — nunca para copiar o banco inteiro, importar migrations antigas,
transportar Edge Functions ou reproduzir a arquitetura sem revisão.

# 7. Fase 0 — Fundação

```text
novo GitHub / novo Supabase / novo Vercel (ver nota de aplicação)
↓
Next.js, TypeScript, lint, formatação, testes, CI, variáveis de ambiente,
Supabase local, estrutura de migrations
```

# 8. GitHub

Estrutura inicial sugerida: `src/`, `supabase/`, `docs/`, `prompts/`, `taxonomia/`,
`tests/`. Branch principal `main`. Branches de desenvolvimento:
`feature/fundacao`, `feature/biblioteca`, `feature/processamento`, `feature/taxonomia`,
`feature/cerebro`, `feature/reflexoes`. Nenhuma mudança estrutural importante diretamente em
`main`.

> Nota de aplicação: por ora seguimos desenvolvendo na branch de trabalho designada para
> esta sessão (`claude/bold-pasteur-cfum8r`), que é a branch de produção configurada na
> Vercel. Uma migração para o fluxo `main` + `feature/*` + Pull Requests é uma melhoria de
> processo a discutir com o usuário antes de adotar (ver `docs/DECISOES.md`).

# 9. Supabase

Schemas desejados: `biblioteca`, `processamento`, `taxonomia`, `cerebro_autoral`,
`reflexoes`, `auditoria`, `sistema`. Schemas próprios do Supabase permanecem: `auth`,
`storage`.

# 10–11. Migrations

A primeira migration cria somente a Fundação (extensões, schemas, funções utilitárias,
triggers comuns, estruturas fundamentais, RLS básico, comments SQL). Depois, migrations
independentes por domínio, na sequência:
`0001_fundacao → 0002_sistema → 0003_taxonomia → 0004_biblioteca → 0005_processamento →
0006_cerebro_autoral → 0007_reflexoes → 0008_auditoria → 0009_indices →
0010_policies_rls`.

# 12–14. Ambientes e Vercel

Desde o início: LOCAL, PREVIEW, PRODUCTION — nunca desenvolver diretamente sobre produção.
GitHub → Vercel com `main` → produção e Pull Request → Preview. Investigar e, se disponível
no plano usado, configurar Supabase Branching para que cada PR tenha Preview de app +
Preview de banco.

# 15. Dicionário Mestre

Ponto de partida oficial: `docs/DICIONARIO_MESTRE_DADOS.md`. Não alterar nomes de forma
arbitrária — qualquer mudança importante atualiza primeiro o dicionário.

# 16–20. Biblioteca, classificação de autoria, regra do Cérebro, influência externa

Ver `docs/ARQUITETURA_TECNICA.md` seções 6–11 (conteúdo consistente).

# 21–29. Motores de IA

```text
motor_documental, motor_taxonomico, motor_autoral, motor_recuperacao,
motor_planejamento, motor_redacao, motor_auditoria, motor_aprendizado
```

Motor documental extrai temas, conceitos, ideias, teses, argumentos, valores, perguntas,
tensões, histórias, experiências, metáforas, relações, contradições, mudanças, estruturas
narrativas/argumentativas, padrões linguísticos. Motor taxonômico sempre procura conceito
existente, sinônimo, termo alternativo e conceito relacionado antes de propor um conceito
novo. Motor autoral analisa o conjunto de Documentos Processados autorais perguntando o que
se repete, como o raciocínio começa/progride/associa/argumenta, como transforma experiência
em conceito, como escreve, como conclui, o que mudou ao longo do tempo.

# 25–29. Cérebro Autoral e reflexões

O Cérebro não é texto livre — possui entidades estruturadas (dimensões, características,
evidências, exceções, metodologias, regras operacionais, anti-regras, transições
metodológicas, versões). Cérebro Ativo = Núcleo Autoral + Influências Externas
explicitamente autorizadas.

Depois do Cérebro funcional: reflexão externa + comentário atual + documentos pertinentes +
Cérebro pertinente + influências autorizadas = contexto de trabalho. A geração sempre passa
por: análise → recuperação → conflitos → plano → redação → auditoria → revisão humana.
**Nunca gerar diretamente o texto final depois de uma única chamada simples.**

# 29. Aprendizado

Comparar texto da IA vs. texto final do autor; detectar alterações; transformar alterações
somente em **propostas de aprendizado**. Nunca modificar silenciosamente o Cérebro.

# 30–34. OpenAI, outputs, prompts, workflows, idempotência

Centralizar modelos (`MODELO_EXTRACAO`, `MODELO_ANALISE`, `MODELO_CEREBRO`,
`MODELO_REDACAO`, `MODELO_AUDITORIA`, `MODELO_EMBEDDING`) — nenhum ID de modelo espalhado
pelo código. Toda saída que vai para o banco: OpenAI → Structured Output → JSON Schema →
Zod → validação → persistência. Prompts versionados no GitHub em
`prompts/{documental,taxonomia,cerebro,recuperacao,reflexoes,auditoria}/`. Livro grande
processado com sistema durável: cada etapa suporta retry, resume, idempotência,
observabilidade. Toda etapa cara (obra + versão + pipeline + etapa) possui chave única —
uma tentativa repetida não duplica cobrança nem dados.

# 35–37. Segurança, observabilidade, testes

RLS desde a primeira migration; Storage privado; segredos somente no servidor; usuário
isolado; service role nunca no browser; dados externos tratados como dados; proteção contra
prompt injection. Registrar modelo, prompt, taxonomia, pipeline, tokens, latência, custo,
tentativas, erro, resultado. Construir desde o início testes unitários, de integração, SQL,
RLS, migrations, IA, taxonomia, retrieval, E2E.

# 38. Ordem de construção

```text
Fase 0  Fundação
Fase 1  Biblioteca
Fase 2  Pipeline documental
Fase 3  Documento Processado
Fase 4  Taxonomia
Fase 5  Busca híbrida
Fase 6  Cérebro Autoral
Fase 7  Influências Externas
Fase 8  Recuperação contextual
Fase 9  Motor de Reflexões
Fase 10 Aprendizado por revisão
Fase 11 Avaliações e otimização
```

> Nota: este documento numera as fases de um jeito ligeiramente diferente do documento
> `ARQUITETURA_TECNICA.md` (que junta "Dicionário Mestre" como Fase 1 e desloca as
> seguintes). Vamos seguir a numeração de `ARQUITETURA_TECNICA.md` como referência única de
> progresso em `docs/ESTADO_ATUAL.md`, já que é a mais detalhada; esta lista fica preservada
> aqui apenas como registro fiel do documento original.

# 39. Primeira ação do agente

1. Confirmar conexão GitHub. 2. Confirmar conexão Supabase. 3. Confirmar conexão Vercel.
4. Criar/inventariar o repositório. 5. Criar/inventariar o Supabase. 6. Criar/inventariar o
projeto Vercel. 7. Conectar GitHub → Vercel e Aplicação → Supabase. 8. Criar ambiente local.
9. Configurar CI. 10. Só então começar migrations.

# 40. O que o agente não precisa fazer

Reconciliar o Supabase antigo, migrar o banco antigo, reconciliar a Vercel antiga, descobrir
qual repositório antigo é oficial, manter compatibilidade com banco antigo, preservar APIs
ou migrations antigas — **porque este é um sistema novo** (nos schemas; ver nota de
aplicação sobre a infraestrutura).

# 41. O que aproveitar do projeto antigo

Apenas conhecimento: problemas de concorrência, necessidade de idempotência, RLS,
proveniência, versionamento, revisão humana, separação entre autoria e referência externa,
problemas de prompts conflitantes, necessidade de validação determinística, importância de
observabilidade.

# 42. Princípio final

```text
NÃO ESTOU MIGRANDO O APLICATIVO ANTIGO.
ESTOU CONSTRUINDO A NOVA VERSÃO CORRETA DO PRODUTO.
```

A nova arquitetura (schemas do Cérebro Autoral) nasce limpa, ao lado da infraestrutura já
existente. Todo o restante será construído progressivamente sobre essa Fundação.
