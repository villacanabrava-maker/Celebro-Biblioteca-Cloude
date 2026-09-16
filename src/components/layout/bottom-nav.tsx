"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, Home, Library, NotebookText, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/inicio", label: "Início", icon: Home },
  { href: "/biblioteca", label: "Biblioteca", icon: Library },
  { href: "/cerebro", label: "Cérebro", icon: Brain },
  { href: "/reflexao", label: "Reflexão", icon: Sparkles },
  { href: "/reflexoes", label: "Reflexões", icon: NotebookText },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/5 bg-navy pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-white" : "text-white/45 hover:text-white/70"
                )}
              >
                <Icon
                  className="size-5"
                  strokeWidth={active ? 2.25 : 1.75}
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
