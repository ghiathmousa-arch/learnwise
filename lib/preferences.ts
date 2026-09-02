// ملاحظة: عمدًا بدون "server-only" — بينستورد من سكربتات هجرة مستقلة
// (scripts/backfill-user-embeddings.ts) برّا Next.js نفسو.
import { prisma } from "@/lib/prisma";
import {
  embedText,
  averageVectors,
  weightedAverage,
  normalize,
} from "@/lib/embeddings";

export const LEVELS = ["beginner", "intermediate", "advanced"] as const;
export const GOALS = ["skill", "interview", "academic"] as const;
export const STYLES = ["practical", "theory"] as const;
export const PACES = ["light", "balanced", "intensive"] as const;
export const CONTENT_TYPES = ["video", "article", "both"] as const;

export type Level = (typeof LEVELS)[number];
export type Goal = (typeof GOALS)[number];
export type Style = (typeof STYLES)[number];
export type Pace = (typeof PACES)[number];
export type ContentType = (typeof CONTENT_TYPES)[number];

const LEVEL_LABEL: Record<Level, string> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدّم",
};
const GOAL_LABEL: Record<Goal, string> = {
  skill: "بناء مهارة",
  interview: "التحضير للمقابلات",
  academic: "دعم دراسي",
};
const STYLE_LABEL: Record<Style, string> = {
  practical: "تطبيق عملي أولًا",
  theory: "أساس نظري أولًا",
};

// الوزن بين جملة التفضيلات الوصفية ومتوسط مراكز المواضيع المختارة، عند
// بناء متجه الطالب الأولي — مطابق للنسبة المذكورة بالجزء الأول من الخطة.
const SENTENCE_WEIGHT = 0.4;
const TOPICS_WEIGHT = 0.6;

export function isOneOf<T extends string>(
  value: unknown,
  options: readonly T[],
): value is T {
  return (
    typeof value === "string" && (options as readonly string[]).includes(value)
  );
}

export type PreferencesInput = {
  level: Level;
  topicIds: number[];
  goal: Goal;
  learningStyle: Style;
  weeklyTime: Pace;
  preferredContentType?: ContentType;
};

export async function validateTopicIds(topicIds: unknown): Promise<
  { ok: true; ids: number[] } | { ok: false; error: string }
> {
  if (
    !Array.isArray(topicIds) ||
    topicIds.length === 0 ||
    !topicIds.every((id): id is number => typeof id === "number")
  ) {
    return { ok: false, error: "يجب اختيار موضوع واحد على الأقل." };
  }

  const uniqueIds = [...new Set(topicIds)];
  const found = await prisma.cluster.findMany({
    where: { id: { in: uniqueIds } },
    select: { id: true },
  });

  if (found.length !== uniqueIds.length) {
    return { ok: false, error: "بعض المواضيع المختارة غير موجودة." };
  }

  return { ok: true, ids: uniqueIds };
}

// يبني متجه بروفايل الطالب: 40% جملة نصية عن (المستوى + الهدف + الأسلوب)
// + 60% متوسط مراكز (centroidEmbedding) المواضيع المختارة. لو موضوع ما
// إلو مركز محسوب بعد (K-Means ما اشتغل عليه)، بنستخدم embedding اسمه
// كبديل مؤقت بدل ما نطيح العملية كلها.
async function buildProfileEmbedding(
  input: Pick<PreferencesInput, "level" | "goal" | "learningStyle" | "topicIds">,
): Promise<number[]> {
  const sentence = `مستوى ${LEVEL_LABEL[input.level]}، الهدف ${GOAL_LABEL[input.goal]}، أسلوب تعلم ${STYLE_LABEL[input.learningStyle]}`;

  const clusters = await prisma.cluster.findMany({
    where: { id: { in: input.topicIds } },
    select: { label: true, centroidEmbedding: true },
  });

  const [sentenceVec, ...topicVecs] = await Promise.all([
    embedText(sentence),
    ...clusters.map((c) =>
      c.centroidEmbedding
        ? Promise.resolve(c.centroidEmbedding as number[])
        : embedText(c.label),
    ),
  ]);

  const avgTopicVec = averageVectors(topicVecs);
  const combined = weightedAverage(
    sentenceVec,
    SENTENCE_WEIGHT,
    avgTopicVec,
    TOPICS_WEIGHT,
  );
  return normalize(combined);
}

export async function savePreferences(userId: number, input: PreferencesInput) {
  const profileEmbedding = await buildProfileEmbedding(input);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        level: input.level,
        learningGoal: input.goal,
        learningStyle: input.learningStyle,
        weeklyTime: input.weeklyTime,
        initialEmbedding: profileEmbedding,
        currentEmbedding: profileEmbedding,
        ...(input.preferredContentType
          ? { preferredContentType: input.preferredContentType }
          : {}),
      },
    }),
    prisma.userCluster.deleteMany({ where: { userId } }),
    prisma.userCluster.createMany({
      data: input.topicIds.map((clusterId) => ({ userId, clusterId })),
    }),
  ]);
}
