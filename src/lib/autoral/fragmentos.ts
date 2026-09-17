import type { NoEstrutura } from "./estrutura";

export type NoFragmento = {
  chaveTemporaria: string;
  secaoChaveTemporaria: string;
  ordem: number;
  conteudo: string;
  conteudoContextualizado: string;
  quantidadeTokens: number;
  paginaInicial: number | null;
  paginaFinal: number | null;
};

const TAMANHO_ALVO = 3200;
const TAMANHO_MINIMO_PARA_FECHAR = 800;

/** Fragmentação (etapa 07) — parágrafos agrupados até ~800 tokens, sem cortar frases ao meio quando possível. */
export function criarFragmentos(
  nos: NoEstrutura[],
  contextos: Record<string, string>
): NoFragmento[] {
  const fragmentos: NoFragmento[] = [];
  let ordemGlobal = 0;

  for (const no of nos) {
    const blocos = dividirEmBlocos(no.conteudo);
    const contexto = contextos[no.chaveTemporaria] ?? "";

    for (const bloco of blocos) {
      const chave = `frag-${ordemGlobal}`;
      fragmentos.push({
        chaveTemporaria: chave,
        secaoChaveTemporaria: no.chaveTemporaria,
        ordem: ordemGlobal++,
        conteudo: bloco,
        conteudoContextualizado: `${contexto}\n\n${bloco}`,
        quantidadeTokens: estimarTokens(bloco),
        paginaInicial: no.paginaInicial,
        paginaFinal: no.paginaFinal,
      });
    }
  }

  return fragmentos;
}

function dividirEmBlocos(conteudo: string): string[] {
  const paragrafos = conteudo
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (paragrafos.length === 0) return [];

  const blocos: string[] = [];
  let atual = "";

  for (const paragrafo of paragrafos) {
    const candidato = atual ? `${atual}\n\n${paragrafo}` : paragrafo;

    if (candidato.length <= TAMANHO_ALVO) {
      atual = candidato;
      continue;
    }

    if (atual.length >= TAMANHO_MINIMO_PARA_FECHAR) {
      blocos.push(atual);
      atual = paragrafo.length > TAMANHO_ALVO ? "" : paragrafo;
      if (paragrafo.length > TAMANHO_ALVO) {
        blocos.push(...dividirParagrafoGrande(paragrafo));
      }
      continue;
    }

    // parágrafo sozinho já excede o alvo e o bloco atual ainda é pequeno
    if (paragrafo.length > TAMANHO_ALVO) {
      if (atual) blocos.push(atual);
      blocos.push(...dividirParagrafoGrande(paragrafo));
      atual = "";
    } else {
      atual = candidato;
    }
  }

  if (atual.trim().length > 0) blocos.push(atual);
  return blocos;
}

function dividirParagrafoGrande(paragrafo: string): string[] {
  const frases = paragrafo.split(/(?<=[.!?])\s+/);
  const blocos: string[] = [];
  let atual = "";

  for (const frase of frases) {
    const candidato = atual ? `${atual} ${frase}` : frase;
    if (candidato.length > TAMANHO_ALVO && atual) {
      blocos.push(atual);
      atual = frase;
    } else {
      atual = candidato;
    }
  }
  if (atual.trim().length > 0) blocos.push(atual);
  return blocos;
}

/** Estimativa aproximada (≈4 caracteres por token em português) — não é a contagem exata do tokenizer da OpenAI. */
function estimarTokens(texto: string): number {
  return Math.max(1, Math.ceil(texto.length / 4));
}
