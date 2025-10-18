import React from "react";
import { cn } from "../../lib/utils";

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  variant?: "default" | "bordered" | "ghost";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant = "bordered", size = "md", ...props }, ref) => {
    // Mapeo de variantes a clases de DaisyUI
    const variantClasses = {
      default: "select",
      bordered: "select select-bordered",
      ghost: "select select-ghost",
    };

    // Mapeo de tamaños
    const sizeClasses = {
      xs: "select-xs",
      sm: "select-sm",
      md: "",
      lg: "select-lg",
      xl: "select-xl",
    };

    const classes = [variantClasses[variant], sizeClasses[size]];

    return (
      <select className={cn(...classes, className)} ref={ref} {...props} />
    );
  }
);
Select.displayName = "Select";

export { Select };
