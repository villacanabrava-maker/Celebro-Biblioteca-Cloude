"use client";

import { useState } from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function DocumentNotes({
  documentId,
  initialNotes,
}: {
  documentId: string;
  initialNotes: string | null;
}) {
  const supabase = createClient();
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const { error } = await supabase
      .from("documents")
      .update({ user_notes: notes })
      .eq("id", documentId);
    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Registre suas reflexões, ideias e comentários sobre este documento..."
        rows={8}
        className="w-full rounded-lg border border-input bg-card p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <Button onClick={handleSave} disabled={saving} className="self-start">
        {saved ? <Check className="size-4" /> : null}
        {saving ? "Salvando..." : saved ? "Salvo" : "Salvar anotação"}
      </Button>
    </div>
  );
}
