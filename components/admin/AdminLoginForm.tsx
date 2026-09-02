"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    setPending(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.get("username"),
          password: data.get("password"),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error || "صار في خطأ، حاول مرة ثانية.");
        setPending(false);
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("تعذّر الاتصال بالخادم. تحقّق من الاتصال وحاول مرة ثانية.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-white/86">
          اسم المستخدم الإداري
        </span>
        <input
          type="text"
          name="username"
          required
          autoFocus
          dir="ltr"
          autoComplete="username"
          className="rounded-lg border border-white/20 bg-white/6 px-4 py-3.25 text-left text-[15px] text-white outline-none focus:border-[#7FD3BF]"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-white/86">
          كلمة المرور
        </span>
        <input
          type="password"
          name="password"
          required
          dir="ltr"
          autoComplete="current-password"
          className="rounded-lg border border-white/20 bg-white/6 px-4 py-3.25 text-left text-[15px] text-white outline-none focus:border-[#7FD3BF]"
        />
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg border border-teal bg-teal px-6 py-3.5 text-[15px] font-medium text-white transition-colors hover:border-teal-bright hover:bg-teal-bright disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "جارٍ الدخول..." : "دخول آمن"}
      </button>

      <span className="text-center text-[13px] text-white/50">
        للمساعدة، راسل فريق التشغيل الداخلي.
      </span>
    </form>
  );
}
