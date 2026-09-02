import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ADMIN_SESSION_COOKIE, decryptAdminSession } from "@/lib/session";

export const getAdminSession = cache(async () => {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  return decryptAdminSession(token);
});

// DTO: only the fields safe to expose to the client (never passwordHash).
export const getCurrentAdmin = cache(async () => {
  const session = await getAdminSession();
  if (!session) return null;

  return prisma.admin.findUnique({
    where: { id: session.adminId },
    select: { id: true, username: true },
  });
});

// للاستخدام بصفحات لوحة التحكم (Server Components).
export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

// للاستخدام بالـ Route Handlers: يرجع 401 جاهز لو ما في جلسة أدمن صالحة.
export async function requireAdminApi() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return {
      admin: null,
      unauthorized: Response.json(
        { error: "غير مصرح لك بالدخول." },
        { status: 401 },
      ),
    };
  }
  return { admin, unauthorized: null };
}
