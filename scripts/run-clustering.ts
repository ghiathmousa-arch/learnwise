// يشغّل K-Means حقيقي على embeddings المحتوى، وبعدين يطابق كل تجمّع ناتج
// (رقمي بلا اسم) مع أقرب اسم من الـ 8 مواضيع الموجودة أصلاً بجدول Cluster
// (بمقارنة مركز التجمّع مع embedding اسم الموضوع نفسه). هيك منحافظ على
// نفس الأسماء العربية يلي الطلاب أصلاً اختاروها وقت الـ Onboarding، بس
// التصنيف الفعلي لكل محتوى يصير حسب المعنى الحقيقي مش تخمين كلمات مفتاحية.
//
// لازم خدمة الذكاء تكون شغالة على localhost:8000 قبل التشغيل.
// لازم كمان compute-content-embeddings.ts يكون خلص قبلها.
//
// تشغيل: npx tsx scripts/run-clustering.ts

import "dotenv/config";
import { prisma } from "../lib/prisma";
import { Prisma } from "../app/generated/prisma/client";
import { embedTexts, clusterVectors, cosineSimilarity } from "../lib/embeddings";

const K = 8;

function greedyMatch(simMatrix: number[][]): number[] {
  const n = simMatrix.length;
  const pairs: { i: number; j: number; sim: number }[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      pairs.push({ i, j, sim: simMatrix[i][j] });
    }
  }
  pairs.sort((a, b) => b.sim - a.sim);

  const usedRows = new Set<number>();
  const usedCols = new Set<number>();
  const assignment = new Array(n).fill(-1);

  for (const p of pairs) {
    if (usedRows.has(p.i) || usedCols.has(p.j)) continue;
    assignment[p.i] = p.j;
    usedRows.add(p.i);
    usedCols.add(p.j);
    if (usedRows.size === n) break;
  }
  return assignment;
}

async function main() {
  const content = await prisma.content.findMany({
    where: { embedding: { not: Prisma.AnyNull } },
    select: { id: true, embedding: true },
  });

  if (content.length < K) {
    throw new Error(`Not enough content with embeddings (${content.length}) for K=${K}`);
  }
  console.log(`Clustering ${content.length} content items into ${K} groups...`);

  const vectors = content.map((c) => c.embedding as number[]);
  const { labels, centroids } = await clusterVectors(vectors, K);

  const clusters = await prisma.cluster.findMany({ select: { id: true, label: true } });
  if (clusters.length !== K) {
    throw new Error(`Expected ${K} seeded Cluster rows, found ${clusters.length}`);
  }

  console.log("Matching K-Means centroids to existing topic names...");
  const labelVectors = await embedTexts(clusters.map((c) => c.label));

  // مصفوفة تشابه: صف = تجمّع K-Means رقم i، عمود = اسم موضوع موجود رقم j
  const simMatrix = centroids.map((centroid) =>
    labelVectors.map((labelVec) => cosineSimilarity(centroid, labelVec)),
  );
  const matchedClusterIndexForKMeansGroup = greedyMatch(simMatrix);

  console.log("\nMatch results:");
  matchedClusterIndexForKMeansGroup.forEach((clusterIdx, kmeansGroup) => {
    const sim = simMatrix[kmeansGroup][clusterIdx];
    console.log(
      `  K-Means group ${kmeansGroup} -> "${clusters[clusterIdx].label}" (sim=${sim.toFixed(3)})`,
    );
  });

  console.log("\nUpdating centroidEmbedding for each topic...");
  for (let kmeansGroup = 0; kmeansGroup < K; kmeansGroup++) {
    const clusterIdx = matchedClusterIndexForKMeansGroup[kmeansGroup];
    await prisma.cluster.update({
      where: { id: clusters[clusterIdx].id },
      data: { centroidEmbedding: centroids[kmeansGroup] },
    });
  }

  console.log("Reassigning clusterId for every content item based on real similarity...");
  // منجمّع العناصر حسب التجمّع ومنعمل updateMany لكل تجمّع: ٨ عبارات بدل
  // عبارة لكل عنصر. مع قاعدة بيانات بعيدة، الفرق بين ٨ رحلات شبكة و١٨٩
  // هو الفرق بين ثانية ومعاملة بتتخطى مهلتها.
  const idsByCluster = new Map<number, number[]>();
  content.forEach((c, idx) => {
    const clusterIdx = matchedClusterIndexForKMeansGroup[labels[idx]];
    const newClusterId = clusters[clusterIdx].id;
    const bucket = idsByCluster.get(newClusterId);
    if (bucket) bucket.push(c.id);
    else idsByCluster.set(newClusterId, [c.id]);
  });

  await prisma.$transaction(
    [...idsByCluster].map(([clusterId, ids]) =>
      prisma.content.updateMany({
        where: { id: { in: ids } },
        data: { clusterId },
      }),
    ),
  );

  const counts = await prisma.content.groupBy({
    by: ["clusterId"],
    _count: true,
  });
  console.log("\nFinal distribution:");
  for (const row of counts) {
    const label = clusters.find((c) => c.id === row.clusterId)?.label ?? "(none)";
    console.log(`  ${label}: ${row._count}`);
  }

  console.log("\nDone.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
