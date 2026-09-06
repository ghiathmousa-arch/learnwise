import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import LogoutButton from "@/components/layout/LogoutButton";
import { getCurrentUser } from "@/lib/auth";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/courses", label: "الدروس" },
  { href: "/#services", label: "الخدمات" },
  { href: "/#about", label: "من نحن" },
  { href: "/#faq", label: "الأسئلة الشائعة" },
  { href: "/#contact", label: "تواصل معنا" },
];

export default async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-white px-4 py-3.5 sm:gap-10 sm:px-6 md:px-16">
      <div className="flex items-center gap-11">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/learnwise-logo.png"
            alt="LearnWise"
            width={1162}
            height={319}
            priority
            className="h-8 w-auto max-w-none md:h-10"
          />
        </Link>
        <nav className="hidden items-center gap-7 text-[15px] lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-body transition-colors hover:text-teal first:text-ink first:font-medium"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex shrink-0 items-center gap-3 sm:gap-4">
        {user ? (
          <>
            <Link
              href="/profile"
              className="max-w-28 truncate text-[15px] font-medium text-ink hover:text-teal sm:max-w-none"
            >
              {user.name}
            </Link>
            <LogoutButton />
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="hidden text-[15px] text-body hover:text-teal min-[380px]:block"
            >
              تسجيل الدخول
            </Link>
            <Button
              href="/register"
              className="max-sm:px-4 max-sm:py-2.5 max-sm:text-sm"
            >
              إنشاء حساب
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
