"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchIcon, EditIcon, TrashIcon } from "@/components/ui/icons";

export type AdminUserItem = {
  id: number;
  name: string;
  email: string;
  level: string | null;
  createdAt: string;
};

const LEVEL_LABELS: Record<string, string> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدّم",
};

const GRID = "1.4fr 1.2fr 1fr 100px";

export default function AdminUsersTable({ items }: { items: AdminUserItem[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return items;
    return items.filter(
      (user) => user.name.includes(q) || user.email.includes(q),
    );
  }, [items, query]);

  async function handleDelete(id: number, name: string) {
    if (!confirm(`متأكد إنك بدك تحذف حساب "${name}"؟ هالإجراء ما إله رجعة.`)) return;

    setPendingId(id);
    setError("");

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
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
            placeholder="ابحث بالاسم أو البريد…"
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
          ما في مستخدمين مطابقين.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line">
          <div className="min-w-150">
            <div
              className="grid gap-4 border-b border-line bg-surface px-5 py-3.5 font-mono text-[11px] tracking-wider text-muted uppercase"
              style={{ gridTemplateColumns: GRID }}
            >
              <div>المستخدم</div>
              <div>البريد الإلكتروني</div>
              <div>المستوى</div>
              <div>إجراءات</div>
            </div>
            {filtered.map((user) => (
              <div
                key={user.id}
                className="grid items-center gap-4 border-b border-[#F0F3F2] px-5 py-4 text-[14px] last:border-b-0"
                style={{ gridTemplateColumns: GRID }}
              >
                <span className="truncate font-medium text-ink">{user.name}</span>
                <span dir="ltr" className="truncate text-left text-body">
                  {user.email}
                </span>
                <span className="text-body">
                  {user.level ? (LEVEL_LABELS[user.level] ?? user.level) : "—"}
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-line transition-colors hover:border-teal"
                  >
                    <EditIcon size={15} className="text-teal" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(user.id, user.name)}
                    disabled={pendingId === user.id}
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
