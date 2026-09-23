import type { SVGProps } from "react";

/**
 * lucide-react removeu os ícones de marcas (Instagram, Facebook, etc.).
 * Estes ícones seguem o mesmo estilo visual (stroke, 24x24, cantos
 * arredondados) para manter consistência com os demais ícones do site.
 */

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

/**
 * Logo oficial do WhatsApp (glifo do telefone no balão), path do Simple
 * Icons. Preenchido de propósito (fill="currentColor"), diferente dos
 * outros ícones em stroke, porque é uma marca e precisa ser reconhecível.
 */
export function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12.02 2c-5.514 0-9.98 4.466-9.98 9.98 0 1.76.46 3.484 1.334 5.003l-1.42 5.183a.5.5 0 0 0 .612.612l5.183-1.42a9.95 9.95 0 0 0 5.003 1.334h.004c5.514 0 9.98-4.466 9.98-9.98s-4.466-9.98-9.98-9.98zm0 18.148h-.003a8.16 8.16 0 0 1-4.152-1.135l-.298-.177-3.077.843.845-3.076-.18-.301a8.17 8.17 0 0 1-1.246-4.322c0-4.508 3.67-8.178 8.178-8.178 4.508 0 8.178 3.67 8.178 8.178s-3.67 8.168-8.178 8.168z"/>
    </svg>
  );
}
