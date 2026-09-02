import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminContentForm from "@/components/admin/AdminContentForm";

export default async function AdminEditContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contentId = Number(id);
  if (!Number.isInteger(contentId)) notFound();

  const [content, clusters] = await Promise.all([
    prisma.content.findUnique({ where: { id: contentId } }),
    prisma.cluster.findMany({ orderBy: { label: "asc" }, select: { id: true, label: true } }),
  ]);

  if (!content) notFound();

  return (
    <div className="flex max-w-3xl flex-col gap-7">
      <div className="flex flex-col gap-1.5 border-b border-line pb-7">
        <span className="font-mono text-xs tracking-wider text-muted uppercase">
          المحتوى
        </span>
        <h1 className="text-[22px] font-semibold text-ink">تعديل المحتوى</h1>
      </div>

      <AdminContentForm
        clusters={clusters}
        mode="edit"
        contentId={content.id}
        initial={{
          title: content.title,
          description: content.description,
          type: content.type,
          source: content.source,
          url: content.url,
          thumbnailUrl: content.thumbnailUrl ?? "",
          difficultyLevel: content.difficultyLevel,
          durationMinutes: String(content.durationMinutes),
          clusterId: content.clusterId ? String(content.clusterId) : "",
        }}
      />
    </div>
  );
}
