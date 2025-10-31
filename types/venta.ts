// types/venta.ts
export interface Venta {
  id: number;
  fecha: Date;
  subtotal: number;
  descuento: number;
  tipoDescuento?: string;
  valorDescuentoOriginal?: number;
  total: number;
  recibido: number;
  cambio: number;
  metodoPago: string;
  notas?: string;
}

export interface DetalleVenta {
  id: number;
  ventaId: number;
  recetaId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  movimientoRef?: string;
}

export interface VentaConDetalles extends Venta {
  detalles: DetalleVenta[];
}

export interface DescuentoData {
  tipo: "porcentaje" | "monto";
  valor: number;
  descripcion?: string;
}
