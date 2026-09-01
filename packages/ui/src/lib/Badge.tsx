import type { HTMLAttributes } from "react";

export type BadgeVariant = "accent" | "default" | "outline" | "secondary" | "success" | "warning";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  return <span className={`badge badge-${variant} ${className}`.trim()} {...props} />;
}
