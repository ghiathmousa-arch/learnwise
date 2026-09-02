import { prisma } from "@/lib/prisma";
import AdminContentForm from "@/components/admin/AdminContentForm";

export default async function AdminNewContentPage() {
  const clusters = await prisma.cluster.findMany({
    orderBy: { label: "asc" },
    select: { id: true, label: true },
  });

  return (
    <div className="flex max-w-3xl flex-col gap-7">
      <div className="flex flex-col gap-1.5 border-b border-line pb-7">
        <span className="font-mono text-xs tracking-wider text-muted uppercase">
          المحتوى
        </span>
        <h1 className="text-[22px] font-semibold text-ink">إضافة محتوى</h1>
      </div>

      <AdminContentForm clusters={clusters} mode="create" />
    </div>
  );
}
