import Link from "next/link";
import { Search } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "@/components/layout/logo";

export function TopBar({
  title,
  showLogo = false,
  initials = "RB",
}: {
  title?: string;
  showLogo?: boolean;
  initials?: string;
}) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-navy px-4 py-3.5">
      {showLogo ? <Logo /> : <h1 className="text-lg font-semibold text-white">{title}</h1>}
      <div className="flex items-center gap-3">
        <Link
          href="/buscar"
          className="flex size-9 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Buscar"
        >
          <Search className="size-4.5" />
        </Link>
        <Link href="/configuracoes" aria-label="Configurações">
          <Avatar className="size-9 ring-1 ring-white/15">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
