"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    setPending(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          password: data.get("password"),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error || "صار في خطأ، حاول مرة ثانية.");
        setPending(false);
        return;
      }

      router.push("/onboarding");
      router.refresh();
    } catch {
      setError("تعذّر الاتصال بالخادم. تحقّق من الاتصال وحاول مرة ثانية.");
      setPending(false);
    }
  }

  return (
    <div className="flex w-full max-w-105 flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold text-ink">
          أنشئ حسابك المجاني
        </h1>
        <p className="text-[15px] leading-relaxed text-body">
          دقيقة واحدة، ثم نرشّح لك أول درس حسب مستواك.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
        <label className="flex flex-col gap-2">
          <span className="text-[13px] font-medium text-ink">
            الاسم الكامل
          </span>
          <input
            type="text"
            name="name"
            required
            maxLength={120}
            placeholder="مثال: سارة الحسن"
            className="rounded-lg border border-line px-4 py-3.25 text-[15px] text-ink outline-none focus:border-teal"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[13px] font-medium text-ink">
            البريد الإلكتروني
          </span>
          <input
            type="email"
            name="email"
            required
            dir="ltr"
            placeholder="name@example.com"
            className="rounded-lg border border-line px-4 py-3.25 text-left text-[15px] text-ink outline-none focus:border-teal"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[13px] font-medium text-ink">
            كلمة المرور
          </span>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            dir="ltr"
            className="rounded-lg border border-line px-4 py-3.25 text-left text-[15px] text-ink outline-none focus:border-teal"
          />
          <span className="text-xs text-muted">
            ٨ أحرف على الأقل، بينها رقم واحد.
          </span>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg border border-teal bg-teal px-6 py-3.5 text-[15px] font-medium text-white transition-colors hover:border-teal-deep hover:bg-teal-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
        </button>

        <span className="text-sm text-body">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="font-medium text-teal">
            سجّل الدخول
          </Link>
        </span>
      </form>
    </div>
  );
}
