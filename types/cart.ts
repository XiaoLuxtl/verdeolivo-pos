// types/cart.ts
export interface CartItem {
  recetaId: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen: string | null;
}

export interface CartState {
  items: CartItem[];
  total: number;
  descuento: number;
  tipoDescuento?: "porcentaje" | "monto";
}
