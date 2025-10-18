// Ruta: types/cart.ts
export type CartItem = {
  recetaId: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen: string | null;
};
