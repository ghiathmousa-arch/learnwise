import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OnboardingWizard from "@/components/sections/OnboardingWizard";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const clusters = await prisma.cluster.findMany({
    orderBy: { label: "asc" },
    select: { id: true, label: true },
  });

  return (
    <div className="px-6 py-16 md:px-16">
      <div className="flex flex-col gap-3 pb-8">
        <span className="font-mono text-xs tracking-wider text-muted uppercase">
          تهيئة الحساب
        </span>
        <h1 className="text-3xl font-semibold text-ink">
          ست خطوات لبناء مسارك
        </h1>
      </div>

      <OnboardingWizard topics={clusters} />
    </div>
  );
}
