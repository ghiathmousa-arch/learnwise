import { prisma } from "@/lib/prisma";
import AdminMessagesTable from "@/components/admin/AdminMessagesTable";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { submittedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-1.5 border-b border-line pb-7">
        <span className="font-mono text-xs tracking-wider text-muted uppercase">
          لوحة الإدارة
        </span>
        <h1 className="text-[22px] font-semibold text-ink">رسائل التواصل</h1>
      </div>

      <AdminMessagesTable
        items={messages.map((m) => ({
          id: m.id,
          senderName: m.senderName,
          senderEmail: m.senderEmail,
          message: m.message,
          isRead: m.isRead,
          submittedAt: m.submittedAt.toISOString(),
        }))}
      />
    </div>
  );
}
