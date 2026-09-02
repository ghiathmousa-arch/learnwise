import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";
import { requireAdminApi } from "@/lib/adminAuth";
import { parseContentBody } from "@/lib/adminValidation";

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/admin/content/[id]">,
) {
  const { unauthorized } = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await ctx.params;
  const contentId = Number(id);
  if (!Number.isInteger(contentId)) {
    return Response.json({ error: "معرّف غير صالح." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "طلب غير صالح." }, { status: 400 });
  }

  const parsed = parseContentBody(body);
  if ("error" in parsed) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const content = await prisma.content.update({
      where: { id: contentId },
      data: parsed,
    });
    return Response.json({ content });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return Response.json({ error: "هذا الرابط مضاف مسبقًا." }, { status: 409 });
      }
      if (error.code === "P2025") {
        return Response.json({ error: "المحتوى غير موجود." }, { status: 404 });
      }
    }
    throw error;
  }
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/admin/content/[id]">,
) {
  const { unauthorized } = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await ctx.params;
  const contentId = Number(id);
  if (!Number.isInteger(contentId)) {
    return Response.json({ error: "معرّف غير صالح." }, { status: 400 });
  }

  try {
    await prisma.content.delete({ where: { id: contentId } });
  } catch {
    return Response.json({ error: "المحتوى غير موجود." }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}
