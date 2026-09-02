import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/adminAuth";

export async function GET() {
  const { unauthorized } = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const [users, content, suggestions, unreadMessages] = await Promise.all([
    prisma.user.count(),
    prisma.content.count(),
    prisma.suggestedDomain.count(),
    prisma.contactMessage.count({ where: { isRead: false } }),
  ]);

  return Response.json({ users, content, suggestions, unreadMessages });
}
