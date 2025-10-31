// ProductoForm.tsx

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
import { Loading } from "./ui/loading";
import { Producto, ProductoFormData } from "@/types";

type Props = {
  readonly producto?: {
    id: number;
    sku: string;
    nombre: string;
    sabor: string | null;
    categoria: string;
    proveedor: string | null;
    precioUnitario: number;
    peso: number | null;
    precioPorUnidad: number | null;
    unidad: string;
    descripcion: string | null;
    stockMinimo: number;
    descripcionUmbral: string | null;
  } | null;
  readonly onClose: () => void;
  readonly onSave: () => void;
};

// 💡 Unidades actualizadas con KG y L
const unidadesDisponibles = [
  { value: "GR", label: "Gramos (gr)" },
  { value: "ML", label: "Mililitros (ml)" },
  { value: "PZ", label: "Piezas (pz)" },
  { value: "KG", label: "Kilogramos (kg)" },
  { value: "L", label: "Litros (L)" },
] as const;

// 💡 Categorías actualizadas con INSUMO_PESO
const categoriasDisponibles = [
  { value: "ALOE", label: "Aloe" },
  { value: "TE", label: "Té" },
  { value: "MALTEADA", label: "Malteada" },
  { value: "PROTEINA", label: "Proteína" },
  { value: "EXTRA", label: "Extra (Pieza: Pastillas, Saborizantes)" },
  { value: "INSUMO_PESO", label: "Insumo por Peso (Fruta, Avena)" }, // ¡NUEVA!
] as const;

export default function ProductoForm({ producto, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<ProductoFormData>({
    sku: "",
    nombre: "",
    sabor: "",
    categoria: "EXTRA",
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

  // 💡 Nuevo estado para guardar el precio de referencia (Precio por Kilo/Litro)
  // Esto evita sobrescribir el campo precioUnitario de formData con el costo total
  const [referenciaPrecio, setReferenciaPrecio] = useState("");

  useEffect(() => {
    if (producto) {
      // Convertir el producto al formato de formulario (strings)
      const formDataConverted: ProductoFormData = {
        sku: producto.sku,
        nombre: producto.nombre,
        sabor: producto.sabor || "",
        categoria: producto.categoria,
        proveedor: producto.proveedor || "",
        precioUnitario: producto.precioUnitario?.toString() || "",
        peso: producto.peso?.toString() || "",
        precioPorUnidad: producto.precioPorUnidad?.toString() || "",
        unidad: producto.unidad,
        descripcion: producto.descripcion || "",
        stockMinimo: producto.stockMinimo?.toString() || "",
        descripcionUmbral: producto.descripcionUmbral || "",
      };

      // Al editar, si es INSUMO_PESO, hay que inicializar el campo referenciaPrecio
      if (producto.categoria === "INSUMO_PESO") {
        // En este caso, el producto YA TIENE un precioPorUnidad (costo por gramo/ml).
        // Debemos hacer el cálculo inverso para mostrar el costo por KG/L.
        const precioBase = parseFloat(
          producto.precioPorUnidad?.toString() || "0"
        );
        let factorConversion = 1;

        if (producto.unidad === "KG") factorConversion = 1000;
        else if (producto.unidad === "L") factorConversion = 1000;

        // El precio de referencia (por unidad grande)
        const precioRef = precioBase * factorConversion;
        setReferenciaPrecio(precioRef.toFixed(2));
      }
      setFormData(formDataConverted);
    }
  }, [producto]);

  // 💡 Lógica de Cálculo Unificada (Conversión y Costo Total)
  useEffect(() => {
    const costoRef = parseFloat(referenciaPrecio) || 0;
    const peso = parseFloat(formData.peso) || 0;
    const unidad = formData.unidad;
    const categoria = formData.categoria;

    if (categoria === "INSUMO_PESO") {
      // 1. Lógica para INSUMO_PESO (Necesita Conversión y Costo Total Estimado)
      if (costoRef > 0) {
        let factorConversion = 1;

        if (unidad === "KG") factorConversion = 1000;
        else if (unidad === "L") factorConversion = 1000;

        // Costo por Unidad Base (GR/ML)
        const precioPorUnidadBase = costoRef / factorConversion;

        // Precio Total de Compra Estimado (Esto va a precioUnitario)
        // Usamos el factor de conversión para calcular el costo total de la cantidad comprada (peso)
        // Ejemplo: Compré 0.6 KG a $100/KG -> Costo Total = 100 * 0.6 = $60
        const precioTotalEstimado = costoRef * peso;

        setFormData((prev) => ({
          ...prev,
          // precioPorUnidad guarda el costo por GR/ML (el que va al inventario)
          precioPorUnidad: precioPorUnidadBase.toFixed(4),
          // precioUnitario guarda el costo total de esta compra
          precioUnitario: precioTotalEstimado.toFixed(2),
        }));
      } else {
        // Si no hay precio de referencia, limpiamos
        setFormData((prev) => ({
          ...prev,
          precioPorUnidad: "",
          precioUnitario: "",
        }));
      }
    } else {
      // 2. Lógica para EXTRA/Otros (Cálculo Simple)
      const precioUnitario = parseFloat(formData.precioUnitario) || 0;

      if (precioUnitario > 0) {
        // Cálculo simple: Precio Total de Compra / Cantidad Comprada
        const precioPorUnidad =
          peso > 0 ? precioUnitario / peso : precioUnitario;
        setFormData((prev) => ({
          ...prev,
          // precioPorUnidad es el costo de la pieza/unidad
          precioPorUnidad: precioPorUnidad.toFixed(4),
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          precioPorUnidad: "",
        }));
      }
    }
    // Añadimos dependencia para el cambio de unidad, categoría, y el nuevo estado referenciaPrecio
  }, [
    formData.peso,
    formData.unidad,
    formData.categoria,
    referenciaPrecio,
    formData.precioUnitario,
  ]);

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
        // 💡 NOTA: Enviamos formData, que ya tiene el Costo Total en precioUnitario
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

  // Condicionales para las etiquetas
  const isInsumoPeso = formData.categoria === "INSUMO_PESO";

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {producto?.id ? "Editar Producto" : "Nuevo Producto"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto pr-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="error">
                <span>{error}</span>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* SKU & Nombre (Se mantienen igual) */}
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

              {/* Categoría (Actualizada) */}
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría *</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoria: value })
                  }
                >
                  <SelectTrigger id="categoria">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriasDisponibles.map((categoria) => (
                      <SelectItem key={categoria.value} value={categoria.value}>
                        {categoria.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

              {/* 💡 CAMPO DE REFERENCIA: Solo se muestra para INSUMO_PESO */}
              {isInsumoPeso && (
                <div className="space-y-2">
                  <Label htmlFor="referenciaPrecio">
                    Costo Referencia (por Kilo o Litro) *
                  </Label>
                  <Input
                    id="referenciaPrecio"
                    type="number"
                    step="0.01"
                    required
                    value={referenciaPrecio}
                    onChange={(e) => setReferenciaPrecio(e.target.value)}
                  />
                  <p className="text-xs text-blue-500">
                    Precio unitario del mercado (ej: $25.00/KG de plátano).
                  </p>
                </div>
              )}

              {/* 💡 PESO/CANTIDAD: Se usa diferente según la categoría */}
              <div className="space-y-2">
                <Label htmlFor="peso">
                  {isInsumoPeso ? "Peso Comprado (en KG o L)" : "Peso/Cantidad"}
                </Label>
                <Input
                  id="peso"
                  type="number"
                  step="0.01"
                  value={formData.peso}
                  onChange={(e) =>
                    setFormData({ ...formData, peso: e.target.value })
                  }
                />
                {isInsumoPeso && (
                  <p className="text-xs text-blue-500">
                    La cantidad real que compraste (ej: 0.6 si fueron 600g).
                  </p>
                )}
              </div>

              {/* 💡 PRECIO UNITARIO (Costo Total o Precio por Pieza) */}
              <div className="space-y-2">
                <Label htmlFor="precioUnitario">
                  {isInsumoPeso
                    ? "Precio Total de Compra Estimado (Editable) *"
                    : "Precio Total de Compra/Costo por Pieza *"}
                </Label>
                <Input
                  id="precioUnitario"
                  type="number"
                  step="0.01"
                  required
                  value={formData.precioUnitario}
                  // En INSUMO_PESO, el usuario puede ajustar el precio calculado
                  // En EXTRA, el usuario ingresa el costo total de la compra o de la pieza.
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      precioUnitario: e.target.value,
                    });
                  }}
                  className={isInsumoPeso ? "bg-yellow-50/50 font-bold" : ""}
                />
                {isInsumoPeso && (
                  <p className="text-xs text-orange-500">
                    El sistema calculó este costo total (Referencia * Peso).
                    Ajústalo al costo real de tu ticket ($24.00).
                  </p>
                )}
              </div>

              {/* 💡 UNIDAD DE ALMACENAMIENTO (Ahora incluye KG y L) */}
              <div className="space-y-2">
                <Label htmlFor="unidad">Unidad de Almacenamiento *</Label>
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
                {isInsumoPeso && (
                  <p className="text-xs text-orange-500">
                    Para **INSUMO_PESO** usa **KG** o **L**. Esto define la
                    referencia de costo.
                  </p>
                )}
              </div>

              {/* Precio por Unidad (calculado automáticamente) */}
              <div className="space-y-2">
                <Label htmlFor="precioPorUnidad">
                  Costo por Unidad Base (GR, ML o PZ)
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
                  Costo que se usará en las recetas. En INSUMO_PESO es por
                  Gramo/Mililitro.
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

            {/* Configuración de Stock (Se mantiene igual) */}
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
              {" "}
              {loading ? (
                // 💡 CORRECCIÓN DE ESTILO: Usar el componente <Loading /> de shadcn
                <>
                  <Loading size="sm" className="mr-2" />
                  Guardando...{" "}
                </>
              ) : (
                submitButtonText
              )}{" "}
            </Button>{" "}
          </div>{" "}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
