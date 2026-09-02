import SectionHeading from "@/components/ui/SectionHeading";
import { ChartIcon, LayersIcon, ClockIcon } from "@/components/ui/icons";

const steps = [
  {
    icon: ChartIcon,
    title: "قياس المستوى",
    description:
      "اختبار قصير وتحليل لأدائك في التمارين يحدّدان نقطة البداية الفعلية، لا المفترضة.",
  },
  {
    icon: LayersIcon,
    title: "ترشيح الدروس",
    description:
      "يرتّب النظام الدروس حسب الفجوة بين مستواك وهدفك، ويقترح درسًا واحدًا في كل مرة.",
  },
  {
    icon: ClockIcon,
    title: "متابعة التقدّم",
    description:
      "تُعاد جدولة المراجعات تلقائيًا قبل أن تنسى، وتتغيّر وتيرة المسار مع وقتك المتاح.",
  },
];

export default function Services() {
  return (
    <section
      id="services"
      className="border-t border-line px-6 py-24 md:px-16"
    >
      <SectionHeading
        kicker="نظام التوصيات"
        title="كيف تقرّر المنصّة ما تتعلّمه بعد ذلك"
        description="ثلاث خطوات تعمل بعد كل جلسة: قياس، ترشيح، ثم إعادة ضبط للمسار حسب نتائجك."
        className="max-w-[62ch]"
      />

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {steps.map(({ icon: Icon, title, description }, i) => (
          <div
            key={title}
            className="group rounded-xl border border-line bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-teal-line hover:shadow-lg hover:shadow-ink/5"
          >
            <span
              className={`inline-flex h-13 w-13 items-center justify-center rounded-full ${
                i === 1 ? "bg-amber-wash" : "bg-teal-wash"
              }`}
            >
              <Icon
                size={26}
                className={i === 1 ? "text-amber" : "text-teal"}
              />
            </span>
            <h3 className="mt-6 text-lg font-semibold text-ink">{title}</h3>
            <p className="mt-2.5 text-[15px] leading-relaxed text-body">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
