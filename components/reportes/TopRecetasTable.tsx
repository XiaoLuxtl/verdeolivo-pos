import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReporteVentas } from "@/types";

interface TopRecetasTableProps {
  reporteVentas: ReporteVentas | null;
}

export function TopRecetasTable({ reporteVentas }: TopRecetasTableProps) {
  return (
    <Card className="bg-card shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Recetas Más Vendidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Receta</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Ingresos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reporteVentas?.topRecetas.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No hay datos de ventas en este periodo
                  </TableCell>
                </TableRow>
              ) : (
                reporteVentas?.topRecetas.map((receta, index) => (
                  <TableRow key={`receta-${receta.nombre}-${index}`}>
                    <TableCell className="font-bold">{index + 1}</TableCell>
                    <TableCell className="font-semibold">
                      {receta.nombre}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">{receta.cantidad}</Badge>
                    </TableCell>
                    <TableCell className="font-bold text-green-600">
                      ${receta.ingresos.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
