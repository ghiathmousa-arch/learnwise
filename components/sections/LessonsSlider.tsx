"use client";

import { useState } from "react";
import { CourseCard, type CourseCardItem } from "@/components/sections/CourseBrowser";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";

const PAGE_SIZE = 6; // 3 أعمدة × صفّين

export default function LessonsSlider({ items }: { items: CourseCardItem[] }) {
  const pageCount = Math.ceil(items.length / PAGE_SIZE);
  const [page, setPage] = useState(0);

  const visible = items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item) => (
          <CourseCard key={item.id} item={item} />
        ))}
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-end gap-3">
          <span className="font-mono text-xs text-muted">
            مجموعة {page + 1} من {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            aria-label="المجموعة السابقة"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white transition-colors hover:border-teal disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRightIcon size={18} className="text-ink" />
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={page >= pageCount - 1}
            aria-label="المجموعة التالية"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white transition-colors hover:border-teal disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeftIcon size={18} className="text-ink" />
          </button>
        </div>
      )}
    </div>
  );
}
