// components/ui/menu.tsx
import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface MenuItem {
  icon?: LucideIcon;
  label: string;
  href: string;
  active?: boolean;
  badge?: string | number;
}

export interface MenuProps extends React.HTMLAttributes<HTMLElement> {
  items: MenuItem[];
  variant?: "vertical" | "horizontal";
  size?: "sm" | "md" | "lg";
  minimized?: boolean;
}

const Menu = React.forwardRef<HTMLElement, MenuProps>(
  (
    {
      className,
      items,
      variant = "vertical",
      size = "md",
      minimized = false,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    };

    const variantClasses = {
      vertical: "flex flex-col space-y-1",
      horizontal: "flex flex-row space-x-1",
    };

    return (
      <nav
        className={cn(variantClasses[variant], sizeClasses[size], className)}
        ref={ref}
        {...props}
      >
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none",
                isActive
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "text-muted-foreground",
                variant === "horizontal" ? "justify-center" : "justify-start"
              )}
            >
              {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
              <span
                className={cn(
                  "truncate",
                  (variant === "horizontal" || minimized) && "sr-only"
                )}
              >
                {item.label}
              </span>
              {item.badge && (
                <span
                  className={cn(
                    "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    );
  }
);
Menu.displayName = "Menu";

// Menu Group para agrupar items
const MenuGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    label?: string;
  }
>(({ className, label, children, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-1", className)} {...props}>
    {label && (
      <h4 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </h4>
    )}
    {children}
  </div>
));
MenuGroup.displayName = "MenuGroup";

// Menu Separator
const MenuSeparator = React.forwardRef<
  HTMLHRElement,
  React.HTMLAttributes<HTMLHRElement>
>(({ className, ...props }, ref) => (
  <hr
    ref={ref}
    className={cn("mx-3 my-2 border-border", className)}
    {...props}
  />
));
MenuSeparator.displayName = "MenuSeparator";

export { Menu, MenuGroup, MenuSeparator };
