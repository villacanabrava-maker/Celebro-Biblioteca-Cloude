"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { DocumentStatus } from "@/lib/documents";

export function ProcessDocumentButton({
  documentId,
  status,
}: {
  documentId: string;
  status: DocumentStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isProcessing = status === "processando" || loading;

  useEffect(() => {
    if (status !== "processando") return;
    const interval = setInterval(() => router.refresh(), 3000);
    return () => clearInterval(interval);
  }, [status, router]);

  async function handleClick() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/documents/${documentId}/process`, { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Não foi possível processar o documento.");
      router.refresh();
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        size="sm"
        variant={status === "processado" ? "outline" : "default"}
        onClick={handleClick}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : status === "processado" ? (
          <RefreshCw className="size-3.5" />
        ) : (
          <Sparkles className="size-3.5" />
        )}
        {isProcessing
          ? "Processando..."
          : status === "processado"
            ? "Gerar novamente"
            : "Gerar resumo com IA"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
