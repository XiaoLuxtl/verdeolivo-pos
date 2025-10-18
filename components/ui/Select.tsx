import React from "react";
import { cn } from "../../lib/utils";

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  variant?: "default" | "bordered" | "ghost";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant = "bordered", size = "md", ...props }, ref) => {
    const classes = ["select"];

    if (variant && variant !== "default") {
      classes.push(`select-${variant}`);
    }
    if (size && size !== "md") {
      classes.push(`select-${size}`);
    }

    return (
      <select className={cn(...classes, className)} ref={ref} {...props} />
    );
  }
);
Select.displayName = "Select";

export { Select };
