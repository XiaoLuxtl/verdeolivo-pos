import React from "react";
import { cn } from "../../lib/utils";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "error";
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "info", ...props }, ref) => {
    const classes = ["alert"];

    if (variant) {
      classes.push(`alert-${variant}`);
    }

    return <div className={cn(...classes, className)} ref={ref} {...props} />;
  }
);
Alert.displayName = "Alert";

export { Alert };
