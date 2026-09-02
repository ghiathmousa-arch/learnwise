import { requireAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const admin = await requireAdmin();

  const [content, users, suggestions, messages] = await Promise.all([
    prisma.content.count(),
    prisma.user.count(),
    prisma.suggestedDomain.count(),
    prisma.contactMessage.count({ where: { isRead: false } }),
  ]);

  return (
    <div className="flex bg-white">
      <AdminSidebar
        username={admin.username}
        counts={{ content, users, suggestions, messages }}
      />
      <main className="min-h-screen flex-1 bg-white px-9 py-8 text-ink md:px-11">
        {children}
      </main>
    </div>
  );
}
