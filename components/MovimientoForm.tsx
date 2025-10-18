// Ruta: components/MovimientoForm.tsx
"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

type Producto = {
  id: number;
  nombre: string;
  unidad: string;
  inventario: {
    cantidadActual: number;
  } | null;
};

type Props = {
  productoSeleccionado?: { id: number; nombre: string };
  onClose: () => void;
  onSave: () => void;
};

export default function MovimientoForm({
  productoSeleccionado,
  onClose,
  onSave,
}: Props) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [formData, setFormData] = useState({
    productoId: productoSeleccionado?.id.toString() || "",
    tipo: "salida",
    categoria: "merma",
    cantidad: "",
    notas: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const response = await fetch("/api/productos");
      const data = await response.json();
      setProductos(data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  };

  const getStockActual = () => {
    if (!formData.productoId) return null;
    const producto = productos.find(
      (p) => p.id === parseInt(formData.productoId)
    );
    return producto?.inventario?.cantidadActual || 0;
  };

  const getUnidad = () => {
    if (!formData.productoId) return "";
    const producto = productos.find(
      (p) => p.id === parseInt(formData.productoId)
    );
    return producto?.unidad || "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/inventario/movimientos", {
        method: "POST",
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
      <div className="bg-base-100 rounded-lg shadow-xl max-w-2xl w-full">
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <h2 className="text-2xl font-bold text-base-content">
            Registrar Movimiento
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

          {/* Producto */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Producto *</span>
            </label>
            <select
              required
              className="select select-bordered"
              value={formData.productoId}
              onChange={(e) =>
                setFormData({ ...formData, productoId: e.target.value })
              }
              disabled={!!productoSeleccionado}
            >
              <option value="">Seleccionar...</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} - Stock: {p.inventario?.cantidadActual || 0}{" "}
                  {p.unidad}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo y Categoría */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Tipo *</span>
              </label>
              <select
                required
                className="select select-bordered"
                value={formData.tipo}
                onChange={(e) =>
                  setFormData({ ...formData, tipo: e.target.value })
                }
              >
                <option value="salida">Salida</option>
                <option value="entrada">Entrada</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Categoría *</span>
              </label>
              <select
                required
                className="select select-bordered"
                value={formData.categoria}
                onChange={(e) =>
                  setFormData({ ...formData, categoria: e.target.value })
                }
              >
                <option value="merma">Merma</option>
                <option value="ajuste">Ajuste</option>
              </select>
            </div>
          </div>

          {/* Cantidad */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Cantidad *</span>
            </label>
            <input
              type="number"
              step="0.01"
              required
              className="input input-bordered"
              value={formData.cantidad}
              onChange={(e) =>
                setFormData({ ...formData, cantidad: e.target.value })
              }
              placeholder="0.00"
            />
            {formData.productoId && (
              <label className="label">
                <span className="label-text-alt">
                  Stock actual: {getStockActual()} {getUnidad()}
                </span>
                {formData.cantidad && formData.tipo === "salida" && (
                  <span className="label-text-alt text-info">
                    Quedarán:{" "}
                    {(getStockActual() || 0) -
                      parseFloat(formData.cantidad || "0")}{" "}
                    {getUnidad()}
                  </span>
                )}
                {formData.cantidad && formData.tipo === "entrada" && (
                  <span className="label-text-alt text-success">
                    Quedarán:{" "}
                    {(getStockActual() || 0) +
                      parseFloat(formData.cantidad || "0")}{" "}
                    {getUnidad()}
                  </span>
                )}
              </label>
            )}
          </div>

          {/* Notas */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Notas</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24"
              value={formData.notas}
              onChange={(e) =>
                setFormData({ ...formData, notas: e.target.value })
              }
              placeholder="Motivo del movimiento..."
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
              ) : (
                "Registrar Movimiento"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
