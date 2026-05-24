import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils/classNames";

export interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padded?: boolean;
}

export function GlassPanel({ children, className, padded = true, ...props }: GlassPanelProps) {
  return (
    <div className={cx("glass-panel", padded && "glass-panel--padded", className)} {...props}>
      {children}
    </div>
  );
}
