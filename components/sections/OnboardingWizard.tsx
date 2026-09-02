"use client";

import { useState } from "react";
import OnboardingPreparing from "@/components/sections/OnboardingPreparing";

type Level = "beginner" | "intermediate" | "advanced";
type Goal = "skill" | "interview" | "academic";
type Style = "practical" | "theory";
type Pace = "light" | "balanced" | "intensive";

type Topic = { id: number; label: string };

type Answers = {
  level: Level | null;
  topicIds: number[];
  goal: Goal | null;
  learningStyle: Style | null;
  weeklyTime: Pace | null;
};

const STEP_LABELS = [
  "المستوى الحالي",
  "مواضيع تهمّك",
  "هدفك من التعلّم",
  "أسلوب التعلّم",
  "الوقت الأسبوعي",
  "مراجعة وتأكيد",
];

const LEVELS: { id: Level; title: string; desc: string }[] = [
  {
    id: "beginner",
    title: "مبتدئ",
    desc: "أعرف الأساسيات النظرية ولم أبنِ مشروعًا بعد.",
  },
  {
    id: "intermediate",
    title: "متوسط",
    desc: "أكتب كودًا بثقة وأحتاج تنظيم المعرفة وتعميقها.",
  },
  {
    id: "advanced",
    title: "متقدّم",
    desc: "أعمل في المجال وأبحث عن مواضيع متخصّصة.",
  },
];

const GOALS: { id: Goal; title: string; desc: string }[] = [
  {
    id: "skill",
    title: "بناء مهارة",
    desc: "تعلُّم تقنية جديدة وتطبيقها في مشروع عملي.",
  },
  {
    id: "interview",
    title: "التحضير للمقابلات",
    desc: "تمارين خوارزميات وأسئلة تصميم أنظمة بجدول مضغوط.",
  },
  {
    id: "academic",
    title: "دعم دراسي",
    desc: "شرح موازٍ لمقرّراتك الجامعية مع تمارين مرافقة.",
  },
];

const STYLES: { id: Style; label: string; note: string }[] = [
  {
    id: "practical",
    label: "تطبيق عملي أولًا",
    note: "سيبدأ كل درس بتمرين قصير، ثم يأتي الشرح النظري لما احتجته فيه.",
  },
  {
    id: "theory",
    label: "أساس نظري أولًا",
    note: "سيبدأ كل درس بالمفاهيم والنماذج، ثم تمرين يثبّتها في نهاية الوحدة.",
  },
];

const PACES: { id: Pace; hours: string; label: string; note: string }[] = [
  { id: "light", hours: "٢–٣ ساعات", label: "وتيرة هادئة", note: "درس واحد أسبوعيًا" },
  { id: "balanced", hours: "٤–٦ ساعات", label: "وتيرة متوازنة", note: "درسان ومراجعة" },
  { id: "intensive", hours: "٨+ ساعات", label: "وتيرة مكثّفة", note: "مسار مضغوط بمشاريع" },
];

const toArabicDigits = (n: number) =>
  String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

function OptionCard({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-lg border p-6 transition-colors ${
        selected
          ? "border-teal bg-teal-wash"
          : "border-line bg-white hover:border-teal-line"
      }`}
    >
      {children}
    </div>
  );
}

export default function OnboardingWizard({ topics }: { topics: Topic[] }) {
  const [step, setStep] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [answers, setAnswers] = useState<Answers>({
    level: null,
    topicIds: [],
    goal: null,
    learningStyle: null,
    weeklyTime: null,
  });

  const isStepValid = [
    answers.level !== null,
    answers.topicIds.length > 0,
    answers.goal !== null,
    answers.learningStyle !== null,
    answers.weeklyTime !== null,
    true,
  ][step];

  function toggleTopic(id: number) {
    setAnswers((prev) => ({
      ...prev,
      topicIds: prev.topicIds.includes(id)
        ? prev.topicIds.filter((t) => t !== id)
        : [...prev.topicIds, id],
    }));
  }

  async function handleFinish() {
    setPending(true);
    setError("");

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error || "صار في خطأ، حاول مرة ثانية.");
        setPending(false);
        return;
      }

      setDone(true);
    } catch {
      setError("تعذّر الاتصال بالخادم. تحقّق من الاتصال وحاول مرة ثانية.");
      setPending(false);
    }
  }

  function handleNext() {
    if (step === STEP_LABELS.length - 1) {
      handleFinish();
      return;
    }
    setStep((s) => Math.min(STEP_LABELS.length - 1, s + 1));
  }

  const goalLabel = GOALS.find((g) => g.id === answers.goal)?.title ?? "";
  const styleLabel =
    answers.learningStyle === "practical"
      ? "تطبيق عملي أولًا"
      : answers.learningStyle === "theory"
        ? "أساس نظري أولًا"
        : "";
  const paceInfo = PACES.find((p) => p.id === answers.weeklyTime);
  const levelLabel = LEVELS.find((l) => l.id === answers.level)?.title ?? "";
  const selectedTopics = topics.filter((t) => answers.topicIds.includes(t.id));

  if (done) {
    return <OnboardingPreparing />;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <div className="border-b border-line px-10 pt-7 pb-6">
        <div className="flex items-center justify-between gap-6 pb-3.5">
          <span className="text-[15px] font-medium text-ink">
            {STEP_LABELS[step]}
          </span>
          <span className="font-mono text-xs text-muted">
            الخطوة {toArabicDigits(step + 1)} من {toArabicDigits(STEP_LABELS.length)}
          </span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-[#EDF1EF]">
          <div
            className="h-full bg-teal transition-all"
            style={{ width: `${((step + 1) / STEP_LABELS.length) * 100}%` }}
          />
        </div>
        <div className="flex items-center gap-2.5 pt-4">
          {STEP_LABELS.map((label, i) => {
            const done = i < step;
            const current = i === step;
            return (
              <span
                key={label}
                className={`rounded border px-2.25 py-1 font-mono text-[11px] ${
                  current
                    ? "border-teal bg-teal text-white"
                    : done
                      ? "border-teal-line bg-teal-wash text-teal-deep"
                      : "border-line bg-white text-muted"
                }`}
              >
                {toArabicDigits(i + 1)}
              </span>
            );
          })}
        </div>
      </div>

      <div className="min-h-[340px] px-10 pt-11 pb-10">
        {step === 0 && (
          <div className="flex flex-col gap-6">
            <p className="text-base text-body">اختر المستوى الأقرب لخبرتك الحالية.</p>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {LEVELS.map((level) => (
                <OptionCard
                  key={level.id}
                  selected={answers.level === level.id}
                  onClick={() =>
                    setAnswers((prev) => ({ ...prev, level: level.id }))
                  }
                >
                  <span className="text-lg font-semibold text-ink">
                    {level.title}
                  </span>
                  <p className="mt-1.5 text-sm leading-relaxed text-body">
                    {level.desc}
                  </p>
                </OptionCard>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-6">
            <p className="text-base text-body">
              اختر ما يهمّك — يمكنك تحديد أكثر من موضوع.
            </p>
            <div className="flex max-w-[780px] flex-wrap gap-3.5">
              {topics.map((topic) => {
                const selected = answers.topicIds.includes(topic.id);
                return (
                  <span
                    key={topic.id}
                    onClick={() => toggleTopic(topic.id)}
                    className={`cursor-pointer rounded-full border px-5 py-2.5 text-[15px] transition-colors ${
                      selected
                        ? "border-teal bg-teal-wash text-teal-deep"
                        : "border-line bg-white text-body hover:border-teal-line"
                    }`}
                  >
                    {topic.label}
                  </span>
                );
              })}
            </div>
            <span className="font-mono text-xs text-muted">
              اخترت {toArabicDigits(answers.topicIds.length)} من{" "}
              {toArabicDigits(topics.length)}
            </span>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-6">
            <p className="text-base text-body">ما الهدف من التعلُّم الآن؟</p>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {GOALS.map((goal) => (
                <OptionCard
                  key={goal.id}
                  selected={answers.goal === goal.id}
                  onClick={() =>
                    setAnswers((prev) => ({ ...prev, goal: goal.id }))
                  }
                >
                  <span className="text-lg font-semibold text-ink">
                    {goal.title}
                  </span>
                  <p className="mt-1.5 text-sm leading-relaxed text-body">
                    {goal.desc}
                  </p>
                </OptionCard>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex max-w-[720px] flex-col gap-7">
            <p className="text-base text-body">
              كيف تفضّل توزيع الوقت بين التطبيق والنظرية؟
            </p>
            <div className="flex gap-1.5 rounded-lg border border-line bg-offwhite p-1.5">
              {STYLES.map((option) => {
                const selected = answers.learningStyle === option.id;
                return (
                  <span
                    key={option.id}
                    onClick={() =>
                      setAnswers((prev) => ({
                        ...prev,
                        learningStyle: option.id,
                      }))
                    }
                    className={`flex-1 cursor-pointer rounded-md px-5 py-3 text-center text-[15px] font-medium transition-colors ${
                      selected
                        ? "border border-teal-line bg-white text-teal-deep"
                        : "border border-transparent text-body"
                    }`}
                  >
                    {option.label}
                  </span>
                );
              })}
            </div>
            {answers.learningStyle && (
              <p className="text-[15px] leading-relaxed text-body">
                {
                  STYLES.find((s) => s.id === answers.learningStyle)?.note
                }
              </p>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-6">
            <p className="text-base text-body">كم وقتًا تستطيع تخصيصه أسبوعيًا؟</p>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {PACES.map((pace) => (
                <OptionCard
                  key={pace.id}
                  selected={answers.weeklyTime === pace.id}
                  onClick={() =>
                    setAnswers((prev) => ({ ...prev, weeklyTime: pace.id }))
                  }
                >
                  <span className="text-2xl font-semibold text-teal">
                    {pace.hours}
                  </span>
                  <p className="mt-2 text-[15px] font-medium text-ink">
                    {pace.label}
                  </p>
                  <p className="mt-1 text-sm text-muted">{pace.note}</p>
                </OptionCard>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="flex max-w-[720px] flex-col gap-6">
            <p className="text-base text-body">
              هذه خلاصة اختياراتك. سيبدأ المسار من الدرس المرشَّح لك.
            </p>
            <div className="rounded-lg border border-line">
              {[
                { label: "المستوى", value: levelLabel },
                {
                  label: "المواضيع",
                  value: selectedTopics.map((t) => t.label).join(" · "),
                },
                { label: "الهدف", value: goalLabel },
                { label: "الأسلوب", value: styleLabel },
                {
                  label: "الوقت الأسبوعي",
                  value: paceInfo ? `${paceInfo.hours} · ${paceInfo.label}` : "",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[140px_1fr] gap-6 border-b border-[#F0F3F2] px-6 py-4.5 last:border-b-0"
                >
                  <span className="font-mono text-xs tracking-wider text-muted uppercase">
                    {row.label}
                  </span>
                  <span className="text-[15px] text-ink">{row.value}</span>
                </div>
              ))}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-6 border-t border-line bg-surface px-10 py-5.5">
        <span
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className={`text-[15px] ${
            step === 0
              ? "cursor-not-allowed text-muted/50"
              : "cursor-pointer text-body hover:text-ink"
          }`}
        >
          رجوع
        </span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted">
            يمكنك تعديل هذه الخيارات لاحقًا
          </span>
          <button
            type="button"
            onClick={handleNext}
            disabled={!isStepValid || pending}
            className="rounded-md border border-teal bg-teal px-7.5 py-3 text-[15px] font-medium text-white transition-colors hover:border-teal-deep hover:bg-teal-deep disabled:cursor-not-allowed disabled:opacity-60"
          >
            {step === STEP_LABELS.length - 1
              ? pending
                ? "جارٍ البدء..."
                : "ابدأ المسار"
              : "التالي"}
          </button>
        </div>
      </div>
    </div>
  );
}
