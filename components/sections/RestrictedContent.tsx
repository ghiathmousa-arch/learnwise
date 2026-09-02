import Button from "@/components/ui/Button";
import { LockIcon } from "@/components/ui/icons";

const placeholderItems = [
  { title: "أساسيات الأنظمة الموزّعة", meta: "8 دروس" },
  { title: "تحسين أداء الاستعلامات", meta: "6 دروس" },
  { title: "بنية الواجهات الحديثة", meta: "7 دروس" },
  { title: "مدخل إلى الحاويات", meta: "5 دروس" },
  { title: "تصميم واجهات برمجة التطبيقات", meta: "9 دروس" },
  { title: "أساسيات أمن التطبيقات", meta: "6 دروس" },
];

export default function RestrictedContent() {
  return (
    <div className="relative min-h-[620px] overflow-hidden rounded-lg border border-line bg-white">
      <div
        aria-hidden
        className="grid select-none grid-cols-1 gap-6 p-10 blur-sm sm:grid-cols-2 lg:grid-cols-3"
      >
        {placeholderItems.map((item) => (
          <div
            key={item.title}
            className="overflow-hidden rounded-lg border border-line bg-white"
          >
            <div className="h-32.5 border-b border-line bg-offwhite" />
            <div className="flex items-center justify-between gap-4 px-5.5 py-5">
              <span className="text-base font-medium text-ink">
                {item.title}
              </span>
              <span className="font-mono text-xs text-muted">
                {item.meta}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-center bg-white/62 px-6">
        <div className="flex w-full max-w-[460px] flex-col items-center gap-5 rounded-lg border border-line bg-white p-11 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-md border border-teal-line bg-teal-wash">
            <LockIcon size={26} className="text-teal" />
          </div>
          <h3 className="text-xl font-semibold text-ink">
            سجّل الدخول لعرض المحتوى الكامل
          </h3>
          <p className="max-w-[40ch] text-[15px] leading-relaxed text-body">
            هذه المعاينة مقفلة. أنشئ حسابك المجاني للوصول إلى جميع الدروس
            والتمارين ومتابعة تقدّمك.
          </p>
          <Button href="/register" className="w-full">
            تسجيل الدخول / إنشاء حساب
          </Button>
          <span className="text-[13px] text-muted">
            مجاني، وبدون بطاقة بنكية.
          </span>
        </div>
      </div>
    </div>
  );
}
