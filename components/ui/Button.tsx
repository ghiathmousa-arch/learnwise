import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "outline";
type Size = "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "border border-teal bg-linear-to-b from-teal-bright to-teal text-white shadow-sm shadow-teal/25 hover:from-teal hover:to-teal-deep hover:shadow-md hover:shadow-teal/25",
  outline:
    "border border-teal-line bg-white text-teal shadow-sm hover:border-teal hover:bg-teal-wash",
};

const sizeClasses: Record<Size, string> = {
  md: "px-6 py-3 text-[15px]",
  lg: "px-7 py-3.25 text-[15px]",
};

const baseClasses =
  "inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-md font-medium transition-all hover:-translate-y-0.5 active:translate-y-0";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsLink = CommonProps & {
  href: string;
};

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonAsLink | ButtonAsButton) {
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(props as ButtonAsButton)}>
      {children}
    </button>
  );
}
