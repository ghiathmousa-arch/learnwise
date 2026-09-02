import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";
import { requireAdminApi } from "@/lib/adminAuth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LEVELS = new Set(["beginner", "intermediate", "advanced"]);

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/admin/users/[id]">,
) {
  const { unauthorized } = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await ctx.params;
  const userId = Number(id);
  if (!Number.isInteger(userId)) {
    return Response.json({ error: "معرّف غير صالح." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "طلب غير صالح." }, { status: 400 });
  }

  const { name, email, level } = (body ?? {}) as Record<string, unknown>;

  if (typeof name !== "string" || !name.trim() || name.length > 120) {
    return Response.json({ error: "الاسم غير صالح." }, { status: 400 });
  }
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(normalizedEmail) || normalizedEmail.length > 200) {
    return Response.json({ error: "البريد الإلكتروني غير صالح." }, { status: 400 });
  }
  if (level !== null && (typeof level !== "string" || !LEVELS.has(level))) {
    return Response.json({ error: "المستوى غير صالح." }, { status: 400 });
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { name: name.trim(), email: normalizedEmail, level },
      select: { id: true, name: true, email: true, level: true },
    });
    return Response.json({ user });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return Response.json(
          { error: "هذا البريد الإلكتروني مستخدم مسبقًا." },
          { status: 409 },
        );
      }
      if (error.code === "P2025") {
        return Response.json({ error: "المستخدم غير موجود." }, { status: 404 });
      }
    }
    throw error;
  }
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/admin/users/[id]">,
) {
  const { unauthorized } = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await ctx.params;
  const userId = Number(id);
  if (!Number.isInteger(userId)) {
    return Response.json({ error: "معرّف غير صالح." }, { status: 400 });
  }

  try {
    await prisma.user.delete({ where: { id: userId } });
  } catch {
    return Response.json({ error: "المستخدم غير موجود." }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}
