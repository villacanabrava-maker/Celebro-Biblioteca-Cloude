import Link from "next/link";
import { Brain, FilePlus2, Library, NotebookText, Search, Sparkles } from "lucide-react";

import { TopBar } from "@/components/layout/top-bar";
import { Card, CardContent } from "@/components/ui/card";

// TODO(fase 2/3): substituir pelos dados reais do usuário logado (Supabase).
const mock = {
  nome: "Robert",
  biblioteca: { total: 0, livros: 0, reflexoes: 0, cartas: 0, outros: 0 },
  cerebro: { percentual: 0, memorias: 0 },
  reflexoes: { concluidas: 0, emElaboracao: 0, emRevisao: 0 },
};

const quickActions = [
  { href: "/biblioteca/adicionar", label: "Adicionar arquivo", icon: FilePlus2 },
  { href: "/reflexao", label: "Criar nova reflexão", icon: Sparkles },
  { href: "/cerebro", label: "Consultar meu cérebro", icon: Brain },
  { href: "/reflexoes", label: "Ver minhas reflexões", icon: NotebookText },
];

export default function InicioPage() {
  return (
    <>
      <TopBar showLogo />

      <div className="flex flex-col gap-5 px-4 pt-5">
        <section className="rounded-xl bg-gradient-to-br from-navy to-navy-muted p-5 text-white">
          <p className="text-xl font-semibold">Olá, {mock.nome}!</p>
          <p className="mt-1 text-sm text-white/70">Que bom te ver por aqui.</p>
          <p className="mt-4 text-sm italic text-white/60">
            &ldquo;Toda grande reflexão começa com uma pergunta.&rdquo;
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <Link href="/biblioteca">
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Library className="size-5" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Minha Biblioteca</p>
                  <p className="text-xs text-muted-foreground">
                    {mock.biblioteca.total} documentos
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {mock.biblioteca.livros} livros · {mock.biblioteca.reflexoes} reflexões
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/cerebro">
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Brain className="size-5" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Meu Cérebro</p>
                  <p className="text-xs text-muted-foreground">
                    Memória analisada: {mock.cerebro.percentual}%
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {mock.cerebro.memorias} memórias
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/reflexoes">
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <NotebookText className="size-5" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Minhas Reflexões</p>
                  <p className="text-xs text-muted-foreground">
                    {mock.reflexoes.concluidas} concluídas
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {mock.reflexoes.emElaboracao} em elaboração
                </p>
              </CardContent>
            </Card>
          </Link>
        </section>

        <section>
          <p className="mb-3 text-sm font-semibold text-foreground">Ações rápidas</p>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="flex flex-col items-start gap-2.5 p-4">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
