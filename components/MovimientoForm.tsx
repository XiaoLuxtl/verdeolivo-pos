// Ruta: components/MovimientoForm.tsx
"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  Button,
  Input,
  Select,
  Modal,
  ModalHeader,
  ModalBody,
} from "@/components/ui";

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal>
      <ModalHeader>
        <h2 className="text-2xl font-bold text-base-content">
          Registrar Movimiento
        </h2>
        <Button type="button" onClick={onClose} variant="ghost" size="sm">
          <X className="w-5 h-5" />
        </Button>
      </ModalHeader>

      <ModalBody>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Select
              required
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
            </Select>
          </div>

          {/* Tipo y Categoría */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Tipo *</span>
              </label>
              <Select
                required
                value={formData.tipo}
                onChange={(e) =>
                  setFormData({ ...formData, tipo: e.target.value })
                }
              >
                <option value="salida">Salida</option>
                <option value="entrada">Entrada</option>
              </Select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Categoría *</span>
              </label>
              <Select
                required
                value={formData.categoria}
                onChange={(e) =>
                  setFormData({ ...formData, categoria: e.target.value })
                }
              >
                <option value="merma">Merma</option>
                <option value="ajuste">Ajuste</option>
              </Select>
            </div>
          </div>

          {/* Cantidad */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Cantidad *</span>
            </label>
            <Input
              type="number"
              step="0.01"
              required
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
            <Button
              type="button"
              onClick={onClose}
              variant="ghost"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Registrar Movimiento"
              )}
            </Button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
}
