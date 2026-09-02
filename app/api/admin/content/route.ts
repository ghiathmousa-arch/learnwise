import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";
import { requireAdminApi } from "@/lib/adminAuth";
import { parseContentBody } from "@/lib/adminValidation";

export async function GET() {
  const { unauthorized } = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const content = await prisma.content.findMany({
    orderBy: { createdAt: "desc" },
    include: { cluster: { select: { id: true, label: true } } },
  });

  return Response.json({ content });
}

export async function POST(request: Request) {
  const { unauthorized } = await requireAdminApi();
  if (unauthorized) return unauthorized;

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
    const content = await prisma.content.create({ data: parsed });
    return Response.json({ content }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return Response.json({ error: "هذا الرابط مضاف مسبقًا." }, { status: 409 });
    }
    throw error;
  }
}
