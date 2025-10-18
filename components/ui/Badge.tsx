import React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "accent"
    | "info"
    | "success"
    | "warning"
    | "error"
    | "ghost"
    | "outline";
  size?: "xs" | "sm" | "md" | "lg";
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const classes = ["badge"];

    if (variant && variant !== "default") {
      classes.push(`badge-${variant}`);
    }
    if (size && size !== "md") {
      classes.push(`badge-${size}`);
    }

    return <div className={cn(...classes, className)} ref={ref} {...props} />;
  }
);
Badge.displayName = "Badge";

export { Badge };
