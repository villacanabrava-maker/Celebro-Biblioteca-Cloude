const MAX_CHARS = 20000;

/**
 * Extrai texto de formatos suportados (txt, md, pdf, docx). Retorna null
 * quando o formato não é suportado para extração automática — o documento
 * continua na biblioteca, só não recebe resumo/temas/memórias por IA.
 */
export async function extractText(buffer: Buffer, format: string | null): Promise<string | null> {
  const ext = (format ?? "").toLowerCase();

  if (ext === "txt" || ext === "md") {
    return buffer.toString("utf-8").slice(0, MAX_CHARS);
  }

  if (ext === "pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    return result.text.slice(0, MAX_CHARS);
  }

  if (ext === "docx") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value.slice(0, MAX_CHARS);
  }

  return null;
}
