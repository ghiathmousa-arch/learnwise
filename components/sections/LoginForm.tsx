"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    setPending(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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

      const body = await res.json();
      router.push(body.onboardingComplete ? "/" : "/onboarding");
      router.refresh();
    } catch {
      setError("تعذّر الاتصال بالخادم. تحقّق من الاتصال وحاول مرة ثانية.");
      setPending(false);
    }
  }

  return (
    <div className="flex w-full max-w-105 flex-col gap-7">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold text-ink">مرحبًا بعودتك</h1>
        <p className="text-[15px] leading-relaxed text-body">
          أدخل بياناتك لمتابعة مسارك من حيث توقّفت.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
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
            dir="ltr"
            className="rounded-lg border border-line px-4 py-3.25 text-left text-[15px] text-ink outline-none focus:border-teal"
          />
          <span className="text-xs text-muted">
            تأكد من تعطيل قفل الأحرف الكبيرة.
          </span>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg border border-teal bg-teal px-6 py-3.5 text-[15px] font-medium text-white transition-colors hover:border-teal-deep hover:bg-teal-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "جارٍ الدخول..." : "تسجيل الدخول"}
        </button>

        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-body">
            ليس لديك حساب؟{" "}
            <Link href="/register" className="font-medium text-teal">
              أنشئ حسابًا
            </Link>
          </span>
          <span className="cursor-pointer text-muted">
            نسيت كلمة المرور؟
          </span>
        </div>
      </form>
    </div>
  );
}
