// استيراد ملف prisma/data/export.json لقاعدة Postgres المحدّدة بـ DATABASE_URL.
// لازم `npm run db:deploy` يكون مرق قبلو (الجداول لازم تكون موجودة).
// التشغيل: npm run db:import  [-- --reset]
import "dotenv/config";
import { readFileSync } from "node:fs";
import path from "node:path";
import { prisma } from "../lib/prisma";
import { TABLES } from "./db-tables";

const shouldReset = process.argv.includes("--reset");
const inPath = path.join("prisma", "data", "export.json");
const dump = JSON.parse(readFileSync(inPath, "utf8")) as Record<string, Record<string, unknown>[]>;

async function main() {
  if (shouldReset) {
    // بترتيب معكوس حتى ما تنكسر المفاتيح الأجنبية
    for (const table of [...TABLES].reverse()) {
      await prisma.$executeRawUnsafe(`DELETE FROM "${table.name}"`);
    }
    console.log("انمسحت البيانات القديمة\n");
  }

  for (const table of TABLES) {
    const rows = dump[table.name] ?? [];
    if (rows.length === 0) {
      console.log(`${table.name.padEnd(16)} 0 صف (فاضي)`);
      continue;
    }

    for (const row of rows) {
      for (const col of table.dates) {
        if (typeof row[col] === "string") row[col] = new Date(row[col] as string);
      }
    }

    const model = (prisma as unknown as Record<string, { createMany: (a: unknown) => Promise<{ count: number }> }>)[
      table.name.charAt(0).toLowerCase() + table.name.slice(1)
    ];
    const { count } = await model.createMany({ data: rows, skipDuplicates: true });
    console.log(`${table.name.padEnd(16)} ${count} صف`);

    // منعنا نمرّر id يدويًا، فالـ sequence لسا عند 1 — منحرّكو لآخر id مستعمل
    // حتى أول INSERT جديد ما يصطدم بمفتاح موجود.
    if (table.serial) {
      await prisma.$executeRawUnsafe(
        `SELECT setval(pg_get_serial_sequence('"${table.name}"', 'id'), COALESCE((SELECT MAX(id) FROM "${table.name}"), 1))`,
      );
    }
  }

  console.log("\nخلص الاستيراد.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
