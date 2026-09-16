import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type MemoryKind = "trecho" | "citacao" | "insight";

export type DocumentAnalysis = {
  summary: string;
  mainTheme: string;
  themes: string[];
  memories: { kind: MemoryKind; content: string }[];
};

const MEMORY_KINDS: MemoryKind[] = ["trecho", "citacao", "insight"];

export async function analyzeDocument(params: {
  title: string;
  author?: string | null;
  text: string;
}): Promise<DocumentAnalysis> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "Você analisa documentos pessoais (livros, cartas, relatos, textos) para o app " +
          "Cérebro Biblioteca. Responda SOMENTE com um JSON válido, em português do Brasil, " +
          "no formato exato: " +
          '{"summary": string (3 a 5 frases), "main_theme": string (2 a 4 palavras), ' +
          '"themes": string[] (3 a 6 itens curtos, 1 a 3 palavras cada), ' +
          '"memories": {"kind": "trecho"|"citacao"|"insight", "content": string (até 2 frases)}[] (3 a 6 itens)}',
      },
      {
        role: "user",
        content: `Título: ${params.title}\nAutor: ${params.author ?? "desconhecido"}\n\nConteúdo:\n${params.text}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("A IA não retornou nenhum conteúdo.");

  const parsed = JSON.parse(raw) as {
    summary?: unknown;
    main_theme?: unknown;
    themes?: unknown;
    memories?: unknown;
  };

  const summary = typeof parsed.summary === "string" ? parsed.summary : "";
  const mainTheme = typeof parsed.main_theme === "string" ? parsed.main_theme : "";
  const themes = Array.isArray(parsed.themes)
    ? parsed.themes.filter((t): t is string => typeof t === "string").slice(0, 6)
    : [];
  const memories = Array.isArray(parsed.memories)
    ? parsed.memories
        .filter(
          (m): m is { kind: unknown; content: unknown } => typeof m === "object" && m !== null
        )
        .map((m) => ({
          kind: MEMORY_KINDS.includes(m.kind as MemoryKind) ? (m.kind as MemoryKind) : "insight",
          content: typeof m.content === "string" ? m.content : "",
        }))
        .filter((m) => m.content.length > 0)
        .slice(0, 6)
    : [];

  if (!summary) throw new Error("A IA não retornou um resumo válido.");

  return { summary, mainTheme, themes, memories };
}
