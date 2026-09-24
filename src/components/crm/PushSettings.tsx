"use client";

import { useEffect, useState, useSyncExternalStore, useTransition } from "react";

const subscribeNada = () => () => {};
import {
  getPushPublicKeyAction,
  listPushDevicesAction,
  removePushDeviceAction,
  sendTestPushAction,
  subscribePushAction,
  unsubscribePushAction,
  type PushDevice,
} from "@/lib/crm/push-actions";

// Ativação de Web Push nativo do CRM (PWA) — troca os avisos que iam por
// ntfy.sh (recusando com 429 nos IPs compartilhados da Cloudflare) por push
// direto do navegador. Ver src/lib/webpush.ts para a criptografia.

function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

function nomeAparelho(): string {
  const ua = navigator.userAgent;
  if (/iphone/i.test(ua)) return "iPhone";
  if (/ipad/i.test(ua)) return "iPad";
  if (/android/i.test(ua)) {
    if (/chrome/i.test(ua)) return "Android — Chrome";
    return "Android";
  }
  if (/windows/i.test(ua)) {
    if (/edg\//i.test(ua)) return "Windows — Edge";
    if (/chrome/i.test(ua)) return "Windows — Chrome";
    if (/firefox/i.test(ua)) return "Windows — Firefox";
    return "Windows";
  }
  if (/macintosh/i.test(ua)) {
    if (/chrome/i.test(ua)) return "Mac — Chrome";
    if (/safari/i.test(ua)) return "Mac — Safari";
    return "Mac";
  }
  return "Aparelho desconhecido";
}

function isIosStandaloneCapable(): { isIos: boolean; isStandalone: boolean } {
  const ua = navigator.userAgent;
  const isIos = /iphone|ipad|ipod/i.test(ua);
  // navigator.standalone é específico do Safari/iOS (fora do padrão TS de Navigator).
  const nav = navigator as Navigator & { standalone?: boolean };
  const isStandalone = nav.standalone === true || window.matchMedia("(display-mode: standalone)").matches;
  return { isIos, isStandalone };
}

function formatarData(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function PushSettings() {
  // useSyncExternalStore: no servidor (e na 1ª hidratação) usa o valor
  // "neutro" e só depois lê o navegador — sem erro de hidratação (#418).
  const suportado = useSyncExternalStore<boolean | null>(
    subscribeNada,
    () => "serviceWorker" in navigator && "PushManager" in window,
    () => null,
  );
  const iosForaDoApp = useSyncExternalStore(
    subscribeNada,
    () => {
      const { isIos, isStandalone } = isIosStandaloneCapable();
      return isIos && !isStandalone;
    },
    () => false,
  );
  const [inscritoNesteAparelho, setInscritoNesteAparelho] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagemTeste, setMensagemTeste] = useState<string | null>(null);
  const [dispositivos, setDispositivos] = useState<PushDevice[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const [testando, startTesteTransition] = useTransition();

  useEffect(() => {
    const suporta = typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;

    if (suporta) {
      navigator.serviceWorker.getRegistration("/crm/").then(async (reg) => {
        if (!reg) return;
        const sub = await reg.pushManager.getSubscription();
        setInscritoNesteAparelho(Boolean(sub));
      });
    }

    listPushDevicesAction()
      .then(setDispositivos)
      .catch(() => setDispositivos([]));
  }, []);

  function ativar() {
    setErro(null);
    startTransition(async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setErro("Permissão de notificação negada. Ative nas configurações do navegador para tentar de novo.");
          return;
        }

        const registration = await navigator.serviceWorker.register("/crm-sw.js", { scope: "/crm/" });
        await navigator.serviceWorker.ready;

        const publicKey = await getPushPublicKeyAction();
        let subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: base64UrlToUint8Array(publicKey) as unknown as BufferSource,
          });
        }

        const json = subscription.toJSON();
        const endpoint = json.endpoint;
        const p256dh = json.keys?.p256dh;
        const auth = json.keys?.auth;
        if (!endpoint || !p256dh || !auth) {
          setErro("Não deu para ler a inscrição do navegador.");
          return;
        }

        const result = await subscribePushAction({ endpoint, p256dh, auth, aparelho: nomeAparelho() });
        if (!result?.ok) {
          setErro(result?.error || "Não deu para salvar a inscrição.");
          return;
        }

        setInscritoNesteAparelho(true);
        setDispositivos(await listPushDevicesAction());
      } catch (err) {
        console.error("Ativar avisos falhou:", err);
        setErro("Não deu para ativar os avisos neste aparelho.");
      }
    });
  }

  function desativarNesteAparelho() {
    setErro(null);
    startTransition(async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration("/crm/");
        const subscription = await registration?.pushManager.getSubscription();
        if (subscription) {
          await unsubscribePushAction(subscription.endpoint);
          await subscription.unsubscribe();
        }
        setInscritoNesteAparelho(false);
        setDispositivos(await listPushDevicesAction());
      } catch (err) {
        console.error("Desativar avisos falhou:", err);
        setErro("Não deu para desativar os avisos neste aparelho.");
      }
    });
  }

  function removerDispositivo(id: string) {
    startTransition(async () => {
      await removePushDeviceAction(id);
      setDispositivos(await listPushDevicesAction());
    });
  }

  function enviarTeste() {
    setMensagemTeste(null);
    startTesteTransition(async () => {
      const result = await sendTestPushAction();
      if (!result) return;
      if (result.ok) {
        setMensagemTeste(`Enviado para ${result.enviados} aparelho(s).`);
      } else {
        setMensagemTeste(result.error || "Falha ao enviar.");
      }
    });
  }

  if (suportado === null) return null;

  if (!suportado && !iosForaDoApp) {
    return (
      <p className="text-sm text-cream/60">
        Este navegador não suporta avisos no celular. Tente pelo Chrome (Android) ou Safari (iPhone, dentro do app
        instalado).
      </p>
    );
  }

  if (iosForaDoApp) {
    return (
      <div className="rounded-lg border border-gold/30 bg-gold/10 p-4 text-sm text-cream/80">
        <p className="font-medium text-cream">No iPhone/iPad, os avisos só funcionam com o CRM instalado como app:</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Toque em Compartilhar (o ícone com a seta para cima)</li>
          <li>Escolha &quot;Adicionar à Tela de Início&quot;</li>
          <li>Abra o CRM pelo ícone que apareceu na tela de início</li>
          <li>Volte aqui em Configurações e ative os avisos</li>
        </ol>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {inscritoNesteAparelho ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-gold">Avisos ativados neste aparelho ✓</span>
          <button
            type="button"
            onClick={desativarNesteAparelho}
            disabled={isPending}
            className="focus-gold rounded-full border border-cream/20 px-4 py-2 text-xs text-cream/70 transition-colors hover:border-cream/40 disabled:opacity-60"
          >
            Desativar neste aparelho
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={ativar}
          disabled={isPending}
          className="focus-gold self-start rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-gold-soft disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Ativando..." : "Ativar avisos neste aparelho"}
        </button>
      )}

      {erro && <p className="text-sm text-red-400">{erro}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={enviarTeste}
          disabled={testando}
          className="focus-gold self-start rounded-full border border-cream/20 px-4 py-2 text-xs text-cream/70 transition-colors hover:border-cream/40 disabled:opacity-60"
        >
          {testando ? "Enviando..." : "Enviar aviso de teste"}
        </button>
        {mensagemTeste && <span className="text-xs text-cream/60">{mensagemTeste}</span>}
      </div>

      {dispositivos && dispositivos.length > 0 && (
        <div className="mt-2 flex flex-col gap-2">
          <p className="text-xs uppercase tracking-wide text-cream/40">Aparelhos cadastrados</p>
          {dispositivos.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-cream/10 bg-ink px-4 py-2.5 text-sm"
            >
              <div>
                <p className="text-cream">{d.aparelho || "Aparelho"}</p>
                <p className="text-xs text-cream/50">
                  Ativado em {formatarData(d.criadoEm)}
                  {d.ultimoOkEm && ` · último aviso recebido em ${formatarData(d.ultimoOkEm)}`}
                  {d.ultimoErro && !d.ultimoOkEm && ` · erro: ${d.ultimoErro}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removerDispositivo(d.id)}
                className="focus-gold shrink-0 rounded-full border border-cream/20 px-3 py-1.5 text-xs text-cream/60 transition-colors hover:border-red-400/60 hover:text-red-400"
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
