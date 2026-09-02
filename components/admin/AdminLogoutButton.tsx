"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-[13px] font-medium text-[#C7CFCC] transition-colors hover:border-white/20 hover:text-white disabled:opacity-60"
    >
      تسجيل خروج
    </button>
  );
}
