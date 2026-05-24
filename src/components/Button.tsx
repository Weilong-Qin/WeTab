import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "../utils/classNames";
import { Icon, type IconName } from "./Icon";

export type ButtonVariant = "primary" | "glass" | "icon" | "fab" | "subtle";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: IconName;
  children?: ReactNode;
}

export function Button({
  variant = "glass",
  icon,
  children,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cx("button", `button--${variant}`, !children && "button--square", className)}
      type={type}
      {...props}
    >
      {icon ? <Icon name={icon} size={20} /> : null}
      {children ? <span>{children}</span> : null}
    </button>
  );
}
