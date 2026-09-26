// Compacta uma imagem no navegador (canvas) antes do envio pelo CRM, para
// qualquer foto ou print caber no limite do servidor sem a equipe precisar
// mexer em nada: primeiro limita as dimensões, depois baixa a qualidade em
// passos e, se ainda não couber, encolhe a imagem e tenta de novo.

export type CompressOptions = {
  /** Limite de bytes do arquivo final (use uma folga abaixo do limite do servidor). */
  maxBytes: number;
  /** Largura máxima. */
  maxWidth: number;
  /** Altura máxima (prints compridos de conversa esbarram aqui). */
  maxHeight: number;
};

const START_QUALITY = 0.82;
const MIN_QUALITY = 0.5;
const QUALITY_STEP = 0.1;
const SHRINK = 0.8;
const MIN_SIDE = 320;

export async function compressImageFile(
  file: File,
  { maxBytes, maxWidth, maxHeight }: CompressOptions,
): Promise<{ blob: Blob; width: number; height: number }> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("Formato de imagem não reconhecido. Tente enviar como JPG ou PNG (ou um print da tela).");
  }

  let scale = Math.min(1, maxWidth / bitmap.width, maxHeight / bitmap.height);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas não suportado neste navegador.");

  const exportAs = (type: string, quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), type, quality));

  try {
    for (;;) {
      const width = Math.max(1, Math.round(bitmap.width * scale));
      const height = Math.max(1, Math.round(bitmap.height * scale));
      canvas.width = width;
      canvas.height = height;
      // Fundo branco: PNG com transparência viraria preto ao exportar em JPEG.
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(bitmap, 0, 0, width, height);

      // WebP quando o navegador exporta (Safari antigo não) — senão JPEG.
      let quality = START_QUALITY;
      let blob = await exportAs("image/webp", quality);
      const type = blob?.type === "image/webp" ? "image/webp" : "image/jpeg";
      if (type === "image/jpeg") blob = await exportAs(type, quality);
      if (!blob) throw new Error("Não foi possível processar a imagem.");

      while (blob.size > maxBytes && quality - QUALITY_STEP >= MIN_QUALITY) {
        quality -= QUALITY_STEP;
        blob = (await exportAs(type, quality)) ?? blob;
      }

      if (blob.size <= maxBytes) return { blob, width, height };
      if (Math.min(width, height) * SHRINK < MIN_SIDE) {
        throw new Error("Imagem grande demais mesmo depois de compactar.");
      }
      scale *= SHRINK;
    }
  } finally {
    bitmap.close?.();
  }
}
