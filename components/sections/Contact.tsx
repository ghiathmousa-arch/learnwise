import { MailIcon, ClockIcon } from "@/components/ui/icons";
import ContactForm from "@/components/sections/ContactForm";

export default function Contact() {
  return (
    <section
      id="contact"
      className="grid grid-cols-1 gap-16 border-t border-line px-6 py-24 md:px-16 lg:grid-cols-[320px_1fr]"
    >
      <div className="flex flex-col gap-6 rounded-xl border border-teal-line bg-linear-to-b from-teal-wash to-white p-8 shadow-sm shadow-ink/5">
        <div>
          <h2 className="text-3xl font-semibold text-ink">تواصل معنا</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-body">
            للأسئلة عن المسارات أو الاشتراكات المؤسسية.
          </p>
        </div>

        <div className="flex flex-col gap-5 border-t border-line pt-6">
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-teal-line bg-teal-wash">
              <MailIcon size={18} className="text-teal" />
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[11px] tracking-wider text-muted uppercase">
                البريد الإلكتروني
              </span>
              <span dir="ltr" className="text-right text-[15px] font-medium text-ink">
                hello@learnwise.io
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-teal-line bg-teal-wash">
              <ClockIcon size={18} className="text-teal" />
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[11px] tracking-wider text-muted uppercase">
                مدة الرد
              </span>
              <span className="text-[15px] font-medium text-ink">
                خلال يوم عمل واحد
              </span>
            </div>
          </div>
        </div>
      </div>

      <ContactForm />
    </section>
  );
}
