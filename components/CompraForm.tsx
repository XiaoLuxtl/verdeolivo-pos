// components/CompraForm.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  ModalClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loading } from "@/components/ui/loading";

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
  open?: boolean;
  onClose: () => void;
  onSave: () => void;
};

export default function CompraForm({ open = true, onClose, onSave }: Props) {
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

  if (!open) return null;

  return (
    <Modal open={open} onOpenChange={onClose}>
      <ModalContent className="sm:max-w-4xl">
        <ModalHeader>
          <ModalTitle>Registrar Compra</ModalTitle>
          <ModalDescription>
            Completa la información de la compra y agrega los productos.
          </ModalDescription>
          <ModalClose />
        </ModalHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="error">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Datos generales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha *</Label>
              <Input
                id="fecha"
                type="date"
                required
                value={formData.fecha}
                onChange={(e) =>
                  setFormData({ ...formData, fecha: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proveedor">Proveedor *</Label>
              <Input
                id="proveedor"
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
          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              value={formData.notas}
              onChange={(e) =>
                setFormData({ ...formData, notas: e.target.value })
              }
              placeholder="Notas adicionales..."
              rows={3}
            />
          </div>

          {/* Detalles de compra */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Productos</h3>
              <Button
                type="button"
                onClick={agregarDetalle}
                variant="outline"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Producto
              </Button>
            </div>

            <div className="space-y-3">
              {detalles.map((detalle, index) => (
                <Card key={index} className="p-4">
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      {/* Producto */}
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor={`producto-${index}`}>Producto</Label>
                        <Select
                          value={detalle.productoId}
                          onValueChange={(value) =>
                            actualizarDetalle(index, "productoId", value)
                          }
                        >
                          <SelectTrigger id={`producto-${index}`}>
                            <SelectValue placeholder="Seleccionar producto" />
                          </SelectTrigger>
                          <SelectContent>
                            {productos.map((p) => (
                              <SelectItem key={p.id} value={p.id.toString()}>
                                {p.nombre} - {p.sku} ({p.peso}
                                {p.unidad}/unidad)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Cantidad */}
                      <div className="space-y-2">
                        <Label htmlFor={`cantidad-${index}`}>
                          Cantidad (unidades)
                        </Label>
                        <Input
                          id={`cantidad-${index}`}
                          type="number"
                          step="0.01"
                          required
                          value={detalle.cantidad}
                          onChange={(e) =>
                            actualizarDetalle(index, "cantidad", e.target.value)
                          }
                        />
                        {detalle.productoId && detalle.cantidad && (
                          <p className="text-xs text-muted-foreground">
                            = {calcularCantidadTotal(detalle)}
                            {getProductoUnidad(detalle.productoId)} total
                          </p>
                        )}
                      </div>

                      {/* Costo Unitario */}
                      <div className="space-y-2">
                        <Label htmlFor={`costo-${index}`}>Costo Unit.</Label>
                        <Input
                          id={`costo-${index}`}
                          type="number"
                          step="0.01"
                          required
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
                        <div className="space-y-2 flex-1">
                          <Label>Subtotal</Label>
                          <Input
                            readOnly
                            value={`$${detalle.subtotal.toFixed(2)}`}
                            className="bg-muted"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={() => eliminarDetalle(index)}
                          variant="destructive"
                          size="icon"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {detalles.length === 0 && (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  No hay productos agregados. Haz clic en &quot;Agregar
                  Producto&quot;
                </div>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex justify-end items-center gap-4">
              <span className="text-xl font-semibold">Total:</span>
              <span className="text-3xl font-bold text-primary">
                ${calcularTotal().toFixed(2)}
              </span>
            </div>
          </div>

          {/* Botones */}
          <ModalFooter>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || detalles.length === 0}>
              {loading ? (
                <>
                  <Loading size="sm" className="mr-2" />
                  Guardando...
                </>
              ) : (
                "Registrar Compra"
              )}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
