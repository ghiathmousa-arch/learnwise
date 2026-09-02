import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/adminAuth";

export async function GET() {
  const { unauthorized } = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const suggestions = await prisma.suggestedDomain.findMany({
    orderBy: { submittedAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  return Response.json({ suggestions });
}
