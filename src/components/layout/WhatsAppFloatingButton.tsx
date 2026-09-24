"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { WhatsAppIcon } from "@/components/ui/SocialIcons";
import { buildWhatsappUrl } from "@/lib/site-config";

export default function WhatsAppFloatingButton() {
  const pathname = usePathname();
  // O /crm é uma ferramenta interna da equipe — o botão de "solicitar
  // orçamento" é pro visitante do site público, não faz sentido lá dentro.
  // /links tem o próprio botão de WhatsApp (página da bio do Instagram).
  if (pathname.startsWith("/crm") || pathname === "/links") return null;

  return (
    <motion.a
      href={buildWhatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Solicitar orçamento pelo WhatsApp"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, duration: 0.4, ease: "easeOut" }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="reveal focus-gold fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gold text-ink shadow-[0_10px_30px_-8px_rgba(201,162,39,0.7)] sm:bottom-8 sm:right-8"
    >
      <WhatsAppIcon className="h-8 w-8" aria-hidden="true" />
    </motion.a>
  );
}
