import Link from "next/link";
import { ArrowRight, Brain, Sparkles } from "lucide-react";

import { TopBar } from "@/components/layout/top-bar";
import { Badge, tagVariantForLabel } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GenerateBrainButton } from "@/components/brain/generate-brain-button";
import { createClient } from "@/lib/supabase/server";

export default async function CerebroPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: brain } = await supabase
    .from("brain_insights")
    .select("*")
    .eq("user_id", user!.id)
    .maybeSingle();

  const { count: memoriesCount } = await supabase
    .from("memories")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id);

  if (!brain) {
    return (
      <>
        <TopBar title="Meu Cérebro" />
        <div className="px-4 pt-4">
          <BannerCerebroAutoral />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 py-16 text-center">
          <span className="flex size-16 items-center justify-center rounded-3xl bg-[image:var(--gradient-ai)] text-white shadow-[var(--shadow-glow-ai)]">
            <Brain className="size-7" />
          </span>
          <p className="text-base font-semibold text-foreground">O que a IA aprendeu sobre você</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Assim que houver memórias suficientes (pelo menos 3, extraídas dos seus documentos
            processados), gere sua primeira análise aqui.
          </p>
          <p className="text-xs text-muted-foreground">
            {memoriesCount ?? 0} memória{memoriesCount === 1 ? "" : "s"} disponível
            {memoriesCount === 1 ? "" : "eis"} até agora
          </p>
          <div className="mt-2">
            <GenerateBrainButton hasInsights={false} />
          </div>
        </div>
      </>
    );
  }

  const sections = (brain.sections ?? {}) as {
    temas?: string;
    conceitos?: string;
    historias?: string;
    evolucao?: string;
  };
  const writingStyle = (brain.writing_style ?? []) as string[];
  const recurringThemes = (brain.recurring_themes ?? []) as string[];
  const thinkingPatterns = (brain.thinking_patterns ?? []) as string[];

  return (
    <>
      <TopBar title="Meu Cérebro" />

      <div className="flex flex-col gap-5 px-4 pt-5 pb-8">
        <BannerCerebroAutoral />

        <Card>
          <CardContent className="flex flex-col gap-3 p-4">
            <div className="flex items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[image:var(--gradient-ai)] text-white shadow-[var(--shadow-glow-ai)]">
                <Brain className="size-5" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold">Memória analisada</p>
                <p className="text-xs text-muted-foreground">
                  A partir de {brain.memories_analyzed_count} memórias identificadas
                </p>
              </div>
              <p className="text-xl font-bold text-primary">{brain.memory_analyzed_percent}%</p>
            </div>
            <Progress value={brain.memory_analyzed_percent} />
          </CardContent>
        </Card>

        {brain.summary_quote && (
          <Card className="border-none bg-[image:var(--gradient-ai)] shadow-[var(--shadow-glow-ai)]">
            <CardContent className="p-4">
              <p className="text-sm italic text-white/95">&ldquo;{brain.summary_quote}&rdquo;</p>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="visao-geral">
          <TabsList className="flex-wrap">
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="estilo">Estilo</TabsTrigger>
            <TabsTrigger value="temas">Temas</TabsTrigger>
            <TabsTrigger value="conceitos">Conceitos</TabsTrigger>
            <TabsTrigger value="historias">Histórias</TabsTrigger>
            <TabsTrigger value="evolucao">Evolução</TabsTrigger>
          </TabsList>

          <TabsContent value="visao-geral" className="flex flex-col gap-3">
            <TagSection title="Meu estilo de escrita" tags={writingStyle} />
            <TagSection title="Temas recorrentes" tags={recurringThemes} />
            <TagSection title="Minha forma de pensar" tags={thinkingPatterns} />
          </TabsContent>

          <TabsContent value="estilo">
            <TagSection title="Meu estilo de escrita" tags={writingStyle} large />
          </TabsContent>

          <TabsContent value="temas" className="flex flex-col gap-3">
            <TagSection title="Temas recorrentes" tags={recurringThemes} large />
            <SectionText text={sections.temas} />
          </TabsContent>

          <TabsContent value="conceitos">
            <SectionText text={sections.conceitos} />
          </TabsContent>

          <TabsContent value="historias">
            <SectionText text={sections.historias} />
          </TabsContent>

          <TabsContent value="evolucao">
            <SectionText text={sections.evolucao} />
          </TabsContent>
        </Tabs>

        <p className="text-center text-xs text-muted-foreground">
          Baseado em IA · sujeito a revisão · gerado{" "}
          {brain.generated_at ? new Date(brain.generated_at).toLocaleDateString("pt-BR") : ""}
        </p>

        <div className="flex justify-center">
          <GenerateBrainButton hasInsights />
        </div>
      </div>
    </>
  );
}

function TagSection({ title, tags, large = false }: { title: string; tags: string[]; large?: boolean }) {
  if (tags.length === 0) return null;
  return (
    <Card>
      <CardContent className={large ? "p-5" : "p-4"}>
        <p className="mb-2.5 text-sm font-semibold">{title}</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant={tagVariantForLabel(tag)} className={large ? "text-sm" : undefined}>
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function BannerCerebroAutoral() {
  return (
    <Link href="/autoral">
      <Card className="border-none bg-[image:var(--gradient-ai)] shadow-[var(--shadow-glow-ai)] transition-transform duration-200 hover:-translate-y-0.5">
        <CardContent className="flex items-center gap-3 p-4">
          <Sparkles className="size-5 shrink-0 text-white" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Novo: Cérebro Autoral (beta)</p>
            <p className="text-xs text-white/85">
              Envie um livro ou texto e veja a IA de verdade estruturando, resumindo e identificando
              elementos — o início da metodologia consolidada.
            </p>
          </div>
          <ArrowRight className="size-4 shrink-0 text-white/80" />
        </CardContent>
      </Card>
    </Link>
  );
}

function SectionText({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-foreground">{text}</p>
      </CardContent>
    </Card>
  );
}
