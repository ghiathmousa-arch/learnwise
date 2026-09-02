"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type AdminMessageItem = {
  id: number;
  senderName: string;
  senderEmail: string;
  message: string;
  isRead: boolean;
  submittedAt: string;
};

export default function AdminMessagesTable({ items }: { items: AdminMessageItem[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function toggleRead(id: number, isRead: boolean) {
    setPendingId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: !isRead }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error || "تعذّر التحديث.");
        setPendingId(null);
        return;
      }
      router.refresh();
    } catch {
      setError("تعذّر الاتصال بالخادم.");
      setPendingId(null);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("متأكد إنك بدك تحذف هاي الرسالة؟")) return;

    setPendingId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
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

  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-line py-16 text-center text-[15px] text-body">
        ما في رسائل واردة بعد.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex flex-col gap-3.5">
        {items.map((m) => (
          <div
            key={m.id}
            className="flex flex-col gap-3 rounded-lg border border-line p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <h2 className="text-[15px] font-medium text-ink">{m.senderName}</h2>
                <span dir="ltr" className="text-[13px] text-muted">
                  {m.senderEmail}
                </span>
                <span
                  className={`font-mono text-[11px] tracking-wider uppercase rounded px-2 py-0.5 border ${
                    m.isRead
                      ? "border-line text-muted"
                      : "border-teal-line bg-teal-wash text-teal"
                  }`}
                >
                  {m.isRead ? "مقروءة" : "غير مقروءة"}
                </span>
              </div>
              <span className="font-mono text-xs text-muted">
                {new Date(m.submittedAt).toLocaleDateString("ar")}
              </span>
            </div>
            <p className="text-[14px] leading-relaxed text-body">{m.message}</p>
            <div className="flex items-center gap-4 border-t border-[#F0F3F2] pt-3">
              <button
                type="button"
                onClick={() => toggleRead(m.id, m.isRead)}
                disabled={pendingId === m.id}
                className="text-[13px] text-teal hover:underline disabled:opacity-50"
              >
                {m.isRead ? "تعليم كغير مقروءة" : "تعليم كمقروءة"}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(m.id)}
                disabled={pendingId === m.id}
                className="text-[13px] text-red-600 hover:underline disabled:opacity-50"
              >
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
