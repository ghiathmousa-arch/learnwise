import { getSession } from "@/lib/auth";
import {
  LEVELS,
  GOALS,
  STYLES,
  PACES,
  isOneOf,
  validateTopicIds,
  savePreferences,
} from "@/lib/preferences";

export async function POST(request: Request) {
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

  const { level, topicIds, goal, learningStyle, weeklyTime } = (body ??
    {}) as Record<string, unknown>;

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

  const topics = await validateTopicIds(topicIds);
  if (!topics.ok) {
    return Response.json({ error: topics.error }, { status: 400 });
  }

  await savePreferences(session.userId, {
    level,
    goal,
    learningStyle,
    weeklyTime,
    topicIds: topics.ids,
  });

  return Response.json({ ok: true });
}
