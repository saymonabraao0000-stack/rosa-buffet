import "server-only";
import { sql } from "@/lib/db/client";

// Item 6 — trava de login por IP: 5 falhas em 15 min bloqueia por 15 min.
const MAX_ATTEMPTS = 5;

/** true se o IP já tem 5 (ou mais) falhas registradas nos últimos 15 minutos. */
export async function isIpBlocked(ip: string): Promise<boolean> {
  const rows = await sql`
    select count(*)::int as total
    from login_attempts
    where ip = ${ip} and created_at >= now() - interval '15 minutes'
  `;
  return (rows[0]?.total ?? 0) >= MAX_ATTEMPTS;
}

/**
 * Grava a falha e aproveita para limpar o lixo (registros com mais de 1 dia,
 * de qualquer IP) — limpeza oportunista, sem cron dedicado.
 */
export async function registerFailedAttempt(ip: string): Promise<void> {
  await sql`insert into login_attempts (ip) values (${ip})`;
  await sql`delete from login_attempts where created_at < now() - interval '1 day'`;
}

/** Acertou a senha: some com o histórico de falhas daquele IP. */
export async function clearAttemptsForIp(ip: string): Promise<void> {
  await sql`delete from login_attempts where ip = ${ip}`;
}
