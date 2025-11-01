// Hook personalizado para manejar categorías de productos
import { useMemo } from "react";
import { Receta } from "./useRecetas";

export type CategoriaConfig = {
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  nombre: string;
  prioridad: number;
};

// Configuración de categorías con prioridades
export const CATEGORIA_CONFIG: Record<string, CategoriaConfig> = {
  MALTEADA: {
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    icon: "🥤",
    nombre: "Malteadas",
    prioridad: 1,
  },
  ALOE: {
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    icon: "🌿",
    nombre: "Aloe Vera",
    prioridad: 2,
  },
  SHAKE: {
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: "🧊",
    nombre: "Shakes",
    prioridad: 3,
  },
  SUPLEMENTO: {
    color: "from-purple-500 to-violet-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    icon: "💊",
    nombre: "Suplementos",
    prioridad: 4,
  },
  OTRO: {
    color: "from-gray-500 to-slate-500",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    icon: "🍽️",
    nombre: "Otros",
    prioridad: 5,
  },
};

export function useCategorias(recetas: Receta[]) {
  // Función para agrupar recetas por categoría
  const groupRecetasByCategoria = useMemo(() => {
    const grouped: { [key: string]: Receta[] } = {};

    for (const receta of recetas) {
      const categoria = receta.categoria || "OTRO";
      if (!grouped[categoria]) {
        grouped[categoria] = [];
      }
      grouped[categoria].push(receta);
    }

    return grouped;
  }, [recetas]);

  // Función para obtener categorías ordenadas por prioridad
  const categoriasOrdenadas = useMemo(() => {
    return Object.entries(groupRecetasByCategoria)
      .map(([categoria, recetas]) => ({
        categoria,
        recetas,
        config: CATEGORIA_CONFIG[categoria] || CATEGORIA_CONFIG.OTRO,
      }))
      .sort((a, b) => a.config.prioridad - b.config.prioridad);
  }, [groupRecetasByCategoria]);

  // Función para obtener configuración de una categoría
  const getCategoriaConfig = (categoria: string): CategoriaConfig => {
    return CATEGORIA_CONFIG[categoria] || CATEGORIA_CONFIG.OTRO;
  };

  return {
    groupRecetasByCategoria,
    categoriasOrdenadas,
    getCategoriaConfig,
  };
}
