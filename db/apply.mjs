// Aplica db/schema.sql no banco apontado por DATABASE_URL.
// Uso: node --env-file=.env.local db/apply.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL não definida. Rode `vercel env pull .env.local` primeiro.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const schemaPath = fileURLToPath(new URL("./schema.sql", import.meta.url));
const schema = readFileSync(schemaPath, "utf8");

// Remove comentários linha a linha ANTES de dividir por ";" — senão um bloco
// de comentário emendado com o statement seguinte (sem linha em branco entre
// eles) engole o statement inteiro no filtro de comentário.
const withoutComments = schema
  .split("\n")
  .filter((line) => !line.trim().startsWith("--"))
  .join("\n");

const statements = withoutComments
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

for (const statement of statements) {
  console.log(`Executando: ${statement.slice(0, 60).replace(/\s+/g, " ")}...`);
  await sql.query(statement);
}

console.log(`OK: ${statements.length} statements aplicados.`);
