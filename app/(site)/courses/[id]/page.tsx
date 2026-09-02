import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RestrictedContent from "@/components/sections/RestrictedContent";
import { CourseCard } from "@/components/sections/CourseBrowser";
import TrackViewLink from "@/components/sections/TrackViewLink";
import { YoutubeIcon, ArticleIcon, ClockIcon } from "@/components/ui/icons";

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدّم",
};

function StripePlaceholder() {
  return (
    <svg viewBox="0 0 1200 340" preserveAspectRatio="none" className="block h-full w-full">
      <defs>
        <pattern id="lw-detail-stripe" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="12" stroke="#E2E9E6" strokeWidth="3" />
        </pattern>
      </defs>
      <rect width="1200" height="340" fill="url(#lw-detail-stripe)" />
    </svg>
  );
}

export default async function ContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contentId = Number(id);
  if (!Number.isInteger(contentId)) notFound();

  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="px-6 py-16 md:px-16">
        <RestrictedContent />
      </div>
    );
  }

  const content = await prisma.content.findUnique({
    where: { id: contentId },
    include: { cluster: true },
  });
  if (!content) notFound();

  const similar = content.clusterId
    ? await prisma.content.findMany({
        where: { clusterId: content.clusterId, id: { not: content.id } },
        take: 4,
        select: {
          id: true,
          title: true,
          type: true,
          thumbnailUrl: true,
          durationMinutes: true,
          cluster: { select: { label: true } },
        },
      })
    : [];

  const isVideo = content.type === "video";

  return (
    <div className="px-6 py-16 md:px-16">
      <div className="overflow-hidden rounded-lg border border-line bg-white">
        <div className="relative h-85 border-b border-line bg-offwhite">
          {content.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={content.thumbnailUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <StripePlaceholder />
          )}
          <span className="absolute bottom-4 inset-s-4 rounded border border-line bg-white px-3 py-1.5 font-mono text-xs text-body">
            {content.durationMinutes} {isVideo ? "دقيقة" : "دقائق قراءة"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-14 p-10 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 rounded-md border border-line px-3 py-1.5">
                {isVideo ? (
                  <YoutubeIcon size={15} className="text-teal" />
                ) : (
                  <ArticleIcon size={15} className="text-teal" />
                )}
                <span className="text-[13px] font-medium text-ink">
                  {content.source}
                </span>
              </span>
            </div>

            <h1 className="max-w-[34ch] text-2xl leading-snug font-semibold text-ink md:text-3xl">
              {content.title}
            </h1>

            <p className="max-w-[62ch] text-[15px] leading-loose text-body">
              {content.description}
            </p>

            <div className="flex flex-wrap gap-2.5">
              {content.cluster && (
                <span className="rounded-full border border-teal-line bg-teal-wash px-3.5 py-1.5 text-[13px] text-teal">
                  {content.cluster.label}
                </span>
              )}
              <span className="rounded-full border border-teal-line bg-teal-wash px-3.5 py-1.5 text-[13px] text-teal">
                {DIFFICULTY_LABEL[content.difficultyLevel] ?? content.difficultyLevel}
              </span>
            </div>

            <div className="flex items-center gap-3.5 pt-2">
              <TrackViewLink
                contentId={content.id}
                href={content.url}
                className="flex items-center gap-2.5 rounded-lg border border-teal bg-teal px-6.5 py-3.25 text-[15px] font-medium text-white transition-colors hover:border-teal-deep hover:bg-teal-deep"
              >
                {isVideo ? "افتح على YouTube" : "اقرأ المقال"}
              </TrackViewLink>
            </div>
          </div>

          <div className="flex flex-col gap-4.5 lg:border-s lg:border-line lg:ps-10">
            <span className="font-mono text-[11px] tracking-wider text-muted uppercase">
              تفاصيل
            </span>
            {[
              { label: "المدة", value: `${content.durationMinutes} دقيقة` },
              {
                label: "المستوى",
                value: DIFFICULTY_LABEL[content.difficultyLevel] ?? content.difficultyLevel,
              },
              { label: "المصدر", value: content.source },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted">{row.label}</span>
                <span className="text-ink">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <div className="mt-12">
          <div className="flex items-end justify-between gap-8 pb-6">
            <h3 className="text-xl font-semibold text-ink">محتوى مشابه</h3>
            <span className="flex items-center gap-1.5 font-mono text-xs text-muted">
              <ClockIcon size={13} />
              نفس الموضوع
            </span>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((s) => (
              <CourseCard
                key={s.id}
                item={{
                  id: s.id,
                  title: s.title,
                  type: s.type as "video" | "article",
                  thumbnailUrl: s.thumbnailUrl,
                  durationMinutes: s.durationMinutes,
                  clusterLabel: s.cluster?.label ?? null,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
