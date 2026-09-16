import Link from "next/link";
import { Plus, Search } from "lucide-react";

import { TopBar } from "@/components/layout/top-bar";
import { ComingSoon } from "@/components/layout/coming-soon";
import { StatusBadge } from "@/components/library/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import {
  DOCUMENT_TYPE_ICONS,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_TYPE_LABELS_PLURAL,
  type DocumentStatus,
  type DocumentType,
} from "@/lib/documents";

const FILTERS: { value: DocumentType | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "livro", label: DOCUMENT_TYPE_LABELS_PLURAL.livro },
  { value: "reflexao", label: DOCUMENT_TYPE_LABELS_PLURAL.reflexao },
  { value: "carta", label: DOCUMENT_TYPE_LABELS_PLURAL.carta },
  { value: "relato", label: DOCUMENT_TYPE_LABELS_PLURAL.relato },
  { value: "outro", label: DOCUMENT_TYPE_LABELS_PLURAL.outro },
];

export default async function BibliotecaPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; q?: string }>;
}) {
  const { tipo, q } = await searchParams;
  const activeTipo = (tipo as DocumentType | "todos") || "todos";

  const supabase = await createClient();
  let query = supabase.from("documents").select("*").order("created_at", { ascending: false });
  if (activeTipo !== "todos") query = query.eq("type", activeTipo);
  if (q) query = query.ilike("title", `%${q}%`);
  const { data: documents } = await query;

  const hasLibrary = (documents?.length ?? 0) > 0;

  return (
    <>
      <TopBar title="Biblioteca" />

      <div className="flex flex-col gap-4 px-4 pt-4">
        <div className="flex items-center gap-2">
          <form action="/biblioteca" className="relative flex-1">
            {activeTipo !== "todos" && <input type="hidden" name="tipo" value={activeTipo} />}
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Buscar na biblioteca..."
              className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </form>
          <Link
            href="/biblioteca/adicionar"
            className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
          >
            <Plus className="size-4" />
            Adicionar
          </Link>
        </div>

        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {FILTERS.map((f) => {
            const active = activeTipo === f.value;
            const href =
              f.value === "todos"
                ? "/biblioteca" + (q ? `?q=${encodeURIComponent(q)}` : "")
                : `/biblioteca?tipo=${f.value}` + (q ? `&q=${encodeURIComponent(q)}` : "");
            return (
              <Link
                key={f.value}
                href={href}
                className={
                  "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors " +
                  (active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-secondary")
                }
              >
                {f.label}
              </Link>
            );
          })}
        </div>
      </div>

      {hasLibrary ? (
        <div className="flex flex-col gap-3 px-4 pb-4 pt-2">
          {documents!.map((doc) => {
            const Icon = DOCUMENT_TYPE_ICONS[doc.type as DocumentType];
            return (
              <Link key={doc.id} href={`/biblioteca/${doc.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center gap-3 p-3.5">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <Icon className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{doc.title}</p>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="px-1.5 py-0">
                          {DOCUMENT_TYPE_LABELS[doc.type as DocumentType]}
                        </Badge>
                        {doc.year && <span>{doc.year}</span>}
                        {doc.page_count && <span>· {doc.page_count} páginas</span>}
                      </div>
                    </div>
                    <StatusBadge status={doc.status as DocumentStatus} />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <ComingSoon
          icon={Search}
          title={q || activeTipo !== "todos" ? "Nada encontrado" : "Sua biblioteca está vazia"}
          description={
            q || activeTipo !== "todos"
              ? "Tente outro termo de busca ou outro filtro."
              : "Toque em \"Adicionar\" para trazer seu primeiro livro, carta, relato ou texto."
          }
        />
      )}
    </>
  );
}
