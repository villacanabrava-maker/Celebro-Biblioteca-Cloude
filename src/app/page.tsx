import { redirect } from "next/navigation";

export default function RootPage() {
  // TODO(fase 2): redirecionar para /inicio quando já houver sessão válida.
  redirect("/login");
}
