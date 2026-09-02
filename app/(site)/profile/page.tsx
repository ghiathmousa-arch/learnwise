import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileSettings from "@/components/sections/ProfileSettings";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const [user, clusters] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        level: true,
        learningGoal: true,
        learningStyle: true,
        weeklyTime: true,
        preferredContentType: true,
        createdAt: true,
        clusters: { select: { clusterId: true } },
      },
    }),
    prisma.cluster.findMany({
      orderBy: { label: "asc" },
      select: { id: true, label: true },
    }),
  ]);

  if (!user) {
    redirect("/login");
  }
  if (!user.level) {
    redirect("/onboarding");
  }

  return (
    <div className="px-6 py-16 md:px-16">
      <div className="flex flex-wrap items-end justify-between gap-4 pb-8">
        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs tracking-wider text-muted uppercase">
            حساب المتعلّم
          </span>
          <h1 className="text-3xl font-semibold text-ink">
            الملف الشخصي والإعدادات
          </h1>
        </div>
        <Link
          href="/suggest-domain"
          className="rounded-lg border border-teal px-5 py-2.5 text-[14px] font-medium text-teal transition-colors hover:bg-teal-wash"
        >
          اقترح مجالًا جديدًا
        </Link>
      </div>

      <ProfileSettings
        user={{
          name: user.name,
          email: user.email,
          memberSince: user.createdAt.toISOString(),
        }}
        topics={clusters}
        initial={{
          level: user.level,
          goal: user.learningGoal,
          learningStyle: user.learningStyle,
          weeklyTime: user.weeklyTime,
          preferredContentType: user.preferredContentType,
          topicIds: user.clusters.map((c) => c.clusterId),
        }}
      />
    </div>
  );
}
