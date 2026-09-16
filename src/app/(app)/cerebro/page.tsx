import { Brain } from "lucide-react";

import { TopBar } from "@/components/layout/top-bar";
import { ComingSoon } from "@/components/layout/coming-soon";

export default function CerebroPage() {
  return (
    <>
      <TopBar title="Meu Cérebro" />
      <ComingSoon
        icon={Brain}
        title="O que a IA aprendeu sobre você"
        description="Estilo de escrita, temas recorrentes e forma de pensar, sempre com evidências rastreáveis das suas memórias."
        fase="Fase 5"
      />
    </>
  );
}
