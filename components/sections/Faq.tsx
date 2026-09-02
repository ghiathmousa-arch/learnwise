import FaqAccordion from "@/components/sections/FaqAccordion";

export default function Faq() {
  return (
    <section
      id="faq"
      className="relative overflow-hidden border-t border-line bg-linear-to-b from-teal-wash/70 via-surface to-surface px-6 py-24 md:px-16"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 end-[-8%] h-96 w-96 rounded-full bg-amber/10 blur-[120px]"
      />

      <div className="relative grid grid-cols-1 gap-16 lg:grid-cols-[320px_1fr]">
        <div className="flex flex-col gap-3">
          <span className="w-fit rounded-full border border-teal-line bg-white px-3 py-1.5 font-mono text-xs tracking-wider text-teal shadow-sm">
            الدعم والأسئلة
          </span>
          <h2 className="mt-2 text-3xl font-semibold text-ink">
            الأسئلة الشائعة
          </h2>
          <p className="text-[15px] leading-relaxed text-body">
            لم تجد سؤالك؟ اكتب لنا وسنرد خلال يوم عمل واحد.
          </p>
        </div>

        <FaqAccordion />
      </div>
    </section>
  );
}
