import type { PaginaTexto } from "./extrair-conteudo";

export type NoEstrutura = {
  chaveTemporaria: string;
  paiChaveTemporaria: string | null;
  tipo: "parte" | "capitulo" | "secao";
  titulo: string | null;
  ordem: number;
  nivelHierarquico: number;
  conteudo: string;
  paginaInicial: number | null;
  paginaFinal: number | null;
};

type OffsetPagina = { offset: number; pagina: number };
type LinhaComOffset = { texto: string; offset: number };
type TituloDetectado = { offset: number; tipo: "parte" | "capitulo" | "secao"; titulo: string };

const RE_MARKDOWN = /^(#{1,3})\s+(.+)$/;
const RE_PARTE = /^parte\s+([ivxlcdm]+|\d+)\b[:\-.\s]*(.*)$/i;
const RE_CAPITULO = /^cap[íi]tulo\s+([ivxlcdm]+|\d+)\b[:\-.\s]*(.*)$/i;
const RE_SECAO_NUM = /^se[çc][ãa]o\s+([ivxlcdm]+|\d+)\b[:\-.\s]*(.*)$/i;

/**
 * Identificação de estrutura (etapa 05) + construção de hierarquia
 * (etapa 06). Heurística por enquanto — reconhece marcações markdown,
 * "Parte N" / "Capítulo N" / "Seção N" e linhas curtas em CAIXA ALTA
 * isoladas por linhas em branco. Sem título nenhum detectado, a obra
 * inteira vira uma única seção (nunca falha por falta de estrutura).
 */
export function identificarEstruturaEHierarquia(
  textoNormalizado: string,
  paginas: PaginaTexto[] | null
): NoEstrutura[] {
  const { texto, mapa } = construirTextoComMapaDePaginas(paginas, textoNormalizado);
  const linhas = linhasComOffset(texto);
  const titulos = detectarTitulos(linhas);

  if (titulos.length === 0) {
    return [
      {
        chaveTemporaria: "sec-0",
        paiChaveTemporaria: null,
        tipo: "secao",
        titulo: null,
        ordem: 0,
        nivelHierarquico: 1,
        conteudo: texto.trim(),
        paginaInicial: mapa.length ? mapa[0].pagina : null,
        paginaFinal: mapa.length ? mapa[mapa.length - 1].pagina : null,
      },
    ];
  }

  const nos: NoEstrutura[] = [];
  let ordem = 0;
  let parteAtual: string | null = null;
  let capituloAtual: string | null = null;

  const inicio = texto.slice(0, titulos[0].offset).trim();
  if (inicio.length > 0) {
    nos.push({
      chaveTemporaria: `sec-${ordem}`,
      paiChaveTemporaria: null,
      tipo: "secao",
      titulo: null,
      ordem: ordem++,
      nivelHierarquico: 1,
      conteudo: inicio,
      paginaInicial: paginaNoOffset(mapa, 0),
      paginaFinal: paginaNoOffset(mapa, titulos[0].offset),
    });
  }

  for (let i = 0; i < titulos.length; i++) {
    const atual = titulos[i];
    const fimOffset = i + 1 < titulos.length ? titulos[i + 1].offset : texto.length;
    const conteudo = texto.slice(atual.offset, fimOffset).trim();
    const chave = `sec-${ordem}`;

    let pai: string | null = null;
    let nivel = 1;
    if (atual.tipo === "parte") {
      pai = null;
      nivel = 1;
      parteAtual = chave;
      capituloAtual = null;
    } else if (atual.tipo === "capitulo") {
      pai = parteAtual;
      nivel = parteAtual ? 2 : 1;
      capituloAtual = chave;
    } else {
      pai = capituloAtual ?? parteAtual;
      nivel = pai ? (capituloAtual ? 3 : 2) : 1;
    }

    nos.push({
      chaveTemporaria: chave,
      paiChaveTemporaria: pai,
      tipo: atual.tipo,
      titulo: atual.titulo || null,
      ordem: ordem++,
      nivelHierarquico: nivel,
      conteudo,
      paginaInicial: paginaNoOffset(mapa, atual.offset),
      paginaFinal: paginaNoOffset(mapa, fimOffset),
    });
  }

  return nos;
}

/** Trilha "Obra > Parte > Capítulo > Seção" usada no conteúdo contextualizado dos fragmentos. */
export function construirContextos(nos: NoEstrutura[], tituloObra: string): Record<string, string> {
  const porChave = new Map(nos.map((n) => [n.chaveTemporaria, n]));
  const contextos: Record<string, string> = {};

  function trilha(no: NoEstrutura): string {
    const partes: string[] = [tituloObra];
    const cadeia: NoEstrutura[] = [];
    let atual: NoEstrutura | undefined = no;
    while (atual) {
      cadeia.unshift(atual);
      atual = atual.paiChaveTemporaria ? porChave.get(atual.paiChaveTemporaria) : undefined;
    }
    for (const n of cadeia) {
      if (n.titulo) partes.push(n.titulo);
    }
    return partes.join(" > ");
  }

  for (const no of nos) {
    contextos[no.chaveTemporaria] = trilha(no);
  }
  return contextos;
}

function construirTextoComMapaDePaginas(paginas: PaginaTexto[] | null, textoSemPaginas: string) {
  if (!paginas || paginas.length === 0) {
    return { texto: textoSemPaginas, mapa: [] as OffsetPagina[] };
  }
  let texto = "";
  const mapa: OffsetPagina[] = [];
  for (const p of paginas) {
    mapa.push({ offset: texto.length, pagina: p.numero });
    texto += p.texto + "\n\n";
  }
  return { texto, mapa };
}

function paginaNoOffset(mapa: OffsetPagina[], offset: number): number | null {
  if (mapa.length === 0) return null;
  let pagina = mapa[0].pagina;
  for (const item of mapa) {
    if (item.offset > offset) break;
    pagina = item.pagina;
  }
  return pagina;
}

function linhasComOffset(texto: string): LinhaComOffset[] {
  const linhas: LinhaComOffset[] = [];
  let offset = 0;
  for (const linha of texto.split("\n")) {
    linhas.push({ texto: linha, offset });
    offset += linha.length + 1;
  }
  return linhas;
}

function pareceTituloCaixaAlta(linha: string): boolean {
  const t = linha.trim();
  if (t.length < 3 || t.length > 80) return false;
  if (!/[A-ZÀ-Ú]/.test(t)) return false;
  if (/[a-zà-ú]/.test(t)) return false;
  if (/\d{4}/.test(t)) return false;
  return true;
}

function detectarTitulos(linhas: LinhaComOffset[]): TituloDetectado[] {
  const titulos: TituloDetectado[] = [];
  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i].texto.trim();
    if (!linha) continue;

    const md = linha.match(RE_MARKDOWN);
    if (md) {
      titulos.push({
        offset: linhas[i].offset,
        tipo: md[1].length === 1 ? "capitulo" : "secao",
        titulo: md[2].trim(),
      });
      continue;
    }

    if (RE_PARTE.test(linha)) {
      titulos.push({ offset: linhas[i].offset, tipo: "parte", titulo: linha });
      continue;
    }

    if (RE_CAPITULO.test(linha)) {
      titulos.push({ offset: linhas[i].offset, tipo: "capitulo", titulo: linha });
      continue;
    }

    if (RE_SECAO_NUM.test(linha)) {
      titulos.push({ offset: linhas[i].offset, tipo: "secao", titulo: linha });
      continue;
    }

    const anterior = linhas[i - 1]?.texto.trim() ?? "";
    const seguinte = linhas[i + 1]?.texto.trim() ?? "";
    if (!anterior && !seguinte && pareceTituloCaixaAlta(linha)) {
      titulos.push({ offset: linhas[i].offset, tipo: "capitulo", titulo: linha });
    }
  }
  return titulos;
}
