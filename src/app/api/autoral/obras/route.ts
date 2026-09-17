import { NextResponse, after } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { processarObra } from "@/lib/autoral/pipeline";
import { FORMATOS_SUPORTADOS, type FormatoSuportado } from "@/lib/autoral/tipos";

export const runtime = "nodejs";
export const maxDuration = 1800;

type CorpoRequisicao = {
  titulo?: unknown;
  tipoObra?: unknown;
  autoria?: unknown;
  autorOriginal?: unknown;
  descricao?: unknown;
  nomeArquivo?: unknown;
  caminhoArquivo?: unknown;
  tipoMime?: unknown;
  extensao?: unknown;
  tamanhoBytes?: unknown;
  hashSha256?: unknown;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const corpo = (await request.json().catch(() => null)) as CorpoRequisicao | null;
  if (!corpo) {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const titulo = typeof corpo.titulo === "string" ? corpo.titulo.trim() : "";
  const tipoObra = typeof corpo.tipoObra === "string" ? corpo.tipoObra : "";
  const autoria = typeof corpo.autoria === "string" ? corpo.autoria : "";
  const autorOriginal = typeof corpo.autorOriginal === "string" ? corpo.autorOriginal : null;
  const descricao = typeof corpo.descricao === "string" ? corpo.descricao : null;
  const nomeArquivo = typeof corpo.nomeArquivo === "string" ? corpo.nomeArquivo : "";
  const caminhoArquivo = typeof corpo.caminhoArquivo === "string" ? corpo.caminhoArquivo : "";
  const tipoMime = typeof corpo.tipoMime === "string" ? corpo.tipoMime : "application/octet-stream";
  const extensao = typeof corpo.extensao === "string" ? corpo.extensao.toLowerCase() : "";
  const tamanhoBytes = typeof corpo.tamanhoBytes === "number" ? corpo.tamanhoBytes : 0;
  const hashSha256 = typeof corpo.hashSha256 === "string" ? corpo.hashSha256 : "";

  if (!titulo) {
    return NextResponse.json({ error: "Dê um título para a obra." }, { status: 400 });
  }
  if (!FORMATOS_SUPORTADOS.includes(extensao as FormatoSuportado)) {
    return NextResponse.json(
      { error: `Formato não suportado. Use um destes: ${FORMATOS_SUPORTADOS.join(", ")}.` },
      { status: 400 }
    );
  }
  if (!caminhoArquivo || !hashSha256 || !nomeArquivo) {
    return NextResponse.json({ error: "Envio incompleto — falta o arquivo." }, { status: 400 });
  }

  // Confere posse do arquivo recém enviado ao Storage antes de registrar a
  // obra — o caminho precisa começar com o id do usuário autenticado (é a
  // mesma regra das políticas do bucket).
  if (!caminhoArquivo.startsWith(`${user.id}/`)) {
    return NextResponse.json({ error: "Caminho de arquivo inválido." }, { status: 400 });
  }

  const { data: duplicado } = await supabase
    .rpc("autoral_verificar_duplicado_hash", { p_hash_sha256: hashSha256 })
    .maybeSingle();
  if (duplicado) {
    const d = duplicado as { obra_id: string; titulo_exibicao: string };
    return NextResponse.json(
      { error: `Este arquivo já está na sua biblioteca, em "${d.titulo_exibicao}".`, obraId: d.obra_id },
      { status: 409 }
    );
  }

  const { data: resultado, error: erroEnvio } = await supabase
    .rpc("autoral_enviar_obra", {
      p_titulo: titulo,
      p_tipo_obra: tipoObra,
      p_autoria: autoria,
      p_autor_original: autorOriginal,
      p_descricao: descricao,
      p_nome_arquivo: nomeArquivo,
      p_caminho_arquivo: caminhoArquivo,
      p_tipo_mime: tipoMime,
      p_extensao: extensao,
      p_tamanho_bytes: tamanhoBytes,
      p_hash_sha256: hashSha256,
      p_quantidade_paginas: null,
    })
    .single();

  if (erroEnvio || !resultado) {
    return NextResponse.json(
      { error: erroEnvio?.message ?? "Não foi possível registrar a obra." },
      { status: 500 }
    );
  }

  const linha = resultado as {
    obra_id: string;
    obra_codigo: string;
    versao_obra_id: string;
    execucao_id: string;
  };

  after(async () => {
    const supabaseFundo = await createClient();
    try {
      await processarObra({
        supabase: supabaseFundo,
        execucaoId: linha.execucao_id,
        caminhoArquivo,
        extensao: extensao as FormatoSuportado,
        tituloObra: titulo,
      });
    } catch {
      // processarObra já registra o erro em processamento.execucoes/etapas_execucao;
      // não há nada mais a fazer aqui além de não deixar a exceção subir sem tratamento.
    }
  });

  return NextResponse.json(
    { obraId: linha.obra_id, obraCodigo: linha.obra_codigo, execucaoId: linha.execucao_id },
    { status: 201 }
  );
}
