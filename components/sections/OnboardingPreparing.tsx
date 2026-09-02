"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon } from "@/components/ui/icons";

const STATUS_MESSAGES = [
  "نحفظ تفضيلاتك...",
  "نبني بروفايلك الأولي...",
  "نحلّل المحتوى المتاح...",
  "نجهّز أول توصياتك...",
];

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function OnboardingPreparing() {
  const router = useRouter();
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    if (percent >= 100) return;
    const id = setTimeout(() => setPercent((p) => Math.min(100, p + 4)), 90);
    return () => clearTimeout(id);
  }, [percent]);

  const ready = percent >= 100;
  const statusIndex = Math.min(
    STATUS_MESSAGES.length - 1,
    Math.floor((percent / 100) * STATUS_MESSAGES.length),
  );
  const offset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;

  function handleEnter() {
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-center gap-7 rounded-lg border border-line px-10 py-16 text-center">
      <div className="relative flex h-36 w-36 items-center justify-center">
        <svg viewBox="0 0 120 120" className="h-36 w-36 -rotate-90">
          <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="#EDF1EF" strokeWidth="8" />
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            stroke="#1D6F5C"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-150 ease-linear"
          />
        </svg>
        <div className="absolute flex items-center justify-center">
          {ready ? (
            <CheckIcon size={40} className="text-teal" />
          ) : (
            <span className="font-mono text-2xl font-semibold text-ink">
              {percent}%
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-ink">
          {ready ? "محتواك المخصّص جاهز" : "نحضّر محتواك المخصّص..."}
        </h2>
        <p className="max-w-[40ch] text-[15px] leading-relaxed text-body">
          {ready
            ? "رشّحنا لك أول درس مفتوح الآن، وستتحسّن التوصيات مع كل مشاهدة."
            : STATUS_MESSAGES[statusIndex]}
        </p>
      </div>

      <button
        type="button"
        onClick={handleEnter}
        disabled={!ready}
        className="w-full max-w-70 rounded-lg border border-teal bg-teal px-6 py-3.5 text-[15px] font-medium text-white transition-colors hover:border-teal-deep hover:bg-teal-deep disabled:cursor-not-allowed disabled:opacity-40"
      >
        ادخل إلى المنصة
      </button>
    </div>
  );
}
