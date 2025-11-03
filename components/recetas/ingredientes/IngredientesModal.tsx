// components/recetas/ingredientes/IngredientesModal.tsx

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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

// Componentes refactorizados
import IngredienteForm from "./IngredienteForm";
import IngredienteCard from "./IngredienteCard";
import IngredientesCostSummary from "./IngredientesCostSummary";
import { Producto, UnidadMedida } from "@/types";

// --- Tipos Locales ---
export interface Ingrediente {
  readonly id: number;
  readonly cantidad: number;
  readonly unidad: UnidadMedida;
  readonly producto: Producto;
}

// -----------------------------------------------------------

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
  const [editingIngrediente, setEditingIngrediente] =
    useState<Ingrediente | null>(null);
  const [error, setError] = useState<string>("");

  const fetchData = useCallback(async () => {
    setLoading(true);
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

  // 💡 Lógica de Costos Centralizada
  const costoTotalReceta = useMemo(() => {
    return ingredientes.reduce((sum, ing) => {
      const precioUnitario = ing.producto.precioPorUnidad || 0;
      const costoIngrediente = ing.cantidad * precioUnitario;
      return sum + costoIngrediente;
    }, 0);
  }, [ingredientes]);

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

  const handleEditIngrediente = (ingrediente: Ingrediente) => {
    setEditingIngrediente(ingrediente);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    fetchData();
    setShowForm(false);
    setEditingIngrediente(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingIngrediente(null);
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

        <div className="space-y-4 overflow-y-auto pr-2">
          {/* 💡 Nuevo componente de resumen de costos */}
          <IngredientesCostSummary costoTotal={costoTotalReceta} />

          {error && (
            <Alert variant="warning">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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

          {showForm && (
            /* 💡 Nuevo componente de formulario */
            <IngredienteForm
              recetaId={recetaId}
              productos={productos}
              ingrediente={editingIngrediente || undefined}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
              onError={setError}
            />
          )}

          <div className="space-y-3">
            {ingredientes.length === 0 ? (
              <div className="flex items-center justify-center py-8 border rounded-lg text-muted-foreground">
                No hay ingredientes agregados
              </div>
            ) : (
              ingredientes.map((ing) => (
                /* 💡 Nuevo componente de tarjeta */
                <IngredienteCard
                  key={ing.id}
                  ingrediente={ing}
                  onDelete={handleDeleteIngrediente}
                  onEdit={handleEditIngrediente}
                />
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
