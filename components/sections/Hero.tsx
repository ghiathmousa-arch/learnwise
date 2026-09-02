import Button from "@/components/ui/Button";

function buildAccentCells() {
  return Array.from({ length: 36 }, (_, i) => {
    const r = Math.floor(i / 6);
    const c = i % 6;
    const solid = (r + c) % 3 === 0;
    const wash = (r * c) % 4 === 1;
    return {
      fill: solid ? "#1D6F5C" : wash ? "#F1F6F4" : "transparent",
      stroke: solid ? "#1D6F5C" : "#DDE5E2",
    };
  });
}

export default function Hero() {
  const accentCells = buildAccentCells();

  return (
    <section
      id="hero"
      className="relative grid grid-cols-1 items-center gap-16 overflow-hidden px-6 py-20 md:px-16 lg:grid-cols-[1fr_380px] lg:py-26"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 start-[-10%] h-[26rem] w-[26rem] rounded-full bg-teal/18 blur-[110px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 end-[6%] h-80 w-80 rounded-full bg-amber/14 blur-[100px]"
      />

      <div className="relative flex flex-col items-start gap-7">
        <span className="rounded-full border border-teal-line bg-teal-wash px-3 py-1.5 font-mono text-xs tracking-wider text-teal shadow-sm">
          توصيات مبنية على مستواك
        </span>
        <h1 className="max-w-[22ch] text-4xl font-bold leading-tight tracking-tight text-ink md:text-5xl">
          تعلُّم أذكى: المنصّة تختار لك{" "}
          <span className="bg-linear-to-l from-teal to-teal-bright bg-clip-text text-transparent">
            الدرس التالي
          </span>
        </h1>
        <p className="max-w-[52ch] text-lg leading-loose text-body">
          يحلّل LearnWise مستواك وأهدافك ووتيرة تقدّمك، ثم يرشّح الدروس
          المناسبة في الوقت المناسب. لا مسارات عامة، ولا محتوى زائد.
        </p>
        <div className="flex flex-wrap items-center gap-4 pt-1">
          <Button href="/register" size="lg">
            ابدأ مجانًا
          </Button>
          <Button href="#lessons" variant="outline" size="lg">
            استعرض المسارات
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-7 pt-5 text-sm text-muted">
          <span>أكثر من ٢٤٠ درسًا</span>
          <span className="h-3.5 w-px bg-line" />
          <span>٨ مسارات تقنية</span>
          <span className="h-3.5 w-px bg-line" />
          <span>بدون بطاقة بنكية</span>
        </div>
      </div>

      <div className="relative hidden rounded-xl border border-line bg-surface p-10 shadow-lg shadow-ink/5 lg:grid lg:grid-cols-6 lg:gap-4.5">
        {accentCells.map((cell, i) => (
          <div
            key={i}
            className="aspect-square rounded-sm border"
            style={{ background: cell.fill, borderColor: cell.stroke }}
          />
        ))}
      </div>
    </section>
  );
}
