import { prisma } from "@/lib/prisma";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "طلب غير صالح." }, { status: 400 });
  }

  const { senderName, senderEmail, message } = (body ?? {}) as Record<
    string,
    unknown
  >;

  if (
    typeof senderName !== "string" ||
    typeof senderEmail !== "string" ||
    typeof message !== "string"
  ) {
    return Response.json({ error: "الحقول المطلوبة ناقصة." }, { status: 400 });
  }

  const name = senderName.trim();
  const email = senderEmail.trim();
  const text = message.trim();

  if (!name || name.length > 120) {
    return Response.json({ error: "الاسم غير صالح." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return Response.json(
      { error: "البريد الإلكتروني غير صالح." },
      { status: 400 },
    );
  }
  if (!text || text.length > 4000) {
    return Response.json({ error: "الرسالة غير صالحة." }, { status: 400 });
  }

  const created = await prisma.contactMessage.create({
    data: { senderName: name, senderEmail: email, message: text },
  });

  return Response.json({ id: created.id }, { status: 201 });
}
