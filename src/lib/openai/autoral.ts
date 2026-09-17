import OpenAI from "openai";

import { TIPOS_ELEMENTO, TIPOS_RELACAO, type TipoElemento, type TipoRelacao } from "@/lib/autoral/tipos";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MODELO_TEXTO = "gpt-4o-mini";
const MODELO_EMBEDDING = "text-embedding-3-small";

export type ElementoExtraido = {
  tipo: TipoElemento;
  titulo: string;
  descricao: string;
  importancia: number;
  confianca: number;
  trechoReferencia: string;
  forcaEvidencia: number;
};

/** Etapa 08 — síntese analítica de um trecho (seção, capítulo, parte ou obra inteira). */
export async function gerarSintese(params: { contexto: string; texto: string }): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: MODELO_TEXTO,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "Você escreve uma síntese analítica objetiva (não um resumo de marketing) de um " +
          "trecho de um documento, preservando os conceitos, teses e a estrutura de " +
          "raciocínio do autor, em português do Brasil, em 3 a 8 frases. " +
          'Responda em JSON no formato exato: {"sintese": string}.',
      },
      { role: "user", content: `Contexto: ${params.contexto}\n\nTrecho:\n${params.texto}` },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("A IA não retornou síntese.");
  const parsed = JSON.parse(raw) as { sintese?: unknown };
  if (typeof parsed.sintese !== "string" || !parsed.sintese.trim()) {
    throw new Error("A IA não retornou uma síntese válida.");
  }
  return parsed.sintese.trim();
}

/** Etapa 09 — elementos intelectuais/narrativos presentes EXATAMENTE no fragmento dado. */
export async function extrairElementos(params: {
  contexto: string;
  fragmento: string;
}): Promise<ElementoExtraido[]> {
  const completion = await openai.chat.completions.create({
    model: MODELO_TEXTO,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          `Você identifica elementos intelectuais/narrativos (tipos possíveis: ${TIPOS_ELEMENTO.join(", ")}) ` +
          "presentes EXATAMENTE no fragmento de texto fornecido. Nunca invente conteúdo fora do " +
          "fragmento — se não houver nada relevante, retorne uma lista vazia. Cada elemento precisa " +
          "de um trecho_referencia copiado literalmente do fragmento. Responda em português do " +
          'Brasil, em JSON no formato exato: {"elementos": [{"tipo": string, "titulo": string, ' +
          '"descricao": string, "importancia": number (0 a 1), "confianca": number (0 a 1), ' +
          '"trecho_referencia": string, "forca_evidencia": number (0 a 1)}]} (no máximo 8 itens).',
      },
      { role: "user", content: `Contexto: ${params.contexto}\n\nFragmento:\n${params.fragmento}` },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("A IA não retornou elementos.");
  const parsed = JSON.parse(raw) as { elementos?: unknown };
  if (!Array.isArray(parsed.elementos)) return [];

  const tiposValidos = new Set<string>(TIPOS_ELEMENTO);
  return parsed.elementos
    .filter((e): e is Record<string, unknown> => typeof e === "object" && e !== null)
    .map((e) => ({
      tipo: tiposValidos.has(e.tipo as string) ? (e.tipo as TipoElemento) : "tema",
      titulo: typeof e.titulo === "string" ? e.titulo.slice(0, 500) : "",
      descricao: typeof e.descricao === "string" ? e.descricao : "",
      importancia: clamp01(e.importancia),
      confianca: clamp01(e.confianca),
      trechoReferencia: typeof e.trecho_referencia === "string" ? e.trecho_referencia.slice(0, 2000) : "",
      forcaEvidencia: clamp01(e.forca_evidencia),
    }))
    .filter((e) => e.titulo.length > 0 && e.descricao.length > 0)
    .slice(0, 8);
}

export type RelacaoProposta = {
  origemChave: string;
  tipoRelacao: TipoRelacao;
  destinoChave: string;
  confianca: number;
  justificativa: string;
};

/** Etapa 11 — relações entre elementos já extraídos de uma mesma seção. */
export async function proporRelacoesEntreElementos(
  elementos: { chave: string; tipo: string; titulo: string; descricao: string }[]
): Promise<RelacaoProposta[]> {
  if (elementos.length < 2) return [];

  const completion = await openai.chat.completions.create({
    model: MODELO_TEXTO,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          `Você identifica relações (tipos possíveis: ${TIPOS_RELACAO.join(", ")}) entre elementos ` +
          "já extraídos de um mesmo trecho. Use SOMENTE as chaves fornecidas para origem/destino. " +
          "Só proponha uma relação quando houver conexão real e explicável — não force relações. " +
          'Responda em JSON no formato exato: {"relacoes": [{"origem_chave": string, ' +
          '"tipo_relacao": string, "destino_chave": string, "confianca": number (0 a 1), ' +
          '"justificativa": string}]} (no máximo 6 itens).',
      },
      {
        role: "user",
        content: JSON.stringify(
          elementos.map((e) => ({ chave: e.chave, tipo: e.tipo, titulo: e.titulo, descricao: e.descricao }))
        ),
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) return [];
  const parsed = JSON.parse(raw) as { relacoes?: unknown };
  if (!Array.isArray(parsed.relacoes)) return [];

  const chavesValidas = new Set(elementos.map((e) => e.chave));
  const tiposValidos = new Set<string>(TIPOS_RELACAO);
  return parsed.relacoes
    .filter((r): r is Record<string, unknown> => typeof r === "object" && r !== null)
    .map((r) => ({
      origemChave: typeof r.origem_chave === "string" ? r.origem_chave : "",
      tipoRelacao: tiposValidos.has(r.tipo_relacao as string) ? (r.tipo_relacao as TipoRelacao) : "associa_se_a",
      destinoChave: typeof r.destino_chave === "string" ? r.destino_chave : "",
      confianca: clamp01(r.confianca),
      justificativa: typeof r.justificativa === "string" ? r.justificativa.slice(0, 1000) : "",
    }))
    .filter(
      (r) =>
        chavesValidas.has(r.origemChave) && chavesValidas.has(r.destinoChave) && r.origemChave !== r.destinoChave
    )
    .slice(0, 6);
}

/** Etapa 14 — leitura local (só desta obra) de padrões metodológicos, sem tocar no Cérebro Autoral (Fase 7). */
export async function realizarAnaliseAutoralLocal(params: {
  titulo: string;
  amostraTexto: string;
}): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: MODELO_TEXTO,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "Você observa, apenas dentro deste documento, como o autor pensa e escreve: como " +
          "costuma abrir um raciocínio, como desenvolve tensões, como argumenta, como conclui, " +
          "traços de estilo. Isto é uma leitura LOCAL (só desta obra) — não é ainda o Cérebro " +
          "Autoral consolidado (que cruza várias obras). Não generalize além do que está no " +
          "texto. Escreva em português do Brasil, 4 a 10 frases, tom analítico. " +
          'Responda em JSON no formato exato: {"analise": string}.',
      },
      { role: "user", content: `Título: ${params.titulo}\n\nAmostra do texto:\n${params.amostraTexto}` },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("A IA não retornou análise autoral local.");
  const parsed = JSON.parse(raw) as { analise?: unknown };
  if (typeof parsed.analise !== "string" || !parsed.analise.trim()) {
    throw new Error("A IA não retornou uma análise autoral local válida.");
  }
  return parsed.analise.trim();
}

/** Etapa 12 — embedding padronizado em 1536 dimensões (text-embedding-3-small). Formato pronto para ::vector. */
export async function gerarEmbedding(texto: string): Promise<string> {
  const resposta = await openai.embeddings.create({
    model: MODELO_EMBEDDING,
    input: texto.slice(0, 30000),
  });
  const vetor = resposta.data[0]?.embedding;
  if (!vetor || vetor.length !== 1536) {
    throw new Error("A IA não retornou um embedding de 1536 dimensões.");
  }
  return `[${vetor.join(",")}]`;
}

function clamp01(valor: unknown): number {
  const n = typeof valor === "number" ? valor : Number(valor);
  if (!Number.isFinite(n)) return 0.5;
  return Math.min(1, Math.max(0, n));
}
