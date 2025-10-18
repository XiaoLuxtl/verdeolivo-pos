import React from "react";
import { cn } from "../../lib/utils";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  variant?: "default" | "bordered" | "ghost";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = "bordered", size = "md", ...props }, ref) => {
    // Mapeo de variantes a clases de DaisyUI
    const variantClasses = {
      default: "input",
      bordered: "input input-bordered",
      ghost: "input input-ghost",
    };

    // Mapeo de tamaños
    const sizeClasses = {
      xs: "input-xs",
      sm: "input-sm",
      md: "",
      lg: "input-lg",
      xl: "input-xl",
    };

    const classes = [variantClasses[variant], sizeClasses[size]];

    return <input className={cn(...classes, className)} ref={ref} {...props} />;
  }
);
Input.displayName = "Input";

export { Input };
