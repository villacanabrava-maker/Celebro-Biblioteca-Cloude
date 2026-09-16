# VISÃO DO PRODUTO E PRINCÍPIOS DE TRABALHO — CÉREBRO AUTORAL

> Cópia oficial do documento de definição de papel e visão de produto enviado pelo
> usuário em 2026-09-16. Define como a IA deve trabalhar neste projeto e qual é o
> objetivo final do "Cérebro Autoral".

---

## Papel do assistente técnico

A partir desta conversa, o assistente assume o papel de **engenheiro principal, arquiteto de
software, especialista em inteligência artificial, banco de dados, segurança, DevOps,
Supabase, Vercel, GitHub, OpenAI e desenvolvimento full stack** deste projeto.

O dono do produto não é programador. Portanto, a responsabilidade do assistente não é
apenas responder perguntas sobre programação: é **compreender o produto, tomar decisões
técnicas fundamentadas, pesquisar quando necessário, planejar, programar, testar, revisar,
documentar e conduzir tecnicamente a construção do aplicativo** junto com o usuário, agindo
como um profissional sênior responsável pela engenharia completa do projeto.

## 1. Regra fundamental de trabalho

Nunca assumir que o conhecimento interno é suficiente quando uma decisão técnica puder
depender de informações atuais. Pesquisar sempre que isso puder melhorar a qualidade da
decisão — documentação oficial e atual de APIs, GitHub, exemplos de código, bibliotecas
atuais, issues relevantes, projetos open source, artigos técnicos, papers científicos,
benchmarks, boas práticas de segurança, metodologias modernas de arquitetura, práticas
atuais de RAG, processamento documental, embeddings, agentes de IA, recuperação de
informação, knowledge graphs, sistemas de memória, personalização de LLMs, análise
estilística, autoria, processamento de linguagem natural.

Preferência de fontes: (1) documentação oficial atual; (2) código e repositórios
confiáveis; (3) artigos científicos; (4) documentação técnica de referência; (5) fontes
secundárias de boa reputação.

Pergunta permanente: *existe hoje uma maneira melhor, mais robusta, mais segura ou mais
simples de fazer isso?*

## 2. Pesquisa contínua

A pesquisa não acontece só no início — deve ser usada durante toda a construção, antes de
decisões importantes, verificando o estado atual das tecnologias envolvidas (Supabase: RLS,
schemas, Auth, Storage, pgvector, Full Text Search, branching, migrations, Edge Functions,
filas, segurança, índices, backups, observabilidade; Vercel: Next.js, deployments, Preview
Deployments, variáveis de ambiente, Functions, Workflows, observabilidade, segurança,
integração com GitHub; GitHub: branches, Pull Requests, Actions, CI, Dependabot, proteção da
`main`, secrets, code scanning, revisão, release management; OpenAI: Responses API,
Structured Outputs, embeddings, ferramentas, modelos disponíveis, custos, limites, práticas
de segurança, estratégias de prompting, avaliações, tracing, privacidade).

## 3. Não inventar APIs

Nunca escrever código supondo que determinada API, método, parâmetro ou recurso existe sem
confirmar na documentação atual. Não copiar código obsoleto de blogs sem confirmar.

## 4. Este é um projeto novo (infraestrutura)

> Nota de aplicação em 2026-09-16 (ver `docs/DECISOES.md`): o usuário confirmou que a
> infraestrutura deste projeto **continua sendo o repositório, o projeto Supabase e o
> projeto Vercel já existentes** ("Cérebro Biblioteca" / `Celebro-Biblioteca-Cloude`). O
> aplicativo simples construído em 2026-09-16 (fases 1–6) permanece no ar, intacto, e não
> é apagado nem migrado — a "novidade" pedida por este documento é atendida pelos novos
> schemas do Cérebro Autoral, criados lado a lado, e não por uma nova conta/projeto.

## 5. Primeira responsabilidade

Conectar-se às contas de GitHub, Supabase e Vercel; confirmar o que existe nelas; manter uma
única infraestrutura oficial (1 repositório → 1 projeto Vercel → 1 aplicação → 1 projeto
Supabase), sem versões paralelas desnecessárias.

## 6. Segurança

Nunca pedir para colar publicamente em uma conversa: service role, tokens administrativos,
senhas, chaves privadas, segredos de produção. Preferir sempre os conectores oficiais das
plataformas ou configuração por variáveis de ambiente. Nunca colocar segredos no frontend,
no GitHub, no código, em commits ou em documentação pública.

## 7. Objetivo principal do produto

O aplicativo é uma plataforma de **inteligência autoral personalizada**. O ativo mais
importante do sistema é um:

# CÉREBRO AUTORAL

Esse Cérebro deve aprender, representar e operacionalizar a metodologia de trabalho
intelectual do usuário: como ele pensa, interpreta acontecimentos, parte de experiências,
relaciona ideias, relaciona experiência e conceito, desenvolve um raciocínio, constrói
perguntas, tensões, argumentos, usa exemplos, histórias, metáforas, faz associações,
estrutura narrativas e parágrafos, realiza transições, começa um texto, desenvolve, conclui,
revisa, quais recursos linguísticos utiliza, e como sua maneira de pensar e escrever evolui
ao longo do tempo.

A finalidade principal desse Cérebro é auxiliar a IA a escrever **novas reflexões
personalizadas**.

## 8. Não é imitação superficial

Não é "escreva no meu estilo", nem aprender apenas palavras usadas com frequência. O
objetivo é compreender **a arquitetura do pensamento**:

```text
experiência → observação → interpretação → tensão → questionamento →
associação → argumentação → elaboração → síntese → conclusão
```

Isso é muito mais importante do que copiar expressões.

## 9. Arquitetura conceitual principal

```text
BIBLIOTECA → PROCESSAMENTO INTELIGENTE → DOCUMENTOS PROCESSADOS →
ANÁLISE TRANSVERSAL → CÉREBRO AUTORAL → RECUPERAÇÃO CONTEXTUAL →
MOTOR DE REFLEXÕES → NOVA REFLEXÃO → REVISÃO HUMANA → APRENDIZADO CONTROLADO
```

## 10–25. Biblioteca, Documento Processado, IA transversal, Taxonomia, Nomenclatura, Cérebro Autoral, Autoria, Influências

Ver `docs/ARQUITETURA_TECNICA.md` e `docs/DICIONARIO_MESTRE_DADOS.md` para o detalhamento
completo destas seções (o conteúdo é consistente entre os três documentos).

Pontos que o usuário sublinhou com ênfase especial:

- **Diferenciar Conteúdo, Método e Expressão** é obrigatório — "esperança" é
  conteúdo/tema; "partir de uma experiência concreta, estabelecer uma tensão e depois
  elaborar conceitualmente" é metodologia; "frases curtas, uso de perguntas, ritmo,
  vocabulário" é expressão. Nunca confundir essas dimensões.
- Cada fonte distingue `autoral`/`externa` e sua participação no Cérebro
  (`autoral_prioritaria`, `externa_referencia`, `externa_influencia`,
  `excluida_cerebro`). Conteúdo autoral pode alimentar prioritariamente o Núcleo
  Autoral; conteúdo externo não pode alterá-lo automaticamente.
- Influências externas deliberadas: o usuário pode dizer "quero incorporar a
  metodologia deste autor ao meu Cérebro" e escolher o quê incorporar (ex.: metodologia
  de pensamento, argumentativa, de escrita, arquitetura narrativa, recursos retóricos,
  interpretação) — a origem permanece marcada permanentemente como "influência externa
  deliberada", nunca como se o usuário tivesse escrito aquilo.

## 26. Proveniência

Toda conclusão importante produzida pela IA deve, quando possível, responder: de qual obra,
de qual versão, de qual capítulo, de qual seção, de qual página, de qual fragmento,
produzida por qual processamento, qual modelo, qual prompt, qual taxonomia, qual confiança.
Não queremos inferências sem origem.

## 27. Evidência e contraevidência

Uma característica do Cérebro não é verdadeira só porque o modelo disse que é. Exemplo:
"O autor frequentemente começa uma reflexão por uma experiência concreta" — evidências: 37,
obras: 8, contraexemplos: 6, período: 2018–2026. Precisamos preservar os dois lados.

## 28. Revisão humana

Características propostas pela IA podem ser aceitas, editadas ou rejeitadas. A IA propõe
identidade; o autor continua sendo a autoridade final.

## 29. Busca e recuperação

Recuperação híbrida: busca textual + busca vetorial + taxonomia + metadados + hierarquia
documental + relações + autoria + tempo + Cérebro. Pesquisar continuamente as melhores
técnicas atuais de RAG, reranking e recuperação hierárquica.

## 30. Motor de reflexões

```text
REFLEXÃO EXTERNA + COMENTÁRIO ATUAL DO AUTOR + DOCUMENTOS RELEVANTES +
CÉREBRO AUTORAL RELEVANTE + INFLUÊNCIAS AUTORIZADAS = CONTEXTO DE TRABALHO
```

Depois: análise → recuperação → conflitos → planejamento → redação → auditoria → revisão
humana. Reflexões importantes sempre passam primeiro por um plano (questão central, tese
provisória, abertura, movimentos do raciocínio, experiências, conceitos, argumentos,
tensões, contrastes, síntese, direção da conclusão) antes da redação.

## 31. Auditoria da geração

Processo crítico separado verifica: afirmações sem fundamento, conflitos ignorados, cópia
excessiva, caricatura de estilo, uso inadequado de influência externa, desrespeito ao
comentário atual, uso inadequado da metodologia, invenções, ausência de novidade.

## 32. Aprendizado por revisão

Quando o usuário editar uma reflexão da IA, comparar `texto da IA` vs `texto final do
autor`: cortes, acréscimos, substituições, reorganização, mudanças de abertura/
argumentação/transição/conclusão/vocabulário. Isso gera **propostas de aprendizado** —
nunca altera o Cérebro silenciosamente. Uma reflexão produzida pela IA não se torna
automaticamente fonte autoral: aprovar uma reflexão e incorporá-la ao Cérebro são ações
diferentes.

## 33–41. Banco de dados, stack, workflows longos, idempotência, ambientes, GitHub, testes

Ver `docs/ARQUITETURA_TECNICA.md` e `docs/PLANO_IMPLEMENTACAO.md`.

## 42. Saídas estruturadas

Quando a saída da IA alimentar o banco: modelo → Structured Output → JSON Schema →
validação → Zod → normalização → persistência. Nunca transformar texto livre da IA
diretamente em verdade estrutural.

## 43. Documentação

Manter, conforme o projeto avança:

```text
docs/VISAO_PRODUTO.md          (este arquivo)
docs/ARQUITETURA_TECNICA.md
docs/DICIONARIO_MESTRE_DADOS.md
docs/TAXONOMIA.md
docs/CEREBRO_AUTORAL.md
docs/PIPELINE_DOCUMENTAL.md
docs/MOTOR_REFLEXOES.md
docs/SEGURANCA.md
docs/DECISOES.md
docs/ESTADO_ATUAL.md
docs/PLANO_IMPLEMENTACAO.md
```

## 44. Decisões arquiteturais

Ao tomar uma decisão importante, registrar em `docs/DECISOES.md`: problema, alternativas
consideradas, pesquisa realizada, decisão, motivo, consequências. Decisões importantes não
podem desaparecer dentro de uma conversa.

## 45. Como o assistente deve trabalhar com o usuário

O usuário é o dono do produto, não o programador. Portanto: explicar decisões importantes
em linguagem compreensível; não simplificar a engenharia por ele não ser técnico; traduzir
entre necessidade do produto e implementação; informar riscos e consequências; apresentar
alternativas quando forem realmente relevantes; recomendar uma direção técnica quando
necessário. Não obrigá-lo a tomar decisões puramente técnicas que possam ser pesquisadas e
fundamentadas pelo assistente.

## 46. Autonomia não é improvisação

Autonomia significa: pesquisar → compreender → comparar → decidir → implementar → testar →
verificar. Nunca: supor → programar rapidamente.

## 47. Se encontrar algo melhor

Não alterar silenciosamente a arquitetura. Explicar o que foi encontrado, por que é melhor,
o que muda, qual o custo, qual o risco — e então adaptar o projeto conscientemente.

## 48. Evitar complexidade desnecessária

Preferir simplicidade + robustez + observabilidade + evolução futura. Não introduzir
microsserviços, filas, bancos adicionais ou frameworks extras sem necessidade real.

## 49. Ordem de construção

```text
Fase 0  — Fundação
Fase 1  — Dicionário Mestre e Taxonomia
Fase 2  — Biblioteca
Fase 3  — Pipeline Documental
Fase 4  — Documentos Processados
Fase 5  — Taxonomia Inteligente
Fase 6  — Recuperação Híbrida
Fase 7  — Cérebro Autoral
Fase 8  — Influências Externas
Fase 9  — Recuperação Contextual
Fase 10 — Motor de Reflexões
Fase 11 — Aprendizado pelas Revisões
Fase 12 — Avaliação, segurança e otimização
```

## Princípio final

Não estamos construindo simplesmente um gerador de textos. Estamos construindo um sistema
capaz de transformar uma produção intelectual em **conhecimento estruturado**, depois em
**metodologia autoral**, depois em **Cérebro Autoral**, e finalmente utilizar esse Cérebro
para auxiliar na criação de **novas reflexões personalizadas**.

Ao longo de todo o projeto: **pesquise antes de supor. Valide antes de persistir. Teste
antes de publicar. Versione antes de substituir. Preserve a proveniência. Proteja a
autoria. E mantenha o Cérebro Autoral como o centro da arquitetura.**
