"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchIcon, EditIcon, TrashIcon } from "@/components/ui/icons";

export type AdminContentItem = {
  id: number;
  title: string;
  type: string;
  difficultyLevel: string;
  durationMinutes: number;
  clusterLabel: string | null;
};

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدّم",
};

const GRID = "1.6fr 1fr 1fr 0.9fr 100px";

export default function AdminContentTable({
  items,
}: {
  items: AdminContentItem[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return items;
    return items.filter((item) => item.title.includes(q));
  }, [items, query]);

  async function handleDelete(id: number, title: string) {
    if (!confirm(`متأكد إنك بدك تحذف "${title}"؟`)) return;

    setPendingId(id);
    setError("");

    try {
      const res = await fetch(`/api/admin/content/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error || "تعذّر الحذف.");
        setPendingId(null);
        return;
      }
      router.refresh();
    } catch {
      setError("تعذّر الاتصال بالخادم.");
      setPendingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <label className="flex w-80 items-center gap-2.5 rounded-md border border-line px-3.5 py-2.25">
          <SearchIcon size={16} className="flex-none text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في الدروس…"
            className="w-full text-[14px] text-ink outline-none placeholder:text-muted"
          />
        </label>
        <span className="font-mono text-xs text-muted">
          {filtered.length} من {items.length}
        </span>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-line py-16 text-center text-[15px] text-body">
          ما في محتوى مطابق.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line">
          <div className="min-w-175">
            <div
              className="grid gap-4 border-b border-line bg-surface px-5 py-3.5 font-mono text-[11px] tracking-wider text-muted uppercase"
              style={{ gridTemplateColumns: GRID }}
            >
              <div>العنوان</div>
              <div>الموضوع</div>
              <div>النوع والمدة</div>
              <div>المستوى</div>
              <div>إجراءات</div>
            </div>
            {filtered.map((item) => (
              <div
                key={item.id}
                className="grid items-center gap-4 border-b border-[#F0F3F2] px-5 py-4 text-[14px] last:border-b-0"
                style={{ gridTemplateColumns: GRID }}
              >
                <span className="truncate font-medium text-ink">
                  {item.title}
                </span>
                <span className="truncate text-body">
                  {item.clusterLabel ?? "—"}
                </span>
                <span className="font-mono text-[13px] text-body">
                  {item.type === "video" ? "فيديو" : "مقال"} ·{" "}
                  {item.durationMinutes} د
                </span>
                <span>
                  {DIFFICULTY_LABELS[item.difficultyLevel] ?? item.difficultyLevel}
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/content/${item.id}`}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-line transition-colors hover:border-teal"
                  >
                    <EditIcon size={15} className="text-teal" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.title)}
                    disabled={pendingId === item.id}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-line transition-colors hover:border-red-400 disabled:opacity-50"
                  >
                    <TrashIcon size={15} className="text-muted" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
