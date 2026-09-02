import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdminContentTable from "@/components/admin/AdminContentTable";

export default async function AdminContentPage() {
  const content = await prisma.content.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      type: true,
      difficultyLevel: true,
      durationMinutes: true,
      cluster: { select: { label: true } },
    },
  });

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-7">
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-xs tracking-wider text-muted uppercase">
            لوحة الإدارة
          </span>
          <h1 className="text-[22px] font-semibold text-ink">المحتوى</h1>
        </div>
        <Link
          href="/admin/content/new"
          className="rounded-md border border-teal bg-teal px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:border-teal-deep hover:bg-teal-deep"
        >
          إضافة محتوى
        </Link>
      </div>

      <AdminContentTable
        items={content.map((c) => ({
          id: c.id,
          title: c.title,
          type: c.type,
          difficultyLevel: c.difficultyLevel,
          durationMinutes: c.durationMinutes,
          clusterLabel: c.cluster?.label ?? null,
        }))}
      />
    </div>
  );
}
