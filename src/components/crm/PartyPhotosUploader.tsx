"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { Upload, Eye, EyeOff, Trash2 } from "lucide-react";
import { portfolioCategories } from "@/lib/portfolio-data";
import {
  deletePartyPhotoAction,
  togglePartyPhotoVisibleAction,
  updatePartyPhotoTemaAction,
  uploadPartyPhotoAction,
} from "@/lib/crm/party-photos-actions";
import type { PartyPhotoMeta } from "@/lib/crm/party-photos";
import { compressImageFile } from "@/lib/compress-image";

// O servidor aceita até 900 KB (party-photos.ts); fica uma folga para o
// arquivo nunca ser recusado.
const COMPRESS = { maxBytes: 850 * 1024, maxWidth: 1600, maxHeight: 1600 };

type UploadState = { total: number; current: number } | null;

export default function PartyPhotosUploader({ photos: initialPhotos }: { photos: PartyPhotoMeta[] }) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [uploadTema, setUploadTema] = useState(portfolioCategories[0]?.slug ?? "");
  const [filterTema, setFilterTema] = useState<string>("todas");
  const [uploadState, setUploadState] = useState<UploadState>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const temaLabel = (slug: string) => portfolioCategories.find((c) => c.slug === slug)?.label ?? slug;

  const visiblePhotos = useMemo(
    () => (filterTema === "todas" ? photos : photos.filter((p) => p.tema === filterTema)),
    [photos, filterTema],
  );

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
        const { blob, width, height } = await compressImageFile(file, COMPRESS);

        const formData = new FormData();
        formData.set("blob", blob, file.name);
        formData.set("tema", uploadTema);
        formData.set("width", String(width));
        formData.set("height", String(height));

        const result = await uploadPartyPhotoAction(formData);
        if (result.error) {
          newErrors.push(`${file.name}: ${result.error}`);
        } else {
          setPhotos((prev) => [
            {
              id: crypto.randomUUID(),
              tema: uploadTema,
              mime: blob.type,
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
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, visivel } : p)));
    startTransition(() => togglePartyPhotoVisibleAction(id, visivel));
  };

  const handleTema = (id: string, tema: string) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, tema } : p)));
    startTransition(() => {
      void updatePartyPhotoTemaAction(id, tema);
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Excluir esta foto? Essa ação não pode ser desfeita.")) return;
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    startTransition(() => deletePartyPhotoAction(id));
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="upload-tema" className="mb-1.5 block text-xs font-medium text-cream/60">
            Tema das fotos
          </label>
          <select
            id="upload-tema"
            value={uploadTema}
            onChange={(e) => setUploadTema(e.target.value)}
            className="focus-gold w-full rounded-lg border border-cream/15 bg-ink px-3 py-2.5 text-sm text-cream"
          >
            {portfolioCategories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="focus-gold mt-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-cream/20 bg-cream/5 px-4 py-8 text-center transition-colors hover:bg-cream/10">
        <Upload className="h-6 w-6 text-gold" aria-hidden="true" />
        <span className="text-sm font-semibold text-cream">Enviar fotos da festa</span>
        <span className="text-xs text-cream/50">Toque para escolher uma ou mais fotos</span>
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

      <div className="mt-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilterTema("todas")}
          className={`focus-gold rounded-full px-3 py-1.5 text-xs font-medium ${
            filterTema === "todas" ? "bg-gold text-ink" : "bg-cream/10 text-cream/70"
          }`}
        >
          Todas ({photos.length})
        </button>
        {portfolioCategories.map((c) => {
          const count = photos.filter((p) => p.tema === c.slug).length;
          return (
            <button
              key={c.slug}
              type="button"
              onClick={() => setFilterTema(c.slug)}
              className={`focus-gold rounded-full px-3 py-1.5 text-xs font-medium ${
                filterTema === c.slug ? "bg-gold text-ink" : "bg-cream/10 text-cream/70"
              }`}
            >
              {c.label} ({count})
            </button>
          );
        })}
      </div>

      {visiblePhotos.length === 0 ? (
        <p className="mt-6 text-sm text-cream/50">Nenhuma foto enviada ainda.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visiblePhotos.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-xl border border-cream/10 bg-cream/5">
              <div className="aspect-square overflow-hidden bg-ink/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/fotos/${p.id}`}
                  alt={`Foto de festa (${temaLabel(p.tema)})`}
                  width={p.width}
                  height={p.height}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-2 p-2">
                <select
                  value={p.tema}
                  disabled={isPending}
                  onChange={(e) => handleTema(p.id, e.target.value)}
                  className="focus-gold w-full rounded-md border border-cream/15 bg-ink px-2 py-1 text-[11px] text-cream disabled:opacity-60"
                >
                  {portfolioCategories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      p.visivel ? "bg-green-500/15 text-green-300" : "bg-cream/10 text-cream/50"
                    }`}
                  >
                    {p.visivel ? "No site" : "Oculta"}
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
                      aria-label="Excluir foto"
                      className="focus-gold rounded-full p-1.5 text-red-300 transition-colors hover:bg-red-500/15 disabled:opacity-60"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
