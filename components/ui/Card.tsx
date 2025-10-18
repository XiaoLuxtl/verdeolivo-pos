import React from "react";
import { cn } from "../../lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered" | "compact" | "side";
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const classes = ["card"];

    if (variant && variant !== "default") {
      classes.push(`card-${variant}`);
    }

    return <div className={cn(...classes, className)} ref={ref} {...props} />;
  }
);
Card.displayName = "Card";

const CardBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div className={cn("card-body", className)} ref={ref} {...props} />
));
CardBody.displayName = "CardBody";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2 className={cn("card-title", className)} ref={ref} {...props} />
));
CardTitle.displayName = "CardTitle";

const CardActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div className={cn("card-actions", className)} ref={ref} {...props} />
));
CardActions.displayName = "CardActions";

export { Card, CardBody, CardTitle, CardActions };
