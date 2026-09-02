import "dotenv/config";
import { hash } from "bcryptjs";
import { prisma } from "../lib/prisma";

// أسماء التجمّعات هون مؤقتة (بدون centroidEmbedding) لحد ما تنبني المرحلة 2
// (جلب المحتوى + K-Means)، يلي وقتها رح تحدّث نفس الصفوف بمراكز حقيقية
// بدل ما تعيد إنشاءها من الصفر.
const CLUSTER_LABELS = [
  "Python",
  "تطوير الويب",
  "هياكل البيانات",
  "قواعد البيانات",
  "الحاويات",
  "أمن التطبيقات",
  "الذكاء الاصطناعي",
  "الأنظمة الموزّعة",
];

async function main() {
  const passwordHash = await hash("Password123!", 10);

  const user = await prisma.user.upsert({
    where: { email: "sara@example.com" },
    update: {},
    create: {
      name: "سارة الحسن",
      email: "sara@example.com",
      passwordHash,
    },
  });

  console.log("Seeded demo user:", user.email, "/ password: Password123!");

  for (const label of CLUSTER_LABELS) {
    await prisma.cluster.upsert({
      where: { label },
      update: {},
      create: { label },
    });
  }

  console.log("Seeded clusters:", CLUSTER_LABELS.length);

  const adminPasswordHash = await hash("Admin123!", 10);
  const admin = await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", passwordHash: adminPasswordHash },
  });

  console.log("Seeded admin:", admin.username, "/ password: Admin123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
