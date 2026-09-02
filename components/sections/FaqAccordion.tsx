"use client";

import { useState } from "react";

const faqs = [
  {
    question: "هل أحتاج خبرة سابقة للبدء؟",
    answer:
      "لا. يبدأ كل مسار باختبار قصير يحدّد نقطة انطلاقك، فإن كنت مبتدئًا تُرشَّح لك الدروس التأسيسية أولًا.",
  },
  {
    question: "كيف يعمل نظام التوصيات؟",
    answer:
      "يقرأ النظام نتائج تمارينك ووتيرة إنجازك، ثم يرتّب الدروس حسب الفجوة بين مستواك الحالي وهدفك المعلَن، ويقترح خطوة واحدة في كل مرة.",
  },
  {
    question: "هل الشهادات معتمدة؟",
    answer:
      "نصدر شهادة إتمام لكل مسار تتضمّن المشاريع التي أنجزتها، ويمكن لجهة العمل التحقّق منها عبر رابط دائم.",
  },
  {
    question: "ما مدة الاشتراك وهل يمكن إلغاؤه؟",
    answer:
      "الاشتراك شهري أو سنوي، ويمكن إلغاؤه في أي وقت من إعدادات الحساب مع بقاء الوصول حتى نهاية الفترة المدفوعة.",
  },
  {
    question: "هل يوجد خطة للفرق والمؤسسات؟",
    answer:
      "نعم، تتضمّن لوحة متابعة للفريق وتقارير تقدّم شهرية ومسارات مخصّصة حسب أدوار الفريق.",
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white shadow-md shadow-ink/5">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={faq.question}
            className={`border-b border-[#F0F3F2] transition-colors duration-500 last:border-b-0 ${
              isOpen ? "bg-teal-wash/40" : ""
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              className={`flex w-full items-center justify-between gap-6 border-e-[3px] px-6 py-5.5 text-right transition-colors duration-500 ${
                isOpen
                  ? "border-teal"
                  : "border-transparent hover:bg-teal-wash/25"
              }`}
            >
              <span
                className={`text-base font-medium transition-colors duration-500 ${
                  isOpen ? "text-teal-deep" : "text-ink"
                }`}
              >
                {faq.question}
              </span>
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-base leading-none transition-all duration-500 ${
                  isOpen ? "rotate-45 bg-teal text-white" : "bg-teal-wash text-teal"
                }`}
              >
                +
              </span>
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-500 ease-out ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="max-w-[70ch] px-6.5 pb-6 text-[15px] leading-loose text-body">
                  {faq.answer}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
