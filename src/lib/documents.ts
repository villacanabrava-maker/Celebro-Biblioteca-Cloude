import { BookOpen, File, FileText, Mail, Sparkles, type LucideIcon } from "lucide-react";

export type DocumentType = "livro" | "carta" | "relato" | "reflexao" | "outro";
export type DocumentStatus = "pendente" | "processando" | "processado" | "erro";

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  livro: "Livro",
  carta: "Carta",
  relato: "Relato",
  reflexao: "Reflexão",
  outro: "Outro",
};

export const DOCUMENT_TYPE_LABELS_PLURAL: Record<DocumentType, string> = {
  livro: "Livros",
  carta: "Cartas",
  relato: "Relatos",
  reflexao: "Reflexões",
  outro: "Outros",
};

export const DOCUMENT_TYPE_ICONS: Record<DocumentType, LucideIcon> = {
  livro: BookOpen,
  carta: Mail,
  relato: FileText,
  reflexao: Sparkles,
  outro: File,
};

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  pendente: "Pendente",
  processando: "Processando",
  processado: "Processado",
  erro: "Erro",
};

export function formatFileSize(bytes: number | null | undefined) {
  if (!bytes) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
