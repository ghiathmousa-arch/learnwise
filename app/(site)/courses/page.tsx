import SectionHeading from "@/components/ui/SectionHeading";
import RestrictedContent from "@/components/sections/RestrictedContent";
import CourseBrowser from "@/components/sections/CourseBrowser";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function CoursesPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="px-6 py-16 md:px-16">
        <SectionHeading
          kicker="قسم الكورسات"
          title="كل الدروس والمقالات"
          className="pb-10"
        />
        <RestrictedContent />
      </div>
    );
  }

  const [content, topics] = await Promise.all([
    prisma.content.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        type: true,
        thumbnailUrl: true,
        durationMinutes: true,
        cluster: { select: { label: true } },
      },
    }),
    prisma.cluster.findMany({
      orderBy: { label: "asc" },
      select: { id: true, label: true },
    }),
  ]);

  return (
    <div className="px-6 py-16 md:px-16">
      <SectionHeading
        kicker="قسم الكورسات"
        title="كل الدروس والمقالات"
        className="pb-8"
      />
      <CourseBrowser
        items={content.map((c) => ({
          id: c.id,
          title: c.title,
          type: c.type as "video" | "article",
          thumbnailUrl: c.thumbnailUrl,
          durationMinutes: c.durationMinutes,
          clusterLabel: c.cluster?.label ?? null,
        }))}
        topics={topics}
      />
    </div>
  );
}
