import { CheckCircle2, CircleDashed, Loader2, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DOCUMENT_STATUS_LABELS, type DocumentStatus } from "@/lib/documents";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<DocumentStatus, string> = {
  pendente: "bg-muted text-muted-foreground",
  processando: "bg-accent text-accent-foreground",
  processado: "bg-success-muted text-success",
  erro: "bg-destructive-muted text-destructive",
};

const STATUS_ICONS = {
  pendente: CircleDashed,
  processando: Loader2,
  processado: CheckCircle2,
  erro: XCircle,
};

export function StatusBadge({ status }: { status: DocumentStatus }) {
  const Icon = STATUS_ICONS[status];
  return (
    <Badge className={cn(STATUS_STYLES[status])}>
      <Icon className={cn("size-3", status === "processando" && "animate-spin")} />
      {DOCUMENT_STATUS_LABELS[status]}
    </Badge>
  );
}
