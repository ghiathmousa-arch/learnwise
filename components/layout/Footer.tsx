import Image from "next/image";
import Link from "next/link";
import {
  XIcon,
  InstagramIcon,
  YoutubeIcon,
  ChatIcon,
} from "@/components/ui/icons";

const quickLinks = [
  { href: "/#about", label: "من نحن" },
  { href: "/#services", label: "الخدمات" },
  { href: "/#faq", label: "الأسئلة الشائعة" },
  { href: "/#contact", label: "تواصل معنا" },
];

const legalLinks = [
  { href: "#", label: "شروط الاستخدام" },
  { href: "#", label: "سياسة الخصوصية" },
];

const socialIcons = [XIcon, InstagramIcon, YoutubeIcon, ChatIcon];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-linear-to-b from-teal-wash/50 to-[#FAFBFB]">
      <div className="grid grid-cols-1 gap-10 px-6 py-14 sm:grid-cols-2 md:px-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-12">
        <div className="flex flex-col gap-4">
          <Image
            src="/learnwise-logo.png"
            alt="LearnWise"
            width={1162}
            height={319}
            className="h-9 w-auto"
          />
          <p className="max-w-[34ch] text-[15px] leading-relaxed text-body">
            مسارات تقنية قصيرة، ونظام توصيات يختار لك الخطوة التالية.
          </p>
        </div>

        <div className="flex flex-col gap-3.5">
          <span className="font-mono text-[11px] tracking-wider text-muted uppercase">
            روابط سريعة
          </span>
          {quickLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[15px] text-body hover:text-teal"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3.5">
          <span className="font-mono text-[11px] tracking-wider text-muted uppercase">
            قانوني
          </span>
          {legalLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[15px] text-body hover:text-teal"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3.5">
          <span className="font-mono text-[11px] tracking-wider text-muted uppercase">
            تابعنا
          </span>
          <div className="flex items-center gap-2">
            {socialIcons.map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-line bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal hover:bg-teal-wash hover:shadow"
              >
                <Icon size={15} className="text-teal" strokeWidth={1.6} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-line px-6 py-5 text-center md:px-16">
        <span className="font-mono text-xs text-muted">
          © ٢٠٢٦ LearnWise · جميع الحقوق محفوظة
        </span>
      </div>
    </footer>
  );
}
