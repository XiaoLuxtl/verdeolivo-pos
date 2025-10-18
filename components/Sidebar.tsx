"use client";

import { useState } from "react";
import Link from "next/link";
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
        {!isMinimized && <h1 className="text-xl font-bold">Herbalife POS</h1>}
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="btn btn-ghost btn-sm btn-circle"
          aria-label="Toggle sidebar"
        >
          {isMinimized ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="menu p-2 gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    ${isActive ? "active bg-primary-content/20" : ""}
                    ${isMinimized ? "justify-center" : ""}
                    tooltip tooltip-right
                  `}
                  data-tip={isMinimized ? item.label : ""}
                >
                  <Icon className="w-5 h-5" />
                  {!isMinimized && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-primary-content/20">
        {!isMinimized && (
          <p className="text-xs opacity-70 text-center">v1.0.0</p>
        )}
      </div>
    </aside>
  );
}
