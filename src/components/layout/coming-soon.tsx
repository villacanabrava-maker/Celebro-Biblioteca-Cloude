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
  fase: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 py-20 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
        <Icon className="size-6" />
      </span>
      <p className="text-base font-semibold text-foreground">{title}</p>
      <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
      <span className="mt-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
        Chega na {fase}
      </span>
    </div>
  );
}
