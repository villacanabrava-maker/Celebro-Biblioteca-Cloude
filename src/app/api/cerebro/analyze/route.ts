import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { analyzeBrain } from "@/lib/openai/analyze-brain";

export const runtime = "nodejs";
export const maxDuration = 60;

const MIN_MEMORIES = 3;

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { data: memories } = await supabase
    .from("memories")
    .select("content, documents(title)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(200);

  if (!memories || memories.length < MIN_MEMORIES) {
    return NextResponse.json(
      {
        error: `São necessárias pelo menos ${MIN_MEMORIES} memórias para gerar o Meu Cérebro. Adicione e processe mais documentos na Biblioteca.`,
      },
      { status: 400 }
    );
  }

  const { count: totalDocs } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);
  const { count: processedDocs } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "processado");

  try {
    const analysis = await analyzeBrain(
      memories.map((m) => ({
        content: m.content,
        documentTitle: (m.documents as unknown as { title: string } | null)?.title ?? "documento",
      }))
    );

    const percent = totalDocs && totalDocs > 0 ? Math.round(((processedDocs ?? 0) / totalDocs) * 100) : 0;

    await supabase.from("brain_insights").upsert(
      {
        user_id: user.id,
        memory_analyzed_percent: percent,
        memories_analyzed_count: memories.length,
        summary_quote: analysis.summaryQuote,
        writing_style: analysis.writingStyle,
        recurring_themes: analysis.recurringThemes,
        thinking_patterns: analysis.thinkingPatterns,
        sections: analysis.sections,
        generated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha ao gerar a análise.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
