import { Sparkles } from "lucide-react";

import { TopBar } from "@/components/layout/top-bar";
import { ComingSoon } from "@/components/layout/coming-soon";

export default function CriarReflexaoPage() {
  return (
    <>
      <TopBar title="Criar Reflexão" />
      <ComingSoon
        icon={Sparkles}
        title="Do externo ao seu novo texto"
        description="Traga um texto, arquivo ou link, conecte com suas memórias e deixe a IA gerar uma reflexão personalizada para você revisar."
        fase="Fase 6"
      />
    </>
  );
}
