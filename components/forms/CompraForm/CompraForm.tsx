"use client";

import { Plus } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Loading } from "@/components/ui/loading";
import { ProductoSearchSelect } from "./ProductoSearchSelect";
import { DetalleCompraCard } from "./DetalleCompraCard";
import { useCompraForm } from "./useCompraForm";
import { CompraFormProps } from "./types";

export function CompraForm({ open = true, onClose, onSave }: CompraFormProps) {
  const {
    productos,
    productoSeleccionado,
    setProductoSeleccionado,
    formData,
    handleFormDataChange,
    detalles,
    agregarDetalle,
    eliminarDetalle,
    actualizarDetalle,
    loading,
    error,
    isLoadingProductos,
    calcularTotal,
    handleSubmit,
    getProductoInfo,
    calcularCantidadTotal,
    resetForm,
  } = useCompraForm(onSave, onClose);

  // Resetear formulario cuando se cierra
  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
              <ProductoSearchSelect
                productos={productos}
                value={productoSeleccionado}
                onValueChange={(productoId) => {
                  setProductoSeleccionado(productoId);
                  // Pre-llenar proveedor si está disponible
                  if (productoId) {
                    const producto = productos.find(
                      (p) => p.id.toString() === productoId
                    );
                    if (producto?.proveedor && !formData.proveedor) {
                      handleFormDataChange("proveedor", producto.proveedor);
                    }
                  }
                }}
                placeholder={
                  isLoadingProductos
                    ? "Cargando productos..."
                    : "Buscar producto..."
                }
                disabled={isLoadingProductos}
              />
              <p className="text-xs text-muted-foreground">
                Escribe para buscar por nombre, SKU o proveedor
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
                  <div className="text-sm text-muted-foreground">
                    Un producto por compra
                  </div>
                </div>

                <div className="space-y-3">
                  {detalles.map((detalle, index) => (
                    <DetalleCompraCard
                      key={detalle.id}
                      detalle={detalle}
                      index={index}
                      productos={productos}
                      onActualizarDetalle={actualizarDetalle}
                      onEliminarDetalle={eliminarDetalle}
                      getProductoInfo={getProductoInfo}
                      calcularCantidadTotal={calcularCantidadTotal}
                    />
                  ))}

                  {detalles.length === 0 && productoSeleccionado && (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                      <p>Configura los detalles del producto seleccionado</p>
                      <Button
                        type="button"
                        onClick={agregarDetalle}
                        variant="outline"
                        className="mt-2"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Detalle
                      </Button>
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
                onClick={handleClose}
                variant="outline"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  loading || !productoSeleccionado || detalles.length === 0
                }
              >
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
