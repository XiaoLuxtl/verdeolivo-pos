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

function Button({
  className,
  variant = "default",
  size = "md",
  shape,
  ...props
}: ButtonProps) {
  const classes = ["btn", "cursor-pointer"];

  if (variant && variant !== "default") {
    classes.push(`btn-${variant}`);
  }
  if (size && size !== "md") {
    classes.push(`btn-${size}`);
  }
  if (shape) {
    classes.push(`btn-${shape}`);
  }

  return <button className={cn(...classes, className)} {...props} />;
}

export { Button };
