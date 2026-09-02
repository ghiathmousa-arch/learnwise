"use client";

import { useState } from "react";
import { UserIcon, YoutubeIcon, ArticleIcon } from "@/components/ui/icons";

type Level = "beginner" | "intermediate" | "advanced";
type Goal = "skill" | "interview" | "academic";
type Style = "practical" | "theory";
type Pace = "light" | "balanced" | "intensive";
type ContentType = "video" | "article" | "both";

type Topic = { id: number; label: string };

type Prefs = {
  level: Level;
  topicIds: number[];
  goal: Goal;
  learningStyle: Style;
  weeklyTime: Pace;
  preferredContentType: ContentType;
};

const LEVEL_OPTIONS: { id: Level; label: string }[] = [
  { id: "beginner", label: "مبتدئ" },
  { id: "intermediate", label: "متوسط" },
  { id: "advanced", label: "متقدّم" },
];

const GOAL_OPTIONS: { id: Goal; label: string }[] = [
  { id: "skill", label: "بناء مهارة" },
  { id: "interview", label: "التحضير للمقابلات" },
  { id: "academic", label: "دعم دراسي" },
];

const PACE_OPTIONS: { id: Pace; label: string }[] = [
  { id: "light", label: "٢–٣ ساعات أسبوعيًا" },
  { id: "balanced", label: "٤–٦ ساعات أسبوعيًا" },
  { id: "intensive", label: "٨+ ساعات أسبوعيًا" },
];

function Pill({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <span
      onClick={onClick}
      className={`cursor-pointer rounded-full border px-4 py-1.75 text-sm font-medium transition-colors ${
        selected
          ? "border-teal bg-teal text-white"
          : "border-line bg-white text-body hover:border-teal-line"
      }`}
    >
      {children}
    </span>
  );
}

function SettingsRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 border-b border-[#F0F3F2] px-6.5 py-6 last:border-b-0 md:grid-cols-[240px_1fr]">
      <div className="flex flex-col gap-1">
        <span className="text-[15px] font-medium text-ink">{title}</span>
        <span className="text-[13px] text-muted">{description}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">{children}</div>
    </div>
  );
}

function normalize(initial: {
  level: string | null;
  goal: string | null;
  learningStyle: string | null;
  weeklyTime: string | null;
  preferredContentType: string | null;
  topicIds: number[];
}): Prefs {
  return {
    level: (initial.level as Level) ?? "beginner",
    topicIds: initial.topicIds,
    goal: (initial.goal as Goal) ?? "skill",
    learningStyle: (initial.learningStyle as Style) ?? "practical",
    weeklyTime: (initial.weeklyTime as Pace) ?? "balanced",
    preferredContentType:
      (initial.preferredContentType as ContentType) ?? "both",
  };
}

export default function ProfileSettings({
  user,
  topics,
  initial,
}: {
  user: { name: string; email: string; memberSince: string };
  topics: Topic[];
  initial: {
    level: string | null;
    goal: string | null;
    learningStyle: string | null;
    weeklyTime: string | null;
    preferredContentType: string | null;
    topicIds: number[];
  };
}) {
  const initialPrefs = normalize(initial);
  const [prefs, setPrefs] = useState<Prefs>(initialPrefs);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  const memberSince = new Date(user.memberSince).toLocaleDateString("ar", {
    year: "numeric",
    month: "long",
  });

  function toggleTopic(id: number) {
    setPrefs((prev) => ({
      ...prev,
      topicIds: prev.topicIds.includes(id)
        ? prev.topicIds.filter((t) => t !== id)
        : [...prev.topicIds, id],
    }));
  }

  function handleReset() {
    setPrefs(initialPrefs);
    setStatus("idle");
  }

  async function handleSave() {
    setStatus("saving");
    setError("");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error || "صار في خطأ، حاول مرة ثانية.");
        setStatus("error");
        return;
      }

      setStatus("saved");
    } catch {
      setError("تعذّر الاتصال بالخادم. تحقّق من الاتصال وحاول مرة ثانية.");
      setStatus("error");
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white">
      <div className="flex flex-wrap items-center gap-6 border-b border-line px-8 py-8">
        <div className="flex h-22 w-22 items-center justify-center rounded-full border border-teal-line bg-teal-wash">
          <UserIcon size={36} className="text-teal" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-2xl font-semibold text-ink">{user.name}</h2>
          <span dir="ltr" className="text-[15px] text-muted">
            {user.email}
          </span>
          <span className="font-mono text-xs text-muted">
            عضو منذ {memberSince}
          </span>
        </div>
      </div>

      <div className="px-8 pt-7 pb-4">
        <h3 className="text-lg font-semibold text-ink">تفضيلات التعلُّم</h3>
        <p className="mt-1.5 text-[15px] leading-relaxed text-body">
          تُستخدم هذه الخيارات في ترشيح الدروس. أي تعديل ينعكس على مسارك
          مباشرة.
        </p>
      </div>

      <div className="mx-8 mb-4 rounded-lg border border-line">
        <SettingsRow title="المستوى والخبرة" description="يحدّد نقطة انطلاق المسار">
          {LEVEL_OPTIONS.map((opt) => (
            <Pill
              key={opt.id}
              selected={prefs.level === opt.id}
              onClick={() => setPrefs((p) => ({ ...p, level: opt.id }))}
            >
              {opt.label}
            </Pill>
          ))}
        </SettingsRow>

        <SettingsRow
          title="المواضيع التي تهمّك"
          description="يمكنك اختيار أكثر من موضوع"
        >
          {topics.map((topic) => (
            <Pill
              key={topic.id}
              selected={prefs.topicIds.includes(topic.id)}
              onClick={() => toggleTopic(topic.id)}
            >
              {topic.label}
            </Pill>
          ))}
        </SettingsRow>

        <SettingsRow title="هدف التعلُّم" description="هدف واحد في كل مرة">
          {GOAL_OPTIONS.map((opt) => (
            <Pill
              key={opt.id}
              selected={prefs.goal === opt.id}
              onClick={() => setPrefs((p) => ({ ...p, goal: opt.id }))}
            >
              {opt.label}
            </Pill>
          ))}
        </SettingsRow>

        <SettingsRow
          title="أسلوب التعلُّم"
          description="تطبيق عملي أو أساس نظري"
        >
          <span
            onClick={() =>
              setPrefs((p) => ({
                ...p,
                learningStyle: p.learningStyle === "practical" ? "theory" : "practical",
              }))
            }
            className={`flex h-7 w-13 cursor-pointer items-center rounded-full border p-0.75 transition-colors ${
              prefs.learningStyle === "practical"
                ? "justify-start border-teal bg-teal"
                : "justify-end border-line bg-[#EDF1EF]"
            }`}
          >
            <span className="h-5.5 w-5.5 rounded-full border border-black/10 bg-white" />
          </span>
          <span className="text-sm text-ink">
            {prefs.learningStyle === "practical"
              ? "تطبيق عملي أولًا"
              : "أساس نظري أولًا"}
          </span>
        </SettingsRow>

        <SettingsRow
          title="الوقت الأسبوعي المتاح"
          description="يضبط وتيرة المسار"
        >
          {PACE_OPTIONS.map((opt) => (
            <Pill
              key={opt.id}
              selected={prefs.weeklyTime === opt.id}
              onClick={() => setPrefs((p) => ({ ...p, weeklyTime: opt.id }))}
            >
              {opt.label}
            </Pill>
          ))}
        </SettingsRow>

        <SettingsRow
          title="نوع المحتوى المفضّل"
          description="يرجّح ترتيب التوصيات"
        >
          <span
            onClick={() => setPrefs((p) => ({ ...p, preferredContentType: "video" }))}
            className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              prefs.preferredContentType === "video"
                ? "border-teal bg-teal text-white"
                : "border-line bg-white text-body"
            }`}
          >
            <YoutubeIcon size={16} />
            فيديو
          </span>
          <span
            onClick={() => setPrefs((p) => ({ ...p, preferredContentType: "article" }))}
            className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              prefs.preferredContentType === "article"
                ? "border-teal bg-teal text-white"
                : "border-line bg-white text-body"
            }`}
          >
            <ArticleIcon size={16} />
            مقال
          </span>
          <Pill
            selected={prefs.preferredContentType === "both"}
            onClick={() => setPrefs((p) => ({ ...p, preferredContentType: "both" }))}
          >
            الاثنان
          </Pill>
        </SettingsRow>
      </div>

      {error && <p className="px-8 pb-2 text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line bg-surface px-8 py-5.5">
        <span className="text-[13px] text-muted">
          {status === "saved" ? "تم الحفظ." : "لسا ما حفظت التعديلات."}
        </span>
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-line px-6 py-3 text-[15px] font-medium text-body transition-colors hover:border-[#C9CFCD] hover:text-ink"
          >
            تراجع
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={status === "saving"}
            className="rounded-lg border border-teal bg-teal px-7.5 py-3 text-[15px] font-medium text-white transition-colors hover:border-teal-deep hover:bg-teal-deep disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "saving" ? "جارٍ الحفظ..." : "حفظ التغييرات"}
          </button>
        </div>
      </div>
    </div>
  );
}
