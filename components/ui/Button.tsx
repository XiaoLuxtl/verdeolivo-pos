import React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
    | "outline"
    | "link";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "square" | "circle";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", shape, ...props }, ref) => {
    const classes = ["btn"];

    if (variant && variant !== "default") {
      classes.push(`btn-${variant}`);
    }
    if (size && size !== "md") {
      classes.push(`btn-${size}`);
    }
    if (shape) {
      classes.push(`btn-${shape}`);
    }

    return (
      <button className={cn(...classes, className)} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button };
