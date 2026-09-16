import { Library } from "lucide-react";

import { TopBar } from "@/components/layout/top-bar";
import { ComingSoon } from "@/components/layout/coming-soon";

export default function BibliotecaPage() {
  return (
    <>
      <TopBar title="Biblioteca" />
      <ComingSoon
        icon={Library}
        title="Sua biblioteca pessoal"
        description="Aqui você vai organizar, buscar e adicionar livros, cartas, relatos e reflexões — com upload real para o Supabase."
        fase="Fase 3"
      />
    </>
  );
}
