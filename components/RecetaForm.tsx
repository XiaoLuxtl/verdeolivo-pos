"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import ImageUpload from "./ImageUpload";
import { Button, Input, Modal, ModalHeader, ModalBody } from "@/components/ui";

type Receta = {
  id?: number;
  nombre: string;
  descripcion: string;
  precioVenta: string;
  imagen: string | null;
};

type Props = {
  receta?: Receta;
  onClose: () => void;
  onSave: () => void;
};

export default function RecetaForm({ receta, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<Receta>({
    nombre: "",
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

  return (
    <Modal>
      <ModalHeader>
        <h2 className="text-2xl font-bold text-base-content">
          {receta?.id ? "Editar Receta" : "Nueva Receta"}
        </h2>
        <Button type="button" onClick={onClose} variant="ghost" size="sm">
          <X className="w-5 h-5" />
        </Button>
      </ModalHeader>

      <ModalBody>
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
          <div className="form-control">
            <label className="label">
              <span className="label-text">Nombre de la Receta *</span>
            </label>
            <Input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              placeholder="Ej. Malteada de Uva"
            />
          </div>

          {/* Precio de Venta */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Precio de Venta *</span>
            </label>
            <Input
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
          <div className="form-control">
            <label className="label">
              <span className="label-text">Descripción</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24"
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
              placeholder="Descripción opcional de la receta..."
            />
          </div>

          <div className="alert alert-info">
            <span className="text-sm">
              💡 Después de crear la receta podrás agregar los ingredientes
              necesarios
            </span>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="ghost"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : receta?.id ? (
                "Actualizar"
              ) : (
                "Crear Receta"
              )}
            </Button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
}
