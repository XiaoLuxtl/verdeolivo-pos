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
    // Mapeo de variantes a clases de DaisyUI
    const variantClasses = {
      default: "badge",
      primary: "badge badge-primary",
      secondary: "badge badge-secondary",
      accent: "badge badge-accent",
      info: "badge badge-info",
      success: "badge badge-success",
      warning: "badge badge-warning",
      error: "badge badge-error",
      ghost: "badge badge-ghost",
      outline: "badge badge-outline",
    };

    // Mapeo de tamaños
    const sizeClasses = {
      xs: "badge-xs",
      sm: "badge-sm",
      md: "",
      lg: "badge-lg",
    };

    const classes = [variantClasses[variant], sizeClasses[size]];

    return <div className={cn(...classes, className)} ref={ref} {...props} />;
  }
);
Badge.displayName = "Badge";

export { Badge };
