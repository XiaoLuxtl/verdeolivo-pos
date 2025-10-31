// types/producto.ts
import {
  Producto as PrismaProducto,
  CategoriaProducto,
  UnidadMedida,
} from "@prisma/client";

// Usar el tipo generado por Prisma directamente
export type Producto = PrismaProducto;

export interface ProductoConInventario extends Producto {
  inventario?: {
    cantidadActual: number;
    unidad: UnidadMedida;
    actualizadoEn: Date;
  };
}

export interface ProductoFormData {
  sku: string;
  nombre: string;
  sabor: string;
  categoria: string;
  proveedor: string;
  precioUnitario: string;
  peso: string;
  precioPorUnidad: string;
  unidad: string;
  descripcion: string;
  stockMinimo: string;
  descripcionUmbral: string;
}
