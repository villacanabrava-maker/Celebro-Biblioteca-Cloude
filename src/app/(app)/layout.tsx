import { BottomNav } from "@/components/layout/bottom-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col pb-20">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
