// components/CompraForm.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loading } from "@/components/ui/loading";

// Función para generar IDs únicos
const generateId = (): string =>
  `detalle-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

interface Producto {
  readonly id: number;
  readonly nombre: string;
  readonly sku: string;
  readonly precioUnitario: number;
  readonly unidad: string;
  readonly peso: number | null;
  readonly proveedor: string | null;
  readonly descripcion?: string | null;
}

interface DetalleCompra {
  readonly id: string;
  readonly productoId: string;
  readonly cantidad: string;
  readonly costoUnitario: string;
  subtotal: number;
}

interface CompraFormData {
  fecha: string;
  proveedor: string;
  notas: string;
}

interface Props {
  readonly open?: boolean;
  readonly onClose: () => void;
  readonly onSave: () => void;
}

export default function CompraForm({ open = true, onClose, onSave }: Props) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<string>("");
  const [formData, setFormData] = useState<CompraFormData>({
    fecha: new Date().toISOString().split("T")[0],
    proveedor: "",
    notas: "",
  });
  const [detalles, setDetalles] = useState<DetalleCompra[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [isLoadingProductos, setIsLoadingProductos] = useState(true);

  // Resetear formulario cuando se cierra
  const resetForm = useCallback(() => {
    setProductoSeleccionado("");
    setFormData({
      fecha: new Date().toISOString().split("T")[0],
      proveedor: "",
      notas: "",
    });
    setDetalles([]);
    setError("");
  }, []);

  // Resetear cuando se cierra el modal
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  const handleFormDataChange = useCallback(
    (field: keyof CompraFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (error) setError(""); // Limpiar error cuando el usuario empieza a editar
    },
    [error]
  );

  // Cargar productos al montar el componente
  useEffect(() => {
    const loadProductos = async () => {
      try {
        setIsLoadingProductos(true);
        const response = await fetch("/api/productos");
        if (!response.ok) {
          throw new Error("Error al cargar productos");
        }
        const data: Producto[] = await response.json();
        setProductos(data);
      } catch (error) {
        console.error("Error al cargar productos:", error);
        setError("Error al cargar la lista de productos");
      } finally {
        setIsLoadingProductos(false);
      }
    };

    loadProductos();
  }, []);

  // Pre-llenar campos cuando se selecciona un producto
  useEffect(() => {
    if (productoSeleccionado && productos.length > 0) {
      const producto = productos.find(
        (p) => p.id.toString() === productoSeleccionado
      );

      if (producto) {
        setFormData((prev) => ({
          ...prev,
          proveedor: producto.proveedor || prev.proveedor,
          notas: prev.notas || `${producto.nombre} - ${producto.sku}`,
        }));

        // Crear detalle de compra automáticamente
        const nuevoDetalle: DetalleCompra = {
          id: generateId(),
          productoId: productoSeleccionado,
          cantidad: "1",
          costoUnitario: producto.precioUnitario.toString(),
          subtotal: producto.precioUnitario,
        };

        setDetalles([nuevoDetalle]);
        setError(""); // Limpiar errores previos
      }
    } else {
      setDetalles([]);
    }
  }, [productoSeleccionado, productos]);

  const agregarDetalle = useCallback(() => {
    const nuevoDetalle: DetalleCompra = {
      id: generateId(),
      productoId: "",
      cantidad: "",
      costoUnitario: "",
      subtotal: 0,
    };
    setDetalles((prev) => [...prev, nuevoDetalle]);
  }, []);

  const eliminarDetalle = useCallback((index: number) => {
    setDetalles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const actualizarDetalle = useCallback(
    (index: number, field: keyof DetalleCompra, value: string) => {
      setDetalles((prev) => {
        const nuevosDetalles = [...prev];
        nuevosDetalles[index] = {
          ...nuevosDetalles[index],
          [field]: value,
        };

        // Calcular subtotal cuando cambian cantidad o costo
        if (field === "cantidad" || field === "costoUnitario") {
          const cantidad =
            Number.parseFloat(nuevosDetalles[index].cantidad) || 0;
          const costo =
            Number.parseFloat(nuevosDetalles[index].costoUnitario) || 0;
          nuevosDetalles[index].subtotal = cantidad * costo;
        }

        return nuevosDetalles;
      });

      // Si se cambió el producto, actualizar proveedor (solo si está vacío)
      if (field === "productoId" && value && !formData.proveedor) {
        const producto = productos.find((p) => p.id.toString() === value);
        if (producto?.proveedor) {
          setFormData((prev) => ({
            ...prev,
            proveedor: producto.proveedor!,
          }));
        }
      }
    },
    [productos, formData.proveedor]
  );

  const calcularTotal = useMemo(() => {
    return detalles.reduce((sum, detalle) => sum + detalle.subtotal, 0);
  }, [detalles]);

  const validarFormulario = (): string | null => {
    if (!productoSeleccionado) {
      return "Selecciona un producto primero";
    }

    if (detalles.length === 0) {
      return "No se pudo crear el detalle del producto";
    }

    if (!formData.proveedor.trim()) {
      return "El proveedor es obligatorio";
    }

    if (!formData.fecha) {
      return "La fecha es obligatoria";
    }

    const detalleInvalido = detalles.find(
      (d) =>
        !d.productoId ||
        !d.cantidad ||
        !d.costoUnitario ||
        Number.parseFloat(d.cantidad) <= 0 ||
        Number.parseFloat(d.costoUnitario) <= 0
    );

    if (detalleInvalido) {
      return "Completa todos los campos correctamente (cantidad y costo deben ser mayores a 0)";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errorValidacion = validarFormulario();
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        total: calcularTotal,
        detalles: detalles.map((d) => ({
          ...d,
          cantidad: Number.parseFloat(d.cantidad),
          costoUnitario: Number.parseFloat(d.costoUnitario),
        })),
      };

      const response = await fetch("/api/compras", {
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

      // Mostrar mensaje de éxito antes de cerrar
      setError(""); // Limpiar cualquier error previo
      onSave();
      resetForm(); // Resetear formulario después de guardar exitosamente
      onClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido al guardar";
      setError(errorMessage);
      console.error("Error al guardar compra:", err);
    } finally {
      setLoading(false);
    }
  };

  const getProductoInfo = useCallback(
    (productoId: string) => {
      const producto = productos.find(
        (p) => p.id === Number.parseInt(productoId)
      );
      return {
        peso: producto?.peso || 0,
        unidad: producto?.unidad || "",
        nombre: producto?.nombre || "",
      };
    },
    [productos]
  );

  const calcularCantidadTotal = useCallback(
    (detalle: DetalleCompra) => {
      const cantidad = Number.parseFloat(detalle.cantidad) || 0;
      const { peso } = getProductoInfo(detalle.productoId);
      return cantidad * peso;
    },
    [getProductoInfo]
  );

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Registrar Compra de Producto</DialogTitle>
          <DialogDescription>
            Selecciona el producto y completa la información de la compra.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="error">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Selección de producto */}
            <div className="space-y-2">
              <Label htmlFor="producto-principal">Producto a Comprar *</Label>
              <Select
                value={productoSeleccionado}
                onValueChange={setProductoSeleccionado}
                disabled={isLoadingProductos}
              >
                <SelectTrigger id="producto-principal">
                  <SelectValue
                    placeholder={
                      isLoadingProductos
                        ? "Cargando productos..."
                        : "Seleccionar producto"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {productos.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.nombre} - {p.sku} ({p.peso ?? 0}
                      {p.unidad}/unidad)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Selecciona el producto primero para pre-llenar los campos
                automáticamente
              </p>
            </div>

            {/* Datos generales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha *</Label>
                <Input
                  id="fecha"
                  type="date"
                  required
                  value={formData.fecha}
                  onChange={(e) =>
                    handleFormDataChange("fecha", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proveedor">
                  Proveedor *
                  {productoSeleccionado && !formData.proveedor && (
                    <span className="text-xs text-muted-foreground ml-2">
                      (se pre-llenará automáticamente)
                    </span>
                  )}
                </Label>
                <Input
                  id="proveedor"
                  type="text"
                  required
                  value={formData.proveedor}
                  onChange={(e) =>
                    handleFormDataChange("proveedor", e.target.value)
                  }
                  placeholder="Nombre del proveedor"
                  className={
                    !formData.proveedor && productoSeleccionado
                      ? "border-orange-300"
                      : ""
                  }
                />
              </div>
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <Label htmlFor="notas">Notas</Label>
              <Textarea
                id="notas"
                value={formData.notas}
                onChange={(e) => handleFormDataChange("notas", e.target.value)}
                placeholder="Notas adicionales..."
                rows={3}
              />
            </div>

            {/* Detalles de compra */}
            {productoSeleccionado && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Detalle de Compra</h3>
                  <Button
                    type="button"
                    onClick={agregarDetalle}
                    variant="outline"
                    size="sm"
                    disabled
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Solo un producto por compra
                  </Button>
                </div>

                <div className="space-y-3">
                  {detalles.map((detalle, index) => (
                    <Card key={detalle.id} className="p-4">
                      <CardContent className="p-0">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                          {/* Producto */}
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor={`producto-${index}`}>
                              Producto
                            </Label>
                            <Select
                              value={detalle.productoId}
                              onValueChange={(value) =>
                                actualizarDetalle(index, "productoId", value)
                              }
                            >
                              <SelectTrigger id={`producto-${index}`}>
                                <SelectValue placeholder="Seleccionar producto" />
                              </SelectTrigger>
                              <SelectContent>
                                {productos.map((p) => (
                                  <SelectItem
                                    key={p.id}
                                    value={p.id.toString()}
                                  >
                                    {p.nombre} - {p.sku} ({p.peso}
                                    {p.unidad}/unidad)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Cantidad */}
                          <div className="space-y-2">
                            <Label htmlFor={`cantidad-${index}`}>
                              Cantidad (unidades)
                            </Label>
                            <Input
                              id={`cantidad-${index}`}
                              type="number"
                              step="0.01"
                              min="0"
                              required
                              value={detalle.cantidad}
                              onChange={(e) =>
                                actualizarDetalle(
                                  index,
                                  "cantidad",
                                  e.target.value
                                )
                              }
                              className={
                                detalle.cantidad &&
                                Number.parseFloat(detalle.cantidad) <= 0
                                  ? "border-red-300"
                                  : ""
                              }
                              aria-label={`Cantidad del producto ${index + 1}`}
                            />
                            {detalle.productoId && detalle.cantidad && (
                              <p className="text-xs text-muted-foreground">
                                = {calcularCantidadTotal(detalle).toFixed(2)}
                                {
                                  getProductoInfo(detalle.productoId).unidad
                                }{" "}
                                total
                              </p>
                            )}
                          </div>

                          {/* Costo Unitario */}
                          <div className="space-y-2">
                            <Label htmlFor={`costo-${index}`}>
                              Costo Unit.
                            </Label>
                            <Input
                              id={`costo-${index}`}
                              type="number"
                              step="0.01"
                              min="0"
                              required
                              value={detalle.costoUnitario}
                              onChange={(e) =>
                                actualizarDetalle(
                                  index,
                                  "costoUnitario",
                                  e.target.value
                                )
                              }
                              className={
                                detalle.costoUnitario &&
                                Number.parseFloat(detalle.costoUnitario) <= 0
                                  ? "border-red-300"
                                  : ""
                              }
                              aria-label={`Costo unitario del producto ${
                                index + 1
                              }`}
                            />
                          </div>

                          {/* Subtotal y eliminar */}
                          <div className="flex items-end gap-2">
                            <div className="space-y-2 flex-1">
                              <Label>Subtotal</Label>
                              <Input
                                readOnly
                                value={`$${detalle.subtotal.toFixed(2)}`}
                                className="bg-muted"
                              />
                            </div>
                            <Button
                              type="button"
                              onClick={() => eliminarDetalle(index)}
                              variant="destructive"
                              size="icon"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {detalles.length === 0 && productoSeleccionado && (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                      Error: No se pudo cargar el detalle del producto
                      seleccionado
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-end items-center gap-4">
                <span className="text-xl font-semibold">Total:</span>
                <span className="text-3xl font-bold text-primary">
                  ${calcularTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Botones */}
            <DialogFooter className="flex-shrink-0">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || !productoSeleccionado}>
                {loading ? (
                  <>
                    <Loading size="sm" className="mr-2" />
                    Guardando...
                  </>
                ) : (
                  "Registrar Compra"
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
