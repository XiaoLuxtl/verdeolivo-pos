// Ruta: app/admin/reportes/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Package,
  Download,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loading } from "@/components/ui/loading";

type ReporteVentas = {
  periodo: string;
  resumen: {
    totalVentas: number;
    totalIngresos: number;
    promedioVenta: number;
  };
  topRecetas: Array<{
    nombre: string;
    cantidad: number;
    ingresos: number;
  }>;
  ventasPorDia: { [key: string]: number };
};

type ReporteInventario = {
  periodo: string;
  resumen: {
    totalProductos: number;
    sinStock: number;
    stockBajo: number;
    totalMovimientos: number;
  };
  movimientosPorCategoria: Array<{
    categoria: string;
    cantidad: number;
    productos: number;
  }>;
  productosMasMovidos: Array<{
    nombre: string;
    movimientos: number;
    entradas: number;
    salidas: number;
  }>;
  alertas: {
    sinStock: Array<{ id: number; nombre: string; sku: string }>;
    stockBajo: Array<{
      id: number;
      nombre: string;
      sku: string;
      stock: number;
      unidad: string;
    }>;
  };
};

export default function ReportesPage() {
  const [periodoVentas, setPeriodoVentas] = useState("dia");
  const [periodoInventario, setPeriodoInventario] = useState("mes");
  const [reporteVentas, setReporteVentas] = useState<ReporteVentas | null>(
    null
  );
  const [reporteInventario, setReporteInventario] =
    useState<ReporteInventario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportes();
  }, [periodoVentas, periodoInventario]);

  const fetchReportes = async () => {
    setLoading(true);
    try {
      const [ventasRes, inventarioRes] = await Promise.all([
        fetch(`/api/reportes/ventas?periodo=${periodoVentas}`),
        fetch(`/api/reportes/inventario?periodo=${periodoInventario}`),
      ]);

      const ventasData = await ventasRes.json();
      const inventarioData = await inventarioRes.json();

      setReporteVentas(ventasData);
      setReporteInventario(inventarioData);
    } catch (error) {
      console.error("Error al cargar reportes:", error);
    } finally {
      setLoading(false);
    }
  };

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
      default:
        return periodo;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-foreground">Reportes</h1>
        <Button variant="outline">
          <Download className="w-5 h-5 mr-2" />
          Exportar PDF
        </Button>
      </div>

      {/* SECCIÓN: VENTAS */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" />
            Reporte de Ventas
          </h2>
          <div className="flex gap-2">
            {["dia", "semana", "mes", "3meses"].map((p) => (
              <Button
                key={p}
                onClick={() => setPeriodoVentas(p)}
                variant={periodoVentas === p ? "default" : "ghost"}
                size="sm"
              >
                {getPeriodoLabel(p)}
              </Button>
            ))}
          </div>
        </div>

        {/* Estadísticas principales */}
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

          <Card className="bg-gradient-to-br from-blue-500 to-blue-500/80 text-white shadow-lg">
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

        {/* Top recetas */}
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
      </div>

      {/* SECCIÓN: INVENTARIO */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-secondary" />
            Reporte de Inventario
          </h2>
          <div className="flex gap-2">
            {["semana", "mes", "3meses"].map((p) => (
              <Button
                key={p}
                onClick={() => setPeriodoInventario(p)}
                variant={periodoInventario === p ? "default" : "ghost"}
                size="sm"
              >
                {getPeriodoLabel(p)}
              </Button>
            ))}
          </div>
        </div>

        {/* Estadísticas de inventario */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-card shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-sm text-muted-foreground">
                Productos Totales
              </h3>
              <p className="text-3xl font-bold text-primary">
                {reporteInventario?.resumen.totalProductos || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-sm text-muted-foreground">Sin Stock</h3>
              <p className="text-3xl font-bold text-red-600">
                {reporteInventario?.resumen.sinStock || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-sm text-muted-foreground">Stock Bajo</h3>
              <p className="text-3xl font-bold text-yellow-600">
                {reporteInventario?.resumen.stockBajo || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-sm text-muted-foreground">Movimientos</h3>
              <p className="text-3xl font-bold text-blue-600">
                {reporteInventario?.resumen.totalMovimientos || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Movimientos por categoría */}
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
                          width: `${
                            (cat.cantidad /
                              reporteInventario.resumen.totalMovimientos) *
                            100
                          }%`,
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

          {/* Alertas */}
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
                  <p className="text-green-600 font-semibold">
                    ✓ Todo en orden
                  </p>
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
                        <strong>{prod.nombre}</strong>: {prod.stock}{" "}
                        {prod.unidad}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Productos más movidos */}
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
                    reporteInventario?.productosMasMovidos.map(
                      (prod, index) => (
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
                      )
                    )
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
