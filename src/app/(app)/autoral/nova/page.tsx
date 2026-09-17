import { TopBar } from "@/components/layout/top-bar";
import { FormularioEnvioObra } from "@/components/autoral/formulario-envio";

export default function NovaObraPage() {
  return (
    <>
      <TopBar title="Enviar obra" />
      <FormularioEnvioObra />
    </>
  );
}
