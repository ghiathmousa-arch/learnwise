const stats = [
  { value: "٢٤٠+", label: "درسًا تفاعليًا", note: "موزّعة على ٨ مسارات" },
  { value: "١٨ ألف", label: "متعلّم مسجَّل", note: "من ٢٢ دولة" },
  { value: "٩٢٪", label: "نسبة إتمام المسار", note: "لمن أكمل أول درسين" },
  { value: "٤.٨", label: "تقييم المتعلّمين", note: "من ٥ · ٣٤٠٠ تقييم" },
];

export default function Stats() {
  return (
    <section
      id="stats"
      className="border-t border-line bg-linear-to-b from-teal-wash to-white px-6 py-22 md:px-16"
    >
      <div className="flex flex-wrap items-end justify-between gap-10">
        <h2 className="text-3xl font-semibold tracking-tight text-ink">
          أرقام حتى منتصف ٢٠٢٦
        </h2>
        <span className="font-mono text-xs text-muted">تُحدَّث شهريًا</span>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="flex flex-col gap-2.5 overflow-hidden rounded-xl border border-line bg-white p-8 shadow-sm shadow-ink/5 transition-shadow hover:shadow-lg"
          >
            <span
              className={`h-1 w-9 rounded-full ${
                i % 2 === 0 ? "bg-teal" : "bg-amber"
              }`}
            />
            <span
              className={`mt-2 text-[44px] leading-none font-bold tracking-tight ${
                i % 2 === 0 ? "text-teal" : "text-amber"
              }`}
            >
              {stat.value}
            </span>
            <span className="text-base font-medium text-ink">
              {stat.label}
            </span>
            <span className="text-sm text-muted">{stat.note}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
