import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ReporteInventario = {
  resumen: {
    totalMovimientos: number;
  };
  movimientosPorCategoria: Array<{
    categoria: string;
    cantidad: number;
    productos: number;
  }>;
};

interface MovimientosCategoriaProps {
  reporteInventario: ReporteInventario | null;
}

export function MovimientosCategoria({
  reporteInventario,
}: MovimientosCategoriaProps) {
  return (
    <Card className="bg-card shadow-lg">
      <CardHeader>
        <CardTitle>Movimientos por Categoría</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {reporteInventario?.movimientosPorCategoria.map((cat) => (
            <div key={cat.categoria}>
              <div className="flex justify-between mb-1">
                <span className="font-semibold capitalize">
                  {cat.categoria}
                </span>
                <Badge variant="default">{cat.cantidad}</Badge>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{
                    width: `${(
                      (cat.cantidad /
                        reporteInventario.resumen.totalMovimientos) *
                      100
                    ).toFixed(0)}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {cat.productos} producto(s) afectado(s)
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
