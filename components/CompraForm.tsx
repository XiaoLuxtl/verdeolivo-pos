// Ruta: components/CompraForm.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Alert } from "./ui/Alert";
import { Modal, ModalHeader, ModalBody, ModalActions } from "./ui/Modal";

type Producto = {
  id: number;
  nombre: string;
  sku: string;
  precioUnitario: number;
  unidad: string;
  peso: number;
};

type DetalleCompra = {
  productoId: string;
  cantidad: string;
  costoUnitario: string;
  subtotal: number;
};

type Props = {
  onClose: () => void;
  onSave: () => void;
};

export default function CompraForm({ onClose, onSave }: Props) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split("T")[0],
    proveedor: "",
    notas: "",
  });
  const [detalles, setDetalles] = useState<DetalleCompra[]>([]);
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

  const agregarDetalle = () => {
    setDetalles([
      ...detalles,
      {
        productoId: "",
        cantidad: "",
        costoUnitario: "",
        subtotal: 0,
      },
    ]);
  };

  const eliminarDetalle = (index: number) => {
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  const actualizarDetalle = (
    index: number,
    field: keyof DetalleCompra,
    value: string
  ) => {
    const nuevosDetalles = [...detalles];
    nuevosDetalles[index] = {
      ...nuevosDetalles[index],
      [field]: value,
    };

    // Calcular subtotal
    if (field === "cantidad" || field === "costoUnitario") {
      const cantidad = parseFloat(nuevosDetalles[index].cantidad) || 0;
      const costo = parseFloat(nuevosDetalles[index].costoUnitario) || 0;
      nuevosDetalles[index].subtotal = cantidad * costo;
    }

    setDetalles(nuevosDetalles);
  };

  const calcularTotal = () => {
    return detalles.reduce((sum, detalle) => sum + detalle.subtotal, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (detalles.length === 0) {
      setError("Agrega al menos un producto");
      return;
    }

    if (
      detalles.some((d) => !d.productoId || !d.cantidad || !d.costoUnitario)
    ) {
      setError("Completa todos los campos de los productos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/compras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          total: calcularTotal(),
          detalles: detalles,
        }),
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

  const getProductoNombre = (productoId: string) => {
    const producto = productos.find((p) => p.id === parseInt(productoId));
    return producto ? `${producto.nombre} (${producto.unidad})` : "";
  };

  const getProductoPeso = (productoId: string) => {
    const producto = productos.find((p) => p.id === parseInt(productoId));
    return producto?.peso || 0;
  };

  const getProductoUnidad = (productoId: string) => {
    const producto = productos.find((p) => p.id === parseInt(productoId));
    return producto?.unidad || "";
  };

  const calcularCantidadTotal = (detalle: DetalleCompra) => {
    const cantidad = parseFloat(detalle.cantidad) || 0;
    const peso = getProductoPeso(detalle.productoId);
    return cantidad * peso;
  };

  return (
    <Modal open={true} onClose={onClose}>
      <ModalHeader>
        <h2 className="text-2xl font-bold">Registrar Compra</h2>
        <Button onClick={onClose} variant="ghost" size="sm" shape="circle">
          <X className="w-5 h-5" />
        </Button>
      </ModalHeader>

      <ModalBody>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="error">
              <span>{error}</span>
            </Alert>
          )}

          {/* Datos generales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Fecha *</span>
              </label>
              <Input
                type="date"
                required
                value={formData.fecha}
                onChange={(e) =>
                  setFormData({ ...formData, fecha: e.target.value })
                }
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Proveedor *</span>
              </label>
              <Input
                type="text"
                required
                value={formData.proveedor}
                onChange={(e) =>
                  setFormData({ ...formData, proveedor: e.target.value })
                }
                placeholder="Nombre del proveedor"
              />
            </div>
          </div>

          {/* Notas */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Notas</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-20"
              value={formData.notas}
              onChange={(e) =>
                setFormData({ ...formData, notas: e.target.value })
              }
              placeholder="Notas adicionales..."
            />
          </div>

          {/* Detalles de compra */}
          <div className="border-t border-base-300 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Productos</h3>
              <Button
                type="button"
                onClick={agregarDetalle}
                variant="primary"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Producto
              </Button>
            </div>

            <div className="space-y-3">
              {detalles.map((detalle, index) => (
                <div key={index} className="card bg-base-200 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {/* Producto */}
                    <div className="form-control md:col-span-2">
                      <label className="label label-text">Producto</label>
                      <Select
                        required
                        size="sm"
                        value={detalle.productoId}
                        onChange={(e) =>
                          actualizarDetalle(index, "productoId", e.target.value)
                        }
                      >
                        <option value="">Seleccionar...</option>
                        {productos.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nombre} - {p.sku} ({p.peso}
                            {p.unidad}/unidad)
                          </option>
                        ))}
                      </Select>
                    </div>

                    {/* Cantidad */}
                    <div className="form-control">
                      <label className="label label-text">
                        Cantidad (unidades)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        className="input input-bordered input-sm"
                        value={detalle.cantidad}
                        onChange={(e) =>
                          actualizarDetalle(index, "cantidad", e.target.value)
                        }
                      />
                      {detalle.productoId && detalle.cantidad && (
                        <label className="label">
                          <span className="label-text-alt text-info">
                            = {calcularCantidadTotal(detalle)}
                            {getProductoUnidad(detalle.productoId)} total
                          </span>
                        </label>
                      )}
                    </div>

                    {/* Costo Unitario */}
                    <div className="form-control">
                      <label className="label label-text">Costo Unit.</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        className="input input-bordered input-sm"
                        value={detalle.costoUnitario}
                        onChange={(e) =>
                          actualizarDetalle(
                            index,
                            "costoUnitario",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    {/* Subtotal y eliminar */}
                    <div className="flex items-end gap-2">
                      <div className="form-control flex-1">
                        <label className="label label-text">Subtotal</label>
                        <input
                          type="text"
                          readOnly
                          className="input input-bordered input-sm bg-base-300"
                          value={`$${detalle.subtotal.toFixed(2)}`}
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={() => eliminarDetalle(index)}
                        variant="error"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {detalles.length === 0 && (
                <div className="text-center py-8 text-base-content/50">
                  No hay productos agregados. Click en &quot;Agregar
                  Producto&quot;
                </div>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-base-300 pt-4">
            <div className="flex justify-end items-center gap-4">
              <span className="text-xl font-semibold">Total:</span>
              <span className="text-3xl font-bold text-primary">
                ${calcularTotal().toFixed(2)}
              </span>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 justify-end pt-4 border-t border-base-300">
            <Button
              type="button"
              onClick={onClose}
              variant="ghost"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || detalles.length === 0}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Registrar Compra"
              )}
            </Button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
}
