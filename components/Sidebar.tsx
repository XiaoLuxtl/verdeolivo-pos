"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ChefHat,
  ShoppingCart,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Menu } from "@/components/ui/menu";

const menuItems = [
  { icon: Home, label: "POS", href: "/" },
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Package, label: "Productos", href: "/admin/productos" },
  { icon: Warehouse, label: "Inventario", href: "/admin/inventario" },
  { icon: ChefHat, label: "Recetas", href: "/admin/recetas" },
  { icon: ShoppingCart, label: "Compras", href: "/admin/compras" },
  { icon: BarChart3, label: "Reportes", href: "/admin/reportes" },
];

export default function Sidebar() {
  const [isMinimized, setIsMinimized] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`${
        isMinimized ? "w-20" : "w-64"
      } bg-card/95 backdrop-blur-sm border-r border-border h-screen fixed left-0 top-0 transition-all duration-300 ease-in-out flex flex-col z-50 shadow-xl`}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-border/50 bg-gradient-to-r from-muted/40 to-muted/20">
        {!isMinimized && (
          <h1 className="text-xl font-bold text-foreground truncate">
            VerdeOlivo POS
          </h1>
        )}
        <Button
          onClick={() => setIsMinimized(!isMinimized)}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground text-muted-foreground hover:shadow-sm transition-all duration-200 rounded-md"
          aria-label="Toggle sidebar"
        >
          {isMinimized ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto py-2 px-2">
        <Menu
          items={menuItems.map((item) => ({
            ...item,
            active: pathname === item.href,
          }))}
          minimized={isMinimized}
        />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border/50 bg-gradient-to-r from-muted/20 to-muted/10">
        {!isMinimized && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground font-medium">v1.0.0</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Sistema POS</p>
          </div>
        )}
      </div>
    </aside>
  );
}
