"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, ExternalLink, Loader2, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function DocumentActions({
  documentId,
  storagePath,
}: {
  documentId: string;
  storagePath: string | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [busy, setBusy] = useState<"abrir" | "baixar" | "excluir" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleOpen() {
    if (!storagePath) return;
    setBusy("abrir");
    setError(null);
    const { data, error } = await supabase.storage.from("documents").createSignedUrl(storagePath, 60);
    setBusy(null);
    if (error || !data) {
      setError("Não foi possível abrir o arquivo.");
      return;
    }
    window.open(data.signedUrl, "_blank");
  }

  async function handleDownload() {
    if (!storagePath) return;
    setBusy("baixar");
    setError(null);
    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(storagePath, 60, { download: true });
    setBusy(null);
    if (error || !data) {
      setError("Não foi possível baixar o arquivo.");
      return;
    }
    window.open(data.signedUrl, "_blank");
  }

  async function handleDelete() {
    if (!window.confirm("Excluir este documento? Essa ação não pode ser desfeita.")) return;
    setBusy("excluir");
    setError(null);

    if (storagePath) {
      await supabase.storage.from("documents").remove([storagePath]);
    }
    const { error } = await supabase.from("documents").delete().eq("id", documentId);

    setBusy(null);
    if (error) {
      setError("Não foi possível excluir o documento.");
      return;
    }
    router.push("/biblioteca");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={handleOpen} disabled={!storagePath || busy !== null}>
          {busy === "abrir" ? <Loader2 className="size-4 animate-spin" /> : <ExternalLink className="size-4" />}
          Abrir documento
        </Button>
        <Button variant="outline" onClick={handleDownload} disabled={!storagePath || busy !== null}>
          {busy === "baixar" ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
          Baixar arquivo
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" asChild>
          <Link href={`/biblioteca/${documentId}/editar`}>
            <Pencil className="size-4" />
            Editar informações
          </Link>
        </Button>
        <Button variant="outline" onClick={handleDelete} disabled={busy !== null} className="text-destructive hover:bg-destructive-muted">
          {busy === "excluir" ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
          Excluir
        </Button>
      </div>
      {error && (
        <p className="rounded-lg bg-destructive-muted px-3 py-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
