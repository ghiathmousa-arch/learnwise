import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/adminAuth";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { ShieldIcon } from "@/components/ui/icons";

export default async function AdminLoginPage() {
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin/dashboard");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-7 bg-teal-deep px-6 py-16">
      <Image
        src="/learnwise-logo-white.png"
        alt="LearnWise"
        width={1136}
        height={292}
        priority
        className="h-9 w-auto"
      />

      <div className="flex w-full max-w-105 flex-col gap-6 rounded-lg border border-white/14 bg-[#0B3A31] px-8 py-9">
        <div className="flex items-center gap-2.5">
          <ShieldIcon size={20} className="text-[#7FD3BF]" strokeWidth={1.75} />
          <span className="font-mono text-[11px] tracking-widest text-[#7FD3BF] uppercase">
            وصول مقيّد · لوحة الإدارة
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <h1 className="text-xl font-semibold text-white">تسجيل دخول المشرف</h1>
          <p className="text-sm leading-loose text-white/62">
            تُنشأ حسابات الإدارة داخليًا فقط. جميع محاولات الدخول تُسجَّل.
          </p>
        </div>

        <AdminLoginForm />
      </div>

      <span className="font-mono text-[11px] text-white/40">
        LearnWise Admin · ٢٠٢٦
      </span>
    </div>
  );
}
