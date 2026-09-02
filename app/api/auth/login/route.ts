import { compare } from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE,
  SESSION_DURATION_MS,
  encryptSession,
} from "@/lib/session";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "طلب غير صالح." }, { status: 400 });
  }

  const { email, password } = (body ?? {}) as Record<string, unknown>;

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    return Response.json(
      { error: "البريد الإلكتروني وكلمة المرور مطلوبان." },
      { status: 400 },
    );
  }

  const invalidCredentials = () =>
    Response.json(
      { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." },
      { status: 401 },
    );

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (!user) return invalidCredentials();

  const valid = await compare(password, user.passwordHash);
  if (!valid) return invalidCredentials();

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

  return Response.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
    },
    onboardingComplete: user.level !== null,
  });
}
