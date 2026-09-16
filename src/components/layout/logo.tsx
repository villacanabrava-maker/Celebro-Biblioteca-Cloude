import { Feather } from "lucide-react";

import { cn } from "@/lib/utils";

export function Logo({
  className,
  withTagline = false,
}: {
  className?: string;
  withTagline?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
        <Feather className="size-4.5 text-white" strokeWidth={2} />
      </span>
      <div className="flex flex-col leading-tight">
        <span className="text-base font-semibold text-white">Cérebro Biblioteca</span>
        {withTagline && (
          <span className="text-xs text-white/60">
            Seu acervo. Sua inteligência. Novas reflexões.
          </span>
        )}
      </div>
    </div>
  );
}
