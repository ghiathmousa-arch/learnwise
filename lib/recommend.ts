import "server-only";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";
import { cosineSimilarity } from "@/lib/embeddings";
import type { Pace, ContentType } from "@/lib/preferences";

// الحد الأقصى لطول المحتوى (دقائق) حسب الوقت الأسبوعي المتاح — تقدير
// معقول لعدم اقتراح دروس طويلة على طالب وقتو محدود. "intensive" بدون حد.
const DURATION_CAP_MINUTES: Record<Pace, number | null> = {
  light: 20,
  balanced: 40,
  intensive: null,
};

type ScoredContent = {
  id: number;
  title: string;
  type: string;
  thumbnailUrl: string | null;
  durationMinutes: number;
  difficultyLevel: string;
  clusterLabel: string | null;
  score: number;
};

export type RecommendationItem = {
  id: number;
  title: string;
  type: "video" | "article";
  thumbnailUrl: string | null;
  durationMinutes: number;
  clusterLabel: string | null;
};

/**
 * ترشيح المحتوى لطالب معيّن: تشابه جيبي (cosine) بين current_embedding
 * تبعو ومتجه كل محتوى، وبعدين فلترة حسب المستوى/الوقت/نوع المحتوى
 * المفضّل. لو الفلاتر الثلاثة مع بعض ما عطت نتائج كافية (مجموعة المحتوى
 * الحالية صغيرة، ١٨٩ عنصر بس)، منرخّي الفلاتر تدريجيًا بدل ما نرجّع نتيجة
 * فاضية — الأولوية دايمًا للتشابه الدلالي، والفلاتر تحسين فوقه مش شرط قاطع.
 */
export async function getRecommendationsForUser(
  userId: number,
  limit: number,
): Promise<RecommendationItem[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentEmbedding: true,
      level: true,
      weeklyTime: true,
      preferredContentType: true,
    },
  });

  const userVec = user?.currentEmbedding as number[] | null;

  if (!userVec) {
    // طالب ما إلو متجه بعد (نادر — قبل إكمال Onboarding) → أحدث محتوى فقط
    const recent = await prisma.content.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        title: true,
        type: true,
        thumbnailUrl: true,
        durationMinutes: true,
        cluster: { select: { label: true } },
      },
    });
    return recent.map((c) => ({
      id: c.id,
      title: c.title,
      type: c.type as "video" | "article",
      thumbnailUrl: c.thumbnailUrl,
      durationMinutes: c.durationMinutes,
      clusterLabel: c.cluster?.label ?? null,
    }));
  }

  const allContent = await prisma.content.findMany({
    where: { embedding: { not: Prisma.AnyNull } },
    select: {
      id: true,
      title: true,
      type: true,
      thumbnailUrl: true,
      durationMinutes: true,
      difficultyLevel: true,
      embedding: true,
      cluster: { select: { label: true } },
    },
  });

  const scored: ScoredContent[] = allContent.map((c) => ({
    id: c.id,
    title: c.title,
    type: c.type,
    thumbnailUrl: c.thumbnailUrl,
    durationMinutes: c.durationMinutes,
    difficultyLevel: c.difficultyLevel,
    clusterLabel: c.cluster?.label ?? null,
    score: cosineSimilarity(userVec, c.embedding as number[]),
  }));

  const durationCap = user?.weeklyTime
    ? DURATION_CAP_MINUTES[user.weeklyTime as Pace]
    : null;
  const preferredType = user?.preferredContentType as ContentType | null;

  function applyFilters(opts: {
    level: boolean;
    duration: boolean;
    type: boolean;
  }) {
    return scored.filter((c) => {
      if (opts.level && user?.level && c.difficultyLevel !== user.level) {
        return false;
      }
      if (opts.duration && durationCap !== null && c.durationMinutes > durationCap) {
        return false;
      }
      if (
        opts.type &&
        preferredType &&
        preferredType !== "both" &&
        c.type !== preferredType
      ) {
        return false;
      }
      return true;
    });
  }

  // تخفيف تدريجي للفلاتر لحد ما نوصل لعدد كافي من النتائج
  const attempts = [
    { level: true, duration: true, type: true },
    { level: true, duration: true, type: false },
    { level: true, duration: false, type: false },
    { level: false, duration: false, type: false },
  ];

  let results: ScoredContent[] = [];
  for (const attempt of attempts) {
    results = applyFilters(attempt);
    if (results.length >= limit) break;
  }

  results.sort((a, b) => b.score - a.score);

  return results.slice(0, limit).map((c) => ({
    id: c.id,
    title: c.title,
    type: c.type as "video" | "article",
    thumbnailUrl: c.thumbnailUrl,
    durationMinutes: c.durationMinutes,
    clusterLabel: c.clusterLabel,
  }));
}
