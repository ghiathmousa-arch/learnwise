const facts = [
  { label: "التأسيس", value: "٢٠٢٣" },
  { label: "الفريق", value: "١٤ شخصًا في ٣ مدن" },
  { label: "المراجعة", value: "مهندسون عاملون في المجال" },
];

export default function About() {
  return (
    <section
      id="about"
      className="grid grid-cols-1 gap-16 border-t border-line px-6 py-24 md:px-16 lg:grid-cols-[1fr_300px]"
    >
      <div className="flex flex-col gap-6">
        <span className="font-mono text-xs tracking-wider text-muted uppercase">
          من نحن
        </span>
        <h2 className="max-w-[24ch] text-3xl leading-snug font-semibold tracking-tight text-ink md:text-4xl">
          منصّة تعلُّم تقني تحترم وقت المتعلّم
        </h2>
        <p className="max-w-[62ch] text-lg leading-loose text-body">
          بدأت LearnWise من سؤال واحد: لماذا يقضي المتعلّم وقتًا أطول في
          اختيار ما يتعلّمه مما يقضيه في التعلُّم نفسه؟ نبني مسارات تقنية
          قصيرة يراجعها مهندسون عاملون في المجال، ونضع فوقها نظام توصيات يقرأ
          مستواك ويقترح الخطوة التالية فقط.
        </p>
        <p className="max-w-[62ch] text-lg leading-loose text-body">
          فريقنا موزّع بين ثلاث مدن، ونعمل بمبدأ واحد: محتوى أقل، أثر أوضح.
        </p>
      </div>

      <div className="flex flex-col gap-5 rounded-xl border border-teal-line bg-teal-wash/60 p-7">
        {facts.map((fact, i) => (
          <div
            key={fact.label}
            className={`flex flex-col gap-1 ${
              i > 0 ? "border-t border-teal-line/70 pt-5" : ""
            }`}
          >
            <span className="font-mono text-[11px] tracking-wider text-teal uppercase">
              {fact.label}
            </span>
            <span className="text-base font-medium text-ink">
              {fact.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
