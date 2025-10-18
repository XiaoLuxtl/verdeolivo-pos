"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

type Producto = {
  id?: number;
  sku: string;
  nombre: string;
  sabor: string;
  proveedor: string;
  precioUnitario: string;
  peso: string;
  unidad: string;
  descripcion: string;
};

type Props = {
  producto?: Producto;
  onClose: () => void;
  onSave: () => void;
};

const unidadesDisponibles = ["gr", "ml", "pz", "kg", "lt"];

export default function ProductoForm({ producto, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<Producto>({
    sku: "",
    nombre: "",
    sabor: "",
    proveedor: "",
    precioUnitario: "",
    peso: "",
    unidad: "gr",
    descripcion: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (producto) {
      setFormData(producto);
    }
  }, [producto]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = producto?.id
        ? `/api/productos/${producto.id}`
        : "/api/productos";

      const method = producto?.id ? "PUT" : "POST";

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
            {producto?.id ? "Editar Producto" : "Nuevo Producto"}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SKU */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">SKU *</span>
              </label>
              <input
                type="text"
                required
                className="input input-bordered"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
              />
            </div>

            {/* Nombre */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Nombre *</span>
              </label>
              <input
                type="text"
                required
                className="input input-bordered"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
              />
            </div>

            {/* Sabor */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Sabor</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={formData.sabor}
                onChange={(e) =>
                  setFormData({ ...formData, sabor: e.target.value })
                }
              />
            </div>

            {/* Proveedor */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Proveedor</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={formData.proveedor}
                onChange={(e) =>
                  setFormData({ ...formData, proveedor: e.target.value })
                }
              />
            </div>

            {/* Precio Unitario */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Precio Unitario *</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                className="input input-bordered"
                value={formData.precioUnitario}
                onChange={(e) =>
                  setFormData({ ...formData, precioUnitario: e.target.value })
                }
              />
            </div>

            {/* Peso */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Peso/Cantidad</span>
              </label>
              <input
                type="number"
                step="0.01"
                className="input input-bordered"
                value={formData.peso}
                onChange={(e) =>
                  setFormData({ ...formData, peso: e.target.value })
                }
              />
            </div>

            {/* Unidad */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Unidad *</span>
              </label>
              <select
                required
                className="select select-bordered"
                value={formData.unidad}
                onChange={(e) =>
                  setFormData({ ...formData, unidad: e.target.value })
                }
              >
                {unidadesDisponibles.map((unidad) => (
                  <option key={unidad} value={unidad}>
                    {unidad}
                  </option>
                ))}
              </select>
            </div>
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
            />
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
              ) : producto?.id ? (
                "Actualizar"
              ) : (
                "Crear"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
