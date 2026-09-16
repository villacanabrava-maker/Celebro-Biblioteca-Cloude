import Link from "next/link";
import { Brain, FilePlus2, Library, NotebookText, Search, Sparkles } from "lucide-react";

import { TopBar } from "@/components/layout/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";

const quickActions = [
  { href: "/biblioteca/adicionar", label: "Adicionar arquivo", icon: FilePlus2, ai: false },
  { href: "/reflexao", label: "Criar nova reflexão", icon: Sparkles, ai: true },
  { href: "/cerebro", label: "Consultar meu cérebro", icon: Brain, ai: true },
  { href: "/reflexoes", label: "Ver minhas reflexões", icon: NotebookText, ai: false },
];

export default async function InicioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { count: totalDocs }, { count: totalLivros }, { count: totalReflexoesBiblioteca }, { data: brain }, { count: reflexoesConcluidas }, { count: reflexoesEmElaboracao }] =
    await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", user!.id).maybeSingle(),
      supabase.from("documents").select("*", { count: "exact", head: true }),
      supabase.from("documents").select("*", { count: "exact", head: true }).eq("type", "livro"),
      supabase.from("documents").select("*", { count: "exact", head: true }).eq("type", "reflexao"),
      supabase.from("brain_insights").select("memory_analyzed_percent, memories_analyzed_count").eq("user_id", user!.id).maybeSingle(),
      supabase.from("reflections").select("*", { count: "exact", head: true }).in("status", ["aprovada", "incorporada"]),
      supabase.from("reflections").select("*", { count: "exact", head: true }).in("status", ["rascunho", "em_revisao"]),
    ]);

  const nome = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "";
  const initials = getInitials(profile?.full_name ?? user?.email ?? "?");

  return (
    <>
      <TopBar showLogo initials={initials} />

      <div className="flex flex-col gap-5 px-4 pt-5">
        <section
          className="relative overflow-hidden rounded-3xl border border-navy-border bg-navy p-5 text-white shadow-[var(--shadow-lg)]"
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(55% 60% at 100% 0%, var(--navy-glow), transparent), radial-gradient(45% 45% at 0% 100%, rgba(58,169,247,0.18), transparent)",
            }}
            aria-hidden
          />
          <div className="relative">
            <p className="text-xl font-semibold">Olá, {nome}!</p>
            <p className="mt-1 text-sm text-white/65">Que bom te ver por aqui.</p>
            <p className="mt-4 text-sm italic text-white/55">
              &ldquo;Toda grande reflexão começa com uma pergunta.&rdquo;
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <Link href="/biblioteca">
            <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]">
              <CardContent className="flex items-center gap-4 p-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                  <Library className="size-5" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Minha Biblioteca</p>
                  <p className="text-xs text-muted-foreground">{totalDocs ?? 0} documentos</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {totalLivros ?? 0} livros · {totalReflexoesBiblioteca ?? 0} reflexões
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/cerebro">
            <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]">
              <CardContent className="flex items-center gap-4 p-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[image:var(--gradient-ai)] text-white shadow-[var(--shadow-glow-ai)]">
                  <Brain className="size-5" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Meu Cérebro</p>
                  <p className="text-xs text-muted-foreground">
                    Memória analisada: {brain?.memory_analyzed_percent ?? 0}%
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {brain?.memories_analyzed_count ?? 0} memórias
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/reflexoes">
            <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]">
              <CardContent className="flex items-center gap-4 p-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                  <NotebookText className="size-5" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Minhas Reflexões</p>
                  <p className="text-xs text-muted-foreground">
                    {reflexoesConcluidas ?? 0} concluídas
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {reflexoesEmElaboracao ?? 0} em elaboração
                </p>
              </CardContent>
            </Card>
          </Link>
        </section>

        <section>
          <p className="mb-3 text-sm font-semibold text-foreground">Ações rápidas</p>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(({ href, label, icon: Icon, ai }) => (
              <Link key={href} href={href}>
                <Card className="h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]">
                  <CardContent className="flex flex-col items-start gap-2.5 p-4">
                    <span
                      className={cn(
                        "flex size-9 items-center justify-center rounded-xl",
                        ai
                          ? "bg-[image:var(--gradient-ai)] text-white shadow-[var(--shadow-glow-ai)]"
                          : "bg-primary/10 text-primary"
                      )}
                    >
                      <Icon className="size-4.5" />
                    </span>
                    <p className="text-sm font-medium leading-tight">{label}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <p className="flex items-center gap-1.5 pb-2 text-xs text-muted-foreground">
          <Search className="size-3.5" /> Dica: use a busca no topo para encontrar
          qualquer documento, reflexão ou memória.
        </p>
      </div>
    </>
  );
}
