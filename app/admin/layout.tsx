"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(256); // 64 * 4 = w-64

  useEffect(() => {
    const handleResize = () => {
      const sidebar = document.querySelector("aside");
      if (sidebar) {
        setSidebarWidth(sidebar.offsetWidth);
      }
    };

    // Observar cambios en el sidebar
    const observer = new MutationObserver(handleResize);
    const sidebar = document.querySelector("aside");

    if (sidebar) {
      observer.observe(sidebar, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }

    handleResize();

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex min-h-screen bg-base-200">
      <Sidebar />
      <main
        className="flex-1 transition-all duration-300 ease-in-out"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
