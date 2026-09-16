import Link from "next/link";
import { Search } from "lucide-react";

import { TopBar } from "@/components/layout/top-bar";
import { ComingSoon } from "@/components/layout/coming-soon";
import { StatusBadge } from "@/components/library/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { DOCUMENT_TYPE_ICONS, DOCUMENT_TYPE_LABELS, type DocumentStatus, type DocumentType } from "@/lib/documents";

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  const { data: documents } = q
    ? await supabase
        .from("documents")
        .select("*")
        .or(`title.ilike.%${q}%,author.ilike.%${q}%,ai_summary.ilike.%${q}%`)
        .order("created_at", { ascending: false })
    : { data: null };

  return (
    <>
      <TopBar title="Buscar" />

      <div className="px-4 pt-4">
        <form action="/buscar" className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            autoFocus
            placeholder="Buscar em livros, reflexões, cartas, relatos..."
            className="h-11 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </form>
      </div>

      {!q ? (
        <ComingSoon
          icon={Search}
          title="Busca em todo o seu acervo"
          description="Digite acima para encontrar livros, reflexões, cartas, relatos e memórias."
        />
      ) : documents && documents.length > 0 ? (
        <div className="flex flex-col gap-3 px-4 pb-4 pt-4">
          <p className="text-xs text-muted-foreground">
            {documents.length} resultado{documents.length > 1 ? "s" : ""} para &ldquo;{q}&rdquo;
          </p>
          {documents.map((doc) => {
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
                      <Badge variant="secondary" className="mt-0.5 px-1.5 py-0">
                        {DOCUMENT_TYPE_LABELS[doc.type as DocumentType]}
                      </Badge>
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
          title="Nada encontrado"
          description={`Nenhum resultado para "${q}". Tente outro termo.`}
        />
      )}
    </>
  );
}
