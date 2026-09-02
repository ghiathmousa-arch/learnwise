"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";

const NAV_LINKS = [
  { href: "/admin/dashboard", label: "نظرة عامة", meta: "" },
  { href: "/admin/content", label: "المحتوى", metaKey: "content" as const },
  { href: "/admin/users", label: "المستخدمون", metaKey: "users" as const },
  { href: "/admin/suggestions", label: "الاقتراحات", metaKey: "suggestions" as const },
  { href: "/admin/messages", label: "الرسائل", metaKey: "messages" as const },
];

const SOON_ITEMS = ["المسارات", "التقارير", "الإعدادات"];

export type AdminNavCounts = {
  content: number;
  users: number;
  suggestions: number;
  messages: number;
};

export default function AdminSidebar({
  username,
  counts,
}: {
  username: string;
  counts: AdminNavCounts;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-62 flex-none flex-col bg-teal-deep px-4.5 py-7">
      <Image
        src="/learnwise-logo-white.png"
        alt="LearnWise"
        width={1162}
        height={319}
        className="mb-6 h-6.5 w-auto px-1.5"
      />

      <nav className="flex flex-1 flex-col gap-0.5">
        {NAV_LINKS.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(`${link.href}/`);
          const meta = link.metaKey ? counts[link.metaKey] : "";
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between gap-3 rounded-md px-3 py-2.75 text-[14px] transition-colors ${
                active
                  ? "bg-white/12 text-white"
                  : "text-white/68 hover:bg-white/6 hover:text-white"
              }`}
            >
              <span>{link.label}</span>
              {meta !== "" && (
                <span
                  className={`font-mono text-[11px] ${active ? "text-white/70" : "text-white/38"}`}
                >
                  {meta}
                </span>
              )}
            </Link>
          );
        })}

        {SOON_ITEMS.map((label) => (
          <span
            key={label}
            className="flex cursor-default items-center justify-between gap-3 rounded-md px-3 py-2.75 text-[14px] text-white/38"
          >
            <span>{label}</span>
            <span className="font-mono text-[10px] tracking-wide uppercase">
              قريباً
            </span>
          </span>
        ))}
      </nav>

      <div className="flex flex-col gap-3 border-t border-white/14 pt-3.5">
        <div className="flex flex-col gap-0.5 px-3 py-2.5">
          <span className="text-[13px] text-white">{username}</span>
          <span className="font-mono text-[11px] text-white/50">
            مدير النظام
          </span>
        </div>
        <AdminLogoutButton />
      </div>
    </aside>
  );
}
