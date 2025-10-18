// Ruta: components/MovimientoForm.tsx
"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Modal, ModalHeader, ModalContent } from "@/components/ui/dialog";

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
        <div className="flex justify-between items-center w-full">
          <h2 className="text-2xl font-bold text-base-content">
            Registrar Movimiento
          </h2>
          <Button type="button" onClick={onClose} variant="ghost" size="sm">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </ModalHeader>

      <ModalContent>
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
              value={formData.productoId}
              onValueChange={(value) =>
                setFormData({ ...formData, productoId: value })
              }
            >
              <SelectTrigger disabled={!!productoSeleccionado}>
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {productos.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.nombre} - Stock: {p.inventario?.cantidadActual || 0}{" "}
                    {p.unidad}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo y Categoría */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Tipo *</span>
              </label>
              <Select
                value={formData.tipo}
                onValueChange={(value) =>
                  setFormData({ ...formData, tipo: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salida">Salida</SelectItem>
                  <SelectItem value="entrada">Entrada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Categoría *</span>
              </label>
              <Select
                value={formData.categoria}
                onValueChange={(value) =>
                  setFormData({ ...formData, categoria: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="merma">Merma</SelectItem>
                  <SelectItem value="ajuste">Ajuste</SelectItem>
                </SelectContent>
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
            <Button type="submit" variant="default" disabled={loading}>
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Registrar Movimiento"
              )}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}
