// types/compra.ts
export interface DetalleCompra {
  readonly id: string;
  readonly productoId: string;
  readonly cantidad: string;
  readonly costoUnitario: string;
  subtotal: number;
}

export interface CompraFormData {
  fecha: string;
  proveedor: string;
  notas: string;
}

export interface Compra {
  id: number;
  fecha: Date;
  proveedor: string;
  total: number;
  notas?: string;
  detalles: DetalleCompra[];
}
