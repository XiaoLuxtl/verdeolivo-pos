import React from "react";
import { cn } from "../../lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: "default" | "bordered" | "ghost";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = "bordered", size = "md", ...props }, ref) => {
    const classes = ["textarea"];

    if (variant && variant !== "default") {
      classes.push(`textarea-${variant}`);
    }
    if (size && size !== "md") {
      classes.push(`textarea-${size}`);
    }

    return (
      <textarea className={cn(...classes, className)} ref={ref} {...props} />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
