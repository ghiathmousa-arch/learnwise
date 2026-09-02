import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import { LockIcon } from "@/components/ui/icons";
import { getCurrentUser } from "@/lib/auth";
import { getRecommendationsForUser } from "@/lib/recommend";
import LessonsSlider from "@/components/sections/LessonsSlider";

const teaserLessons = [
  { title: "أساسيات الأنظمة الموزّعة", meta: "8 دروس" },
  { title: "تحسين أداء الاستعلامات", meta: "6 دروس" },
  { title: "بنية الواجهات الحديثة", meta: "7 دروس" },
  { title: "مدخل إلى الحاويات", meta: "5 دروس" },
  { title: "تصميم واجهات برمجة التطبيقات", meta: "9 دروس" },
  { title: "أساسيات أمن التطبيقات", meta: "6 دروس" },
];

function LockedThumbnail() {
  return (
    <div className="relative h-37.5 border-b border-line bg-offwhite">
      <svg
        viewBox="0 0 320 150"
        preserveAspectRatio="none"
        className="block h-full w-full"
      >
        <defs>
          <pattern
            id="lw-lock-stripe"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="10"
              stroke="#E2E9E6"
              strokeWidth="3"
            />
          </pattern>
        </defs>
        <rect width="320" height="150" fill="url(#lw-lock-stripe)" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center bg-white/72">
        <div className="flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2">
          <LockIcon size={16} className="text-teal" strokeWidth={1.75} />
          <span className="text-xs font-medium text-teal">مقفل</span>
        </div>
      </div>
    </div>
  );
}

export default async function LessonsTeaser() {
  const user = await getCurrentUser();

  if (user) {
    const recommended = await getRecommendationsForUser(user.id, 24);

    return (
      <section
        id="lessons"
        className="border-t border-line bg-surface px-6 py-22 md:px-16"
      >
        <SectionHeading
          kicker="مرشّح لك"
          title="نماذج من الدروس"
          description="مرتّبة حسب مدى ملاءمتها لمستواك واهتماماتك."
          action={
            <Button href="/courses" variant="outline">
              عرض كل المحتوى
            </Button>
          }
          className="pb-10"
        />

        <LessonsSlider items={recommended} />
      </section>
    );
  }

  return (
    <section
      id="lessons"
      className="border-t border-line bg-surface px-6 py-22 md:px-16"
    >
      <SectionHeading
        kicker="محتوى تجريبي"
        title="نماذج من الدروس"
        description="هذه معاينات مقفلة. أنشئ حسابك لفتح المحتوى الكامل والتمارين المرافقة له."
        action={
          <Button href="/register" variant="outline">
            افتح كل الدروس
          </Button>
        }
        className="pb-10"
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {teaserLessons.map((lesson) => (
          <div
            key={lesson.title}
            className="overflow-hidden rounded-xl border border-line bg-white shadow-sm shadow-ink/5 transition-shadow hover:shadow-md"
          >
            <LockedThumbnail />
            <div className="flex items-center justify-between gap-4 px-5.5 py-5">
              <span className="text-base font-medium text-ink">
                {lesson.title}
              </span>
              <span className="font-mono text-xs text-muted">
                {lesson.meta}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
