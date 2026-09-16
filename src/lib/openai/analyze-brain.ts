import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type BrainAnalysis = {
  summaryQuote: string;
  writingStyle: string[];
  recurringThemes: string[];
  thinkingPatterns: string[];
  sections: {
    temas: string;
    conceitos: string;
    historias: string;
    evolucao: string;
  };
};

export async function analyzeBrain(memories: { content: string; documentTitle: string }[]): Promise<BrainAnalysis> {
  const corpus = memories
    .map((m, i) => `${i + 1}. [${m.documentTitle}] ${m.content}`)
    .join("\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "Você é a funcionalidade 'Meu Cérebro' do app Cérebro Biblioteca: analisa as " +
          "memórias (trechos, citações e insights) extraídas dos documentos de um usuário e " +
          "devolve um retrato do estilo de escrita, temas recorrentes e forma de pensar dele. " +
          "Baseie-se SOMENTE no conteúdo fornecido, sem inventar. Responda SOMENTE com um JSON " +
          "válido, em português do Brasil, no formato exato: " +
          '{"summary_quote": string (1 frase inspiradora resumindo como a pessoa escreve e pensa), ' +
          '"writing_style": string[] (4 a 6 palavras/expressões curtas, ex.: "Reflexivo", "Analítico"), ' +
          '"recurring_themes": string[] (4 a 6 temas curtos, ex.: "Propósito", "Autoconhecimento"), ' +
          '"thinking_patterns": string[] (3 a 5 expressões curtas sobre como a pessoa pensa, ex.: "Conecta ideias"), ' +
          '"sections": {"temas": string (parágrafo curto sobre os temas recorrentes e por que aparecem), ' +
          '"conceitos": string (parágrafo curto sobre os conceitos e valores mais importantes), ' +
          '"historias": string (parágrafo curto sobre histórias e contextos marcantes), ' +
          '"evolucao": string (parágrafo curto sobre como o pensamento parece evoluir ao longo do tempo)}}',
      },
      {
        role: "user",
        content: `Memórias do usuário (formato "[documento] conteúdo"):\n\n${corpus}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("A IA não retornou nenhum conteúdo.");

  const parsed = JSON.parse(raw) as Record<string, unknown>;
  const sections = (parsed.sections ?? {}) as Record<string, unknown>;

  const asStringArray = (v: unknown) =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, 6) : [];

  return {
    summaryQuote: typeof parsed.summary_quote === "string" ? parsed.summary_quote : "",
    writingStyle: asStringArray(parsed.writing_style),
    recurringThemes: asStringArray(parsed.recurring_themes),
    thinkingPatterns: asStringArray(parsed.thinking_patterns),
    sections: {
      temas: typeof sections.temas === "string" ? sections.temas : "",
      conceitos: typeof sections.conceitos === "string" ? sections.conceitos : "",
      historias: typeof sections.historias === "string" ? sections.historias : "",
      evolucao: typeof sections.evolucao === "string" ? sections.evolucao : "",
    },
  };
}
