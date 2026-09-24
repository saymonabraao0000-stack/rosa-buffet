"use client";

import { useRef, useState, useTransition } from "react";
import { Upload, Eye, EyeOff, Trash2 } from "lucide-react";
import {
  deleteReviewPrintAction,
  toggleReviewPrintVisibleAction,
  uploadReviewPrintAction,
} from "@/lib/crm/review-print-actions";
import type { ReviewPrintMeta } from "@/lib/crm/review-prints";

const MAX_WIDTH = 1080;
const WEBP_QUALITY = 0.82;

type UploadState = { total: number; current: number } | null;

/**
 * Redimensiona um arquivo de imagem no navegador (canvas), sem ampliar,
 * até no máximo MAX_WIDTH de largura, e exporta como WebP (fallback JPEG se
 * o navegador não suportar toBlob("image/webp")). Mantém a proporção.
 */
async function resizeImageFile(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas não suportado neste navegador.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const webpBlob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/webp", WEBP_QUALITY),
  );
  if (webpBlob) return { blob: webpBlob, width, height };

  // Fallback: navegador não suporta exportar WebP via canvas.
  const jpegBlob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/jpeg", WEBP_QUALITY),
  );
  if (!jpegBlob) throw new Error("Não foi possível processar a imagem.");
  return { blob: jpegBlob, width, height };
}

export default function PrintsUploader({ prints: initialPrints }: { prints: ReviewPrintMeta[] }) {
  const [prints, setPrints] = useState(initialPrints);
  const [uploadState, setUploadState] = useState<UploadState>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setErrors([]);
    setUploadState({ total: files.length, current: 0 });

    const newErrors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadState({ total: files.length, current: i + 1 });

      try {
        const { blob, width, height } = await resizeImageFile(file);

        const formData = new FormData();
        formData.set("file", blob, file.name);
        formData.set("width", String(width));
        formData.set("height", String(height));

        const result = await uploadReviewPrintAction(formData);
        if (!result.ok) {
          newErrors.push(`${file.name}: ${result.error}`);
        } else {
          setPrints((prev) => [
            {
              id: result.id,
              width,
              height,
              legenda: null,
              visivel: true,
              createdAt: new Date().toISOString(),
            },
            ...prev,
          ]);
        }
      } catch (err) {
        newErrors.push(`${file.name}: ${err instanceof Error ? err.message : "erro ao processar"}`);
      }
    }

    setUploadState(null);
    setErrors(newErrors);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleToggle = (id: string, visivel: boolean) => {
    setPrints((prev) => prev.map((p) => (p.id === id ? { ...p, visivel } : p)));
    startTransition(() => toggleReviewPrintVisibleAction(id, visivel));
  };

  const handleDelete = (id: string) => {
    if (!confirm("Excluir este print? Essa ação não pode ser desfeita.")) return;
    setPrints((prev) => prev.filter((p) => p.id !== id));
    startTransition(() => deleteReviewPrintAction(id));
  };

  return (
    <div>
      <label className="focus-gold flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-cream/20 bg-cream/5 px-4 py-8 text-center transition-colors hover:bg-cream/10">
        <Upload className="h-6 w-6 text-gold" aria-hidden="true" />
        <span className="text-sm font-semibold text-cream">Enviar prints de avaliações</span>
        <span className="text-xs text-cream/50">Toque para escolher uma ou mais imagens</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </label>

      {uploadState && (
        <p className="mt-3 text-sm text-cream/70">
          Enviando {uploadState.current} de {uploadState.total}…
        </p>
      )}

      {errors.length > 0 && (
        <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
          {errors.map((e, i) => (
            <p key={i} className="text-xs text-red-300">
              {e}
            </p>
          ))}
        </div>
      )}

      {prints.length === 0 ? (
        <p className="mt-6 text-sm text-cream/50">Nenhum print enviado ainda.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {prints.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-xl border border-cream/10 bg-cream/5">
              <div className="aspect-[3/4] overflow-hidden bg-ink/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/crm/prints/${p.id}`}
                  alt="Print de avaliação"
                  width={p.width}
                  height={p.height}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between gap-1 p-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    p.visivel ? "bg-green-500/15 text-green-300" : "bg-cream/10 text-cream/50"
                  }`}
                >
                  {p.visivel ? "No site" : "Oculto"}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleToggle(p.id, !p.visivel)}
                    aria-label={p.visivel ? "Ocultar do site" : "Mostrar no site"}
                    className="focus-gold rounded-full p-1.5 text-cream/70 transition-colors hover:bg-cream/10 disabled:opacity-60"
                  >
                    {p.visivel ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleDelete(p.id)}
                    aria-label="Excluir print"
                    className="focus-gold rounded-full p-1.5 text-red-300 transition-colors hover:bg-red-500/15 disabled:opacity-60"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
