import Link from "next/link";
import { AnchorHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "md" | "lg";

type ButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  icon?: ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  // brand-600 is the exact brand Red (#E50914); white text on it is 4.79:1
  // (WCAG AA). Hover moves to brand-700, the exact brand Dark Red (#B20710,
  // 7.17:1), which also reads as a natural "pressed" state.
  primary:
    "bg-brand-600 text-white shadow-glow hover:bg-brand-700 focus-visible:ring-brand-300 active:bg-brand-800",
  secondary:
    "bg-white text-ink-900 ring-1 ring-inset ring-ink-200 hover:bg-ink-50 hover:ring-ink-300",
  ghost: "bg-transparent text-white ring-1 ring-inset ring-white/25 hover:bg-white/10",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

export function Button({
  href,
  variant = "primary",
  size = "md",
  children,
  icon,
  className = "",
  ...props
}: ButtonProps) {
  const isExternal = href.startsWith("http");
  const classes = `group inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if (isExternal) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
        {icon}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...props}>
      {children}
      {icon}
    </Link>
  );
}
