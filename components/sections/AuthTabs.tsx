import Link from "next/link";

export default function AuthTabs({ active }: { active: "login" | "register" }) {
  const tabs = [
    { id: "login", href: "/login", label: "تسجيل الدخول" },
    { id: "register", href: "/register", label: "إنشاء حساب" },
  ] as const;

  return (
    <div className="flex gap-1.5 rounded-lg border border-line bg-offwhite p-1.5">
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`flex-1 rounded-md px-4 py-2.75 text-center text-[15px] font-medium transition-colors ${
              isActive
                ? "border border-teal-line bg-white text-teal-deep"
                : "border border-transparent text-body hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
