// scripts/db-sql.mjs
// Helper para aplicar SQL manual à base de dados MariaDB/MySQL.
//
// Porquê: o `drizzle-kit push` parte no MariaDB (bug upstream de introspeção),
// por isso as alterações ao schema são aplicadas por SQL. Este script trata da
// ligação (lê o DATABASE_URL do .env.local) e aceita ficheiros ou SQL inline.
//
// Uso:
//   npm run db:sql -- caminho/para/ficheiro.sql
//   npm run db:sql -- "ALTER TABLE categoria ADD COLUMN nova_col INT DEFAULT 0"
//
// Nota: por segurança, statements destrutivos (DROP/TRUNCATE/DELETE) exigem a
// flag --force para evitarem enganos.

import { existsSync, readFileSync } from "node:fs";
import process from "node:process";
import mysql from "mysql2/promise";

function loadDatabaseUrl() {
  for (const file of [".env.local", ".env"]) {
    if (!existsSync(file)) continue;
    const match = readFileSync(file, "utf8").match(/^\s*DATABASE_URL\s*=\s*(.*)$/m);
    if (match) return match[1].trim().replace(/^["']|["']$/g, "");
  }
  return process.env.DATABASE_URL ?? "";
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const positional = args.filter((a) => a !== "--force");
  const input = positional[0];

  if (!input) {
    console.error("❌ Falta o SQL. Uso:");
    console.error('   npm run db:sql -- ficheiro.sql');
    console.error('   npm run db:sql -- "ALTER TABLE ..."');
    process.exit(1);
  }

  const sqlText = existsSync(input) ? readFileSync(input, "utf8") : input;

  if (!force && /\b(drop|truncate|delete)\b/i.test(sqlText)) {
    console.error(
      "⚠️  SQL contém DROP/TRUNCATE/DELETE. Se tens a certeza, repete com --force:",
    );
    console.error(`   npm run db:sql -- ${JSON.stringify(input)} --force`);
    process.exit(1);
  }

  const url = loadDatabaseUrl();
  if (!url) {
    console.error("❌ DATABASE_URL não encontrado (.env.local / .env).");
    process.exit(1);
  }

  const conn = await mysql.createConnection({ uri: url, multipleStatements: true });
  try {
    console.log(`🛠️  A executar SQL...\n${sqlText.trim()}\n`);
    const [result] = await conn.query(sqlText);
    // Um único statement devolve ou um array de linhas (SELECT/SHOW) ou um
    // ResultSetHeader (ALTER/INSERT/...). Múltiplos statements devolvem um array
    // desses. Normalizamos para tratar ambos os casos.
    const isHeader = (r) => r && typeof r.affectedRows === "number" && !Array.isArray(r);
    const blocks = Array.isArray(result) && result.every((r) => isHeader(r) || Array.isArray(r))
      ? result
      : [result];
    for (const block of blocks) {
      if (isHeader(block)) {
        console.log(`✅ OK — affectedRows: ${block.affectedRows}, warnings: ${block.warningStatus ?? 0}`);
      } else if (Array.isArray(block)) {
        console.log(`📄 ${block.length} linha(s):`);
        if (block.length) console.table(block);
      }
    }
    console.log("✅ Concluído.");
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error("❌ Erro:", err.sqlMessage || err.message || err);
  process.exit(1);
});
