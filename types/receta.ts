// types/receta.ts
export interface Receta {
  id?: number;
  nombre: string;
  categoria: string;
  descripcion: string;
  precioVenta: number;
  imagen: string | null;
}

export interface RecetaFormData {
  id?: number;
  nombre: string;
  categoria: string;
  descripcion: string;
  precioVenta: string;
  imagen: string | null;
}

export interface IngredienteFormData {
  productoId: string;
  cantidad: string;
  unidad: string;
}

export interface IngredienteReceta {
  id: number;
  cantidad: number;
  producto: {
    id: number;
    nombre: string;
    unidad: string;
    precioUnitario: number;
  };
}

export interface RecetaConIngredientes extends Receta {
  ingredientes: IngredienteReceta[];
}
