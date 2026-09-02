"use client";

import { useState, type FormEvent } from "react";
import { CheckIcon } from "@/components/ui/icons";

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus("submitting");
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName: data.get("senderName"),
          senderEmail: data.get("senderEmail"),
          message: data.get("message"),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error || "صار في خطأ، حاول مرة ثانية.");
        setStatus("error");
        return;
      }

      form.reset();
      setStatus("success");
    } catch {
      setError("تعذّر الاتصال بالخادم. تحقّق من الاتصال وحاول مرة ثانية.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex max-w-[620px] items-center gap-3 rounded-lg border border-teal-line bg-teal-wash px-5 py-4">
        <CheckIcon size={20} className="shrink-0 text-teal" />
        <span className="text-[15px] text-teal-deep">
          تم استلام رسالتك بنجاح. سنعاود التواصل معك قريبًا.
        </span>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-w-[620px] flex-col gap-5.5 rounded-xl border border-line bg-white p-8 shadow-sm shadow-ink/5"
    >
      <label className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-ink">الاسم</span>
        <input
          type="text"
          name="senderName"
          required
          maxLength={120}
          placeholder="اكتب اسمك الكامل"
          className="rounded-md border border-line px-3.5 py-3 text-[15px] text-ink outline-none focus:border-teal"
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-ink">
          البريد الإلكتروني
        </span>
        <input
          type="email"
          name="senderEmail"
          required
          dir="ltr"
          placeholder="name@example.com"
          className="rounded-md border border-line px-3.5 py-3 text-left text-[15px] text-ink outline-none focus:border-teal"
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-ink">رسالتك</span>
        <textarea
          name="message"
          required
          maxLength={4000}
          rows={5}
          placeholder="كيف يمكننا المساعدة؟"
          className="resize-y rounded-md border border-line px-3.5 py-3 text-[15px] leading-relaxed text-ink outline-none focus:border-teal"
        />
      </label>

      {status === "error" && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="flex items-center justify-between gap-6">
        <span className="text-[13px] text-muted">
          لن نشارك بياناتك مع أي طرف ثالث.
        </span>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="whitespace-nowrap rounded-md border border-teal bg-teal px-7 py-3 text-[15px] font-medium text-white transition-colors hover:border-teal-deep hover:bg-teal-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? "جارٍ الإرسال..." : "إرسال الرسالة"}
        </button>
      </div>
    </form>
  );
}
