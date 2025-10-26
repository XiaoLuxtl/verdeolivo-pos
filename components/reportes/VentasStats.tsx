import { ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type ReporteVentas = {
  resumen: {
    totalVentas: number;
    totalIngresos: number;
    promedioVenta: number;
  };
};

interface VentasStatsProps {
  reporteVentas: ReporteVentas | null;
}

export function VentasStats({ reporteVentas }: VentasStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-primary-foreground/80">
                Total Ventas
              </h3>
              <p className="text-4xl font-bold">
                {reporteVentas?.resumen.totalVentas || 0}
              </p>
            </div>
            <ShoppingCart className="w-12 h-12 text-primary-foreground/50" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500 to-green-500/80 text-white shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-white/80">Ingresos Totales</h3>
              <p className="text-4xl font-bold">
                ${reporteVentas?.resumen.totalIngresos.toFixed(2) || "0.00"}
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-white/50" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-info to-blue-500/80 text-white shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-white/80">Promedio por Venta</h3>
              <p className="text-4xl font-bold">
                ${reporteVentas?.resumen.promedioVenta.toFixed(2) || "0.00"}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-white/50" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
