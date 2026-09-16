import { notFound } from "next/navigation";
import { Brain, Sparkles } from "lucide-react";

import { TopBar } from "@/components/layout/top-bar";
import { Badge, tagVariantForLabel } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/library/status-badge";
import { DocumentActions } from "@/components/library/document-actions";
import { DocumentNotes } from "@/components/library/document-notes";
import { ProcessDocumentButton } from "@/components/library/process-document-button";
import { createClient } from "@/lib/supabase/server";
import {
  DOCUMENT_TYPE_ICONS,
  DOCUMENT_TYPE_LABELS,
  formatFileSize,
  type DocumentStatus,
  type DocumentType,
} from "@/lib/documents";

export default async function DocumentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: doc }, { data: memories }, { data: documentThemes }] = await Promise.all([
    supabase.from("documents").select("*").eq("id", id).maybeSingle(),
    supabase.from("memories").select("*").eq("document_id", id).order("created_at", { ascending: false }),
    supabase.from("document_themes").select("themes(id, label)").eq("document_id", id),
  ]);

  if (!doc) notFound();

  const Icon = DOCUMENT_TYPE_ICONS[doc.type as DocumentType];
  const themes = (documentThemes ?? [])
    .map((row) => row.themes as unknown as { id: string; label: string } | null)
    .filter((t): t is { id: string; label: string } => Boolean(t));

  const uploadDate = new Date(doc.created_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <TopBar title={doc.title} />

      <div className="flex flex-col gap-5 px-4 pt-5 pb-8">
        <div className="flex gap-4">
          <span className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Icon className="size-8" />
          </span>
          <div className="flex flex-1 flex-col gap-1.5">
            <p className="text-lg font-semibold leading-tight">{doc.title}</p>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <Badge variant="secondary">{DOCUMENT_TYPE_LABELS[doc.type as DocumentType]}</Badge>
              {doc.year && <span>{doc.year}</span>}
              {doc.page_count && <span>· {doc.page_count} páginas</span>}
              {formatFileSize(doc.file_size_bytes) && <span>· {formatFileSize(doc.file_size_bytes)}</span>}
            </div>
            <StatusBadge status={doc.status as DocumentStatus} />
          </div>
        </div>

        <Tabs defaultValue="resumo">
          <TabsList>
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
            <TabsTrigger value="memorias">Memórias</TabsTrigger>
            <TabsTrigger value="anotacoes">Anotações</TabsTrigger>
          </TabsList>

          <TabsContent value="resumo">
            <Card>
              <CardContent className="flex flex-col items-start gap-3 p-4">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                  <Sparkles className="size-4" /> Resumo gerado pela IA
                </span>
                {doc.ai_summary ? (
                  <p className="text-sm text-foreground">{doc.ai_summary}</p>
                ) : doc.status === "erro" ? (
                  <p className="text-sm text-destructive">
                    Não foi possível processar este documento (formato não suportado ou erro na
                    IA). Você pode tentar novamente.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Este documento ainda não foi processado pela IA.
                  </p>
                )}
                <ProcessDocumentButton documentId={doc.id} status={doc.status as DocumentStatus} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conteudo">
            <Card>
              <CardContent className="flex flex-col gap-2 p-4">
                <p className="text-sm text-muted-foreground">
                  {doc.storage_path
                    ? "Use as ações abaixo para abrir ou baixar o arquivo original."
                    : "Nenhum arquivo associado a este documento."}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="memorias">
            {memories && memories.length > 0 ? (
              <div className="flex flex-col gap-2">
                {memories.map((m) => (
                  <Card key={m.id}>
                    <CardContent className="p-4">
                      <p className="text-sm text-foreground">{m.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
                  <Brain className="size-6 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma memória extraída ainda. Isso acontece automaticamente quando a IA
                    processa o documento (Fase 4).
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="anotacoes">
            <DocumentNotes documentId={doc.id} initialNotes={doc.user_notes} />
          </TabsContent>
        </Tabs>

        <div>
          <p className="mb-2 text-sm font-semibold">Metadados do documento</p>
          <Card>
            <CardContent className="flex flex-col gap-2.5 p-4 text-sm">
              <MetaRow label="Autor" value={doc.author} />
              <MetaRow label="Categoria" value={DOCUMENT_TYPE_LABELS[doc.type as DocumentType]} />
              <MetaRow label="Ano" value={doc.year?.toString()} />
              <MetaRow label="Formato" value={doc.format?.toUpperCase()} />
              <MetaRow label="Tamanho" value={formatFileSize(doc.file_size_bytes)} />
              <MetaRow label="Data de upload" value={uploadDate} />
            </CardContent>
          </Card>
        </div>

        {themes.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-semibold">Temas relacionados</p>
            <div className="flex flex-wrap gap-2">
              {themes.map((theme) => (
                <Badge key={theme.id} variant={tagVariantForLabel(theme.label)}>
                  {theme.label}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="mb-2 text-sm font-semibold">Ações</p>
          <DocumentActions documentId={doc.id} storagePath={doc.storage_path} />
        </div>
      </div>
    </>
  );
}

function MetaRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
