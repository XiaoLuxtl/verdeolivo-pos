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
  versiones?: RecetaVersion[];
}

export interface RecetaVersion {
  id: number;
  recetaId: number;
  version: number;
  nombre: string;
  categoria: string;
  descripcion?: string;
  precioVenta: number;
  imagen?: string;
  costoTotal?: number;
  createdAt: Date;
  ingredientes: RecetaVersionIngrediente[];
}

export interface RecetaVersionIngrediente {
  id: number;
  recetaVersionId: number;
  productoId: number;
  cantidad: number;
  unidad: string;
  costoUnitario: number;
  costoTotal: number;
  producto: {
    id: number;
    nombre: string;
    sku: string;
  };
}
