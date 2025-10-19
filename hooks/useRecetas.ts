// Hook para manejar el estado y lógica de recetas
import { useState, useEffect } from "react";

export type RecetaIngrediente = {
  id: number;
  recetaId: number;
  productoId: number;
  cantidad: number;
  unidad: string;
  producto: {
    id: number;
    nombre: string;
    sku: string;
  };
};

export type Receta = {
  id: number;
  nombre: string;
  categoria: string | null;
  precioVenta: number;
  imagen: string | null;
  ingredientes: RecetaIngrediente[];
};

export function useRecetas() {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecetas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/recetas");

      if (!response.ok) {
        throw new Error("Error al cargar recetas");
      }

      const data = await response.json();
      setRecetas(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      console.error("Error al cargar recetas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecetas();
  }, []);

  const refreshRecetas = () => {
    fetchRecetas();
  };

  return {
    recetas,
    loading,
    error,
    refreshRecetas,
  };
}
