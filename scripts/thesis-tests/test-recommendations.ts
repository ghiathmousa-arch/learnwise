// تست دالة التوصيات (lib/recommend.ts -> getRecommendationsForUser): بيعيد
// نفس منطق التسجيل والترتيب هون بدل ما يستورد lib/recommend.ts مباشرة،
// لأنها تستورد "server-only" اللي بيرمي خطأ برّا سياق بناء Next.js (نفس
// السبب يلي خلّى lib/embeddings.ts ولib/preferences.ts يتجنبوها — شوف
// التعليق بأول lib/embeddings.ts). المنطق هون مطابق تمامًا لما بترجعه
// getRecommendationsForUser فعليًا وقت الطلب الحقيقي بالموقع.
//
// تشغيل: npx tsx scripts/thesis-tests/test-recommendations.ts [userEmail]

import "dotenv/config";
import { Prisma } from "../../app/generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { cosineSimilarity } from "../../lib/embeddings";

const DURATION_CAP_MINUTES: Record<string, number | null> = {
  light: 20,
  balanced: 40,
  intensive: null,
};

async function main() {
  const email = process.argv[2];
  const limit = 10;

  const user = email
    ? await prisma.user.findUnique({ where: { email } })
    : await prisma.user.findFirst({
        where: { currentEmbedding: { not: Prisma.DbNull } },
        orderBy: { id: "asc" },
      });

  if (!user) {
    throw new Error("لم يتم إيجاد مستخدم عنده current_embedding.");
  }
  console.log(`المستخدم: ${user.name} <${user.email}> (id=${user.id})`);
  console.log(`المستوى: ${user.level}  |  الوقت الأسبوعي: ${user.weeklyTime}`);

  const userVec = user.currentEmbedding as number[];

  const allContent = await prisma.content.findMany({
    where: { embedding: { not: Prisma.DbNull } },
    select: {
      id: true,
      title: true,
      type: true,
      durationMinutes: true,
      difficultyLevel: true,
      embedding: true,
      cluster: { select: { label: true } },
    },
  });

  const scored = allContent.map((c) => ({
    ...c,
    clusterLabel: c.cluster?.label ?? null,
    score: cosineSimilarity(userVec, c.embedding as number[]),
  }));

  const durationCap = user.weeklyTime
    ? DURATION_CAP_MINUTES[user.weeklyTime]
    : null;
  const userLevel = user.level;

  function applyFilters(opts: { level: boolean; duration: boolean }) {
    return scored.filter((c) => {
      if (opts.level && userLevel && c.difficultyLevel !== userLevel) return false;
      if (opts.duration && durationCap !== null && c.durationMinutes > durationCap) return false;
      return true;
    });
  }

  const attempts = [
    { level: true, duration: true },
    { level: true, duration: false },
    { level: false, duration: false },
  ];
  let results = scored;
  for (const attempt of attempts) {
    results = applyFilters(attempt);
    if (results.length >= limit) break;
  }
  results.sort((a, b) => b.score - a.score);
  const recommended = results.slice(0, limit);

  console.log(`\nأعلى ${recommended.length} توصيات (مرتبة تنازليًا حسب cosine similarity):\n`);
  console.log(
    `${"#".padEnd(3)} ${"cosine".padEnd(8)} ${"المدة".padEnd(6)} ${"الموضوع".padEnd(16)} العنوان`,
  );
  console.log("-".repeat(90));

  recommended.forEach((item, idx) => {
    console.log(
      `${String(idx + 1).padEnd(3)} ${item.score.toFixed(4).padEnd(8)} ${String(
        item.durationMinutes + "د",
      ).padEnd(6)} ${(item.clusterLabel ?? "-").padEnd(16)} ${item.title.slice(0, 50)}`,
    );
  });

  const isDescending = recommended.every(
    (item, i) => i === 0 || item.score <= recommended[i - 1].score + 1e-9,
  );
  console.log(
    `\nمرتبة تنازليًا حسب cosine similarity: ${isDescending ? "نعم ✔" : "لا ✘"}`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
