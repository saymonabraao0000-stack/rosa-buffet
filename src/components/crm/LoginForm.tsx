"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/lib/crm/actions";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    loginAction,
    undefined,
  );

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-ink">
          Senha do CRM
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          className="focus-gold w-full rounded-lg border border-ink/15 bg-cream px-4 py-3 text-ink outline-none focus:border-gold"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="focus-gold rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-gold-soft disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
