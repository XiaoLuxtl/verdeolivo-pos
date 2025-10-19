"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loading } from "@/components/ui/loading";
import { Alert, AlertDescription } from "@/components/ui/alert";

type UnidadMedida = "GR" | "ML" | "PZ";

interface Producto {
  readonly id: number;
  readonly nombre: string;
  readonly unidad: UnidadMedida;
}

interface Ingrediente {
  readonly id: number;
  readonly cantidad: number;
  readonly unidad: UnidadMedida;
  readonly producto: Producto;
}

interface IngredienteFormData {
  productoId: string;
  cantidad: string;
  unidad: UnidadMedida;
}

interface Props {
  readonly recetaId: number;
  readonly recetaNombre: string;
  readonly onClose: () => void;
}

export default function IngredientesModal({
  recetaId,
  recetaNombre,
  onClose,
}: Props) {
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string>("");
  const [formData, setFormData] = useState<IngredienteFormData>({
    productoId: "",
    cantidad: "",
    unidad: "GR",
  });

  // Unidades disponibles
  const unidadesDisponibles = useMemo(
    () => [
      { value: "GR" as const, label: "Gramos (gr)" },
      { value: "ML" as const, label: "Mililitros (ml)" },
      { value: "PZ" as const, label: "Piezas (pz)" },
    ],
    []
  );

  const fetchData = useCallback(async () => {
    try {
      setError("");
      const [ingredientesRes, productosRes] = await Promise.all([
        fetch(`/api/recetas/${recetaId}/ingredientes`),
        fetch("/api/productos"),
      ]);

      if (!ingredientesRes.ok || !productosRes.ok) {
        throw new Error("Error al cargar los datos");
      }

      const ingredientesData: Ingrediente[] = await ingredientesRes.json();
      const productosData: Producto[] = await productosRes.json();

      setIngredientes(ingredientesData);
      setProductos(productosData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setError("Error al cargar los ingredientes y productos");
    } finally {
      setLoading(false);
    }
  }, [recetaId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-seleccionar unidad cuando cambia el producto
  const handleProductoChange = useCallback(
    (productoId: string) => {
      const producto = productos.find((p) => p.id.toString() === productoId);
      setFormData((prev) => ({
        ...prev,
        productoId,
        unidad: producto?.unidad || "GR",
      }));
    },
    [productos]
  );

  const handleUnidadChange = useCallback((unidad: string) => {
    setFormData((prev) => ({
      ...prev,
      unidad: unidad as UnidadMedida,
    }));
  }, []);

  const validarFormulario = useCallback((): string | null => {
    if (!formData.productoId) {
      return "Selecciona un producto";
    }
    if (!formData.cantidad || Number.parseFloat(formData.cantidad) <= 0) {
      return "Ingresa una cantidad válida mayor a 0";
    }
    return null;
  }, [formData]);

  const handleAddIngrediente = async (e: React.FormEvent) => {
    e.preventDefault();

    const errorValidacion = validarFormulario();
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    try {
      setError("");
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

      await fetchData();
      setFormData({ productoId: "", cantidad: "", unidad: "GR" });
      setShowForm(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      console.error("Error al agregar ingrediente:", err);
    }
  };

  const handleDeleteIngrediente = async (ingredienteId: number) => {
    if (!confirm("¿Eliminar este ingrediente?")) return;

    try {
      setError("");
      const response = await fetch(
        `/api/recetas/${recetaId}/ingredientes/${ingredienteId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al eliminar ingrediente");
      }

      await fetchData();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      console.error("Error al eliminar ingrediente:", err);
    }
  };

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent>
          <div className="flex items-center justify-center p-8">
            <Loading size="lg" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Ingredientes de Receta
          </DialogTitle>
          <DialogDescription>
            Gestiona los ingredientes necesarios para preparar:{" "}
            <strong>{recetaNombre}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mostrar errores */}
          {error && (
            <Alert variant="error">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Botón agregar */}
          {!showForm && (
            <Button
              type="button"
              onClick={() => setShowForm(true)}
              variant="outline"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Ingrediente
            </Button>
          )}

          {/* Formulario */}
          {showForm && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">Nuevo Ingrediente</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddIngrediente}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="producto">Producto *</Label>
                      <Select
                        value={formData.productoId}
                        onValueChange={handleProductoChange}
                      >
                        <SelectTrigger id="producto">
                          <SelectValue placeholder="Seleccionar producto..." />
                        </SelectTrigger>
                        <SelectContent>
                          {productos.map((p) => (
                            <SelectItem key={p.id} value={p.id.toString()}>
                              {p.nombre} ({p.unidad.toLowerCase()})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Al seleccionar un producto, la unidad se
                        auto-seleccionará
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
                        className={
                          formData.cantidad &&
                          Number.parseFloat(formData.cantidad) <= 0
                            ? "border-red-300"
                            : ""
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
                        onValueChange={handleUnidadChange}
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
                      onClick={() => {
                        setShowForm(false);
                        setFormData({
                          productoId: "",
                          cantidad: "",
                          unidad: "GR",
                        });
                        setError("");
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Lista de ingredientes */}
          <div className="space-y-3">
            {ingredientes.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">
                    No hay ingredientes agregados
                  </p>
                </CardContent>
              </Card>
            ) : (
              ingredientes.map((ing) => (
                <Card key={ing.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex-1">
                      <p className="font-semibold">{ing.producto.nombre}</p>
                      <p className="text-sm text-muted-foreground">
                        {ing.cantidad.toFixed(2)} {ing.unidad.toLowerCase()}
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => handleDeleteIngrediente(ing.id)}
                      variant="destructive"
                      size="sm"
                      aria-label={`Eliminar ingrediente ${ing.producto.nombre}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline" className="w-full">
            Cerrar Gestión de Ingredientes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
