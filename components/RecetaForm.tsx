"use client";

import { useState, useEffect } from "react";
import ImageUpload from "./ImageUpload";
import { CategoriaSelector } from "./CategoriaSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

type Receta = {
  id?: number;
  nombre: string;
  categoria: string;
  descripcion: string;
  precioVenta: string;
  imagen: string | null;
};

type Props = {
  readonly receta?: Receta;
  readonly onClose: () => void;
  readonly onSave: () => void;
};

export default function RecetaForm({ receta, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<Receta>({
    nombre: "",
    categoria: "OTRO",
    descripcion: "",
    precioVenta: "",
    imagen: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (receta) {
      setFormData(receta);
    }
  }, [receta]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = receta?.id ? `/api/recetas/${receta.id}` : "/api/recetas";

      const method = receta?.id ? "PUT" : "POST";

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

  const submitButtonText = receta?.id ? "Actualizar" : "Crear Receta";

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {receta ? "Editar Receta" : "Nueva Receta"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="alert alert-error">
                <span>{error}</span>
              </div>
            )}

            {/* Imagen */}
            <ImageUpload
              value={formData.imagen}
              onChange={(imagen) => setFormData({ ...formData, imagen })}
            />

            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre de la Receta *</Label>
              <Input
                id="nombre"
                type="text"
                required
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                placeholder="Ej. Malteada de Uva"
              />
            </div>

            {/* Categoría */}
            <CategoriaSelector
              value={
                formData.categoria as
                  | "MALTEADA"
                  | "ALOE"
                  | "SHAKE"
                  | "SUPLEMENTO"
                  | "OTRO"
              }
              onChange={(categoria) => setFormData({ ...formData, categoria })}
            />

            {/* Precio de Venta */}
            <div className="space-y-2">
              <Label htmlFor="precioVenta">Precio de Venta *</Label>
              <Input
                id="precioVenta"
                type="number"
                step="0.01"
                required
                value={formData.precioVenta}
                onChange={(e) =>
                  setFormData({ ...formData, precioVenta: e.target.value })
                }
                placeholder="0.00"
              />
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
                placeholder="Descripción opcional de la receta..."
                rows={3}
              />
            </div>

            <div className="alert alert-info">
              <span className="text-sm">
                💡 Después de crear la receta podrás agregar los ingredientes
                necesarios
              </span>
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
