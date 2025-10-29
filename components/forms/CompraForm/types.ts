export interface Producto {
  readonly id: number;
  readonly nombre: string;
  readonly sku: string;
  readonly categoria: string;
  readonly precioUnitario: number;
  readonly unidad: string;
  readonly peso: number | null;
  readonly proveedor: string | null;
}

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

export interface CompraFormProps {
  readonly open?: boolean;
  readonly onClose: () => void;
  readonly onSave: () => void;
}
