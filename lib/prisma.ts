import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// على Vercel كل استدعاء بيشتغل بـ lambda لحالها، فمنخلي الـ pool صغير
// ومنعتمد على الـ pooler تبع Neon (الرابط يلي فيه `-pooler`) للتجميع الحقيقي.
const adapter = new PrismaPg({
  connectionString,
  max: process.env.NODE_ENV === "production" ? 1 : 5,
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
