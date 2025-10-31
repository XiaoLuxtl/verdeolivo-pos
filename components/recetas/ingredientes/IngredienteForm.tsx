// components/recetas/ingredientes/IngredienteForm.tsx

import { useState, useCallback, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 💡 IMPORTAR EL COMPONENTE DE BÚSQUEDA EXISTENTE
// Ajusta esta ruta si tu componente ProductoSearchSelect está en otra ubicación
import { ProductoSearchSelect } from "@/components/forms/CompraForm/ProductoSearchSelect";

import { Producto, UnidadMedida, IngredienteFormData } from "@/types";

interface Props {
  readonly recetaId: number;
  readonly productos: Producto[];
  readonly onSuccess: () => void;
  readonly onCancel: () => void;
  readonly onError: (message: string) => void;
}

export default function IngredienteForm({
  recetaId,
  productos,
  onSuccess,
  onCancel,
  onError,
}: Props) {
  const [formData, setFormData] = useState<IngredienteFormData>({
    productoId: "",
    cantidad: "",
    unidad: "GR",
  });

  const unidadesDisponibles = useMemo(
    () => [
      { value: "GR" as const, label: "Gramos (gr)" },
      { value: "ML" as const, label: "Mililitros (ml)" },
      { value: "PZ" as const, label: "Piezas (pz)" },
    ],
    []
  );

  // Auto-seleccionar unidad cuando cambia el producto
  const handleProductoChange = useCallback(
    (productoId: string) => {
      const producto = productos.find((p) => p.id.toString() === productoId);
      setFormData((prev) => ({
        ...prev,
        productoId,
        // Aseguramos que la unidad se actualice basada en el producto
        unidad: producto?.unidad || "GR",
      }));
    },
    [productos]
  );

  const validarFormulario = useCallback((): string | null => {
    if (!formData.productoId) return "Selecciona un producto";
    if (!formData.cantidad || Number.parseFloat(formData.cantidad) <= 0) {
      return "Ingresa una cantidad válida mayor a 0";
    }
    return null;
  }, [formData]);

  const handleAddIngrediente = async (e: React.FormEvent) => {
    e.preventDefault();

    const errorValidacion = validarFormulario();
    if (errorValidacion) {
      onError(errorValidacion);
      return;
    }

    try {
      onError("");
      const payload = {
        ...formData,
        cantidad: Number.parseFloat(formData.cantidad),
      };

      const response = await fetch(`/api/recetas/${recetaId}/ingredientes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error || `Error ${response.status}: ${response.statusText}`
        );
      }

      setFormData({ productoId: "", cantidad: "", unidad: "GR" });
      onSuccess();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      onError(errorMessage);
      console.error("Error al agregar ingrediente:", err);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">Nuevo Ingrediente</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddIngrediente}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="producto">Producto *</Label>

              {/* ✅ USO DEL NUEVO PRODUCTO SEARCH SELECT */}
              <ProductoSearchSelect
                // Se requiere el casting (as any) porque el tipo 'Producto'
                // que usa IngredientesModal es más simple.
                // Si quieres eliminar el casting, debes actualizar el tipo 'Producto' en IngredientesModal.tsx
                // para incluir sku, categoria, peso, etc., tal como lo usa ProductoSearchSelect.
                productos={productos as any}
                value={formData.productoId}
                onValueChange={handleProductoChange}
                placeholder="Buscar y seleccionar producto..."
              />
              {/* ------------------------------------------- */}

              <p className="text-xs text-muted-foreground">
                Escribe para buscar por nombre, SKU o categoría. La unidad se
                auto-seleccionará.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cantidad">
                Cantidad *
                {formData.productoId && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (en {formData.unidad.toLowerCase()})
                  </span>
                )}
              </Label>
              <Input
                id="cantidad"
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.cantidad}
                onChange={(e) =>
                  setFormData({ ...formData, cantidad: e.target.value })
                }
                aria-label={`Cantidad en ${formData.unidad.toLowerCase()}`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unidad">
                Unidad
                {formData.productoId && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (auto-seleccionada)
                  </span>
                )}
              </Label>
              <Select
                value={formData.unidad}
                onValueChange={(unidad) =>
                  setFormData((prev) => ({
                    ...prev,
                    unidad: unidad as UnidadMedida,
                  }))
                }
                disabled={!!formData.productoId}
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
              {formData.productoId && (
                <p className="text-xs text-muted-foreground">
                  La unidad se basa en el producto seleccionado
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button type="submit" variant="default" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Ingrediente
            </Button>
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              size="sm"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
