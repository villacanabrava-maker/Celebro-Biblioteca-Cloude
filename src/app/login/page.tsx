"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleIcon } from "@/components/auth/google-icon";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError("E-mail ou senha incorretos. Tente novamente.");
      return;
    }
    router.push("/inicio");
    router.refresh();
  }

  async function handleGoogleLogin() {
    setError(null);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden bg-navy">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 40% at 15% 0%, var(--navy-glow), transparent), radial-gradient(50% 35% at 100% 20%, rgba(58,169,247,0.22), transparent)",
        }}
        aria-hidden
      />
      <div className="relative flex flex-1 flex-col justify-center px-6 py-10">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-9 flex justify-center">
            <Logo withTagline size="lg" className="flex-col items-center text-center" />
          </div>

          <div className="rounded-3xl bg-card p-6 shadow-[var(--shadow-lg)]">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" placeholder="seu@email.com" required />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-muted-foreground">
                  <input
                    type="checkbox"
                    name="remember"
                    className="size-4 rounded border-input accent-primary"
                  />
                  Lembrar de mim
                </label>
                <Link href="/recuperar-senha" className="font-medium text-primary hover:underline">
                  Esqueceu sua senha?
                </Link>
              </div>

              {error && (
                <p className="rounded-lg bg-destructive-muted px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button type="submit" size="lg" className="mt-1" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">ou</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <Button variant="outline" size="lg" className="w-full" onClick={handleGoogleLogin}>
              <GoogleIcon className="size-4" />
              Continuar com Google
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-white/60">
            Não tem uma conta?{" "}
            <Link href="/cadastro" className="font-medium text-white hover:underline">
              Criar uma conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
