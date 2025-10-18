import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Herbalife POS",
  description: "Sistema de punto de venta e inventario",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-theme="olive">
      <body>{children}</body>
    </html>
  );
}
