import { getSession } from "@/lib/auth";
import {
  LEVELS,
  GOALS,
  STYLES,
  PACES,
  CONTENT_TYPES,
  isOneOf,
  validateTopicIds,
  savePreferences,
} from "@/lib/preferences";

// خدمة الذكاء على Render (الخطة المجانية) بتنام مع الخمول، وأول طلب بيوقظها
// بياخد ~٣٥ ثانية. سقف Vercel الافتراضي عشر ثواني بيقطع الطلب قبل هيك،
// فمنرفعو للحد الأقصى المسموح بالخطة المجانية.
export const maxDuration = 60

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json(
      { error: "يجب تسجيل الدخول أولاً." },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "طلب غير صالح." }, { status: 400 });
  }

  const { level, topicIds, goal, learningStyle, weeklyTime, preferredContentType } =
    (body ?? {}) as Record<string, unknown>;

  if (!isOneOf(level, LEVELS)) {
    return Response.json({ error: "المستوى غير صالح." }, { status: 400 });
  }
  if (!isOneOf(goal, GOALS)) {
    return Response.json({ error: "الهدف غير صالح." }, { status: 400 });
  }
  if (!isOneOf(learningStyle, STYLES)) {
    return Response.json(
      { error: "أسلوب التعلم غير صالح." },
      { status: 400 },
    );
  }
  if (!isOneOf(weeklyTime, PACES)) {
    return Response.json(
      { error: "الوقت الأسبوعي غير صالح." },
      { status: 400 },
    );
  }
  if (!isOneOf(preferredContentType, CONTENT_TYPES)) {
    return Response.json(
      { error: "نوع المحتوى المفضّل غير صالح." },
      { status: 400 },
    );
  }

  const topics = await validateTopicIds(topicIds);
  if (!topics.ok) {
    return Response.json({ error: topics.error }, { status: 400 });
  }

  await savePreferences(session.userId, {
    level,
    goal,
    learningStyle,
    weeklyTime,
    preferredContentType,
    topicIds: topics.ids,
  });

  return Response.json({ ok: true });
}
