import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // الـ migrations لازم تمرق عبر الاتصال المباشر مو عبر الـ pooler،
    // لأنو PgBouncer ما بيدعم الـ prepared statements يلي بيستعملها Prisma.
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
