"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/lib/supabase/client";
import { ESTADO_EXECUCAO_LABELS, type EstadoExecucao } from "@/lib/autoral/tipos";

const ESTADOS_FINAIS = new Set(["concluido", "falhou", "cancelado"]);
const INTERVALO_MS = 3500;

type LinhaExecucao = {
  estado: EstadoExecucao;
  etapa_atual: string | null;
  percentual: number;
  mensagem_erro: string | null;
};

export function StatusExecucao({
  execucaoId,
  estadoInicial,
  etapaInicial,
  percentualInicial,
}: {
  execucaoId: string;
  estadoInicial: EstadoExecucao;
  etapaInicial: string | null;
  percentualInicial: number;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [linha, setLinha] = useState<LinhaExecucao>({
    estado: estadoInicial,
    etapa_atual: etapaInicial,
    percentual: percentualInicial,
    mensagem_erro: null,
  });

  const jaAtualizouRota = useRef(false);

  useEffect(() => {
    if (ESTADOS_FINAIS.has(linha.estado)) return;

    const intervalo = setInterval(async () => {
      const { data } = await supabase
        .from("v_autoral_execucoes")
        .select("estado, etapa_atual, percentual, mensagem_erro")
        .eq("id", execucaoId)
        .single();
      if (!data) return;
      const nova = data as LinhaExecucao;
      setLinha(nova);
      if (ESTADOS_FINAIS.has(nova.estado) && !jaAtualizouRota.current) {
        jaAtualizouRota.current = true;
        router.refresh();
      }
    }, INTERVALO_MS);

    return () => clearInterval(intervalo);
  }, [execucaoId, linha.estado, router, supabase]);

  if (linha.estado === "concluido") return null;

  if (linha.estado === "falhou") {
    return (
      <Card className="border-destructive/30 bg-destructive-muted">
        <CardContent className="flex items-start gap-3 p-4">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-semibold text-destructive">O processamento falhou</p>
            <p className="mt-0.5 text-xs text-destructive/80">
              {linha.mensagem_erro ?? "Não conseguimos identificar o motivo. Tente enviar novamente."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const rotulo = ESTADO_EXECUCAO_LABELS[linha.estado] ?? "Processando";

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-2.5">
          <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
          <p className="text-sm font-semibold">{rotulo}</p>
          <span className="ml-auto text-xs text-muted-foreground">{Math.round(linha.percentual)}%</span>
        </div>
        <Progress value={linha.percentual} />
        <p className="text-xs text-muted-foreground">
          Isso pode levar alguns minutos, dependendo do tamanho da obra. Pode sair desta tela — o
          processamento continua rodando.
        </p>
      </CardContent>
    </Card>
  );
}
