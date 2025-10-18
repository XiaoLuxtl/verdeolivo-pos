"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import ImageUpload from "./ImageUpload";

type Receta = {
  id?: number;
  nombre: string;
  descripcion: string;
  precioVenta: string;
  imagen: string | null;
};

type Props = {
  receta?: Receta;
  onClose: () => void;
  onSave: () => void;
};

export default function RecetaForm({ receta, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<Receta>({
    nombre: "",
    descripcion: "",
    precioVenta: "",
    imagen: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (receta) {
      setFormData(receta);
    }
  }, [receta]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = receta?.id ? `/api/recetas/${receta.id}` : "/api/recetas";

      const method = receta?.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al guardar");
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <h2 className="text-2xl font-bold text-base-content">
            {receta?.id ? "Editar Receta" : "Nueva Receta"}
          </h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          {/* Imagen */}
          <ImageUpload
            value={formData.imagen}
            onChange={(imagen) => setFormData({ ...formData, imagen })}
          />

          {/* Nombre */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Nombre de la Receta *</span>
            </label>
            <input
              type="text"
              required
              className="input input-bordered"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              placeholder="Ej. Malteada de Uva"
            />
          </div>

          {/* Precio de Venta */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Precio de Venta *</span>
            </label>
            <input
              type="number"
              step="0.01"
              required
              className="input input-bordered"
              value={formData.precioVenta}
              onChange={(e) =>
                setFormData({ ...formData, precioVenta: e.target.value })
              }
              placeholder="0.00"
            />
          </div>

          {/* Descripción */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Descripción</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24"
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
              placeholder="Descripción opcional de la receta..."
            />
          </div>

          <div className="alert alert-info">
            <span className="text-sm">
              💡 Después de crear la receta podrás agregar los ingredientes
              necesarios
            </span>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : receta?.id ? (
                "Actualizar"
              ) : (
                "Crear Receta"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
