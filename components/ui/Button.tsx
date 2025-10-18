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
  // Mapeo de variantes a clases de DaisyUI
  const variantClasses = {
    default: "btn",
    primary: "btn btn-primary",
    secondary: "btn btn-secondary",
    accent: "btn btn-accent",
    info: "btn btn-info",
    success: "btn btn-success",
    warning: "btn btn-warning",
    error: "btn btn-error",
    ghost: "btn btn-ghost",
    outline: "btn btn-outline",
    link: "btn btn-link",
  };

  // Mapeo de tamaños
  const sizeClasses = {
    xs: "btn-xs",
    sm: "btn-sm",
    md: "",
    lg: "btn-lg",
    xl: "btn-xl",
  };

  // Mapeo de formas
  const shapeClasses = {
    square: "btn-square",
    circle: "btn-circle",
  };

  const classes = [
    variantClasses[variant],
    sizeClasses[size],
    shape ? shapeClasses[shape] : "",
    "cursor-pointer",
  ];

  return <button className={cn(...classes, className)} {...props} />;
}

export { Button };
