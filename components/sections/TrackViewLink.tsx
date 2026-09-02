"use client";

export default function TrackViewLink({
  contentId,
  href,
  className,
  children,
}: {
  contentId: number;
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        fetch(`/api/content/${contentId}/view`, { method: "POST" }).catch(() => {});
      }}
      className={className}
    >
      {children}
    </a>
  );
}
