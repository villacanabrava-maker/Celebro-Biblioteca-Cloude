import { notFound } from "next/navigation";

import { TopBar } from "@/components/layout/top-bar";
import { EditDocumentForm } from "@/components/library/edit-document-form";
import { createClient } from "@/lib/supabase/server";
import type { DocumentType } from "@/lib/documents";

export default async function EditarDocumentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: doc } = await supabase
    .from("documents")
    .select("id, title, author, year, type")
    .eq("id", id)
    .maybeSingle();

  if (!doc) notFound();

  return (
    <>
      <TopBar title="Editar informações" />
      <EditDocumentForm
        documentId={doc.id}
        initial={{
          title: doc.title,
          author: doc.author,
          year: doc.year,
          type: doc.type as DocumentType,
        }}
      />
    </>
  );
}
