import React from "react";
import { cn } from "../../lib/utils";

export interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "spinner" | "dots" | "ring" | "ball" | "bars" | "infinity";
}

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, size = "md", variant = "spinner", ...props }, ref) => {
    // Mapeo de variantes a clases de DaisyUI
    const variantClasses = {
      spinner: "loading",
      dots: "loading loading-dots",
      ring: "loading loading-ring",
      ball: "loading loading-ball",
      bars: "loading loading-bars",
      infinity: "loading loading-infinity",
    };

    // Mapeo de tamaños
    const sizeClasses = {
      xs: "loading-xs",
      sm: "loading-sm",
      md: "",
      lg: "loading-lg",
    };

    const classes = [variantClasses[variant], sizeClasses[size]];

    return <div className={cn(...classes, className)} ref={ref} {...props} />;
  }
);
Loading.displayName = "Loading";

export { Loading };
