import React from "react";
import { cn } from "../../lib/utils";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  variant?: "default" | "bordered" | "ghost";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = "bordered", size = "md", ...props }, ref) => {
    const classes = ["input"];

    if (variant && variant !== "default") {
      classes.push(`input-${variant}`);
    }
    if (size && size !== "md") {
      classes.push(`input-${size}`);
    }

    return <input className={cn(...classes, className)} ref={ref} {...props} />;
  }
);
Input.displayName = "Input";

export { Input };
