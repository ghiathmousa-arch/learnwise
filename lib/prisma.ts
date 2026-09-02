import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// سائق Neon بيوصل عبر WebSocket على منفذ 443 بدل TCP على 5432. سببين:
//   1. بيئة serverless: ما في اتصال TCP بيضل معلّق بين الاستدعاءات، وكل
//      lambda بتفتح وبتسكّر بلا ما تستهلك من حصة الاتصالات.
//   2. شبكات كتيرة (منها شبكة التطوير عنا) بتحجب المنفذ 5432 برّا، بينما
//      443 مفتوح دايمًا.
// بـ Node لازم نعطيه تنفيذ WebSocket صراحةً (المتصفح عندو واحد جاهز).
neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString });

// المهلة الافتراضية للمعاملة 5 ثوانٍ، وهي قصيرة لما التطبيق والقاعدة
// بمنطقتين وكل عبارة بتاخد رحلة شبكة. دفعة تحديثات وحدة بتتخطاها بسهولة.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    transactionOptions: { maxWait: 10_000, timeout: 30_000 },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
