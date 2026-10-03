import type { ReactNode } from "react";

// O template remonta a cada navegação: cada área "abre" com um zoom curto,
// como um aplicativo saindo do ícone da tela de entrada.
export default function CrmTemplate({ children }: { children: ReactNode }) {
  return <div className="animate-abrir-app">{children}</div>;
}
