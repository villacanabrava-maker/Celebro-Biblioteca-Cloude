"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FilePlus2, PenLine, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import type { DocumentType } from "@/lib/documents";
import { cn } from "@/lib/utils";

const TYPE_OPTIONS: { value: DocumentType; label: string }[] = [
  { value: "livro", label: "Livro" },
  { value: "carta", label: "Carta" },
  { value: "relato", label: "Relato" },
  { value: "outro", label: "Outro" },
];

export function AddDocumentForm() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<"arquivo" | "texto">("arquivo");
  const [type, setType] = useState<DocumentType>("livro");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Dê um título para o documento.");
      return;
    }
    if (mode === "arquivo" && !selectedFile) {
      setError("Escolha um arquivo para enviar.");
      return;
    }
    if (mode === "texto" && !text.trim()) {
      setError("Escreva algum conteúdo antes de salvar.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      setError("Sua sessão expirou. Faça login novamente.");
      return;
    }

    const fileToUpload =
      mode === "arquivo"
        ? selectedFile!
        : new File([text], `${title.trim().slice(0, 60) || "texto"}.txt`, { type: "text/plain" });

    const format = fileToUpload.name.split(".").pop()?.toLowerCase() ?? null;
    const storagePath = `${user.id}/${crypto.randomUUID()}-${fileToUpload.name}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(storagePath, fileToUpload);

    if (uploadError) {
      setLoading(false);
      setError("Não foi possível enviar o arquivo. Tente novamente.");
      return;
    }

    const { data: inserted, error: insertError } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        type,
        title: title.trim(),
        author: author.trim() || null,
        year: year ? Number(year) : null,
        format,
        file_size_bytes: fileToUpload.size,
        storage_path: storagePath,
        status: "pendente",
      })
      .select("id")
      .single();

    setLoading(false);

    if (insertError || !inserted) {
      setError("O arquivo foi enviado, mas não consegui salvar os dados. Tente novamente.");
      return;
    }

    // Dispara o processamento por IA em segundo plano; a página de detalhe
    // acompanha o status sozinha (não precisa esperar aqui).
    fetch(`/api/documents/${inserted.id}/process`, { method: "POST" }).catch(() => {});

    router.push(`/biblioteca/${inserted.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4 pb-8 pt-5">
      <div className="grid grid-cols-4 gap-2">
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setType(opt.value)}
            className={cn(
              "rounded-lg border px-2 py-2.5 text-center text-xs font-medium transition-colors",
              type === opt.value
                ? "border-primary bg-accent text-primary"
                : "border-border bg-card text-muted-foreground hover:bg-muted"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nome do documento"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="author">Autor (opcional)</Label>
          <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="year">Ano (opcional)</Label>
          <Input
            id="year"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="2026"
          />
        </div>
      </div>

      <div className="flex gap-2 rounded-lg bg-muted p-1">
        <button
          type="button"
          onClick={() => setMode("arquivo")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors",
            mode === "arquivo" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
          )}
        >
          <UploadCloud className="size-4" /> Enviar arquivo
        </button>
        <button
          type="button"
          onClick={() => setMode("texto")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors",
            mode === "texto" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
          )}
        >
          <PenLine className="size-4" /> Escrever texto
        </button>
      </div>

      {mode === "arquivo" ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border py-8 text-center hover:border-primary hover:bg-accent/40"
        >
          <FilePlus2 className="size-7 text-muted-foreground" />
          <span className="text-sm font-medium">
            {selectedFile ? selectedFile.name : "Toque para escolher um arquivo"}
          </span>
          <span className="text-xs text-muted-foreground">PDF, DOCX, TXT, EPUB...</span>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
          />
        </button>
      ) : (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escreva ou cole o conteúdo aqui..."
          rows={10}
          className="w-full rounded-xl border border-input bg-muted/60 p-3.5 text-sm placeholder:text-muted-foreground transition-all duration-200 focus-visible:border-ring focus-visible:bg-card focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
        />
      )}

      {error && (
        <p className="rounded-lg bg-destructive-muted px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <Button type="submit" size="lg" disabled={loading}>
        {loading ? "Salvando..." : "Adicionar à biblioteca"}
      </Button>
    </form>
  );
}
