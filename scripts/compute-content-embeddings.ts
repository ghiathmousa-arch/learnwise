// يحسب embedding حقيقي (عنوان + وصف) لكل عنصر بجدول Content ما إلو embedding
// بعد، ويخزّنو. لازم خدمة الذكاء (ai-service) تكون شغالة على localhost:8000
// قبل ما تشغّل هاد السكربت.
//
// تشغيل: npx tsx scripts/compute-content-embeddings.ts

import "dotenv/config";
import { prisma } from "../lib/prisma";
import { embedTexts } from "../lib/embeddings";

const BATCH_SIZE = 50;

async function main() {
  const content = await prisma.content.findMany({
    select: { id: true, title: true, description: true },
  });

  console.log(`Found ${content.length} content rows total.`);

  let updated = 0;
  for (let i = 0; i < content.length; i += BATCH_SIZE) {
    const batch = content.slice(i, i + BATCH_SIZE);
    const texts = batch.map((c) => `${c.title}. ${c.description}`);
    const vectors = await embedTexts(texts);

    await prisma.$transaction(
      batch.map((c, idx) =>
        prisma.content.update({
          where: { id: c.id },
          data: { embedding: vectors[idx] },
        }),
      ),
    );

    updated += batch.length;
    console.log(`  embedded ${updated} / ${content.length}`);
  }

  console.log("Done.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
