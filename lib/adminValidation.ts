import "server-only";

const TYPES = new Set(["video", "article"]);
const DIFFICULTIES = new Set(["beginner", "intermediate", "advanced"]);

export type ContentInput = {
  title: string;
  description: string;
  type: string;
  source: string;
  url: string;
  thumbnailUrl: string | null;
  difficultyLevel: string;
  durationMinutes: number;
  clusterId: number | null;
};

export function parseContentBody(body: unknown): ContentInput | { error: string } {
  const {
    title,
    description,
    type,
    source,
    url,
    thumbnailUrl,
    difficultyLevel,
    durationMinutes,
    clusterId,
  } = (body ?? {}) as Record<string, unknown>;

  if (typeof title !== "string" || !title.trim() || title.length > 200) {
    return { error: "العنوان مطلوب (٢٠٠ حرف كحد أقصى)." };
  }
  if (typeof description !== "string" || !description.trim()) {
    return { error: "الوصف مطلوب." };
  }
  if (typeof type !== "string" || !TYPES.has(type)) {
    return { error: "نوع المحتوى يجب أن يكون فيديو أو مقال." };
  }
  if (typeof source !== "string" || !source.trim()) {
    return { error: "المصدر مطلوب." };
  }
  if (typeof url !== "string" || !url.trim() || !/^https?:\/\//.test(url)) {
    return { error: "الرابط غير صالح." };
  }
  if (thumbnailUrl !== null && thumbnailUrl !== undefined && typeof thumbnailUrl !== "string") {
    return { error: "رابط الصورة غير صالح." };
  }
  if (typeof difficultyLevel !== "string" || !DIFFICULTIES.has(difficultyLevel)) {
    return { error: "مستوى الصعوبة غير صالح." };
  }
  if (
    typeof durationMinutes !== "number" ||
    !Number.isFinite(durationMinutes) ||
    durationMinutes <= 0
  ) {
    return { error: "مدة المحتوى يجب أن تكون رقمًا موجبًا." };
  }
  if (clusterId !== null && clusterId !== undefined && typeof clusterId !== "number") {
    return { error: "الموضوع غير صالح." };
  }

  return {
    title: title.trim(),
    description: description.trim(),
    type,
    source: source.trim(),
    url: url.trim(),
    thumbnailUrl:
      typeof thumbnailUrl === "string" && thumbnailUrl.trim()
        ? thumbnailUrl.trim()
        : null,
    difficultyLevel,
    durationMinutes: Math.round(durationMinutes),
    clusterId: typeof clusterId === "number" ? clusterId : null,
  };
}
