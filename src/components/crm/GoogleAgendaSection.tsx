"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { disconnectGoogleAction, syncAllFechadosAction, type GoogleActionState } from "@/lib/crm/google-actions";

type Props = {
  configured: boolean;
  connected: boolean;
  connectedEmail: string | null;
  connectedAt: string | null;
};

function formatDateHora(iso: string): string {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "America/Manaus",
    });
  } catch {
    return iso;
  }
}

export function GoogleAgendaSection({ configured, connected, connectedEmail, connectedAt }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const googleParam = searchParams.get("google");
  const [dismissed, setDismissed] = useState(false);

  const [syncState, syncAction, isSyncing] = useActionState<GoogleActionState, FormData>(
    syncAllFechadosAction,
    undefined,
  );

  // Limpa o `?google=ok|erro` da URL depois de mostrar o aviso, para não
  // reaparecer se a pessoa atualizar a página.
  useEffect(() => {
    if (googleParam) {
      const timeout = setTimeout(() => {
        setDismissed(true);
        router.replace("/crm/configuracoes");
      }, 6000);
      return () => clearTimeout(timeout);
    }
  }, [googleParam, router]);

  const callbackNotice =
    googleParam && !dismissed ? (
      <p
        className={`mb-4 rounded-lg border px-4 py-2 text-sm ${
          googleParam === "ok"
            ? "border-gold/30 bg-gold/10 text-gold"
            : "border-red-500/30 bg-red-500/10 text-red-300"
        }`}
      >
        {googleParam === "ok"
          ? "Google Agenda conectado com sucesso."
          : "Não foi possível conectar ao Google Agenda. Tente novamente."}
      </p>
    ) : null;

  if (!configured) {
    return (
      <div>
        {callbackNotice}
        <p className="text-sm text-cream/60">
          <span className="font-medium text-cream/80">Aguardando configuração técnica.</span>{" "}
          O Saymon ainda precisa cadastrar as credenciais do Google (Client ID/Secret) no Worker
          da Cloudflare. Assim que isso for feito, o botão de conectar aparece aqui.
        </p>
      </div>
    );
  }

  if (!connected) {
    return (
      <div>
        {callbackNotice}
        <p className="mb-4 text-sm text-cream/60">
          Conecte a agenda do Google da Rosa Buffet para criar e atualizar automaticamente um
          evento para cada festa fechada.
        </p>
        <a
          href="/crm/google/conectar"
          className="focus-gold inline-block rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-gold-soft"
        >
          Conectar Google Agenda
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {callbackNotice}
      <p className="text-sm text-cream/70">
        Conectado{connectedEmail ? ` como ${connectedEmail}` : ""}
        {connectedAt ? ` desde ${formatDateHora(connectedAt)}` : ""}.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <form action={syncAction}>
          <button
            type="submit"
            disabled={isSyncing}
            className="focus-gold rounded-full border border-gold/40 px-5 py-2.5 text-sm font-semibold text-gold transition-colors hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSyncing ? "Sincronizando..." : "Sincronizar agora"}
          </button>
        </form>

        <form action={disconnectGoogleAction}>
          <button
            type="submit"
            className="focus-gold rounded-full border border-cream/15 px-5 py-2.5 text-sm text-cream/70 transition-colors hover:border-red-400/40 hover:text-red-300"
          >
            Desconectar
          </button>
        </form>
      </div>

      {syncState?.mensagem && (
        <p className={`text-sm ${syncState.ok ? "text-gold" : "text-red-300"}`}>{syncState.mensagem}</p>
      )}
      {syncState?.error && <p className="text-sm text-red-300">{syncState.error}</p>}
    </div>
  );
}
