"use client";

import { useEffect } from "react";
import { registrarOrigem } from "@/lib/origem-visitante";

/** Registra de onde o visitante veio (ver origem-visitante.ts). Não renderiza nada. */
export default function OrigemTracker() {
  useEffect(() => {
    registrarOrigem();
  }, []);
  return null;
}
