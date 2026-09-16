"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
  { value: "reflexao", label: "Reflexão" },
  { value: "outro", label: "Outro" },
];

export function EditDocumentForm({
  documentId,
  initial,
}: {
  documentId: string;
  initial: { title: string; author: string | null; year: number | null; type: DocumentType };
}) {
  const router = useRouter();
  const supabase = createClient();

  const [type, setType] = useState<DocumentType>(initial.type);
  const [title, setTitle] = useState(initial.title);
  const [author, setAuthor] = useState(initial.author ?? "");
  const [year, setYear] = useState(initial.year?.toString() ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      setError("Dê um título para o documento.");
      return;
    }
    setLoading(true);
    setError(null);

    const { error } = await supabase
      .from("documents")
      .update({
        type,
        title: title.trim(),
        author: author.trim() || null,
        year: year ? Number(year) : null,
      })
      .eq("id", documentId);

    setLoading(false);
    if (error) {
      setError("Não foi possível salvar as alterações.");
      return;
    }
    router.push(`/biblioteca/${documentId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4 pt-5 pb-8">
      <div className="grid grid-cols-5 gap-2">
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setType(opt.value)}
            className={cn(
              "rounded-lg border px-1.5 py-2.5 text-center text-xs font-medium transition-colors",
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
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="author">Autor (opcional)</Label>
          <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="year">Ano (opcional)</Label>
          <Input id="year" type="number" value={year} onChange={(e) => setYear(e.target.value)} />
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-destructive-muted px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <Button type="submit" size="lg" disabled={loading}>
        {loading ? "Salvando..." : "Salvar alterações"}
      </Button>
    </form>
  );
}
