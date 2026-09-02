import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminUserForm from "@/components/admin/AdminUserForm";

export default async function AdminEditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = Number(id);
  if (!Number.isInteger(userId)) notFound();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, level: true },
  });
  if (!user) notFound();

  return (
    <div className="flex max-w-2xl flex-col gap-7">
      <div className="flex flex-col gap-1.5 border-b border-line pb-7">
        <span className="font-mono text-xs tracking-wider text-muted uppercase">
          المستخدمون
        </span>
        <h1 className="text-[22px] font-semibold text-ink">تعديل مستخدم</h1>
      </div>

      <AdminUserForm
        userId={user.id}
        initial={{ name: user.name, email: user.email, level: user.level }}
      />
    </div>
  );
}
