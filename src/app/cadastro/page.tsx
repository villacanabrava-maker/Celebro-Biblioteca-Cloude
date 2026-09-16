"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleIcon } from "@/components/auth/google-icon";
import { createClient } from "@/lib/supabase/client";

export default function CadastroPage() {
  const supabase = createClient();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("fullName"));
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    const confirmPassword = String(formData.get("confirmPassword"));

    if (password !== confirmPassword) {
      setLoading(false);
      setError("As senhas não coincidem.");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (error) {
      setError(error.message === "User already registered" ? "Este e-mail já tem uma conta." : "Não foi possível criar a conta. Tente novamente.");
      return;
    }
    setSuccess(true);
  }

  async function handleGoogleSignup() {
    setError(null);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="flex min-h-full flex-col bg-navy">
      <div className="flex flex-1 flex-col justify-center px-6 py-10">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex justify-center">
            <Logo withTagline className="flex-col items-center text-center" />
          </div>

          <div className="rounded-2xl bg-card p-6 shadow-xl">
            {success ? (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <p className="text-base font-semibold text-foreground">Quase lá!</p>
                <p className="text-sm text-muted-foreground">
                  Enviamos um link de confirmação para o seu e-mail. Abra-o para ativar
                  sua conta e fazer login.
                </p>
                <Link href="/login" className="mt-3 text-sm font-medium text-primary hover:underline">
                  Voltar para o login
                </Link>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="fullName">Nome completo</Label>
                    <Input id="fullName" name="fullName" type="text" placeholder="Seu nome" required />
                  </div>

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
                        placeholder="Mínimo de 6 caracteres"
                        className="pr-10"
                        minLength={6}
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

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="confirmPassword">Confirmar senha</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Repita a senha"
                      minLength={6}
                      required
                    />
                  </div>

                  {error && (
                    <p className="rounded-lg bg-destructive-muted px-3 py-2 text-sm text-destructive">
                      {error}
                    </p>
                  )}

                  <Button type="submit" size="lg" className="mt-1" disabled={loading}>
                    {loading ? "Criando conta..." : "Criar uma conta"}
                  </Button>
                </form>

                <div className="my-5 flex items-center gap-3">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">ou</span>
                  <span className="h-px flex-1 bg-border" />
                </div>

                <Button variant="outline" size="lg" className="w-full" onClick={handleGoogleSignup}>
                  <GoogleIcon className="size-4" />
                  Continuar com Google
                </Button>
              </>
            )}
          </div>

          {!success && (
            <p className="mt-6 text-center text-sm text-white/60">
              Já tem uma conta?{" "}
              <Link href="/login" className="font-medium text-white hover:underline">
                Entrar
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
