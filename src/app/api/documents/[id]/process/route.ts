import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { extractText } from "@/lib/documents/extract-text";
import { analyzeDocument } from "@/lib/openai/analyze-document";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { data: doc } = await supabase.from("documents").select("*").eq("id", id).maybeSingle();
  if (!doc) {
    return NextResponse.json({ error: "Documento não encontrado." }, { status: 404 });
  }
  if (!doc.storage_path) {
    return NextResponse.json({ error: "Este documento não tem arquivo associado." }, { status: 400 });
  }

  await supabase.from("documents").update({ status: "processando" }).eq("id", id);

  try {
    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from("documents")
      .download(doc.storage_path);
    if (downloadError || !fileBlob) throw new Error("Não foi possível baixar o arquivo.");

    const buffer = Buffer.from(await fileBlob.arrayBuffer());
    const text = await extractText(buffer, doc.format);
    if (!text || text.trim().length < 20) {
      throw new Error("Não foi possível extrair texto deste formato de arquivo.");
    }

    const analysis = await analyzeDocument({ title: doc.title, author: doc.author, text });

    // Limpa temas/memórias de uma análise anterior (permite "gerar novamente").
    await supabase.from("document_themes").delete().eq("document_id", id);
    await supabase.from("memories").delete().eq("document_id", id);

    const themeIds: string[] = [];
    for (const label of analysis.themes) {
      const { data: theme } = await supabase
        .from("themes")
        .upsert({ user_id: user.id, label }, { onConflict: "user_id,label" })
        .select("id")
        .single();
      if (theme) themeIds.push(theme.id);
    }
    if (themeIds.length > 0) {
      await supabase
        .from("document_themes")
        .insert(themeIds.map((theme_id) => ({ document_id: id, theme_id })));
    }

    if (analysis.memories.length > 0) {
      await supabase.from("memories").insert(
        analysis.memories.map((m) => ({
          user_id: user.id,
          document_id: id,
          kind: m.kind,
          content: m.content,
        }))
      );
    }

    await supabase
      .from("documents")
      .update({
        ai_summary: analysis.summary,
        ai_main_theme: analysis.mainTheme || null,
        ai_processed_at: new Date().toISOString(),
        status: "processado",
      })
      .eq("id", id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    await supabase.from("documents").update({ status: "erro" }).eq("id", id);
    const message = err instanceof Error ? err.message : "Falha ao processar o documento.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
