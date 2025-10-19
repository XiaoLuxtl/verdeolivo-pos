// Ruta: components/MovimientoForm.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";

type Producto = {
  id: number;
  nombre: string;
  unidad: string;
  inventario: {
    cantidadActual: number;
  } | null;
};

type Props = {
  readonly productoSeleccionado?: { id: number; nombre: string };
  readonly onClose: () => void;
  readonly onSave: () => void;
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
      (p) => p.id === Number.parseInt(formData.productoId)
    );
    return producto?.inventario?.cantidadActual || 0;
  };

  const getUnidad = () => {
    if (!formData.productoId) return "";
    const producto = productos.find(
      (p) => p.id === Number.parseInt(formData.productoId)
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
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <h2 className="text-2xl font-bold">Registrar Movimiento</h2>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          {/* Producto */}
          <div className="space-y-2">
            <Label htmlFor="producto">Producto *</Label>
            <Select
              value={formData.productoId}
              onValueChange={(value) =>
                setFormData({ ...formData, productoId: value })
              }
            >
              <SelectTrigger id="producto" disabled={!!productoSeleccionado}>
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
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) =>
                  setFormData({ ...formData, tipo: value })
                }
              >
                <SelectTrigger id="tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salida">Salida</SelectItem>
                  <SelectItem value="entrada">Entrada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría *</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) =>
                  setFormData({ ...formData, categoria: value })
                }
              >
                <SelectTrigger id="categoria">
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
          <div className="space-y-2">
            <Label htmlFor="cantidad">Cantidad *</Label>
            <Input
              id="cantidad"
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
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  Stock actual: {getStockActual()} {getUnidad()}
                </p>
                {formData.cantidad && formData.tipo === "salida" && (
                  <p className="text-blue-600">
                    Quedarán:{" "}
                    {(getStockActual() || 0) -
                      Number.parseFloat(formData.cantidad || "0")}{" "}
                    {getUnidad()}
                  </p>
                )}
                {formData.cantidad && formData.tipo === "entrada" && (
                  <p className="text-green-600">
                    Quedarán:{" "}
                    {(getStockActual() || 0) +
                      Number.parseFloat(formData.cantidad || "0")}{" "}
                    {getUnidad()}
                  </p>
                )}
              </div>
            )}
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
              placeholder="Motivo del movimiento..."
              rows={3}
            />
          </div>
        </form>

        <DialogFooter>
          <div className="flex gap-3 w-full">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="default"
              className="flex-1"
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Registrar Movimiento"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
