"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, List, Search } from "lucide-react";
import RecetaForm from "@/components/RecetaForm";
import IngredientesModal from "@/components/IngredientesModal";
import DeleteConfirmation from "@/components/DeleteConfirmation";

type Receta = {
  id: number;
  nombre: string;
  descripcion: string | null;
  precioVenta: number;
  imagen: string | null;
  ingredientes: any[];
};

export default function RecetasPage() {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [filteredRecetas, setFilteredRecetas] = useState<Receta[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedReceta, setSelectedReceta] = useState<any>(null);
  const [showIngredientes, setShowIngredientes] = useState(false);
  const [recetaIngredientes, setRecetaIngredientes] = useState<{
    id: number;
    nombre: string;
  } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recetaToDelete, setRecetaToDelete] = useState<Receta | null>(null);

  const fetchRecetas = async () => {
    try {
      const response = await fetch("/api/recetas");
      const data = await response.json();
      setRecetas(data);
      setFilteredRecetas(data);
    } catch (error) {
      console.error("Error al cargar recetas:", error);
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

  const handleEdit = (receta: Receta) => {
    setSelectedReceta({
      id: receta.id,
      nombre: receta.nombre,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-base-content">Recetas</h1>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Nueva Receta
        </button>
      </div>

      {/* Buscador */}
      <div className="card bg-base-100 shadow-lg mb-6">
        <div className="card-body">
          <div className="form-control">
            <div className="input-group">
              <span className="bg-base-200">
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                placeholder="Buscar recetas..."
                className="input input-bordered w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid de recetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRecetas.length === 0 ? (
          <div className="col-span-full text-center py-12 text-base-content/50">
            No hay recetas registradas
          </div>
        ) : (
          filteredRecetas.map((receta) => (
            <div
              key={receta.id}
              className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
            >
              {/* Imagen */}
              <figure className="h-48 bg-base-200">
                {receta.imagen ? (
                  <img
                    src={receta.imagen}
                    alt={receta.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-base-content/30">
                    <span className="text-6xl">🍽️</span>
                  </div>
                )}
              </figure>

              <div className="card-body">
                <h2 className="card-title text-lg">{receta.nombre}</h2>

                {receta.descripcion && (
                  <p className="text-sm text-base-content/60 line-clamp-2">
                    {receta.descripcion}
                  </p>
                )}

                <div className="flex items-center justify-between mt-2">
                  <span className="text-2xl font-bold text-primary">
                    ${receta.precioVenta.toFixed(2)}
                  </span>
                  <span className="badge badge-secondary">
                    {receta.ingredientes.length} ingredientes
                  </span>
                </div>

                <div className="card-actions justify-end mt-4">
                  <button
                    onClick={() => handleShowIngredientes(receta)}
                    className="btn btn-sm btn-ghost"
                    title="Ver ingredientes"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(receta)}
                    className="btn btn-sm btn-ghost"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setRecetaToDelete(receta);
                      setShowDeleteConfirm(true);
                    }}
                    className="btn btn-sm btn-ghost text-error"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Formulario de receta */}
      {showForm && (
        <RecetaForm
          receta={selectedReceta}
          onClose={handleCloseForm}
          onSave={fetchRecetas}
        />
      )}

      {/* Modal de ingredientes */}
      {showIngredientes && recetaIngredientes && (
        <IngredientesModal
          recetaId={recetaIngredientes.id}
          recetaNombre={recetaIngredientes.nombre}
          onClose={() => {
            setShowIngredientes(false);
            setRecetaIngredientes(null);
            fetchRecetas(); // Refrescar para actualizar el contador de ingredientes
          }}
        />
      )}

      {/* Confirmación de eliminación */}
      {showDeleteConfirm && recetaToDelete && (
        <DeleteConfirmation
          title="Eliminar Receta"
          message={`¿Estás seguro de eliminar la receta "${recetaToDelete.nombre}"? Esta acción no se puede deshacer.`}
          onConfirm={handleDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setRecetaToDelete(null);
          }}
        />
      )}
    </div>
  );
}
