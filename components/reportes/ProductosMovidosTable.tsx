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
import { ReporteInventario } from "@/types";

interface ProductosMovidosTableProps {
  reporteInventario: ReporteInventario | null;
}

export function ProductosMovidosTable({
  reporteInventario,
}: ProductosMovidosTableProps) {
  return (
    <Card className="bg-card shadow-lg mt-6">
      <CardHeader>
        <CardTitle>Productos con Más Movimientos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Movimientos</TableHead>
                <TableHead>Entradas</TableHead>
                <TableHead>Salidas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reporteInventario?.productosMasMovidos.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No hay movimientos en este periodo
                  </TableCell>
                </TableRow>
              ) : (
                reporteInventario?.productosMasMovidos.map((prod, index) => (
                  <TableRow key={`producto-${prod.nombre}-${index}`}>
                    <TableCell className="font-semibold">
                      {prod.nombre}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">{prod.movimientos}</Badge>
                    </TableCell>
                    <TableCell className="text-green-600">
                      +{prod.entradas.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-red-600">
                      -{prod.salidas.toFixed(2)}
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
