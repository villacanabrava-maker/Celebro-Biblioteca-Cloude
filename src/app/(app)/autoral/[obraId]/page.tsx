import { notFound } from "next/navigation";
import { BookText, Layers, Quote, Sparkles } from "lucide-react";

import { TopBar } from "@/components/layout/top-bar";
import { Badge, tagVariantForLabel } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StatusExecucao } from "@/components/autoral/status-execucao";
import { createClient } from "@/lib/supabase/server";
import { ESTADO_EXECUCAO_LABELS, TIPO_OBRA_LABELS, type EstadoExecucao, type TipoObra } from "@/lib/autoral/tipos";

export default async function ObraDetalhePage({ params }: { params: Promise<{ obraId: string }> }) {
  const { obraId } = await params;
  const supabase = await createClient();

  const { data: obra } = await supabase.from("v_autoral_obras").select("*").eq("id", obraId).maybeSingle();
  if (!obra) notFound();

  const { data: versao } = await supabase
    .from("v_autoral_versoes_obras")
    .select("*")
    .eq("obra_id", obraId)
    .order("numero_versao", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: execucao } = versao
    ? await supabase
        .from("v_autoral_execucoes")
        .select("*")
        .eq("versao_obra_id", versao.id)
        .order("criado_em", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null };

  const { data: documento } = await supabase
    .from("v_autoral_documentos_processados")
    .select("*")
    .eq("obra_id", obraId)
    .eq("estado", "ativo")
    .maybeSingle();

  const { data: elementos } = documento
    ? await supabase
        .from("v_autoral_elementos")
        .select("id, tipo, titulo, importancia")
        .eq("documento_processado_id", documento.id)
        .order("importancia", { ascending: false })
        .limit(12)
    : { data: null };

  return (
    <>
      <TopBar title={obra.titulo_exibicao} />

      <div className="flex flex-col gap-4 px-4 pt-4 pb-8">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary">{TIPO_OBRA_LABELS[obra.tipo_obra as TipoObra] ?? obra.tipo_obra}</Badge>
          <Badge variant="outline">{obra.autoria === "autoral" ? "Autoral" : "Externa"}</Badge>
          {obra.autor_original && <Badge variant="outline">{obra.autor_original}</Badge>}
        </div>

        {obra.descricao && <p className="text-sm text-muted-foreground">{obra.descricao}</p>}

        {execucao && (
          <StatusExecucao
            execucaoId={execucao.id}
            estadoInicial={execucao.estado as EstadoExecucao}
            etapaInicial={
              execucao.etapa_atual
                ? (ESTADO_EXECUCAO_LABELS[execucao.etapa_atual as EstadoExecucao] ?? execucao.etapa_atual)
                : null
            }
            percentualInicial={Number(execucao.percentual ?? 0)}
          />
        )}

        {documento && (
          <>
            {documento.resumo_global && (
              <Card className="border-none bg-[image:var(--gradient-ai)] shadow-[var(--shadow-glow-ai)]">
                <CardContent className="flex items-start gap-3 p-4">
                  <Quote className="mt-0.5 size-5 shrink-0 text-white/90" />
                  <p className="text-sm italic text-white/95">{documento.resumo_global}</p>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-3 gap-2">
              <EstatisticaCard icone={Layers} valor={documento.quantidade_secoes} rotulo="Seções" />
              <EstatisticaCard icone={BookText} valor={documento.quantidade_fragmentos} rotulo="Fragmentos" />
              <EstatisticaCard icone={Sparkles} valor={documento.quantidade_elementos} rotulo="Elementos" />
            </div>

            {documento.sintese_analitica && (
              <Card>
                <CardContent className="flex flex-col gap-2 p-4">
                  <p className="text-sm font-semibold">Leitura local de metodologia</p>
                  <p className="text-sm text-muted-foreground">{documento.sintese_analitica}</p>
                  <p className="text-xs text-muted-foreground">
                    Baseada só nesta obra — o Cérebro Autoral consolidado (várias obras) chega na Fase 7.
                  </p>
                </CardContent>
              </Card>
            )}

            {elementos && elementos.length > 0 && (
              <Card>
                <CardContent className="flex flex-col gap-2.5 p-4">
                  <p className="text-sm font-semibold">Principais elementos identificados</p>
                  <div className="flex flex-wrap gap-2">
                    {elementos.map((el) => (
                      <Badge key={el.id} variant={tagVariantForLabel(el.titulo)}>
                        {el.titulo}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </>
  );
}

function EstatisticaCard({
  icone: Icone,
  valor,
  rotulo,
}: {
  icone: typeof Layers;
  valor: number;
  rotulo: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-1 p-3 text-center">
        <Icone className="size-4 text-primary" />
        <p className="text-lg font-bold">{valor}</p>
        <p className="text-[0.7rem] text-muted-foreground">{rotulo}</p>
      </CardContent>
    </Card>
  );
}
