"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

export type Producto = {
  id?: number;
  sku: string;
  nombre: string;
  sabor: string;
  proveedor: string;
  precioUnitario: string;
  peso: string;
  precioPorUnidad: string;
  unidad: string;
  descripcion: string;
  stockMinimo: string;
  descripcionUmbral: string;
};

type Props = {
  readonly producto?: Producto | null;
  readonly onClose: () => void;
  readonly onSave: () => void;
};

const unidadesDisponibles = [
  { value: "GR", label: "Gramos (gr)" },
  { value: "ML", label: "Mililitros (ml)" },
  { value: "PZ", label: "Piezas (pz)" },
] as const;

export default function ProductoForm({ producto, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<Producto>({
    sku: "",
    nombre: "",
    sabor: "",
    proveedor: "",
    precioUnitario: "",
    peso: "",
    precioPorUnidad: "",
    unidad: "GR",
    descripcion: "",
    stockMinimo: "",
    descripcionUmbral: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (producto) {
      setFormData(producto);
    }
  }, [producto]);

  // Calcular precio por unidad automáticamente
  useEffect(() => {
    const precioUnitario = parseFloat(formData.precioUnitario) || 0;
    const peso = parseFloat(formData.peso) || 0;

    if (precioUnitario > 0) {
      const precioPorUnidad = peso > 0 ? precioUnitario / peso : precioUnitario;
      setFormData((prev) => ({
        ...prev,
        precioPorUnidad: precioPorUnidad.toFixed(4),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        precioPorUnidad: "",
      }));
    }
  }, [formData.precioUnitario, formData.peso]);

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const submitButtonText = producto?.id ? "Actualizar" : "Crear";

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {producto?.id ? "Editar Producto" : "Nuevo Producto"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="error">
                <span>{error}</span>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* SKU */}
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                />
              </div>

              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                />
              </div>

              {/* Sabor */}
              <div className="space-y-2">
                <Label htmlFor="sabor">Sabor</Label>
                <Input
                  id="sabor"
                  type="text"
                  value={formData.sabor}
                  onChange={(e) =>
                    setFormData({ ...formData, sabor: e.target.value })
                  }
                />
              </div>

              {/* Proveedor */}
              <div className="space-y-2">
                <Label htmlFor="proveedor">Proveedor</Label>
                <Input
                  id="proveedor"
                  type="text"
                  value={formData.proveedor}
                  onChange={(e) =>
                    setFormData({ ...formData, proveedor: e.target.value })
                  }
                />
              </div>

              {/* Precio Unitario */}
              <div className="space-y-2">
                <Label htmlFor="precioUnitario">Precio Unitario *</Label>
                <Input
                  id="precioUnitario"
                  type="number"
                  step="0.01"
                  required
                  value={formData.precioUnitario}
                  onChange={(e) =>
                    setFormData({ ...formData, precioUnitario: e.target.value })
                  }
                />
              </div>

              {/* Peso */}
              <div className="space-y-2">
                <Label htmlFor="peso">Peso/Cantidad</Label>
                <Input
                  id="peso"
                  type="number"
                  step="0.01"
                  value={formData.peso}
                  onChange={(e) =>
                    setFormData({ ...formData, peso: e.target.value })
                  }
                />
              </div>

              {/* Unidad */}
              <div className="space-y-2">
                <Label htmlFor="unidad">Unidad *</Label>
                <Select
                  value={formData.unidad}
                  onValueChange={(value) =>
                    setFormData({ ...formData, unidad: value })
                  }
                >
                  <SelectTrigger id="unidad">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {unidadesDisponibles.map((unidad) => (
                      <SelectItem key={unidad.value} value={unidad.value}>
                        {unidad.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Precio por Unidad (calculado automáticamente) */}
              <div className="space-y-2">
                <Label htmlFor="precioPorUnidad">
                  Precio por {formData.unidad}
                </Label>
                <Input
                  id="precioPorUnidad"
                  type="number"
                  step="0.0001"
                  value={formData.precioPorUnidad}
                  readOnly
                  className="bg-gray-50"
                />
                <p className="text-xs text-muted-foreground">
                  Calculado automáticamente: Precio Unitario ÷ Peso/Cantidad
                </p>
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                rows={3}
              />
            </div>

            {/* Configuración de Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <Label
                  htmlFor="stockMinimo"
                  className="flex items-center gap-2"
                >
                  🔔 Stock Mínimo *
                  <span className="text-xs text-muted-foreground">
                    (alerta cuando ≤ este valor)
                  </span>
                </Label>
                <Input
                  id="stockMinimo"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.stockMinimo}
                  onChange={(e) =>
                    setFormData({ ...formData, stockMinimo: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="descripcionUmbral"
                  className="flex items-center gap-2"
                >
                  📝 Mensaje de Alerta
                  <span className="text-xs text-muted-foreground">
                    (opcional, se muestra cuando hay poco stock)
                  </span>
                </Label>
                <Input
                  id="descripcionUmbral"
                  type="text"
                  placeholder="ej: Reponer urgentemente"
                  value={formData.descripcionUmbral}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      descripcionUmbral: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </form>
        </div>

        <DialogFooter>
          <div className="flex gap-3 w-full">
            <Button
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
                submitButtonText
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
