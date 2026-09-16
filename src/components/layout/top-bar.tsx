import Link from "next/link";
import { Search } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "@/components/layout/logo";
import { createClient } from "@/lib/supabase/server";
import { getInitials } from "@/lib/format";

export async function TopBar({
  title,
  showLogo = false,
  initials,
}: {
  title?: string;
  showLogo?: boolean;
  initials?: string;
}) {
  let resolvedInitials = initials;

  if (!resolvedInitials) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    resolvedInitials = getInitials(user?.email ?? "?");
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-navy-border bg-navy/90 px-4 py-3.5 backdrop-blur-xl supports-[backdrop-filter]:bg-navy/75">
      {showLogo ? <Logo /> : <h1 className="truncate text-lg font-semibold text-white">{title}</h1>}
      <div className="flex shrink-0 items-center gap-2">
        <Link
          href="/buscar"
          className="flex size-9 items-center justify-center rounded-full text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-95"
          aria-label="Buscar"
        >
          <Search className="size-4.5" />
        </Link>
        <Link href="/configuracoes" aria-label="Configurações" className="transition-transform duration-200 active:scale-95">
          <Avatar className="size-9 ring-2 ring-white/10">
            <AvatarFallback className="bg-[image:var(--gradient-ai)] text-white">
              {resolvedInitials}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
