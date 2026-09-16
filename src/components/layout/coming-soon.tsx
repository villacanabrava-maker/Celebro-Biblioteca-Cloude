import type { LucideIcon } from "lucide-react";

export function ComingSoon({
  icon: Icon,
  title,
  description,
  fase,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Quando definido, mostra o selo "Chega na {fase}" (ex.: "Fase 5"). Omita para estados vazios de algo que já funciona. */
  fase?: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 py-20 text-center">
      <span className="flex size-16 items-center justify-center rounded-3xl bg-[image:var(--gradient-ai)] text-white shadow-[var(--shadow-glow-ai)]">
        <Icon className="size-7" />
      </span>
      <p className="text-base font-semibold text-foreground">{title}</p>
      <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
      {fase && (
        <span className="mt-2 rounded-full bg-muted px-3.5 py-1 text-xs font-medium text-muted-foreground">
          Chega na {fase}
        </span>
      )}
    </div>
  );
}
