"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import {
  Button,
  Input,
  Select,
  Modal,
  ModalHeader,
  ModalBody,
  ModalActions,
} from "@/components/ui";

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
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-base-100 p-8 rounded-lg">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  return (
    <Modal>
      <ModalHeader>
        <div>
          <h2 className="text-2xl font-bold text-base-content">Ingredientes</h2>
          <p className="text-sm text-base-content/60 mt-1">{recetaNombre}</p>
        </div>
        <Button type="button" onClick={onClose} variant="ghost" size="sm">
          <X className="w-5 h-5" />
        </Button>
      </ModalHeader>

      <ModalBody>
        {/* Botón agregar */}
        {!showForm && (
          <Button
            type="button"
            onClick={() => setShowForm(true)}
            variant="primary"
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
            className="card bg-base-200 p-4 mb-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="form-control">
                <label className="label label-text">Producto</label>
                <Select
                  required
                  size="sm"
                  value={formData.productoId}
                  onChange={(e) =>
                    setFormData({ ...formData, productoId: e.target.value })
                  }
                >
                  <option value="">Seleccionar...</option>
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="form-control">
                <label className="label label-text">Cantidad</label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  size="sm"
                  value={formData.cantidad}
                  onChange={(e) =>
                    setFormData({ ...formData, cantidad: e.target.value })
                  }
                />
              </div>

              <div className="form-control">
                <label className="label label-text">Unidad</label>
                <Select
                  size="sm"
                  value={formData.unidad}
                  onChange={(e) =>
                    setFormData({ ...formData, unidad: e.target.value })
                  }
                >
                  <option value="gr">gr</option>
                  <option value="ml">ml</option>
                  <option value="pz">pz</option>
                  <option value="kg">kg</option>
                  <option value="lt">lt</option>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <Button type="submit" variant="primary" size="sm">
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
            <div className="text-center py-8 text-base-content/50">
              No hay ingredientes agregados
            </div>
          ) : (
            ingredientes.map((ing) => (
              <div
                key={ing.id}
                className="flex items-center justify-between p-4 bg-base-200 rounded-lg"
              >
                <div>
                  <p className="font-semibold">{ing.producto.nombre}</p>
                  <p className="text-sm text-base-content/60">
                    {ing.cantidad} {ing.unidad}
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => handleDeleteIngrediente(ing.id)}
                  variant="ghost"
                  size="sm"
                  className="text-error"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ModalBody>

      <ModalActions>
        <Button
          type="button"
          onClick={onClose}
          variant="primary"
          className="w-full"
        >
          Cerrar
        </Button>
      </ModalActions>
    </Modal>
  );
}
