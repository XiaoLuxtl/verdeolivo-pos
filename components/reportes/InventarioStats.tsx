import { Card, CardContent } from "@/components/ui/card";
import { ReporteInventario } from "@/types";

interface InventarioStatsProps {
  reporteInventario: ReporteInventario | null;
}

export function InventarioStats({ reporteInventario }: InventarioStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-card shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-sm text-muted-foreground">Productos Totales</h3>
          <p className="text-3xl font-bold text-primary">
            {reporteInventario?.resumen.totalProductos || 0}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-sm text-muted-foreground">Sin Stock</h3>
          <p className="text-3xl font-bold text-destructive">
            {reporteInventario?.resumen.sinStock || 0}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-sm text-muted-foreground">Stock Bajo</h3>
          <p className="text-3xl font-bold text-warning">
            {reporteInventario?.resumen.stockBajo || 0}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-sm text-muted-foreground">Movimientos</h3>
          <p className="text-3xl font-bold text-info">
            {reporteInventario?.resumen.totalMovimientos || 0}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
