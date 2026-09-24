// Service worker do CRM da Rosa Buffet — só para Web Push, sem cache offline.
// Registrado com escopo "/crm/" (ver ActivatePushForm em
// src/components/crm/PushSettings.tsx). Recebe o payload já decifrado pelo
// navegador (a criptografia aes128gcm acontece antes, no push service) e
// mostra a notificação nativa do sistema.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = { title: "Rosa Buffet", body: "Você tem um aviso novo." };
  try {
    if (event.data) data = event.data.json();
  } catch {
    // payload sem JSON válido: mantém o texto padrão acima
  }

  const title = data.title || "Rosa Buffet";
  const options = {
    body: data.body || "",
    icon: "/icons/crm-icon-192.png",
    badge: "/icons/crm-icon-192.png",
    tag: data.tag || "rosa-buffet",
    data: { url: data.url || "/crm" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data && event.notification.data.url ? event.notification.data.url : "/crm";

  event.waitUntil(
    (async () => {
      const clientsList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of clientsList) {
        if (client.url.includes("/crm") && "focus" in client) {
          await client.focus();
          if ("navigate" in client) {
            try {
              await client.navigate(targetUrl);
            } catch {
              // navegador não suporta client.navigate: já focou a janela, tudo bem
            }
          }
          return;
        }
      }
      await self.clients.openWindow(targetUrl);
    })(),
  );
});
