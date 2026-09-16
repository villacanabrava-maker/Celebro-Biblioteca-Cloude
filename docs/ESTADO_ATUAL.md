# ESTADO ATUAL DO PROJETO

> Atualizado a cada fase concluída. Numeração de fases seguindo
> `docs/ARQUITETURA_TECNICA.md` §79 (ver nota em `docs/PLANO_IMPLEMENTACAO.md`).

## Cérebro Biblioteca (v1 — schema `public`)

App simples, funcional, **em produção**, construído antes da chegada dos 4 documentos do
Cérebro Autoral. Não é alterado a partir de agora, exceto por correções de bugs — todo
desenvolvimento novo acontece no Cérebro Autoral (schemas novos, abaixo).

- [x] Scaffold Next.js + design system + layout base
- [x] Supabase: 8 tabelas multiusuário + auth (e-mail/senha; Google pendente de
      configuração no painel)
- [x] Biblioteca: upload real + detalhe do documento
- [x] Integração OpenAI: resumo, temas e memórias por documento
- [x] Meu Cérebro: análise agregada simples (sem metodologia/dimensões)
- [ ] Criar Reflexão + Minhas Reflexões (pausado — ver nota abaixo)
- [ ] Configurações + polimento final

> Nota: a Fase 6 (Criar Reflexão) estava em andamento quando os documentos do Cérebro
> Autoral chegaram. Decisão: não finalizar a versão simples de Reflexões em `public` — o
> Motor de Reflexões "de verdade" (análise → recuperação → conflitos → plano → redação →
> auditoria → revisão humana) é construído diretamente no schema `reflexoes` do Cérebro
> Autoral, mais adiante no roteiro abaixo.

## Cérebro Autoral (schemas novos — a construção atual)

- [x] **Fase 0 — Fundação técnica**
  Extensões (`pgcrypto`, `vector`/pgvector), os 8 schemas
  (`biblioteca`, `processamento`, `taxonomia`, `cerebro_autoral`, `reflexoes`,
  `auditoria`, `sistema`, `aplicacao`) com `COMMENT ON SCHEMA`, função utilitária
  `public.definir_atualizado_em()`. Zero avisos de segurança. Documentos-fonte salvos em
  `docs/`. Migration: `fase0_fundacao_cerebro_autoral`.
- [ ] **Fase 1 — Sistema + Taxonomia (base)**
  Tabelas de `sistema` (modelos de IA, prompts, versões de pipeline, configurações do
  usuário) e de `taxonomia` (versões, conceitos, termos, relações) — pré-requisito para
  tudo que vem depois, porque `processamento` e `cerebro_autoral` referenciam
  `versao_taxonomia_id`, `modelo_ia_id`, `versao_prompt_id`.
- [ ] **Fase 2 — Biblioteca**
  `biblioteca.obras` + `biblioteca.versoes_obras`, bucket de Storage
  `originais-biblioteca`, upload com hash/dedupe, classificação de autoria
  (`autoral`/`externa`) e participação no Cérebro.
- [ ] **Fase 3 — Pipeline documental (`processar_obra()`)**
  As 18 etapas do workflow (validar → extrair → normalizar → estrutura → fragmentos →
  sínteses → elementos → taxonomia → relações → embeddings → índices → análise autoral
  local → validação → publicar → avaliar participação → atualizar Cérebro), com
  idempotência e execução durável.
- [ ] **Fase 4 — Documento Processado**
  `processamento.documentos_processados` + `secoes` + `fragmentos` + `sinteses` +
  `elementos` + `evidencias` + `vetores` + `relacoes_elementos`. Regra do documento
  atômico (candidato → ativo).
- [ ] **Fase 5 — Taxonomia inteligente**
  Motor taxonômico completo (buscar antes de propor conceito novo), UI de revisão de
  conceitos.
- [ ] **Fase 6 — Busca híbrida e grafo**
  Full Text Search + pgvector (HNSW) + taxonomia + metadados + grafo intelectual.
- [ ] **Fase 7 — Cérebro Autoral**
  Dimensões (18 iniciais), características, evidências, exceções, metodologias, regras,
  transições, versionamento do Cérebro, motor autoral completo.
- [ ] **Fase 8 — Influências Externas**
  `cerebro_autoral.influencias_externas` + `escopos_influencia`, UI de "incorporar
  metodologia deste autor".
- [ ] **Fase 9 — Recuperação contextual**
  Pacote `contexto_trabalho`, recuperação adaptativa (decidir o que consultar antes de
  consultar).
- [ ] **Fase 10 — Motor de Reflexões**
  Fluxo completo: entrada → análise → recuperação → conflitos → plano → rascunho →
  auditoria → revisão do autor → versão aprovada → (opcional) incorporação como conteúdo
  autoral.
- [ ] **Fase 11 — Aprendizado pelas revisões**
  Comparação `rascunho_ia` vs. `versão final do autor` → propostas de aprendizado (nunca
  automático).
- [ ] **Fase 12 — Avaliações, segurança e otimização**
  Testes de contaminação autoral, avaliações do Cérebro, ajuste de índices/custos.

## Frente separada: redesenho visual

Pedido pelo usuário em 2026-09-16 ("modifique todo o design e deixe ele mais moderno
possível"), com base nas 5 imagens de referência já analisadas no início da conversa.
Ainda não iniciado — entra na fila logo após a Fase 1 do Cérebro Autoral, ou antes, a
critério do usuário.
