import Link from "next/link";
import { Brain, Plus } from "lucide-react";

import { TopBar } from "@/components/layout/top-bar";
import { ComingSoon } from "@/components/layout/coming-soon";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { TIPO_OBRA_LABELS, type TipoObra } from "@/lib/autoral/tipos";

type LinhaObra = {
  id: string;
  codigo: string;
  titulo_exibicao: string;
  tipo_obra: string;
  autoria: string;
  criado_em: string;
};

type LinhaVersao = {
  obra_id: string;
  estado_processamento: string;
  criado_em: string;
};

const ROTULO_ESTADO: Record<string, { texto: string; tom: string }> = {
  recebido: { texto: "Na fila", tom: "bg-muted text-muted-foreground" },
  em_processamento: { texto: "Processando", tom: "bg-accent text-accent-foreground" },
  concluido: { texto: "Processado", tom: "bg-emerald-500/15 text-emerald-600" },
  falhou: { texto: "Falhou", tom: "bg-destructive-muted text-destructive" },
};

export default async function AutoralPage() {
  const supabase = await createClient();

  const { data: obras } = await supabase
    .from("v_autoral_obras")
    .select("id, codigo, titulo_exibicao, tipo_obra, autoria, criado_em")
    .order("criado_em", { ascending: false });

  const { data: versoes } = await supabase
    .from("v_autoral_versoes_obras")
    .select("obra_id, estado_processamento, criado_em")
    .order("criado_em", { ascending: false });

  const estadoPorObra = new Map<string, string>();
  for (const v of (versoes ?? []) as LinhaVersao[]) {
    if (!estadoPorObra.has(v.obra_id)) estadoPorObra.set(v.obra_id, v.estado_processamento);
  }

  const lista = (obras ?? []) as LinhaObra[];

  return (
    <>
      <TopBar title="Cérebro Autoral" />

      <div className="flex flex-col gap-4 px-4 pt-4">
        <Card className="border-none bg-[image:var(--gradient-ai)] shadow-[var(--shadow-glow-ai)]">
          <CardContent className="flex items-center gap-3 p-4">
            <Brain className="size-6 shrink-0 text-white" />
            <p className="text-sm text-white/95">
              Aqui suas obras são processadas de verdade pela IA: estrutura, fragmentos, sínteses e
              elementos — a base do Cérebro Autoral que aprende sua metodologia.
            </p>
          </CardContent>
        </Card>

        <Link
          href="/autoral/nova"
          className="flex h-11 items-center justify-center gap-1.5 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-px hover:bg-primary-hover hover:shadow-[var(--shadow-md)] active:scale-[0.97]"
        >
          <Plus className="size-4" />
          Enviar obra
        </Link>
      </div>

      {lista.length > 0 ? (
        <div className="flex flex-col gap-3 px-4 pb-4 pt-2">
          {lista.map((obra) => {
            const estado = estadoPorObra.get(obra.id) ?? "recebido";
            const rotulo = ROTULO_ESTADO[estado] ?? ROTULO_ESTADO.recebido;
            return (
              <Link key={obra.id} href={`/autoral/${obra.id}`}>
                <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]">
                  <CardContent className="flex items-center gap-3 p-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{obra.titulo_exibicao}</p>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="px-1.5 py-0">
                          {TIPO_OBRA_LABELS[obra.tipo_obra as TipoObra] ?? obra.tipo_obra}
                        </Badge>
                        <span>{obra.autoria === "autoral" ? "Autoral" : "Externa"}</span>
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${rotulo.tom}`}>
                      {rotulo.texto}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <ComingSoon
          icon={Brain}
          title="Nenhuma obra enviada ainda"
          description='Toque em "Enviar obra" para trazer seu primeiro livro, carta ou texto para o Cérebro Autoral.'
        />
      )}
    </>
  );
}
