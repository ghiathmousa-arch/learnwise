// تصدير محتوى dev.db (SQLite) لملف JSON، تمهيدًا لاستيرادو بقاعدة Postgres.
// التشغيل: npm run db:export  [-- <مسار قاعدة sqlite>]
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { TABLES } from "./db-tables";

const dbPath = process.argv[2] ?? "dev.db";
const outPath = path.join("prisma", "data", "export.json");

if (!existsSync(dbPath)) {
  console.error(`ما لقيت قاعدة البيانات: ${dbPath}`);
  process.exit(1);
}

const db = new Database(dbPath, { readonly: true });
const dump: Record<string, unknown[]> = {};

for (const table of TABLES) {
  const rows = db.prepare(`SELECT * FROM "${table.name}"`).all() as Record<string, unknown>[];

  for (const row of rows) {
    for (const col of table.json) {
      if (typeof row[col] === "string") row[col] = JSON.parse(row[col] as string);
    }
    for (const col of table.booleans) {
      if (row[col] !== null && row[col] !== undefined) row[col] = Boolean(row[col]);
    }
  }

  dump[table.name] = rows;
  console.log(`${table.name.padEnd(16)} ${rows.length} صف`);
}

db.close();
mkdirSync(path.dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(dump, null, 2), "utf8");
console.log(`\nانكتب: ${outPath}`);
