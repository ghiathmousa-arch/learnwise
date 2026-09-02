import { prisma } from "@/lib/prisma";

export default async function AdminSuggestionsPage() {
  const suggestions = await prisma.suggestedDomain.findMany({
    orderBy: { submittedAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-1.5 border-b border-line pb-7">
        <span className="font-mono text-xs tracking-wider text-muted uppercase">
          لوحة الإدارة
        </span>
        <h1 className="text-[22px] font-semibold text-ink">اقتراحات المجالات</h1>
      </div>

      {suggestions.length === 0 ? (
        <p className="rounded-lg border border-line py-16 text-center text-[15px] text-body">
          ما في اقتراحات واردة بعد.
        </p>
      ) : (
        <div className="flex flex-col gap-3.5">
          {suggestions.map((s) => (
            <div
              key={s.id}
              className="flex flex-col gap-3 rounded-lg border border-line p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-medium text-ink">{s.domainName}</h2>
                <span className="font-mono text-xs text-muted">
                  {new Date(s.submittedAt).toLocaleDateString("ar")}
                </span>
              </div>
              <p className="text-[14px] leading-relaxed text-body">
                {s.description}
              </p>
              <span className="text-[13px] text-muted">
                {s.user.name} · <span dir="ltr">{s.user.email}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
