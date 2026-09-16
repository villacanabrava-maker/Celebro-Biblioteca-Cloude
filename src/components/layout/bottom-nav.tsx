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
    <nav
      className="fixed inset-x-0 z-40 flex justify-center px-3"
      style={{ bottom: "max(0.875rem, env(safe-area-inset-bottom))" }}
    >
      <ul
        className="flex w-full max-w-sm items-stretch justify-between gap-0.5 rounded-full border border-navy-border bg-navy/85 px-1.5 py-1.5 shadow-[var(--shadow-lg)] backdrop-blur-xl supports-[backdrop-filter]:bg-navy/70"
      >
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 rounded-full py-2 text-[10.5px] font-medium transition-all duration-200",
                  active ? "text-white" : "text-white/45 hover:text-white/75"
                )}
              >
                {active && (
                  <span className="absolute inset-0 rounded-full bg-white/10" aria-hidden />
                )}
                <Icon className="relative size-[18px]" strokeWidth={active ? 2.25 : 1.75} />
                <span className="relative">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
