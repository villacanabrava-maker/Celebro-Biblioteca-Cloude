import type { SupabaseClient } from "@supabase/supabase-js";

import { extrairConteudoCompleto, normalizarConteudo } from "./extrair-conteudo";
import { construirContextos, identificarEstruturaEHierarquia, type NoEstrutura } from "./estrutura";
import { criarFragmentos, type NoFragmento } from "./fragmentos";
import {
  extrairElementos,
  gerarEmbedding,
  gerarSintese,
  proporRelacoesEntreElementos,
  realizarAnaliseAutoralLocal,
} from "@/lib/openai/autoral";
import { dominioParaTipoElemento, NOMES_ETAPAS, type FormatoSuportado, type NomeEtapa } from "./tipos";

export type ParametrosPipeline = {
  supabase: SupabaseClient;
  execucaoId: string;
  caminhoArquivo: string;
  extensao: FormatoSuportado;
  tituloObra: string;
};

const ORDEM_ETAPA: Record<NomeEtapa, number> = Object.fromEntries(
  NOMES_ETAPAS.map((nome, i) => [nome, i + 1])
) as Record<NomeEtapa, number>;

const TAMANHO_LOTE_IA = 4;

/**
 * processar_obra() — orquestra as 16 primeiras etapas (as etapas 17 e 18,
 * avaliar_participacao_cerebro/atualizar_cerebro, dependem do schema
 * cerebro_autoral, ainda não construído — Fase 7 — e por isso ficam de
 * fora por enquanto). Cada etapa é resumível: se a função for chamada de
 * novo para a mesma execução (por exemplo depois de uma falha), itens já
 * persistidos no banco não são recriados.
 */
export async function processarObra(params: ParametrosPipeline): Promise<void> {
  const { supabase, execucaoId } = params;

  try {
    await atualizarExecucao(supabase, execucaoId, "validando", "validar_arquivo", 2);
    const arquivo = await etapa(supabase, execucaoId, "validar_arquivo", async () => {
      const { data, error } = await supabase.storage.from("originais-biblioteca").download(params.caminhoArquivo);
      if (error || !data) throw new Error("Não foi possível ler o arquivo enviado.");
      const buffer = Buffer.from(await data.arrayBuffer());
      if (buffer.length === 0) throw new Error("O arquivo enviado está vazio.");
      return buffer;
    });

    await etapa(supabase, execucaoId, "identificar_formato", async () => params.extensao);

    await atualizarExecucao(supabase, execucaoId, "extraindo", "extrair_conteudo", 20);
    const extraido = await etapa(supabase, execucaoId, "extrair_conteudo", () =>
      extrairConteudoCompleto(arquivo, params.extensao)
    );
    if (!extraido.texto || extraido.texto.trim().length < 20) {
      throw new Error("Não foi possível extrair texto deste arquivo.");
    }

    await atualizarExecucao(supabase, execucaoId, "normalizando", "normalizar_conteudo", 25);
    const textoNormalizado = await etapa(supabase, execucaoId, "normalizar_conteudo", async () =>
      normalizarConteudo(extraido.texto)
    );

    await atualizarExecucao(supabase, execucaoId, "estruturando", "identificar_estrutura", 30);
    const nos = await etapa(supabase, execucaoId, "identificar_estrutura", async () =>
      identificarEstruturaEHierarquia(textoNormalizado, extraido.paginas)
    );
    const contextos = construirContextos(nos, params.tituloObra);

    const { documentoProcessadoId } = await obterOuCriarDocumentoProcessado(supabase, execucaoId, params.tituloObra);

    await atualizarExecucao(supabase, execucaoId, "estruturando", "construir_hierarquia", 35);
    const mapaSecoes = await etapa(supabase, execucaoId, "construir_hierarquia", () =>
      construirHierarquia(supabase, documentoProcessadoId, nos)
    );

    await atualizarExecucao(supabase, execucaoId, "segmentando", "criar_fragmentos", 45);
    const fragmentos = criarFragmentos(nos, contextos);
    const mapaFragmentos = await etapa(supabase, execucaoId, "criar_fragmentos", () =>
      persistirFragmentos(supabase, documentoProcessadoId, fragmentos, mapaSecoes)
    );

    await atualizarExecucao(supabase, execucaoId, "sintetizando", "criar_sinteses", 55);
    await etapa(supabase, execucaoId, "criar_sinteses", () =>
      criarSinteses(supabase, documentoProcessadoId, nos, mapaSecoes, params.tituloObra)
    );

    await atualizarExecucao(supabase, execucaoId, "analisando", "extrair_elementos", 65);
    const elementosPorSecao = await etapa(supabase, execucaoId, "extrair_elementos", () =>
      extrairElementosDosFragmentos(supabase, documentoProcessadoId, fragmentos, mapaFragmentos, contextos)
    );

    await atualizarExecucao(supabase, execucaoId, "classificando", "normalizar_taxonomia", 72);
    await etapa(supabase, execucaoId, "normalizar_taxonomia", () =>
      normalizarTaxonomiaDosElementos(supabase, elementosPorSecao)
    );

    await atualizarExecucao(supabase, execucaoId, "relacionando", "criar_relacoes", 78);
    await etapa(supabase, execucaoId, "criar_relacoes", () => criarRelacoes(supabase, elementosPorSecao));

    await atualizarExecucao(supabase, execucaoId, "vetorizando", "gerar_embeddings", 88);
    await etapa(supabase, execucaoId, "gerar_embeddings", () =>
      gerarEmbeddingsDoDocumento(supabase, fragmentos, mapaFragmentos)
    );

    await etapa(supabase, execucaoId, "criar_indices", async () => {
      // Índices (GIN de texto + HNSW de embedding) já existem na definição das
      // tabelas — aqui fica só o registro de que a etapa foi conferida.
      return true;
    });

    await atualizarExecucao(supabase, execucaoId, "analisando", "realizar_analise_autoral_local", 93);
    await etapa(supabase, execucaoId, "realizar_analise_autoral_local", () =>
      finalizarConteudoDocumento(supabase, documentoProcessadoId, params.tituloObra, nos)
    );

    await atualizarExecucao(supabase, execucaoId, "validando_resultado", "validar_processamento", 97);
    await etapa(supabase, execucaoId, "validar_processamento", () =>
      validarProcessamento(supabase, documentoProcessadoId)
    );

    await atualizarExecucao(supabase, execucaoId, "finalizando", "publicar_documento_processado", 99);
    await etapa(supabase, execucaoId, "publicar_documento_processado", async () => {
      const { error } = await supabase.rpc("autoral_publicar_documento_processado", {
        p_documento_processado_id: documentoProcessadoId,
      });
      if (error) throw new Error(error.message);
      return true;
    });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : "Falha desconhecida no processamento.";
    await supabase.rpc("autoral_marcar_execucao_falha", {
      p_execucao_id: execucaoId,
      p_codigo_erro: "erro_pipeline",
      p_mensagem_erro: mensagem.slice(0, 2000),
    });
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Infraestrutura de etapas (idempotência/resume via processamento.etapas_execucao)
// ---------------------------------------------------------------------------

async function etapa<T>(
  supabase: SupabaseClient,
  execucaoId: string,
  nome: NomeEtapa,
  executar: () => Promise<T>
): Promise<T> {
  const inicioMs = Date.now();
  const { data, error } = await supabase
    .rpc("autoral_iniciar_etapa", { p_execucao_id: execucaoId, p_nome_etapa: nome, p_ordem: ORDEM_ETAPA[nome] })
    .single();
  if (error) throw new Error(`Não foi possível iniciar a etapa ${nome}: ${error.message}`);

  const { etapa_id: etapaId } = data as { etapa_id: string; ja_concluida: boolean };

  try {
    const resultado = await executar();
    await supabase.rpc("autoral_concluir_etapa", {
      p_etapa_id: etapaId,
      p_estado: "concluida",
      p_duracao_ms: Date.now() - inicioMs,
    });
    return resultado;
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : "Falha desconhecida.";
    await supabase.rpc("autoral_concluir_etapa", {
      p_etapa_id: etapaId,
      p_estado: "falhou",
      p_duracao_ms: Date.now() - inicioMs,
      p_detalhes: { erro: mensagem.slice(0, 500) },
    });
    throw err;
  }
}

async function atualizarExecucao(
  supabase: SupabaseClient,
  execucaoId: string,
  estado: string,
  etapaAtual: string,
  percentual: number
) {
  await supabase.rpc("autoral_atualizar_execucao", {
    p_execucao_id: execucaoId,
    p_estado: estado,
    p_etapa_atual: etapaAtual,
    p_percentual: percentual,
  });
}

async function obterOuCriarDocumentoProcessado(supabase: SupabaseClient, execucaoId: string, titulo: string) {
  const { data, error } = await supabase
    .rpc("autoral_obter_ou_criar_documento_processado", { p_execucao_id: execucaoId, p_titulo: titulo })
    .single();
  if (error) throw new Error(`Não foi possível preparar o documento processado: ${error.message}`);
  const linha = data as { documento_processado_id: string };
  return { documentoProcessadoId: linha.documento_processado_id };
}

// ---------------------------------------------------------------------------
// Persistência por etapa, com verificação do que já existe (resume seguro)
// ---------------------------------------------------------------------------

async function construirHierarquia(
  supabase: SupabaseClient,
  documentoProcessadoId: string,
  nos: NoEstrutura[]
): Promise<Map<string, string>> {
  const { data: existentes, error } = await supabase
    .from("v_autoral_secoes")
    .select("id, ordem")
    .eq("documento_processado_id", documentoProcessadoId);
  if (error) throw new Error(`Não foi possível ler seções existentes: ${error.message}`);

  const porOrdem = new Map<number, string>((existentes ?? []).map((s: { id: string; ordem: number }) => [s.ordem, s.id]));
  const mapa = new Map<string, string>();

  // primeira passada: cria/recupera todos os nós de nível mais raso primeiro,
  // para que os filhos já encontrem o id real do pai.
  const ordenados = [...nos].sort((a, b) => a.nivelHierarquico - b.nivelHierarquico || a.ordem - b.ordem);

  for (const no of ordenados) {
    const existenteId = porOrdem.get(no.ordem);
    if (existenteId) {
      mapa.set(no.chaveTemporaria, existenteId);
      continue;
    }
    const paiId = no.paiChaveTemporaria ? mapa.get(no.paiChaveTemporaria) ?? null : null;
    const { data, error: erroInsert } = await supabase
      .rpc("autoral_criar_secao", {
        p_documento_processado_id: documentoProcessadoId,
        p_secao_pai_id: paiId,
        p_tipo: no.tipo,
        p_titulo: no.titulo,
        p_ordem: no.ordem,
        p_nivel_hierarquico: no.nivelHierarquico,
        p_pagina_inicial: no.paginaInicial,
        p_pagina_final: no.paginaFinal,
        p_conteudo: no.tipo === "secao" ? no.conteudo : null,
      })
      .single();
    if (erroInsert) throw new Error(`Não foi possível criar a seção "${no.titulo ?? no.tipo}": ${erroInsert.message}`);
    mapa.set(no.chaveTemporaria, data as string);
  }

  return mapa;
}

async function persistirFragmentos(
  supabase: SupabaseClient,
  documentoProcessadoId: string,
  fragmentos: NoFragmento[],
  mapaSecoes: Map<string, string>
): Promise<Map<string, string>> {
  const { data: existentes, error } = await supabase
    .from("v_autoral_fragmentos")
    .select("id, ordem")
    .eq("documento_processado_id", documentoProcessadoId);
  if (error) throw new Error(`Não foi possível ler fragmentos existentes: ${error.message}`);

  const porOrdem = new Map<number, string>((existentes ?? []).map((f: { id: string; ordem: number }) => [f.ordem, f.id]));
  const mapa = new Map<string, string>();
  let criouAlgum = false;

  for (const frag of fragmentos) {
    const existenteId = porOrdem.get(frag.ordem);
    if (existenteId) {
      mapa.set(frag.chaveTemporaria, existenteId);
      continue;
    }
    const secaoId = mapaSecoes.get(frag.secaoChaveTemporaria) ?? null;
    const { data, error: erroInsert } = await supabase
      .rpc("autoral_criar_fragmento", {
        p_documento_processado_id: documentoProcessadoId,
        p_secao_id: secaoId,
        p_ordem: frag.ordem,
        p_pagina_inicial: frag.paginaInicial,
        p_pagina_final: frag.paginaFinal,
        p_conteudo: frag.conteudo,
        p_conteudo_contextualizado: frag.conteudoContextualizado,
        p_quantidade_tokens: frag.quantidadeTokens,
      })
      .single();
    if (erroInsert) throw new Error(`Não foi possível criar um fragmento: ${erroInsert.message}`);
    mapa.set(frag.chaveTemporaria, data as string);
    criouAlgum = true;
  }

  if (criouAlgum) {
    const { error: erroEncadear } = await supabase.rpc("autoral_encadear_fragmentos", {
      p_documento_processado_id: documentoProcessadoId,
    });
    if (erroEncadear) throw new Error(`Não foi possível encadear os fragmentos: ${erroEncadear.message}`);
  }

  return mapa;
}

async function criarSinteses(
  supabase: SupabaseClient,
  documentoProcessadoId: string,
  nos: NoEstrutura[],
  mapaSecoes: Map<string, string>,
  tituloObra: string
): Promise<string | null> {
  const { data: existentes, error } = await supabase
    .from("v_autoral_sinteses")
    .select("id, tipo_alvo, alvo_id, conteudo")
    .eq("documento_processado_id", documentoProcessadoId);
  if (error) throw new Error(`Não foi possível ler sínteses existentes: ${error.message}`);

  const porAlvo = new Map<string, { id: string; conteudo: string }>(
    (existentes ?? []).map((s: { id: string; alvo_id: string; conteudo: string }) => [s.alvo_id, { id: s.id, conteudo: s.conteudo }])
  );

  const textosPorSecao: string[] = [];

  await executarEmLotes(nos, TAMANHO_LOTE_IA, async (no) => {
    const secaoId = mapaSecoes.get(no.chaveTemporaria);
    if (!secaoId || !no.conteudo.trim()) return;

    const existente = porAlvo.get(secaoId);
    if (existente) {
      textosPorSecao.push(existente.conteudo);
      return;
    }

    const conteudo = await gerarSintese({
      contexto: `${tituloObra}${no.titulo ? ` > ${no.titulo}` : ""}`,
      texto: no.conteudo.slice(0, 12000),
    });

    const { error: erroInsert } = await supabase.rpc("autoral_criar_sintese", {
      p_documento_processado_id: documentoProcessadoId,
      p_tipo_alvo: no.tipo,
      p_alvo_id: secaoId,
      p_nivel: no.nivelHierarquico,
      p_conteudo: conteudo,
      p_modelo_apelido: "MODELO_IA_ANALISE",
      p_prompt_codigo: "sintese_documental",
    });
    if (erroInsert) throw new Error(`Não foi possível salvar uma síntese: ${erroInsert.message}`);
    textosPorSecao.push(conteudo);
  });

  if (textosPorSecao.length === 0) return null;

  const { data: obraExistente } = await supabase
    .from("v_autoral_documentos_processados")
    .select("obra_id")
    .eq("id", documentoProcessadoId)
    .single();
  const obraId = (obraExistente as { obra_id: string } | null)?.obra_id;
  if (!obraId) return null;

  const { data: sinteseObraExistente } = await supabase
    .from("v_autoral_sinteses")
    .select("id")
    .eq("documento_processado_id", documentoProcessadoId)
    .eq("tipo_alvo", "obra")
    .maybeSingle();
  if (sinteseObraExistente) return (sinteseObraExistente as { id: string }).id;

  const sinteseGlobal = await gerarSintese({
    contexto: tituloObra,
    texto: textosPorSecao.join("\n\n").slice(0, 15000),
  });

  const { data: novaSintese, error: erroObra } = await supabase
    .rpc("autoral_criar_sintese", {
      p_documento_processado_id: documentoProcessadoId,
      p_tipo_alvo: "obra",
      p_alvo_id: obraId,
      p_nivel: 0,
      p_conteudo: sinteseGlobal,
      p_modelo_apelido: "MODELO_IA_ANALISE",
      p_prompt_codigo: "sintese_documental",
    })
    .single();
  if (erroObra) throw new Error(`Não foi possível salvar a síntese da obra: ${erroObra.message}`);
  return novaSintese as string;
}

type ElementoContexto = { chave: string; id: string; tipo: string; titulo: string; descricao: string; confianca: number };

async function extrairElementosDosFragmentos(
  supabase: SupabaseClient,
  documentoProcessadoId: string,
  fragmentos: NoFragmento[],
  mapaFragmentos: Map<string, string>,
  contextos: Record<string, string>
): Promise<Map<string, ElementoContexto[]>> {
  const { data: evidenciasExistentes, error } = await supabase
    .from("v_autoral_evidencias")
    .select("fragmento_id, elemento_id")
    .in("fragmento_id", Array.from(mapaFragmentos.values()));
  if (error) throw new Error(`Não foi possível conferir elementos já extraídos: ${error.message}`);

  const fragmentosJaProcessados = new Set<string>((evidenciasExistentes ?? []).map((e: { fragmento_id: string }) => e.fragmento_id));
  const elementoIdsExistentes = Array.from(
    new Set((evidenciasExistentes ?? []).map((e: { elemento_id: string }) => e.elemento_id))
  );

  const elementosPorSecao = new Map<string, ElementoContexto[]>();

  if (elementoIdsExistentes.length > 0) {
    const { data: elementosExistentes } = await supabase
      .from("v_autoral_elementos")
      .select("id, tipo, titulo, descricao, confianca")
      .in("id", elementoIdsExistentes);
    const { data: evidenciasComFragmento } = await supabase
      .from("v_autoral_evidencias")
      .select("elemento_id, fragmento_id")
      .in("elemento_id", elementoIdsExistentes);

    const fragmentoPorElemento = new Map<string, string>(
      (evidenciasComFragmento ?? []).map((e: { elemento_id: string; fragmento_id: string }) => [e.elemento_id, e.fragmento_id])
    );
    const secaoChavePorFragmentoId = new Map(
      fragmentos.map((f) => [mapaFragmentos.get(f.chaveTemporaria), f.secaoChaveTemporaria])
    );

    for (const el of (elementosExistentes ?? []) as { id: string; tipo: string; titulo: string; descricao: string; confianca: number }[]) {
      const fragmentoId = fragmentoPorElemento.get(el.id);
      const secaoChave = fragmentoId ? secaoChavePorFragmentoId.get(fragmentoId) : undefined;
      if (!secaoChave) continue;
      const lista = elementosPorSecao.get(secaoChave) ?? [];
      lista.push({ chave: `existente-${el.id}`, id: el.id, tipo: el.tipo, titulo: el.titulo, descricao: el.descricao, confianca: el.confianca });
      elementosPorSecao.set(secaoChave, lista);
    }
  }

  await executarEmLotes(fragmentos, TAMANHO_LOTE_IA, async (frag) => {
    const fragmentoId = mapaFragmentos.get(frag.chaveTemporaria);
    if (!fragmentoId || fragmentosJaProcessados.has(fragmentoId)) return;

    const extraidos = await extrairElementos({
      contexto: contextos[frag.secaoChaveTemporaria] ?? "",
      fragmento: frag.conteudo,
    });

    for (const el of extraidos) {
      const { data: elementoId, error: erroElemento } = await supabase
        .rpc("autoral_criar_elemento", {
          p_documento_processado_id: documentoProcessadoId,
          p_tipo: el.tipo,
          p_titulo: el.titulo,
          p_descricao: el.descricao,
          p_importancia: el.importancia,
          p_confianca: el.confianca,
          p_modelo_apelido: "MODELO_IA_EXTRACAO",
          p_prompt_codigo: "extracao_elementos",
        })
        .single();
      if (erroElemento) throw new Error(`Não foi possível salvar um elemento: ${erroElemento.message}`);

      const { error: erroEvidencia } = await supabase.rpc("autoral_criar_evidencia", {
        p_elemento_id: elementoId,
        p_fragmento_id: fragmentoId,
        p_pagina_inicial: frag.paginaInicial,
        p_pagina_final: frag.paginaFinal,
        p_trecho_referencia: el.trechoReferencia,
        p_forca_evidencia: el.forcaEvidencia,
        p_justificativa: null,
      });
      if (erroEvidencia) throw new Error(`Não foi possível salvar a evidência de um elemento: ${erroEvidencia.message}`);

      const lista = elementosPorSecao.get(frag.secaoChaveTemporaria) ?? [];
      lista.push({
        chave: elementoId as string,
        id: elementoId as string,
        tipo: el.tipo,
        titulo: el.titulo,
        descricao: el.descricao,
        confianca: el.confianca,
      });
      elementosPorSecao.set(frag.secaoChaveTemporaria, lista);
    }
  });

  return elementosPorSecao;
}

async function normalizarTaxonomiaDosElementos(supabase: SupabaseClient, elementosPorSecao: Map<string, ElementoContexto[]>) {
  const { data: jaClassificados } = await supabase.from("v_autoral_classificacoes_elementos").select("elemento_id");
  const jaClassificadosSet = new Set<string>(((jaClassificados ?? []) as { elemento_id: string }[]).map((c) => c.elemento_id));

  const todos = Array.from(elementosPorSecao.values()).flat();
  await executarEmLotes(todos, TAMANHO_LOTE_IA, async (el) => {
    if (jaClassificadosSet.has(el.id)) return;

    const { data: normalizado, error: erroNormalizar } = await supabase
      .rpc("autoral_normalizar_conceito", {
        p_termo: el.titulo,
        p_dominio: dominioParaTipoElemento(el.tipo as Parameters<typeof dominioParaTipoElemento>[0]),
        p_definicao: el.descricao,
      })
      .single();
    if (erroNormalizar) throw new Error(`Não foi possível normalizar um conceito: ${erroNormalizar.message}`);

    const { conceito_id: conceitoId } = normalizado as { conceito_id: string; criado: boolean };
    const { error: erroClassificar } = await supabase.rpc("autoral_classificar_elemento", {
      p_elemento_id: el.id,
      p_conceito_id: conceitoId,
      p_papel: "principal",
      p_confianca: el.confianca,
    });
    if (erroClassificar) throw new Error(`Não foi possível classificar um elemento na taxonomia: ${erroClassificar.message}`);
  });
}

async function criarRelacoes(supabase: SupabaseClient, elementosPorSecao: Map<string, ElementoContexto[]>) {
  const { data: relacoesExistentes } = await supabase.from("v_autoral_relacoes_elementos").select("elemento_origem_id");
  const origensComRelacao = new Set<string>(((relacoesExistentes ?? []) as { elemento_origem_id: string }[]).map((r) => r.elemento_origem_id));

  const grupos = Array.from(elementosPorSecao.values()).filter((g) => g.length >= 2);
  await executarEmLotes(grupos, TAMANHO_LOTE_IA, async (grupo) => {
    if (grupo.some((e) => origensComRelacao.has(e.id))) return;

    const propostas = await proporRelacoesEntreElementos(
      grupo.map((e) => ({ chave: e.id, tipo: e.tipo, titulo: e.titulo, descricao: e.descricao }))
    );

    for (const proposta of propostas) {
      const { error } = await supabase.rpc("autoral_criar_relacao_elementos", {
        p_elemento_origem_id: proposta.origemChave,
        p_tipo_relacao: proposta.tipoRelacao,
        p_elemento_destino_id: proposta.destinoChave,
        p_confianca: proposta.confianca,
        p_justificativa: proposta.justificativa || null,
      });
      if (error) throw new Error(`Não foi possível salvar uma relação entre elementos: ${error.message}`);
    }
  });
}

async function gerarEmbeddingsDoDocumento(
  supabase: SupabaseClient,
  fragmentos: NoFragmento[],
  mapaFragmentos: Map<string, string>
) {
  // processamento.vetores não tem view própria nem índice único por alvo, então
  // esta etapa não é resumível item a item como as outras (simplificação desta
  // fase — ver docs/DECISOES.md): se falhar no meio, o reprocessamento desta
  // etapa específica pode gerar embeddings duplicados para quem já tinha. O
  // impacto é só custo de IA repetido, nunca dado incorreto (RLS/usuario_id
  // continuam corretos, e a busca por embeddings mais recentes é o que a
  // Fase 6 vai usar).
  const fragmentoIds = Array.from(mapaFragmentos.values());
  const { data: sinteses } = await supabase.from("v_autoral_sinteses").select("id");
  const alvosSintese = ((sinteses ?? []) as { id: string }[]).map((s) => s.id);

  await executarEmLotes(fragmentos, TAMANHO_LOTE_IA, async (frag) => {
    const fragmentoId = mapaFragmentos.get(frag.chaveTemporaria);
    if (!fragmentoId || !fragmentoIds.includes(fragmentoId)) return;
    const embedding = await gerarEmbedding(frag.conteudoContextualizado);
    const { error } = await supabase.rpc("autoral_criar_vetor", {
      p_tipo_alvo: "fragmento",
      p_alvo_id: fragmentoId,
      p_embedding: embedding,
      p_modelo_apelido: "MODELO_IA_EMBEDDING",
    });
    if (error) throw new Error(`Não foi possível salvar o embedding de um fragmento: ${error.message}`);
  });

  await executarEmLotes(alvosSintese, TAMANHO_LOTE_IA, async (sinteseId) => {
    const { data: sinteseRow } = await supabase.from("v_autoral_sinteses").select("conteudo").eq("id", sinteseId).single();
    const conteudo = (sinteseRow as { conteudo: string } | null)?.conteudo;
    if (!conteudo) return;
    const embedding = await gerarEmbedding(conteudo);
    const { error } = await supabase.rpc("autoral_criar_vetor", {
      p_tipo_alvo: "sintese",
      p_alvo_id: sinteseId,
      p_embedding: embedding,
      p_modelo_apelido: "MODELO_IA_EMBEDDING",
    });
    if (error) throw new Error(`Não foi possível salvar o embedding de uma síntese: ${error.message}`);
  });
}

async function finalizarConteudoDocumento(
  supabase: SupabaseClient,
  documentoProcessadoId: string,
  tituloObra: string,
  nos: NoEstrutura[]
) {
  const { data: sinteseObra } = await supabase
    .from("v_autoral_sinteses")
    .select("conteudo")
    .eq("documento_processado_id", documentoProcessadoId)
    .eq("tipo_alvo", "obra")
    .maybeSingle();
  const resumoGlobal = (sinteseObra as { conteudo: string } | null)?.conteudo ?? null;

  const amostra = nos
    .filter((n) => n.conteudo.trim().length > 0)
    .slice(0, 6)
    .map((n) => n.conteudo)
    .join("\n\n")
    .slice(0, 10000);

  const analiseLocal = await realizarAnaliseAutoralLocal({ titulo: tituloObra, amostraTexto: amostra || tituloObra });

  const { error } = await supabase.rpc("autoral_finalizar_documento_processado", {
    p_documento_processado_id: documentoProcessadoId,
    p_resumo_global: resumoGlobal,
    p_sintese_analitica: analiseLocal,
  });
  if (error) throw new Error(`Não foi possível finalizar o documento processado: ${error.message}`);
}

async function validarProcessamento(supabase: SupabaseClient, documentoProcessadoId: string) {
  const { data, error } = await supabase
    .from("v_autoral_documentos_processados")
    .select("quantidade_secoes, quantidade_fragmentos")
    .eq("id", documentoProcessadoId)
    .single();
  if (error || !data) throw new Error("Não foi possível validar o processamento.");
  const linha = data as { quantidade_secoes: number; quantidade_fragmentos: number };
  if (linha.quantidade_secoes < 1 || linha.quantidade_fragmentos < 1) {
    throw new Error("O processamento terminou sem seções ou fragmentos — resultado inválido.");
  }
}

async function executarEmLotes<T>(itens: T[], tamanho: number, fn: (item: T) => Promise<void>): Promise<void> {
  for (let i = 0; i < itens.length; i += tamanho) {
    const lote = itens.slice(i, i + tamanho);
    await Promise.all(lote.map((item) => fn(item)));
  }
}
