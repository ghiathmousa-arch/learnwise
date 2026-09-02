import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/adminAuth";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/admin/messages/[id]">,
) {
  const { unauthorized } = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await ctx.params;
  const messageId = Number(id);
  if (!Number.isInteger(messageId)) {
    return Response.json({ error: "معرّف غير صالح." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "طلب غير صالح." }, { status: 400 });
  }

  const { isRead } = (body ?? {}) as Record<string, unknown>;
  if (typeof isRead !== "boolean") {
    return Response.json({ error: "طلب غير صالح." }, { status: 400 });
  }

  try {
    const message = await prisma.contactMessage.update({
      where: { id: messageId },
      data: { isRead },
    });
    return Response.json({ message });
  } catch {
    return Response.json({ error: "الرسالة غير موجودة." }, { status: 404 });
  }
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/admin/messages/[id]">,
) {
  const { unauthorized } = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await ctx.params;
  const messageId = Number(id);

  if (!Number.isInteger(messageId)) {
    return Response.json({ error: "معرّف غير صالح." }, { status: 400 });
  }

  try {
    await prisma.contactMessage.delete({ where: { id: messageId } });
  } catch {
    return Response.json({ error: "الرسالة غير موجودة." }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}
