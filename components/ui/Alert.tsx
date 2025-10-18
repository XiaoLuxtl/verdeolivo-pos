import React from "react";
import { cn } from "../../lib/utils";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "error";
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "info", ...props }, ref) => {
    // Mapeo de variantes a clases de DaisyUI
    const variantClasses = {
      info: "alert alert-info",
      success: "alert alert-success",
      warning: "alert alert-warning",
      error: "alert alert-error",
    };

    const classes = [variantClasses[variant]];

    return <div className={cn(...classes, className)} ref={ref} {...props} />;
  }
);
Alert.displayName = "Alert";

export { Alert };
