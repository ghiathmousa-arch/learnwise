import Link from "next/link";

export default function StatCard({
  label,
  value,
  note,
  href,
}: {
  label: string;
  value: number | string;
  note?: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col rounded-lg border border-line p-5.5 transition-colors hover:border-teal-line"
    >
      <span className="font-mono text-[11px] tracking-wider text-muted uppercase">
        {label}
      </span>
      <span className="mt-3 font-mono text-[28px] font-semibold tracking-tight text-ink">
        {value}
      </span>
      {note && <span className="mt-1.5 text-[13px] text-muted">{note}</span>}
    </Link>
  );
}
