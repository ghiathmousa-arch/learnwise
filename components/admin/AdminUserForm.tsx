"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const inputClasses =
  "rounded-lg border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-teal";
const labelClasses = "text-[13px] font-medium text-ink";

export default function AdminUserForm({
  userId,
  initial,
}: {
  userId: number;
  initial: { name: string; email: string; level: string | null };
}) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [level, setLevel] = useState(initial.level ?? "");
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, level: level || null }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error || "صار في خطأ، حاول مرة ثانية.");
        setPending(false);
        return;
      }

      router.push("/admin/users");
      router.refresh();
    } catch {
      setError("تعذّر الاتصال بالخادم. تحقّق من الاتصال وحاول مرة ثانية.");
      setPending(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`متأكد إنك بدك تحذف حساب "${initial.name}"؟ هالإجراء ما إله رجعة.`)) return;

    setDeleting(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error || "تعذّر الحذف.");
        setDeleting(false);
        return;
      }
      router.push("/admin/users");
      router.refresh();
    } catch {
      setError("تعذّر الاتصال بالخادم.");
      setDeleting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-lg border border-line p-7"
    >
      <label className="flex flex-col gap-2">
        <span className={labelClasses}>الاسم</span>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClasses}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className={labelClasses}>البريد الإلكتروني</span>
        <input
          required
          type="email"
          dir="ltr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${inputClasses} text-left`}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className={labelClasses}>المستوى</span>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className={inputClasses}
        >
          <option value="">غير محدّد</option>
          <option value="beginner">مبتدئ</option>
          <option value="intermediate">متوسط</option>
          <option value="advanced">متقدّم</option>
        </select>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center justify-between gap-3.5 border-t border-line pt-5">
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting || pending}
          className="rounded-lg border border-red-500/30 px-6 py-3 text-[15px] font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {deleting ? "جارٍ الحذف..." : "حذف الحساب"}
        </button>
        <button
          type="submit"
          disabled={pending || deleting}
          className="rounded-lg border border-teal bg-teal px-7 py-3 text-[15px] font-medium text-white transition-colors hover:border-teal-deep hover:bg-teal-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "جارٍ الحفظ..." : "حفظ التعديلات"}
        </button>
      </div>
    </form>
  );
}
