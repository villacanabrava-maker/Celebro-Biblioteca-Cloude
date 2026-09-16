import { Settings } from "lucide-react";

import { TopBar } from "@/components/layout/top-bar";
import { ComingSoon } from "@/components/layout/coming-soon";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { createClient } from "@/lib/supabase/server";
import { getInitials } from "@/lib/format";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .maybeSingle();

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Usuário";

  return (
    <>
      <TopBar title="Configurações" />

      <div className="flex flex-col gap-4 px-4 pt-5">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Avatar className="size-12">
              <AvatarFallback className="bg-primary text-primary-foreground text-base">
                {getInitials(profile?.full_name ?? user?.email ?? "?")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">{displayName}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </CardContent>
        </Card>

        <SignOutButton />
      </div>

      <ComingSoon
        icon={Settings}
        title="Personalize sua experiência"
        description="Preferências, segurança, idioma e o modelo de IA usado nas análises chegam na Fase 7."
        fase="Fase 7"
      />
    </>
  );
}
