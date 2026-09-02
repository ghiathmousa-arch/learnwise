import { hash } from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";
import {
  SESSION_COOKIE,
  SESSION_DURATION_MS,
  encryptSession,
} from "@/lib/session";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "طلب غير صالح." }, { status: 400 });
  }

  const { name, email, password } = (body ?? {}) as Record<string, unknown>;

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return Response.json({ error: "الحقول المطلوبة ناقصة." }, { status: 400 });
  }

  const trimmedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (!trimmedName || trimmedName.length > 120) {
    return Response.json({ error: "الاسم غير صالح." }, { status: 400 });
  }
  if (!EMAIL_RE.test(normalizedEmail) || normalizedEmail.length > 200) {
    return Response.json(
      { error: "البريد الإلكتروني غير صالح." },
      { status: 400 },
    );
  }
  if (password.length < 8 || !/\d/.test(password)) {
    return Response.json(
      { error: "كلمة المرور يجب أن تكون ٨ أحرف على الأقل وتحتوي على رقم واحد." },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return Response.json(
      { error: "هذا البريد الإلكتروني مستخدم مسبقًا." },
      { status: 409 },
    );
  }

  const passwordHash = await hash(password, 10);

  let user;
  try {
    user = await prisma.user.create({
      data: { name: trimmedName, email: normalizedEmail, passwordHash },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return Response.json(
        { error: "هذا البريد الإلكتروني مستخدم مسبقًا." },
        { status: 409 },
      );
    }
    throw error;
  }

  const token = await encryptSession({ userId: user.id });
  const expires = new Date(Date.now() + SESSION_DURATION_MS);

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires,
    path: "/",
  });

  await prisma.loginLog.create({ data: { userId: user.id } });

  return Response.json(
    {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    },
    { status: 201 },
  );
}
