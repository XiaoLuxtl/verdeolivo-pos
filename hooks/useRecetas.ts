// hooks/useRecetas.ts
import { useState, useEffect } from "react";
import { RecetaConIngredientes, RecetaFormData } from "@/types";

export type Receta = RecetaConIngredientes & { id: number };

interface UseRecetasReturn {
  // Estado
  recetas: Receta[];
  filteredRecetas: Receta[];
  searchTerm: string;
  loading: boolean;
  error: string | null;
  showForm: boolean;
  selectedReceta: RecetaFormData | null;
  showIngredientes: boolean;
  recetaIngredientes: { id: number; nombre: string } | null;
  showDeleteConfirm: boolean;
  recetaToDelete: Receta | null;

  // Acciones
  setSearchTerm: (term: string) => void;
  fetchRecetas: () => Promise<void>;
  refreshRecetas: () => void;
  handleEdit: (receta: Receta) => void;
  handleDelete: () => Promise<void>;
  handleCloseForm: () => void;
  handleShowIngredientes: (receta: Receta) => void;
  handleCloseIngredientes: () => void;
  handleCloseDeleteConfirm: () => void;
  handleShowDeleteConfirm: (receta: Receta) => void;
  setShowForm: (show: boolean) => void;
  setRecetaToDelete: (receta: Receta | null) => void;
}

export function useRecetas(): UseRecetasReturn {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [filteredRecetas, setFilteredRecetas] = useState<Receta[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedReceta, setSelectedReceta] = useState<RecetaFormData | null>(
    null
  );
  const [showIngredientes, setShowIngredientes] = useState(false);
  const [recetaIngredientes, setRecetaIngredientes] = useState<{
    id: number;
    nombre: string;
  } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recetaToDelete, setRecetaToDelete] = useState<Receta | null>(null);

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
      setFilteredRecetas(data);
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

  useEffect(() => {
    const filtered = recetas.filter((r) =>
      r.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecetas(filtered);
  }, [searchTerm, recetas]);

  const refreshRecetas = () => {
    fetchRecetas();
  };

  const handleEdit = (receta: Receta) => {
    setSelectedReceta({
      id: receta.id,
      nombre: receta.nombre,
      categoria: receta.categoria,
      descripcion: receta.descripcion || "",
      precioVenta: receta.precioVenta.toString(),
      imagen: receta.imagen,
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!recetaToDelete) return;

    const response = await fetch(`/api/recetas/${recetaToDelete.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error);
    }

    await fetchRecetas();
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedReceta(null);
  };

  const handleShowIngredientes = (receta: Receta) => {
    setRecetaIngredientes({ id: receta.id, nombre: receta.nombre });
    setShowIngredientes(true);
  };

  const handleCloseIngredientes = () => {
    setShowIngredientes(false);
    setRecetaIngredientes(null);
    fetchRecetas(); // Refrescar para actualizar el contador de ingredientes
  };

  const handleCloseDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setRecetaToDelete(null);
  };

  const handleShowDeleteConfirm = (receta: Receta) => {
    setRecetaToDelete(receta);
    setShowDeleteConfirm(true);
  };

  return {
    // Estado
    recetas,
    filteredRecetas,
    searchTerm,
    loading,
    error,
    showForm,
    selectedReceta,
    showIngredientes,
    recetaIngredientes,
    showDeleteConfirm,
    recetaToDelete,

    // Acciones
    setSearchTerm,
    fetchRecetas,
    refreshRecetas,
    handleEdit,
    handleDelete,
    handleCloseForm,
    handleShowIngredientes,
    handleCloseIngredientes,
    handleCloseDeleteConfirm,
    handleShowDeleteConfirm,
    setShowForm,
    setRecetaToDelete,
  };
}
