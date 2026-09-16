import { Search } from "lucide-react";

import { TopBar } from "@/components/layout/top-bar";
import { ComingSoon } from "@/components/layout/coming-soon";

export default function BuscarPage() {
  return (
    <>
      <TopBar title="Buscar" />
      <ComingSoon
        icon={Search}
        title="Busca em todo o seu acervo"
        description="Encontre livros, reflexões, cartas, relatos e memórias em um só lugar."
        fase="Fase 3"
      />
    </>
  );
}
