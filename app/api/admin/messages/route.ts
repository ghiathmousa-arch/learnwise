import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/adminAuth";

export async function GET() {
  const { unauthorized } = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const messages = await prisma.contactMessage.findMany({
    orderBy: { submittedAt: "desc" },
  });

  return Response.json({ messages });
}
