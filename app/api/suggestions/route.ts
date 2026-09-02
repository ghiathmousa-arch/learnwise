import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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

  const { domainName, description } = (body ?? {}) as Record<string, unknown>;

  if (typeof domainName !== "string" || !domainName.trim() || domainName.length > 120) {
    return Response.json({ error: "اسم المجال غير صالح." }, { status: 400 });
  }
  if (
    typeof description !== "string" ||
    description.trim().length < 4 ||
    description.length > 400
  ) {
    return Response.json(
      { error: "الوصف يجب أن يكون بين ٤ و٤٠٠ حرف." },
      { status: 400 },
    );
  }

  const created = await prisma.suggestedDomain.create({
    data: {
      userId: session.userId,
      domainName: domainName.trim(),
      description: description.trim(),
    },
  });

  return Response.json({ id: created.id }, { status: 201 });
}
