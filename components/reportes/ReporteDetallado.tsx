import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, BarChart3, ShoppingCart, Package } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VentasStats } from "./VentasStats";
import { TopRecetasTable } from "./TopRecetasTable";
import { InventarioStats } from "./InventarioStats";
import { MovimientosCategoria } from "./MovimientosCategoria";
import { AlertasInventario } from "./AlertasInventario";
import { ProductosMovidosTable } from "./ProductosMovidosTable";
import { ReporteVentas, ReporteInventario } from "@/types";

interface ReporteDetalladoProps {
  readonly periodoVentas: string;
  readonly periodoInventario: string;
  readonly reporteVentas: ReporteVentas | null;
  readonly reporteInventario: ReporteInventario | null;
  readonly onPeriodoVentasChange: (
    periodo: string,
    fechaInicio?: string,
    fechaFin?: string
  ) => void;
  readonly onPeriodoInventarioChange: (
    periodo: string,
    fechaInicio?: string,
    fechaFin?: string
  ) => void;
}

export function ReporteDetallado({
  periodoVentas,
  periodoInventario,
  reporteVentas,
  reporteInventario,
  onPeriodoVentasChange,
  onPeriodoInventarioChange,
}: ReporteDetalladoProps) {
  const [fechaInicio, setFechaInicio] = useState<string>("");
  const [fechaFin, setFechaFin] = useState<string>("");
  const [showDatePicker, setShowDatePicker] = useState<
    "ventas" | "inventario" | null
  >(null);

  const getPeriodoLabel = (periodo: string) => {
    switch (periodo) {
      case "dia":
        return "Hoy";
      case "semana":
        return "Esta Semana";
      case "mes":
        return "Este Mes";
      case "3meses":
        return "Últimos 3 Meses";
      case "personalizado":
        return "Personalizado";
      default:
        return periodo;
    }
  };

  const handlePeriodoChange = (
    tipo: "ventas" | "inventario",
    periodo: string
  ) => {
    if (tipo === "ventas") {
      onPeriodoVentasChange(periodo);
      setShowDatePicker(periodo === "personalizado" ? "ventas" : null);
    } else {
      onPeriodoInventarioChange(periodo);
      setShowDatePicker(periodo === "personalizado" ? "inventario" : null);
    }
  };

  const aplicarFechasPersonalizadas = () => {
    if (fechaInicio && fechaFin) {
      // Aplicar las fechas personalizadas al período correspondiente
      if (showDatePicker === "ventas") {
        onPeriodoVentasChange("personalizado", fechaInicio, fechaFin);
      } else if (showDatePicker === "inventario") {
        onPeriodoInventarioChange("personalizado", fechaInicio, fechaFin);
      }
      setShowDatePicker(null);
    }
  };

  const generarReporteDetallado = () => {
    const params = new URLSearchParams({ periodo: periodoVentas });
    if (fechaInicio && fechaFin && periodoVentas === "personalizado") {
      params.append("fechaInicio", fechaInicio);
      params.append("fechaFin", fechaFin);
    }
    const url = `/api/reportes/detallado?${params.toString()}`;
    window.open(url, "_blank");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-foreground">Reportes</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generarReporteDetallado}>
            <BarChart3 className="w-5 h-5 mr-2" />
            Reporte Detallado
          </Button>
          <Button variant="outline">
            <Download className="w-5 h-5 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Información sobre reportes detallados */}
      <Alert className="mb-6">
        <BarChart3 className="h-4 w-4" />
        <AlertDescription>
          <strong>Reportes Detallados:</strong> Incluyen análisis completo de
          ventas, insumos gastados, cálculos de ganancia teórica y desglose por
          hora. Haz clic en "Reporte Detallado" para generar un documento HTML
          completo.
        </AlertDescription>
      </Alert>

      {/* SECCIÓN: VENTAS */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" />
            Reporte de Ventas
          </h2>
          <div className="flex gap-2">
            {["dia", "semana", "mes", "3meses", "personalizado"].map((p) => (
              <Button
                key={p}
                onClick={() => handlePeriodoChange("ventas", p)}
                variant={periodoVentas === p ? "default" : "ghost"}
                size="sm"
              >
                {getPeriodoLabel(p)}
              </Button>
            ))}
          </div>
        </div>

        {showDatePicker === "ventas" && (
          <div className="mb-4 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-sm font-medium mb-2">
              Seleccionar período personalizado para ventas
            </h3>
            <div className="flex gap-4 items-center">
              <div>
                <label
                  htmlFor="fecha-inicio-ventas"
                  className="block text-xs text-gray-600 mb-1"
                >
                  Fecha inicio
                </label>
                <input
                  id="fecha-inicio-ventas"
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="px-3 py-2 border rounded text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="fecha-fin-ventas"
                  className="block text-xs text-gray-600 mb-1"
                >
                  Fecha fin
                </label>
                <input
                  id="fecha-fin-ventas"
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="px-3 py-2 border rounded text-sm"
                />
              </div>
              <Button onClick={aplicarFechasPersonalizadas} size="sm">
                Aplicar
              </Button>
            </div>
          </div>
        )}

        <VentasStats reporteVentas={reporteVentas} />
        <TopRecetasTable reporteVentas={reporteVentas} />
      </div>

      {/* SECCIÓN: INVENTARIO */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            Reporte de Inventario
          </h2>
          <div className="flex gap-2">
            {["dia", "semana", "mes", "3meses", "personalizado"].map((p) => (
              <Button
                key={p}
                onClick={() => handlePeriodoChange("inventario", p)}
                variant={periodoInventario === p ? "default" : "ghost"}
                size="sm"
              >
                {getPeriodoLabel(p)}
              </Button>
            ))}
          </div>
        </div>

        {showDatePicker === "inventario" && (
          <div className="mb-4 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-sm font-medium mb-2">
              Seleccionar período personalizado para inventario
            </h3>
            <div className="flex gap-4 items-center">
              <div>
                <label
                  htmlFor="fecha-inicio-inventario"
                  className="block text-xs text-gray-600 mb-1"
                >
                  Fecha inicio
                </label>
                <input
                  id="fecha-inicio-inventario"
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="px-3 py-2 border rounded text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="fecha-fin-inventario"
                  className="block text-xs text-gray-600 mb-1"
                >
                  Fecha fin
                </label>
                <input
                  id="fecha-fin-inventario"
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="px-3 py-2 border rounded text-sm"
                />
              </div>
              <Button onClick={aplicarFechasPersonalizadas} size="sm">
                Aplicar
              </Button>
            </div>
          </div>
        )}

        <InventarioStats reporteInventario={reporteInventario} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MovimientosCategoria reporteInventario={reporteInventario} />
          <AlertasInventario reporteInventario={reporteInventario} />
        </div>

        <ProductosMovidosTable reporteInventario={reporteInventario} />
      </div>
    </div>
  );
}
