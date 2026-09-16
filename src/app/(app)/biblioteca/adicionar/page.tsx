import { TopBar } from "@/components/layout/top-bar";
import { AddDocumentForm } from "@/components/library/add-document-form";

export default function AdicionarConteudoPage() {
  return (
    <>
      <TopBar title="Adicionar à Biblioteca" />
      <AddDocumentForm />
    </>
  );
}
