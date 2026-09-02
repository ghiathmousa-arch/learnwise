import { compare } from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_DURATION_MS,
  encryptAdminSession,
} from "@/lib/session";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "طلب غير صالح." }, { status: 400 });
  }

  const { username, password } = (body ?? {}) as Record<string, unknown>;

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    !username.trim() ||
    !password
  ) {
    return Response.json(
      { error: "اسم المستخدم وكلمة المرور مطلوبان." },
      { status: 400 },
    );
  }

  const invalidCredentials = () =>
    Response.json(
      { error: "اسم المستخدم أو كلمة المرور غير صحيحة." },
      { status: 401 },
    );

  const admin = await prisma.admin.findUnique({
    where: { username: username.trim() },
  });
  if (!admin) return invalidCredentials();

  const valid = await compare(password, admin.passwordHash);
  if (!valid) return invalidCredentials();

  const token = await encryptAdminSession({ adminId: admin.id });
  const expires = new Date(Date.now() + ADMIN_SESSION_DURATION_MS);

  (await cookies()).set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires,
    path: "/",
  });

  return Response.json({
    admin: { id: admin.id, username: admin.username },
  });
}
