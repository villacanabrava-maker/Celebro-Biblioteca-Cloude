"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  // TODO(fase 2): trocar por supabase.auth.signInWithPassword / signInWithOAuth.
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <div className="flex min-h-full flex-col bg-navy">
      <div className="flex flex-1 flex-col justify-center px-6 py-10">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex justify-center">
            <Logo withTagline className="flex-col items-center text-center" />
          </div>

          <div className="rounded-2xl bg-card p-6 shadow-xl">
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

              <Button type="submit" size="lg" className="mt-1">
                Entrar
              </Button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">ou</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <Button variant="outline" size="lg" className="w-full">
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

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.78-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11C3.25 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.37-2.28V6.61H1.27A11.99 11.99 0 0 0 0 12c0 1.94.46 3.77 1.27 5.39z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.61l4 3.11c.95-2.85 3.6-4.97 6.73-4.97z"
      />
    </svg>
  );
}
