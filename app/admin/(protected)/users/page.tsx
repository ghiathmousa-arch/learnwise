import { prisma } from "@/lib/prisma";
import AdminUsersTable from "@/components/admin/AdminUsersTable";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, level: true, createdAt: true },
  });

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-1.5 border-b border-line pb-7">
        <span className="font-mono text-xs tracking-wider text-muted uppercase">
          لوحة الإدارة
        </span>
        <h1 className="text-[22px] font-semibold text-ink">المستخدمون</h1>
      </div>

      <AdminUsersTable
        items={users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          level: u.level,
          createdAt: u.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
