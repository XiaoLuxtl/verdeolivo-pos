import React from "react";
import Link from "next/link";
import { cn } from "../../lib/utils";
import { LucideIcon } from "lucide-react";

export interface MenuItem {
  icon?: LucideIcon;
  label: string;
  href: string;
  active?: boolean;
}

export interface MenuProps extends React.HTMLAttributes<HTMLElement> {
  items: MenuItem[];
  minimized?: boolean;
}

const Menu = React.forwardRef<HTMLElement, MenuProps>(
  ({ className, items, minimized = false, ...props }, ref) => {
    return (
      <nav className={cn("menu p-2 gap-1", className)} ref={ref} {...props}>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  isActive ? "active bg-primary-content/20" : "",
                  minimized ? "justify-center" : "",
                  minimized ? "tooltip tooltip-right" : ""
                )}
                data-tip={minimized ? item.label : ""}
              >
                {Icon && <Icon className="w-5 h-5" />}
                {!minimized && <span>{item.label}</span>}
              </Link>
            </li>
          );
        })}
      </nav>
    );
  }
);
Menu.displayName = "Menu";

export { Menu };
