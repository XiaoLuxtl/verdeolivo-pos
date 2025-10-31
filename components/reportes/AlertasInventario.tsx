import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ReporteInventario } from "@/types";

interface AlertasInventarioProps {
  reporteInventario: ReporteInventario | null;
}

export function AlertasInventario({
  reporteInventario,
}: AlertasInventarioProps) {
  return (
    <Card className="bg-card shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          Alertas de Inventario
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reporteInventario?.alertas.sinStock.length === 0 &&
        reporteInventario?.alertas.stockBajo.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-green-600 font-semibold">✓ Todo en orden</p>
            <p className="text-sm">No hay alertas de inventario</p>
          </div>
        ) : (
          <div className="space-y-2">
            {reporteInventario?.alertas.sinStock.map((prod) => (
              <Alert key={prod.id}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{prod.nombre}</strong> sin stock
                </AlertDescription>
              </Alert>
            ))}
            {reporteInventario?.alertas.stockBajo.map((prod) => (
              <Alert key={prod.id}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{prod.nombre}</strong>: {prod.stock} {prod.unidad}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
