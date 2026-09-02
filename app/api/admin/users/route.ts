import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/adminAuth";

export async function GET() {
  const { unauthorized } = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      level: true,
      createdAt: true,
      _count: { select: { viewHistory: true, suggestedDomains: true } },
    },
  });

  return Response.json({ users });
}
