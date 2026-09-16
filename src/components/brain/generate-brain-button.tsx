"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function GenerateBrainButton({ hasInsights }: { hasInsights: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/cerebro/analyze", { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Não foi possível gerar a análise.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button onClick={handleClick} disabled={loading} size="lg" variant="ai">
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : hasInsights ? (
          <RefreshCw className="size-4" />
        ) : (
          <Sparkles className="size-4" />
        )}
        {loading ? "Analisando..." : hasInsights ? "Atualizar análise" : "Gerar Meu Cérebro"}
      </Button>
      {error && (
        <p className="max-w-xs text-center text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
