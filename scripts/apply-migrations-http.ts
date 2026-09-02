// بيطبّق ملفات prisma/migrations على القاعدة عبر Neon SQL over HTTP (منفذ 443)،
// وبيسجّلها بجدول _prisma_migrations متل ما بيعمل `prisma migrate deploy`.
//
// ليش موجود: محرّك الهجرات تبع Prisma بيوصل بـ TCP على المنفذ 5432، وهاد
// المنفذ محجوب على بعض شبكات المزوّدين. من CI أو أي شبكة عادية استخدمي
// `npm run db:deploy` مباشرة — هاد السكربت بديل لنفس النتيجة بس عبر HTTPS.
//
// التشغيل: npm run db:deploy:http
import "dotenv/config";
import { createHash, randomUUID } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
if (!connectionString) throw new Error("DATABASE_URL غير محدد");

const sql = neon(connectionString);
const MIGRATIONS_DIR = path.join("prisma", "migrations");

// بنقسم السكربت لعبارات مفردة: واجهة HTTP بتنفّذ عبارة وحدة بالطلب.
// منشيل أسطر التعليق أول شي، لأنو كل عبارة بملفات Prisma بتبلّش بسطر
// `-- CreateTable` وما بتمرق مع الواجهة لو تركناه.
function splitStatements(script: string): string[] {
  return script
    .split(/\r?\n/)
    .filter((line) => !/^\s*--/.test(line))
    .join("\n")
    .split(";")
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);
}

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id" VARCHAR(36) PRIMARY KEY,
      "checksum" VARCHAR(64) NOT NULL,
      "finished_at" TIMESTAMPTZ,
      "migration_name" VARCHAR(255) NOT NULL,
      "logs" TEXT,
      "rolled_back_at" TIMESTAMPTZ,
      "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "applied_steps_count" INTEGER NOT NULL DEFAULT 0
    )
  `;

  const applied = new Set(
    ((await sql`SELECT migration_name FROM "_prisma_migrations" WHERE finished_at IS NOT NULL`) as {
      migration_name: string;
    }[]).map((row) => row.migration_name),
  );

  const names = readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const name of names) {
    if (applied.has(name)) {
      console.log(`${name} — مطبّقة سابقًا، تخطّي`);
      continue;
    }

    const script = readFileSync(path.join(MIGRATIONS_DIR, name, "migration.sql"), "utf8");
    const statements = splitStatements(script);
    console.log(`${name} — ${statements.length} عبارة`);

    for (const statement of statements) {
      await sql.query(statement);
    }

    await sql`
      INSERT INTO "_prisma_migrations" (id, checksum, migration_name, finished_at, applied_steps_count)
      VALUES (
        ${randomUUID()},
        ${createHash("sha256").update(script).digest("hex")},
        ${name},
        now(),
        ${statements.length}
      )
    `;
    console.log(`${name} — تمّت`);
  }

  console.log("\nكل الهجرات مطبّقة.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
