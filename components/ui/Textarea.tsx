import React from "react";
import { cn } from "../../lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: "default" | "bordered" | "ghost";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = "bordered", size = "md", ...props }, ref) => {
    // Mapeo de variantes a clases de DaisyUI
    const variantClasses = {
      default: "textarea",
      bordered: "textarea textarea-bordered",
      ghost: "textarea textarea-ghost",
    };

    // Mapeo de tamaños
    const sizeClasses = {
      xs: "textarea-xs",
      sm: "textarea-sm",
      md: "",
      lg: "textarea-lg",
      xl: "textarea-xl",
    };

    const classes = [variantClasses[variant], sizeClasses[size]];

    return (
      <textarea className={cn(...classes, className)} ref={ref} {...props} />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
