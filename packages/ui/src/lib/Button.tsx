import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "danger" | "ghost" | "primary" | "secondary";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  variant?: ButtonVariant;
};

export function Button({
  children,
  className = "",
  icon,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  const iconClass = children ? "button-icon" : "button-icon button-icon-only";

  return (
    <button className={`button button-${variant} ${className}`.trim()} type={type} {...props}>
      {icon ? <span className={iconClass}>{icon}</span> : null}
      {children ? <span>{children}</span> : null}
    </button>
  );
}
