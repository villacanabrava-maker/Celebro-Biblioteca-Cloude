"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FilePlus2, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { FORMATOS_SUPORTADOS, TIPO_OBRA_LABELS, type Autoria, type TipoObra } from "@/lib/autoral/tipos";
import { cn } from "@/lib/utils";

const TIPO_OPCOES = Object.entries(TIPO_OBRA_LABELS) as [TipoObra, string][];
const TAMANHO_MAXIMO_BYTES = 40 * 1024 * 1024; // 40 MB

export function FormularioEnvioObra() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [titulo, setTitulo] = useState("");
  const [tipoObra, setTipoObra] = useState<TipoObra>("livro");
  const [autoria, setAutoria] = useState<Autoria>("autoral");
  const [autorOriginal, setAutorOriginal] = useState("");
  const [descricao, setDescricao] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [etapaAtual, setEtapaAtual] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);

    if (!titulo.trim()) {
      setErro("Dê um título para a obra.");
      return;
    }
    if (!arquivo) {
      setErro("Escolha um arquivo para enviar.");
      return;
    }
    const extensao = arquivo.name.split(".").pop()?.toLowerCase() ?? "";
    if (!FORMATOS_SUPORTADOS.includes(extensao as (typeof FORMATOS_SUPORTADOS)[number])) {
      setErro(`Formato não suportado. Use: ${FORMATOS_SUPORTADOS.join(", ")}.`);
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO_BYTES) {
      setErro("Arquivo muito grande (limite de 40 MB por enquanto).");
      return;
    }

    setEnviando(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setEnviando(false);
      setErro("Sua sessão expirou. Faça login novamente.");
      return;
    }

    try {
      setEtapaAtual("Verificando duplicidade...");
      const bufferHash = await arquivo.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", bufferHash);
      const hashSha256 = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const { data: duplicado } = await supabase
        .rpc("autoral_verificar_duplicado_hash", { p_hash_sha256: hashSha256 })
        .maybeSingle();
      if (duplicado) {
        const d = duplicado as { titulo_exibicao: string };
        throw new Error(`Este arquivo já está na sua biblioteca, em "${d.titulo_exibicao}".`);
      }

      setEtapaAtual("Enviando arquivo...");
      const caminhoArquivo = `${user.id}/${crypto.randomUUID()}/${arquivo.name}`;
      const { error: erroUpload } = await supabase.storage
        .from("originais-biblioteca")
        .upload(caminhoArquivo, arquivo);
      if (erroUpload) throw new Error("Não foi possível enviar o arquivo. Tente novamente.");

      setEtapaAtual("Registrando obra...");
      const resposta = await fetch("/api/autoral/obras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: titulo.trim(),
          tipoObra,
          autoria,
          autorOriginal: autoria === "externa" ? autorOriginal.trim() || null : null,
          descricao: descricao.trim() || null,
          nomeArquivo: arquivo.name,
          caminhoArquivo,
          tipoMime: arquivo.type || "application/octet-stream",
          extensao,
          tamanhoBytes: arquivo.size,
          hashSha256,
        }),
      });

      const json = (await resposta.json().catch(() => ({}))) as { error?: string; obraId?: string };
      if (!resposta.ok) throw new Error(json.error ?? "Não foi possível registrar a obra.");

      router.push(`/autoral/${json.obraId}`);
      router.refresh();
    } catch (err) {
      setEnviando(false);
      setEtapaAtual(null);
      setErro(err instanceof Error ? err.message : "Algo deu errado. Tente novamente.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4 pb-8 pt-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="titulo">Título</Label>
        <Input
          id="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Nome da obra"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tipo-obra">Tipo</Label>
        <select
          id="tipo-obra"
          value={tipoObra}
          onChange={(e) => setTipoObra(e.target.value as TipoObra)}
          className="h-11 w-full rounded-xl border border-input bg-muted/60 px-3.5 text-sm text-foreground transition-all duration-200 focus-visible:border-ring focus-visible:bg-card focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
        >
          {TIPO_OPCOES.map(([valor, rotulo]) => (
            <option key={valor} value={valor}>
              {rotulo}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Autoria</Label>
        <div className="flex gap-2 rounded-lg bg-muted p-1">
          <button
            type="button"
            onClick={() => setAutoria("autoral")}
            className={cn(
              "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
              autoria === "autoral" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
            )}
          >
            É meu (autoral)
          </button>
          <button
            type="button"
            onClick={() => setAutoria("externa")}
            className={cn(
              "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
              autoria === "externa" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
            )}
          >
            É de outro autor
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {autoria === "autoral"
            ? "Vai poder contribuir com o Núcleo Autoral do seu Cérebro."
            : "Fica como referência — não muda sua metodologia pessoal, a menos que você escolha incorporá-la depois."}
        </p>
      </div>

      {autoria === "externa" && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="autor-original">Autor original (opcional)</Label>
          <Input
            id="autor-original"
            value={autorOriginal}
            onChange={(e) => setAutorOriginal(e.target.value)}
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="descricao">Descrição (opcional)</Label>
        <textarea
          id="descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-input bg-muted/60 p-3.5 text-sm placeholder:text-muted-foreground transition-all duration-200 focus-visible:border-ring focus-visible:bg-card focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
        />
      </div>

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border py-8 text-center hover:border-primary hover:bg-accent/40"
      >
        <FilePlus2 className="size-7 text-muted-foreground" />
        <span className="text-sm font-medium">{arquivo ? arquivo.name : "Toque para escolher um arquivo"}</span>
        <span className="text-xs text-muted-foreground">PDF, DOCX, TXT ou MD — até 40 MB</span>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md"
          className="hidden"
          onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
        />
      </button>

      {erro && <p className="rounded-lg bg-destructive-muted px-3 py-2 text-sm text-destructive">{erro}</p>}

      <Button type="submit" size="lg" disabled={enviando} className="gap-2">
        {enviando ? (
          <>
            <UploadCloud className="size-4 animate-pulse" />
            {etapaAtual ?? "Enviando..."}
          </>
        ) : (
          "Enviar para o Cérebro Autoral"
        )}
      </Button>
    </form>
  );
}
