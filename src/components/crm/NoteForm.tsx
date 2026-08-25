"use client";

import { useRef, useTransition } from "react";
import { addNoteAction } from "@/lib/crm/actions";

export default function NoteForm({ leadId }: { leadId: string }) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={(formData: FormData) => {
        const text = String(formData.get("text") ?? "");
        if (!text.trim()) return;
        startTransition(async () => {
          await addNoteAction(leadId, text);
          formRef.current?.reset();
        });
      }}
      className="flex flex-col gap-2"
    >
      <textarea
        name="text"
        required
        rows={2}
        placeholder="Adicionar anotação..."
        className="focus-gold w-full rounded-lg border border-ink/15 bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-gold"
      />
      <button
        type="submit"
        disabled={isPending}
        className="focus-gold self-start rounded-full bg-ink px-4 py-2 text-xs font-semibold text-cream transition-colors hover:bg-ink-soft disabled:opacity-60"
      >
        {isPending ? "Salvando..." : "Adicionar anotação"}
      </button>
    </form>
  );
}
