import { Feather } from "lucide-react";

import { cn } from "@/lib/utils";

export function Logo({
  className,
  withTagline = false,
  size = "default",
}: {
  className?: string;
  withTagline?: boolean;
  size?: "default" | "lg";
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "relative flex shrink-0 items-center justify-center rounded-xl bg-[image:var(--gradient-ai)] shadow-[var(--shadow-glow-ai)]",
          size === "lg" ? "size-12" : "size-8"
        )}
      >
        <Feather className={size === "lg" ? "size-6 text-white" : "size-4.5 text-white"} strokeWidth={2} />
      </span>
      <div className="flex flex-col leading-tight">
        <span className={cn("font-semibold text-white", size === "lg" ? "text-xl" : "text-base")}>
          Cérebro Biblioteca
        </span>
        {withTagline && (
          <span className="text-xs text-white/55">
            Seu acervo. Sua inteligência. Novas reflexões.
          </span>
        )}
      </div>
    </div>
  );
}
