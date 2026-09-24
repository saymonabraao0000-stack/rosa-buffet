/**
 * Telefone mascarado pra exibição na lista de espera (item 9), ex.:
 * "(92) 9****-1234" — mostra DDD e os 4 últimos dígitos, esconde o meio.
 * Se o formato não for reconhecível (poucos dígitos), devolve o telefone
 * original sem mascarar, pra nunca quebrar a exibição.
 */
export function maskPhone(telefone: string): string {
  const digits = telefone.replace(/\D/g, "");
  const local = digits.length > 11 && digits.startsWith("55") ? digits.slice(2) : digits;
  if (local.length < 10) return telefone;

  const ddd = local.slice(0, 2);
  const rest = local.slice(2);
  const last4 = rest.slice(-4);
  const first = rest.length >= 9 ? rest[0] : "";
  return `(${ddd}) ${first}****-${last4}`;
}
