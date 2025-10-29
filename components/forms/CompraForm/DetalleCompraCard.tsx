"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ProductoSearchSelect } from "./ProductoSearchSelect";
import { Producto, DetalleCompra } from "./types";

interface DetalleCompraCardProps {
  detalle: DetalleCompra;
  index: number;
  productos: Producto[];
  onActualizarDetalle: (
    index: number,
    field: keyof DetalleCompra,
    value: string
  ) => void;
  onEliminarDetalle: (index: number) => void;
  getProductoInfo: (productoId: string) => {
    peso: number;
    unidad: string;
    nombre: string;
  };
  calcularCantidadTotal: (detalle: DetalleCompra) => number;
}

export function DetalleCompraCard({
  detalle,
  index,
  productos,
  onActualizarDetalle,
  onEliminarDetalle,
  getProductoInfo,
  calcularCantidadTotal,
}: DetalleCompraCardProps) {
  return (
    <Card key={detalle.id} className="p-4">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Producto */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor={`producto-${index}`}>Producto</Label>
            <ProductoSearchSelect
              productos={productos}
              value={detalle.productoId}
              onValueChange={(value) =>
                onActualizarDetalle(index, "productoId", value)
              }
              placeholder="Buscar producto..."
            />
          </div>

          {/* Cantidad */}
          <div className="space-y-2">
            <Label htmlFor={`cantidad-${index}`}>Cantidad (unidades)</Label>
            <Input
              id={`cantidad-${index}`}
              type="number"
              step="1"
              min="0"
              required
              value={detalle.cantidad}
              onChange={(e) =>
                onActualizarDetalle(index, "cantidad", e.target.value)
              }
              className={
                detalle.cantidad && Number.parseFloat(detalle.cantidad) <= 0
                  ? "border-red-300"
                  : ""
              }
              aria-label={`Cantidad del producto ${index + 1}`}
            />
            {detalle.productoId && detalle.cantidad && (
              <p className="text-xs text-muted-foreground">
                = {calcularCantidadTotal(detalle).toFixed(2)}
                {getProductoInfo(detalle.productoId).unidad} total
              </p>
            )}
          </div>

          {/* Costo Unitario */}
          <div className="space-y-2">
            <Label htmlFor={`costo-${index}`}>Costo Unit.</Label>
            <Input
              id={`costo-${index}`}
              type="number"
              step="0.05"
              min="0"
              required
              value={detalle.costoUnitario}
              onChange={(e) =>
                onActualizarDetalle(index, "costoUnitario", e.target.value)
              }
              className={
                detalle.costoUnitario &&
                Number.parseFloat(detalle.costoUnitario) <= 0
                  ? "border-red-300"
                  : ""
              }
              aria-label={`Costo unitario del producto ${index + 1}`}
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
              onClick={() => onEliminarDetalle(index)}
              variant="destructive"
              size="icon"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
