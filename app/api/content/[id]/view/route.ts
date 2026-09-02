import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { weightedAverage, normalize } from "@/lib/embeddings";

// وزن كل مشاهدة جديدة بمعادلة EMA لتحديث متجه اهتمامات الطالب الحالي —
// نسبة صغيرة عمدًا (تأثير تدريجي متراكم)، مش قفزة كبيرة بعد مشاهدة وحدة.
const VIEW_EMA_ALPHA = 0.15;

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/content/[id]/view">,
) {
  const session = await getSession();
  if (!session) {
    return Response.json(
      { error: "يجب تسجيل الدخول أولاً." },
      { status: 401 },
    );
  }

  const { id } = await ctx.params;
  const contentId = Number(id);
  if (!Number.isInteger(contentId)) {
    return Response.json({ error: "معرّف غير صالح." }, { status: 400 });
  }

  const content = await prisma.content.findUnique({
    where: { id: contentId },
    select: { id: true, embedding: true },
  });
  if (!content) {
    return Response.json({ error: "المحتوى غير موجود." }, { status: 404 });
  }

  await prisma.viewHistory.create({
    data: { userId: session.userId, contentId },
  });

  const contentVec = content.embedding as number[] | null;
  if (contentVec) {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { currentEmbedding: true },
    });
    const currentVec = user?.currentEmbedding as number[] | null;

    if (currentVec) {
      const updated = normalize(
        weightedAverage(contentVec, VIEW_EMA_ALPHA, currentVec, 1 - VIEW_EMA_ALPHA),
      );
      await prisma.user.update({
        where: { id: session.userId },
        data: { currentEmbedding: updated },
      });
    }
  }

  return Response.json({ ok: true }, { status: 201 });
}
