"use client";

import { useState, type FormEvent } from "react";
import { CheckIcon } from "@/components/ui/icons";

export default function SuggestDomainForm({
  user,
}: {
  user: { name: string; email: string };
}) {
  const [domainName, setDomainName] = useState("");
  const [description, setDescription] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainName, description }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error || "صار في خطأ، حاول مرة ثانية.");
        setPending(false);
        return;
      }

      setSent(true);
    } catch {
      setError("تعذّر الاتصال بالخادم. تحقّق من الاتصال وحاول مرة ثانية.");
      setPending(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-lg border border-teal-line bg-teal-wash px-10 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-teal-line bg-white">
          <CheckIcon size={26} className="text-teal" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-teal-deep">
            تم استلام اقتراحك بنجاح، شكراً لمساهمتك!
          </h2>
          <p className="max-w-[44ch] text-[15px] leading-relaxed text-[#3F5A52]">
            فريقنا يراجع الاقتراحات الواردة بشكل دوري لتوسيع مجالات المنصة.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-lg border border-line"
    >
      <div className="flex flex-col gap-5 px-10 py-9">
        <label className="flex flex-col gap-2">
          <span className="text-[13px] font-medium text-ink">اسم المجال</span>
          <input
            required
            value={domainName}
            onChange={(e) => setDomainName(e.target.value)}
            maxLength={120}
            placeholder="مثال: هندسة البيانات"
            className="rounded-lg border border-line px-4 py-3.25 text-[15px] text-ink outline-none focus:border-teal"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[13px] font-medium text-ink">وصف مختصر</span>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={400}
            placeholder="ما الذي يغطيه هذا المجال، ولمن يفيد؟"
            className="resize-none rounded-lg border border-line px-4 py-3.25 text-[15px] text-ink outline-none focus:border-teal"
          />
          <span className="self-end font-mono text-xs text-muted">
            {description.length} / ٤٠٠ حرف
          </span>
        </label>

        <div className="grid grid-cols-1 gap-4 rounded-lg border border-line bg-offwhite px-6 py-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[11px] tracking-wider text-muted uppercase">
              الاسم
            </span>
            <span className="text-[15px] text-ink">{user.name}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[11px] tracking-wider text-muted uppercase">
              البريد الإلكتروني
            </span>
            <span dir="ltr" className="text-[15px] text-ink">
              {user.email}
            </span>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line bg-surface px-10 py-5.5">
        <span className="text-[13px] text-muted">
          نراجع الاقتراحات الواردة بشكل دوري.
        </span>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border border-teal bg-teal px-7.5 py-3 text-[15px] font-medium text-white transition-colors hover:border-teal-deep hover:bg-teal-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "جارٍ الإرسال..." : "إرسال الاقتراح"}
        </button>
      </div>
    </form>
  );
}
