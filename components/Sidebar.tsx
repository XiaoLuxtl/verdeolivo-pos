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
import { Button } from "./ui/Button";
import { Menu } from "./ui/Menu";

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
      } bg-primary text-primary-content h-screen fixed left-0 top-0 transition-all duration-300 ease-in-out flex flex-col z-50`}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-primary-content/20">
        {!isMinimized && <h1 className="text-xl font-bold">VerdeOlivo POS</h1>}
        <Button
          onClick={() => setIsMinimized(!isMinimized)}
          variant="ghost"
          size="sm"
          shape="circle"
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
      <div className="flex-1 overflow-y-auto py-4">
        <Menu
          items={menuItems.map((item) => ({
            ...item,
            active: pathname === item.href,
          }))}
          minimized={isMinimized}
        />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-primary-content/20">
        {!isMinimized && (
          <p className="text-xs opacity-70 text-center">v1.0.0</p>
        )}
      </div>
    </aside>
  );
}
