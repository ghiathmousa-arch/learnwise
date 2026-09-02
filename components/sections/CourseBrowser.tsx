"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { YoutubeIcon, ArticleIcon } from "@/components/ui/icons";

export type CourseCardItem = {
  id: number;
  title: string;
  type: "video" | "article";
  thumbnailUrl: string | null;
  durationMinutes: number;
  clusterLabel: string | null;
};

const stripePattern = (id: string) => (
  <svg viewBox="0 0 320 132" preserveAspectRatio="none" className="block h-full w-full">
    <defs>
      <pattern id={id} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="10" stroke="#E2E9E6" strokeWidth="3" />
      </pattern>
    </defs>
    <rect width="320" height="132" fill={`url(#${id})`} />
  </svg>
);

export function CourseCard({ item }: { item: CourseCardItem }) {
  return (
    <Link
      href={`/courses/${item.id}`}
      className="flex flex-col overflow-hidden rounded-lg border border-line bg-white transition-colors hover:border-teal-line"
    >
      <div className="relative h-33 border-b border-line bg-offwhite">
        {item.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnailUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          stripePattern(`stripe-${item.id}`)
        )}
        <span className="absolute top-3 inset-s-3 flex items-center gap-1.5 rounded-full border border-line bg-white px-2.75 py-1.25">
          {item.type === "video" ? (
            <YoutubeIcon size={13} className="text-teal" strokeWidth={1.9} />
          ) : (
            <ArticleIcon size={13} className="text-teal" strokeWidth={1.9} />
          )}
          <span className="text-[11px] font-medium text-teal">
            {item.type === "video" ? "فيديو" : "مقال"}
          </span>
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-5 pt-4.5 pb-5">
        <span className="line-clamp-2 text-base font-medium leading-normal text-ink">
          {item.title}
        </span>
        <div className="mt-auto flex items-center justify-between gap-3">
          {item.clusterLabel ? (
            <span className="rounded border border-teal-line bg-teal-wash px-2.5 py-1 text-xs text-teal">
              {item.clusterLabel}
            </span>
          ) : (
            <span />
          )}
          <span className="font-mono text-xs text-muted">
            {item.type === "video"
              ? `${item.durationMinutes} دقيقة`
              : `${item.durationMinutes} دقائق قراءة`}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function CourseBrowser({
  items,
  topics,
}: {
  items: CourseCardItem[];
  topics: { id: number; label: string }[];
}) {
  const [topic, setTopic] = useState<string>("الكل");
  const [type, setType] = useState<"all" | "video" | "article">("all");

  const filtered = useMemo(
    () =>
      items.filter(
        (item) =>
          (topic === "الكل" || item.clusterLabel === topic) &&
          (type === "all" || item.type === type),
      ),
    [items, topic, type],
  );

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-wrap items-center justify-between gap-6 rounded-lg border border-line bg-surface px-5 py-4.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <span
            onClick={() => setTopic("الكل")}
            className={`cursor-pointer rounded-full border px-4.5 py-2 text-sm font-medium transition-colors ${
              topic === "الكل"
                ? "border-teal bg-teal text-white"
                : "border-line bg-white text-body hover:border-teal-line"
            }`}
          >
            الكل
          </span>
          {topics.map((t) => (
            <span
              key={t.id}
              onClick={() => setTopic(t.label)}
              className={`cursor-pointer rounded-full border px-4.5 py-2 text-sm font-medium transition-colors ${
                topic === t.label
                  ? "border-teal bg-teal text-white"
                  : "border-line bg-white text-body hover:border-teal-line"
              }`}
            >
              {t.label}
            </span>
          ))}
        </div>
        <div className="flex flex-none gap-1 rounded-lg border border-line bg-white p-1">
          {(
            [
              ["all", "الكل"],
              ["video", "فيديوهات"],
              ["article", "مقالات"],
            ] as const
          ).map(([id, label]) => (
            <span
              key={id}
              onClick={() => setType(id)}
              className={`cursor-pointer rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                type === id
                  ? "border border-teal-line bg-teal-wash text-teal-deep"
                  : "border border-transparent text-body"
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <span className="font-mono text-xs text-muted">
        {filtered.length} من {items.length} عنصر
      </span>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-[15px] text-body">
          ما في محتوى مطابق لهاي الفلاتر حاليًا.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((item) => (
            <CourseCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
