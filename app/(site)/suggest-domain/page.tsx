import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import SuggestDomainForm from "@/components/sections/SuggestDomainForm";

export default async function SuggestDomainPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="px-6 py-16 md:px-16">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs tracking-wider text-muted uppercase">
            اقتراح مجال
          </span>
          <h1 className="text-3xl font-semibold text-ink">اقترح مجالًا جديدًا</h1>
          <p className="text-[15px] leading-relaxed text-body">
            لا تجد المجال الذي تبحث عنه؟ اقترحه ونراجعه ضمن خطة المحتوى القادمة.
          </p>
        </div>

        <SuggestDomainForm user={{ name: user.name, email: user.email }} />
      </div>
    </div>
  );
}
