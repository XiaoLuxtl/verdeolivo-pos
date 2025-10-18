"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Alert } from "@/components/ui/alert";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
  ModalClose,
} from "./ui/dialog";

type Producto = {
  id?: number;
  sku: string;
  nombre: string;
  sabor: string;
  proveedor: string;
  precioUnitario: string;
  peso: string;
  unidad: string;
  descripcion: string;
};

type Props = {
  producto?: Producto;
  onClose: () => void;
  onSave: () => void;
};

const unidadesDisponibles = ["gr", "ml", "pz", "kg", "lt"];

export default function ProductoForm({ producto, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<Producto>({
    sku: "",
    nombre: "",
    sabor: "",
    proveedor: "",
    precioUnitario: "",
    peso: "",
    unidad: "gr",
    descripcion: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (producto) {
      setFormData(producto);
    }
  }, [producto]);

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

  return (
    <Modal open={true} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="max-w-2xl">
        <ModalHeader>
          <ModalTitle>
            {producto?.id ? "Editar Producto" : "Nuevo Producto"}
          </ModalTitle>
          <ModalClose />
        </ModalHeader>

        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="error">
                <span>{error}</span>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* SKU */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">SKU *</span>
                </label>
                <Input
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                />
              </div>

              {/* Nombre */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Nombre *</span>
                </label>
                <Input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                />
              </div>

              {/* Sabor */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Sabor</span>
                </label>
                <Input
                  type="text"
                  value={formData.sabor}
                  onChange={(e) =>
                    setFormData({ ...formData, sabor: e.target.value })
                  }
                />
              </div>

              {/* Proveedor */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Proveedor</span>
                </label>
                <Input
                  type="text"
                  value={formData.proveedor}
                  onChange={(e) =>
                    setFormData({ ...formData, proveedor: e.target.value })
                  }
                />
              </div>

              {/* Precio Unitario */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Precio Unitario *</span>
                </label>
                <Input
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
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Peso/Cantidad</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.peso}
                  onChange={(e) =>
                    setFormData({ ...formData, peso: e.target.value })
                  }
                />
              </div>

              {/* Unidad */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Unidad *</span>
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
                    {unidadesDisponibles.map((unidad) => (
                      <SelectItem key={unidad} value={unidad}>
                        {unidad}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Descripción */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Descripción</span>
              </label>
              <Textarea
                className="h-24"
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
              />
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
              <Button type="submit" variant="default" disabled={loading}>
                {loading ? (
                  <span className="loading loading-spinner"></span>
                ) : producto?.id ? (
                  "Actualizar"
                ) : (
                  "Crear"
                )}
              </Button>
            </div>
          </form>
        </div>

        <ModalFooter>
          <div className="flex gap-3 w-full">
            <Button
              onClick={onClose}
              variant="ghost"
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
              ) : producto?.id ? (
                "Actualizar"
              ) : (
                "Crear"
              )}
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
