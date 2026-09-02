type SectionHeadingProps = {
  kicker?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export default function SectionHeading({
  kicker,
  title,
  description,
  action,
  className = "",
}: SectionHeadingProps) {
  return (
    <div
      className={`flex flex-wrap items-end justify-between gap-10 ${className}`}
    >
      <div className="flex flex-col gap-3">
        {kicker && (
          <span className="font-mono text-xs tracking-wider text-muted uppercase">
            {kicker}
          </span>
        )}
        <h2 className="text-3xl font-semibold tracking-tight text-ink">
          {title}
        </h2>
        {description && (
          <p className="max-w-[56ch] text-base text-body">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
