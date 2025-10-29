// components/ComprasTable.tsx
import React from "react";
import { Eye, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Compra } from "@/app/admin/compras/page";

type ComprasTableProps = {
  compras: Compra[];
  onViewDetails: (compra: Compra) => void;
  onDelete: (compraId: number) => void;
};

export function ComprasTable({
  compras,
  onViewDetails,
  onDelete,
}: ComprasTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Proveedor</TableHead>
          {/* 💡 Columna reintroducida para el nombre del producto principal */}
          <TableHead>Productos</TableHead>
          <TableHead className="text-right">Total Ítems</TableHead>
          <TableHead className="text-right">Total ($)</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {compras.length === 0 ? (
          <TableRow>
            {/* 💡 Colspan ajustado a 7 */}
            <TableCell
              colSpan={7}
              className="text-center py-12 text-muted-foreground"
            >
              No hay compras registradas que coincidan con los filtros.
            </TableCell>
          </TableRow>
        ) : (
          compras.map((compra) => {
            // CÁLCULO: Suma la cantidad de piezas/unidades
            const totalItems = compra.detalles.reduce(
              (sum, detalle) => sum + detalle.cantidad,
              0
            );

            // 💡 Obtiene el nombre del primer producto (ítem 0)
            const primerProductoNombre =
              compra.detalles[0]?.producto.nombre || "N/A";

            return (
              <TableRow key={compra.id} className="group hover:bg-muted/50">
                <TableCell className="font-mono font-medium">
                  #{compra.id}
                </TableCell>
                <TableCell>
                  {new Date(compra.fecha).toLocaleDateString("es-MX", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </TableCell>
                <TableCell className="font-medium">
                  {compra.proveedor}
                </TableCell>

                {/* 💡 CELDA: PRODUCTOS (Muestra el ítem 0 y el resumen) */}
                <TableCell>
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary whitespace-nowrap"
                  >
                    {primerProductoNombre}{" "}
                    {compra.detalles.length > 1 &&
                      `y ${compra.detalles.length - 1} más`}
                  </Badge>
                </TableCell>

                {/* CELDA: TOTAL DE ÍTEMS (Cantidad de piezas/botes/cajas) */}
                <TableCell className="text-right font-medium">
                  <Badge variant="outline">{totalItems} uds.</Badge>
                </TableCell>

                {/* CELDA: TOTAL MONETARIO */}
                <TableCell className="text-right font-semibold text-green-600 dark:text-green-400">
                  ${compra.total.toFixed(2)}
                </TableCell>

                {/* ACCIONES */}
                <TableCell className="text-right flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(compra)}
                  >
                    <Eye className="w-4 h-4" />
                    <span className="sr-only">Ver detalles</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(compra.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50/50"
                  >
                    <Trash className="w-4 h-4" />
                    <span className="sr-only">Eliminar</span>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
