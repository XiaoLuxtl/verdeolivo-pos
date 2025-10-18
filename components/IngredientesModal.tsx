"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
  ModalClose,
} from "./ui/dialog";
import { Loading } from "./ui/loading";

type Producto = {
  id: number;
  nombre: string;
  unidad: string;
};

type Ingrediente = {
  id: number;
  cantidad: number;
  unidad: string;
  producto: Producto;
};

type Props = {
  recetaId: number;
  recetaNombre: string;
  onClose: () => void;
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
      <Modal open={true} onOpenChange={() => {}}>
        <ModalContent>
          <div className="flex items-center justify-center p-8">
            <Loading size="lg" />
          </div>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal open={true} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="max-w-4xl">
        <ModalHeader>
          <ModalTitle className="text-2xl font-bold">Ingredientes</ModalTitle>
          <p className="text-sm text-muted-foreground mt-1">{recetaNombre}</p>
          <ModalClose />
        </ModalHeader>

        <div className="space-y-4">
          {/* Botón agregar */}
          {!showForm && (
            <Button
              type="button"
              onClick={() => setShowForm(true)}
              variant="default"
              size="sm"
              className="mb-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Ingrediente
            </Button>
          )}

          {/* Formulario */}
          {showForm && (
            <form
              onSubmit={handleAddIngrediente}
              className="bg-muted p-4 mb-4 rounded-lg border"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Producto
                  </label>
                  <Select
                    value={formData.productoId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, productoId: value })
                    }
                  >
                    <SelectTrigger>
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
                  <label className="text-sm font-medium text-foreground">
                    Cantidad
                  </label>
                  <Input
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
                  <label className="text-sm font-medium text-foreground">
                    Unidad
                  </label>
                  <Select
                    value={formData.unidad}
                    onValueChange={(value) =>
                      setFormData({ ...formData, unidad: value })
                    }
                  >
                    <SelectTrigger>
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
                  variant="ghost"
                  size="sm"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}

          {/* Lista de ingredientes */}
          <div className="space-y-2">
            {ingredientes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay ingredientes agregados
              </div>
            ) : (
              ingredientes.map((ing) => (
                <div
                  key={ing.id}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg border"
                >
                  <div>
                    <p className="font-semibold text-foreground">
                      {ing.producto.nombre}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {ing.cantidad} {ing.unidad}
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => handleDeleteIngrediente(ing.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        <ModalFooter>
          <Button onClick={onClose} variant="default" className="w-full">
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
