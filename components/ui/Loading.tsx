import React from "react";
import { cn } from "../../lib/utils";

export interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "spinner" | "dots" | "ring" | "ball" | "bars" | "infinity";
}

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, size = "md", variant = "spinner", ...props }, ref) => {
    const classes = ["loading"];

    if (variant && variant !== "spinner") {
      classes.push(`loading-${variant}`);
    }
    if (size && size !== "md") {
      classes.push(`loading-${size}`);
    }

    return <div className={cn(...classes, className)} ref={ref} {...props} />;
  }
);
Loading.displayName = "Loading";

export { Loading };
