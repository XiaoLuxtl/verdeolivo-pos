import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VerdeOlivo POS",
  description: "Sistema de punto de venta e inventario",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
