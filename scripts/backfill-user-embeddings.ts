// أي طالب أكمل Onboarding أو عدّل تفضيلاته قبل ما نبني حساب الـ embedding
// الحقيقي (initial/current) ضلّ بدون متجه. هاد سكربت هجرة (migration)
// بسيط بيعيد حساب المتجه لكل هيك حساب، باستخدام نفس تفضيلاته المحفوظة
// أصلاً (بدون ما يغيّرها).
//
// مع --all بيعيد الحساب لكل مين عندو تفضيلات، مو بس يلي متجهو فاضي —
// بيلزم لما يتبدّل الموديل نفسو، لأنو متجهات الموديل القديم ما بتتقارن
// بمتجهات الجديد (لازم كل الفضاء ينبنى بنفس الموديل).
//
// لازم خدمة الذكاء تكون شغالة على localhost:8000 قبل التشغيل.
// تشغيل: npx tsx scripts/backfill-user-embeddings.ts [--all]

import "dotenv/config";
import { prisma } from "../lib/prisma";
import { Prisma } from "../app/generated/prisma/client";
import { savePreferences, type Level, type Goal, type Style, type Pace } from "../lib/preferences";

const recomputeAll = process.argv.includes("--all");

async function main() {
  const users = await prisma.user.findMany({
    where: {
      level: { not: null },
      ...(recomputeAll
        ? {}
        : {
            OR: [
              { initialEmbedding: { equals: Prisma.AnyNull } },
              { currentEmbedding: { equals: Prisma.AnyNull } },
            ],
          }),
    },
    select: {
      id: true,
      name: true,
      level: true,
      learningGoal: true,
      learningStyle: true,
      weeklyTime: true,
      preferredContentType: true,
      clusters: { select: { clusterId: true } },
    },
  });

  console.log(
    recomputeAll
      ? `Recomputing embeddings for ${users.length} user(s).`
      : `Found ${users.length} user(s) needing a backfilled embedding.`,
  );

  for (const u of users) {
    if (u.clusters.length === 0) {
      console.log(`  skip ${u.name} (#${u.id}) — no selected topics to build from`);
      continue;
    }
    await savePreferences(u.id, {
      level: u.level as Level,
      goal: u.learningGoal as Goal,
      learningStyle: u.learningStyle as Style,
      weeklyTime: u.weeklyTime as Pace,
      preferredContentType: (u.preferredContentType as "video" | "article" | "both") ?? undefined,
      topicIds: u.clusters.map((c) => c.clusterId),
    });
    console.log(`  backfilled ${u.name} (#${u.id})`);
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
