// types/index.ts - Exportaciones centralizadas
export * from "./api";
export * from "./cart";
export * from "./compra";
export * from "./producto";
export * from "./receta";
export * from "./reporte";
export * from "./ui";
export * from "./venta";

// Re-exportar tipos de Prisma para conveniencia
export type {
  CategoriaProducto,
  UnidadMedida,
  CategoriaReceta,
} from "@prisma/client";
