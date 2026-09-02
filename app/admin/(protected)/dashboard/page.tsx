import Link from "next/link";
import { prisma } from "@/lib/prisma";
import StatCard from "@/components/admin/StatCard";

export default async function AdminDashboardPage() {
  const [users, content, suggestions, unreadMessages] = await Promise.all([
    prisma.user.count(),
    prisma.content.count(),
    prisma.suggestedDomain.count(),
    prisma.contactMessage.count({ where: { isRead: false } }),
  ]);

  const updatedAt = new Date().toLocaleTimeString("ar", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-6 border-b border-line pb-7">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[22px] font-semibold text-ink">نظرة عامة</h1>
          <span className="text-sm text-muted">آخر تحديث: اليوم {updatedAt}</span>
        </div>
        <Link
          href="/admin/content/new"
          className="rounded-md border border-teal bg-teal px-5 py-2.5 text-[14px] font-medium whitespace-nowrap text-white transition-colors hover:border-teal-deep hover:bg-teal-deep"
        >
          إضافة محتوى
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="إجمالي المستخدمين"
          value={users}
          note="حساب طالب مسجَّل"
          href="/admin/users"
        />
        <StatCard
          label="إجمالي المحتوى"
          value={content}
          note="فيديو ومقال منشور"
          href="/admin/content"
        />
        <StatCard
          label="اقتراحات معلّقة"
          value={suggestions}
          note={suggestions > 0 ? "تنتظر المراجعة" : "لا يوجد جديد"}
          href="/admin/suggestions"
        />
        <StatCard
          label="رسائل غير مقروءة"
          value={unreadMessages}
          note={unreadMessages > 0 ? "بحاجة لمراجعة" : "لا يوجد جديد"}
          href="/admin/messages"
        />
      </div>
    </div>
  );
}
