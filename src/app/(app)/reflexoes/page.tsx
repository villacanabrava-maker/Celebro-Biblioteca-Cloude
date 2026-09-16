import { NotebookText } from "lucide-react";

import { TopBar } from "@/components/layout/top-bar";
import { ComingSoon } from "@/components/layout/coming-soon";

export default function MinhasReflexoesPage() {
  return (
    <>
      <TopBar title="Minhas Reflexões" />
      <ComingSoon
        icon={NotebookText}
        title="Histórico das suas reflexões"
        description="Rascunhos, reflexões em revisão, aprovadas e incorporadas à sua biblioteca, tudo organizado por status."
        fase="Fase 6"
      />
    </>
  );
}
