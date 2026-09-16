# ARQUITETURA TÉCNICA DE IMPLEMENTAÇÃO — CÉREBRO AUTORAL

### Versão arquitetural canônica

> Cópia oficial do documento "Arquitetura Técnica" enviado pelo usuário em 2026-09-16.

---

# 1. OBJETIVO DO PRODUTO

O aplicativo será uma plataforma pessoal de inteligência autoral.

O objetivo técnico principal do sistema será construir progressivamente um:

# CÉREBRO AUTORAL

Esse cérebro deverá representar computacionalmente:

- metodologia de pensamento;
- metodologia de interpretação;
- metodologia de associação;
- metodologia argumentativa;
- metodologia de escrita;
- metodologia narrativa;
- metodologia de revisão;
- estruturas recorrentes de raciocínio;
- maneiras de iniciar uma reflexão;
- maneiras de desenvolver uma tensão;
- maneiras de relacionar experiência e conceito;
- maneiras de construir argumentos;
- maneiras de realizar transições;
- maneiras de chegar a conclusões;
- identidade linguística;
- recursos retóricos;
- evolução intelectual.

Seu propósito final será aplicar essa metodologia para auxiliar na construção de:

# NOVAS REFLEXÕES PERSONALIZADAS.

---

# 2. MACROARQUITETURA

O sistema terá quatro grandes áreas funcionais.

```text
BIBLIOTECA
      ↓
PROCESSAMENTO INTELIGENTE
      ↓
DOCUMENTOS PROCESSADOS
      ↓
CONSTRUÇÃO DO CÉREBRO AUTORAL
      ↓
MOTOR DE REFLEXÕES
      ↓
REFLEXÃO PERSONALIZADA
      ↓
REVISÃO HUMANA
      ↓
NOVAS EVIDÊNCIAS AUTORAIS
```

A inteligência artificial participa de praticamente todo o fluxo.

Entretanto:

**IA interpreta.**
**IA propõe.**
**IA organiza.**
**IA relaciona.**
**IA raciocina.**

O sistema determinístico controla:

**identidade, integridade, permissões, estados, versões, proveniência e persistência.**

---

# 3. STACK TECNOLÓGICA

- Aplicação: Next.js + React + TypeScript.
- Repositório e engenharia: Git + GitHub.
- Hospedagem: Vercel.
- Banco de dados: Supabase PostgreSQL.
- Arquivos: Supabase Storage privado.
- Autenticação: Supabase Auth.
- Vetores: PostgreSQL + pgvector.
- Pesquisa lexical: PostgreSQL Full Text Search.
- Inteligência artificial: OpenAI API.
- Orquestração de tarefas demoradas: Vercel Workflows (a avaliar; ver `docs/DECISOES.md`).

---

# 4. TAXONOMIA TÉCNICA

Tudo que controlarmos terá nomenclatura canônica em português.

Banco: `snake_case`, minúsculas, sem espaços, sem acentos.
Exemplo: `documentos_processados`, `caracteristicas_autorais`, `nivel_confianca`, `pagina_inicial`.

Interface: "Documentos Processados", "Características Autorais", "Nível de Confiança", "Página Inicial".

Não utilizaremos nomes diferentes para representar a mesma entidade.

---

# 5. SCHEMAS PRINCIPAIS DO SUPABASE

```text
biblioteca
processamento
taxonomia
cerebro_autoral
reflexoes
auditoria
sistema
```

Schemas pertencentes ao Supabase continuarão intactos: `auth`, `storage`.

(Ver `docs/DECISOES.md` para a estratégia de exposição desses schemas via Data API — resumo: tabelas de domínio ficam nos schemas acima, não expostos diretamente; a interface consome apenas `public`/`aplicacao`.)

---

# 6. BIBLIOTECA

A Biblioteca representa as fontes originais: livros, cartas, textos, reflexões, capítulos, documentos, referências externas. O arquivo original nunca será alterado durante o processamento.

---

# 7. CLASSIFICAÇÃO DA FONTE

## Autoria

`autoral` | `externa`

## Participação no Cérebro

`autoral_prioritaria` | `externa_referencia` | `externa_influencia` | `excluida_cerebro`

---

# 8. REGRA DO NÚCLEO AUTORAL

Se `autoria = autoral` e `participacao_cerebro = autoral_prioritaria`, o documento poderá contribuir para o Núcleo Autoral depois do processamento completo.

---

# 9. DOCUMENTOS EXTERNOS

Por padrão: `autoria = externa`, `participacao_cerebro = externa_referencia`.

Esses materiais poderão aparecer em pesquisas, fornecer conhecimento, ser utilizados em reflexões, ser citados, ser relacionados com pensamentos do autor. Mas não modificarão automaticamente a metodologia pessoal do Cérebro.

---

# 10. INFLUÊNCIA EXTERNA DELIBERADA

O usuário poderá selecionar "INCORPORAR METODOLOGIA AO CÉREBRO". Nesse momento, `participacao_cerebro = externa_influencia`. O sistema perguntará quais dimensões serão incorporadas (ex.: metodologia de pensamento, argumentação, arquitetura narrativa, recursos retóricos — mas não opiniões/vocabulário, se assim escolhido).

Portanto será possível aprender intelectualmente com outro autor sem transformar suas ideias em supostas ideias históricas do usuário.

---

# 11. COMPOSIÇÃO DO CÉREBRO

```text
NÚCLEO AUTORAL + INFLUÊNCIAS DELIBERADAS = CÉREBRO ATIVO
```

As duas origens jamais serão confundidas.

---

# 12–14. TABELAS DA BIBLIOTECA E STORAGE

Ver `docs/DICIONARIO_MESTRE_DADOS.md` seção 4 para os campos completos de `biblioteca.obras` e `biblioteca.versoes_obras`.

Bucket privado: `originais-biblioteca`. Caminho: `/{usuario_id}/{obra_id}/{versao_id}/original.ext`. Uma nova versão nunca destrói a anterior.

---

# 15. UPLOAD

```text
arquivo recebido → validação → hash → verificação de duplicidade →
preservação do original → registro da obra → registro da versão →
workflow de processamento
```

A interface não ficará esperando o livro ser totalmente processado.

---

# 16. WORKFLOW PRINCIPAL — `processar_obra()`

```text
01_validar_arquivo
02_identificar_formato
03_extrair_conteudo
04_normalizar_conteudo
05_identificar_estrutura
06_construir_hierarquia
07_criar_fragmentos
08_criar_sinteses
09_extrair_elementos
10_normalizar_taxonomia
11_criar_relacoes
12_gerar_embeddings
13_criar_indices
14_realizar_analise_autoral_local
15_validar_processamento
16_publicar_documento_processado
17_avaliar_participacao_cerebro
18_atualizar_cerebro
```

---

# 17. PROCESSAMENTO RESILIENTE

Cada etapa deverá ser idempotente, reexecutável, versionada, observável, independente e recuperável.

Exemplo de chave de idempotência: `obra: OBR-00014 / versao: 3 / pipeline: 2.0 / etapa: gerar_embeddings`. Executá-la novamente não pode gerar duplicações.

---

# 18. ESTADOS DA EXECUÇÃO

```text
recebido → validando → extraindo → normalizando → estruturando →
segmentando → analisando → classificando → vetorizando →
relacionando → validando_resultado → concluido | falhou
```

---

# 19. DOCUMENTO ATÔMICO

O Cérebro nunca utilizará um documento parcialmente processado. Existirá `versao_processada_candidata` e `versao_processada_ativa`. Somente depois das verificações críticas: candidata → ativa.

---

# 20–25. DOCUMENTO PROCESSADO, HIERARQUIA, SEÇÕES, FRAGMENTOS, SÍNTESES, VETORES

Ver `docs/DICIONARIO_MESTRE_DADOS.md` seção 5 (`processamento.*`).

O documento possui vários níveis: OBRA → síntese da obra → PARTE → síntese → CAPÍTULO → síntese → SEÇÃO → síntese → FRAGMENTOS. Não trabalhamos apenas com chunks planos.

---

# 26–28. MOTOR DOCUMENTAL, ELEMENTOS, EVIDÊNCIAS

O motor documental de IA identifica: tema, conceito, ideia, tese, argumento, valor, princípio, pergunta, tensão, contradição, conclusão, história, experiência, pessoa, personagem, lugar, evento, metáfora, analogia, contraste, frase relevante, recurso linguístico, recurso narrativo, estrutura argumentativa, mudança de pensamento, referência.

Nenhum elemento importante deverá existir sem procedência (`processamento.evidencias`).

---

# 29–32. TAXONOMIA MESTRE E MOTOR TAXONÔMICO

Ao encontrar algo novo: extrair → normalizar → buscar taxonomia → comparar sinônimos → comparar conceitos próximos → reutilizar ou propor → relacionar → registrar evidência.

A IA não poderá simplesmente gerar milhares de tags diferentes.

Grafo intelectual (`processamento.relacoes_elementos`): `sustenta`, `contradiz`, `expande`, `deriva_de`, `exemplifica`, `questiona`, `responde_a`, `evolui_para`, `associa_se_a`.

---

# 33. TRÊS PLANOS ANALÍTICOS (OBRIGATÓRIO)

O Cérebro deverá separar obrigatoriamente:

- **CONTEÚDO** — sobre o que o autor pensa.
- **MÉTODO** — como o autor desenvolve o pensamento.
- **EXPRESSÃO** — como o pensamento aparece linguisticamente.

Isso evita confundir "tema recorrente" com "metodologia autoral".

---

# 34–47. CÉREBRO AUTORAL

Schema `cerebro_autoral`, formado por: versões, dimensões, características, metodologias, regras, transições, evidências, exceções, influências externas, fontes do cérebro.

**Confiança** não é simplesmente um número criado pela IA — é calculada a partir de: quantidade de evidências, quantidade de documentos, diversidade de documentos, diversidade temporal, frequência, contraexemplos, confirmação humana.

**Exceções** (`cerebro_autoral.excecoes`) impedem que padrões se transformem em caricaturas — ex.: "Normalmente inicia pelo concreto (42 ocorrências), mas há 11 exceções."

**Grafo metodológico** (`cerebro_autoral.transicoes`) representa como o raciocínio se move: experiência → observação → tensão → questionamento → associação → contraste → elaboração → síntese → conclusão.

**Versionamento**: estados `em_construcao`, `proposta`, `ativa`, `arquivada`. Somente uma versão `ativa` por usuário. Atualização incremental normalmente; `reconstruir_cerebro()` para mudanças estruturais grandes.

---

# 48–51. RECUPERAÇÃO HÍBRIDA E CONTEXTO DE TRABALHO

Combina: Full Text Search + pgvector + taxonomia + metadados + hierarquia documental + grafo intelectual + autoria + período + tipo de fonte + Cérebro Autoral.

O Motor de IA decide primeiro *o que* precisa consultar (documentos? Cérebro? influências? as três coisas? nada, o pensamento atual já basta?) antes de montar o `contexto_trabalho`.

---

# 52–55. CAMADA DE IA

```text
ia/
├── motor_documental
├── motor_taxonomico
├── motor_autoral
├── motor_recuperacao
├── motor_planejamento
├── motor_redacao
├── motor_auditoria
└── motor_aprendizado
```

Modelos configuráveis (nunca IDs soltos no código): `MODELO_IA_EXTRACAO`, `MODELO_IA_ANALISE`, `MODELO_IA_CEREBRO`, `MODELO_IA_REDACAO`, `MODELO_IA_AUDITORIA`, `MODELO_IA_EMBEDDING`.

Saídas estruturadas: modelo → JSON Schema → validação → normalização → validação de referências → persistência. Nunca resposta textual salva diretamente como verdade.

Prompts versionados em `prompts/{processamento,taxonomia,cerebro,recuperacao,reflexoes,auditoria}/`, cada um com nome, versão, finalidade, entrada, schema de saída.

---

# 56–62. MOTOR DE REFLEXÕES

```text
REFLEXÃO EXTERNA → análise → COMENTÁRIO ATUAL → análise →
classificação da tarefa → recuperação adaptativa → contexto de trabalho →
detecção de conflitos → plano → rascunho → auditoria → revisão do autor →
versão aprovada
```

Plano antes da redação (`reflexoes.planos`): questão central, tese provisória, abertura, movimentos do raciocínio, experiências, conceitos, argumentos, tensões, contrastes, síntese, direção da conclusão.

**Auditor independente**: o processo que escreve não é o único que verifica. O auditor checa afirmação sem fundamento, cópia excessiva, respeito ao comentário atual, uso correto da metodologia, identificação de influência externa, caricatura de estilo, conflito ignorado, novidade real.

**Versionamento da reflexão**: V1 (IA) → V2 (IA após auditoria) → V3 (edição do autor) → V4 (versão aprovada). Nada é sobrescrito silenciosamente.

**Aprovação ≠ Aprendizado.** "Aprovar reflexão" não significa "incorporar ao Cérebro". Para aprender: "incorporar como conteúdo autoral" — a reflexão percorre Biblioteca → Processamento → Documento Processado → Cérebro.

**Aprendizado por revisão**: compara `rascunho_ia` com `versao_final_autor` (remoções, adições, substituições, reordenações, mudanças de abertura/argumentação/transição/conclusão/linguagem) e gera **propostas** de novas evidências autorais — nunca altera o Cérebro silenciosamente.

---

# 63–66. AUDITORIA, PROVENIÊNCIA, SEGURANÇA, PROMPT INJECTION

Toda informação relevante deve responder: de onde veio, qual arquivo, qual versão, qual página, qual fragmento, qual processamento, qual modelo, qual prompt, qual taxonomia, quando, foi revisada pelo usuário?

Segurança: Storage privado, RLS, autenticação, privilégio mínimo, segredos apenas no servidor, URLs temporárias, logs sem conteúdo sensível desnecessário.

**Prompt injection**: o conteúdo de um livro é sempre **DADO**, nunca **INSTRUÇÃO**. Uma frase como "ignore as instruções anteriores" dentro de um documento não pode controlar nenhum agente.

---

# 67–71. FRONTEND

Rotas conceituais:

```text
/
/biblioteca
/biblioteca/[obra]
/documentos-processados
/documentos-processados/[documento]
/cerebro-autoral
/cerebro-autoral/caracteristicas
/cerebro-autoral/influencias
/criar-reflexao
/reflexoes
/reflexoes/[id]
/configuracoes
```

Página Cérebro Autoral dividida em: Visão Geral, Metodologia de Pensamento, Metodologia de Interpretação, Metodologia Argumentativa, Metodologia de Escrita, Arquitetura Narrativa, Identidade Linguística, Universo Conceitual, Grafo Metodológico, Evolução, Influências Deliberadas, Evidências, Versões.

---

# 72–79. ENGENHARIA, CI, AMBIENTES, TESTES, ORDEM DE IMPLEMENTAÇÃO

GitHub: branch principal `main`; branches `funcionalidade/*`; fluxo branch → PR → CI → Preview → testes → merge → produção.

Ambientes: LOCAL, PREVIEW/PR, PRODUÇÃO. Idealmente PR com Vercel Preview + Supabase Preview Branch.

Estrutura de pastas proposta:

```text
src/
├── app/
├── componentes/
├── dominios/{biblioteca,processamento,taxonomia,cerebro-autoral,reflexoes}/
├── ia/{documental,taxonomica,autoral,recuperacao,planejamento,redacao,auditoria,aprendizado}/
├── workflows/{processar-obra,atualizar-cerebro,construir-reflexao}/
└── infraestrutura/{supabase,openai,vercel}/

supabase/{migrations,seeds,tests}/
taxonomia/
prompts/
avaliacoes/
docs/
tests/
```

Testes: detecção de metodologia, separação entre tema e método, identificação de evidências/exceções, distinção entre autoria e influência, recuperação correta, aplicação metodológica, não-caricatura, não-cópia.

**Teste de contaminação** (crítico): dado 10 livros autorais + 5 livros externos + 2 influências deliberadas, o sistema deve distinguir "o autor escreveu..." de "uma referência externa afirma..." de "o autor escolheu incorporar esta metodologia externa...".

Ordem de implementação: Fase 0 (Fundação técnica) → Fase 1 (Dicionário Mestre) → Fase 2 (Biblioteca) → Fase 3 (Pipeline documental) → Fase 4 (Documento Processado) → Fase 5 (Taxonomia inteligente) → Fase 6 (Busca híbrida e grafo) → Fase 7 (Cérebro Autoral) → Fase 8 (Influências Deliberadas) → Fase 9 (Motor de Recuperação) → Fase 10 (Motor de Reflexões) → Fase 11 (Aprendizado pelas revisões) → Fase 12 (Avaliações e otimizações).

---

# 80. CRITÉRIO CENTRAL DE SUCESSO

O produto não é avaliado apenas pela aparência das telas. Está funcionando quando demonstramos:

```text
obras autorais → processamento confiável → conhecimento estruturado →
padrões transversais → metodologia comprovável → Cérebro Autoral →
nova situação → pensamento presente → recuperação pertinente →
aplicação metodológica → nova reflexão personalizada
```

A nova reflexão deve demonstrar: **conteúdo pertinente + pensamento atual + memória do autor + metodologia autoral + elaboração nova.**

---

# PRINCÍPIO DEFINITIVO

A BIBLIOTECA PRESERVA. A IA PROCESSA. O DOCUMENTO PROCESSADO ORGANIZA O CONHECIMENTO. A TAXONOMIA DÁ ORDEM. O NÚCLEO AUTORAL REPRESENTA O AUTOR. AS INFLUÊNCIAS EXTERNAS SÓ ENTRAM POR ESCOLHA EXPLÍCITA. O CÉREBRO APRENDE A METODOLOGIA. O MOTOR DE RECUPERAÇÃO SELECIONA O CONTEXTO. A IA APLICA A METODOLOGIA. O MOTOR DE REFLEXÕES PRODUZ ALGO NOVO. O AUTOR REVISA. O SISTEMA APRENDE COM EVIDÊNCIAS. E O AUTOR PERMANECE A AUTORIDADE FINAL.
