import { Settings } from "lucide-react";

import { TopBar } from "@/components/layout/top-bar";
import { ComingSoon } from "@/components/layout/coming-soon";

export default function ConfiguracoesPage() {
  return (
    <>
      <TopBar title="Configurações" />
      <ComingSoon
        icon={Settings}
        title="Personalize sua experiência"
        description="Perfil, preferências, segurança, idioma e o modelo de IA usado nas análises."
        fase="Fase 7"
      />
    </>
  );
}
