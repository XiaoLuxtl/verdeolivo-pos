"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "./ui/dialog";
import { Loading } from "./ui/loading";

type Producto = {
  readonly id: number;
  readonly nombre: string;
  readonly unidad: string;
};

type Ingrediente = {
  readonly id: number;
  readonly cantidad: number;
  readonly unidad: string;
  readonly producto: Producto;
};

type Props = {
  readonly recetaId: number;
  readonly recetaNombre: string;
  readonly onClose: () => void;
};

export default function IngredientesModal({
  recetaId,
  recetaNombre,
  onClose,
}: Props) {
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    productoId: "",
    cantidad: "",
    unidad: "gr",
  });

  const fetchData = useCallback(async () => {
    try {
      const [ingredientesRes, productosRes] = await Promise.all([
        fetch(`/api/recetas/${recetaId}/ingredientes`),
        fetch("/api/productos"),
      ]);

      const ingredientesData = await ingredientesRes.json();
      const productosData = await productosRes.json();

      setIngredientes(ingredientesData);
      setProductos(productosData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  }, [recetaId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddIngrediente = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/recetas/${recetaId}/ingredientes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Error al agregar ingrediente");

      await fetchData();
      setFormData({ productoId: "", cantidad: "", unidad: "gr" });
      setShowForm(false);
    } catch (error) {
      console.error("Error:", error);
      alert("Error al agregar ingrediente");
    }
  };

  const handleDeleteIngrediente = async (ingredienteId: number) => {
    if (!confirm("¿Eliminar este ingrediente?")) return;

    try {
      const response = await fetch(
        `/api/recetas/${recetaId}/ingredientes/${ingredienteId}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Error al eliminar");

      await fetchData();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar ingrediente");
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
          <DialogTitle className="text-2xl font-bold">Ingredientes</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">{recetaNombre}</p>
        </DialogHeader>

        <div className="space-y-4">
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
                      <Label htmlFor="producto">Producto</Label>
                      <Select
                        value={formData.productoId}
                        onValueChange={(value) =>
                          setFormData({ ...formData, productoId: value })
                        }
                      >
                        <SelectTrigger id="producto">
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          {productos.map((p) => (
                            <SelectItem key={p.id} value={p.id.toString()}>
                              {p.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cantidad">Cantidad</Label>
                      <Input
                        id="cantidad"
                        type="number"
                        step="0.01"
                        required
                        value={formData.cantidad}
                        onChange={(e) =>
                          setFormData({ ...formData, cantidad: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="unidad">Unidad</Label>
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
                          <SelectItem value="gr">gr</SelectItem>
                          <SelectItem value="ml">ml</SelectItem>
                          <SelectItem value="pz">pz</SelectItem>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="lt">lt</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button type="submit" variant="default" size="sm">
                      Agregar
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setShowForm(false)}
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
                    <div>
                      <p className="font-semibold">{ing.producto.nombre}</p>
                      <p className="text-sm text-muted-foreground">
                        {ing.cantidad} {ing.unidad}
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => handleDeleteIngrediente(ing.id)}
                      variant="destructive"
                      size="sm"
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
          <Button onClick={onClose} variant="default" className="w-full">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
