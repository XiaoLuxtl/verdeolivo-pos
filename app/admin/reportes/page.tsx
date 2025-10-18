// Ruta: app/admin/reportes/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Package,
  Calendar,
  Download,
  AlertTriangle,
  BarChart3,
} from "lucide-react";

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
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-base-content">Reportes</h1>
        <button className="btn btn-outline">
          <Download className="w-5 h-5 mr-2" />
          Exportar PDF
        </button>
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
              <button
                key={p}
                onClick={() => setPeriodoVentas(p)}
                className={`btn btn-sm ${
                  periodoVentas === p ? "btn-primary" : "btn-ghost"
                }`}
              >
                {getPeriodoLabel(p)}
              </button>
            ))}
          </div>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card bg-gradient-to-br from-primary to-primary-focus text-primary-content shadow-lg">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm opacity-90">Total Ventas</h3>
                  <p className="text-4xl font-bold">
                    {reporteVentas?.resumen.totalVentas || 0}
                  </p>
                </div>
                <ShoppingCart className="w-12 h-12 opacity-50" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-success to-success-focus text-success-content shadow-lg">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm opacity-90">Ingresos Totales</h3>
                  <p className="text-4xl font-bold">
                    ${reporteVentas?.resumen.totalIngresos.toFixed(2) || "0.00"}
                  </p>
                </div>
                <DollarSign className="w-12 h-12 opacity-50" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-secondary to-secondary-focus text-secondary-content shadow-lg">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm opacity-90">Promedio por Venta</h3>
                  <p className="text-4xl font-bold">
                    ${reporteVentas?.resumen.promedioVenta.toFixed(2) || "0.00"}
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 opacity-50" />
              </div>
            </div>
          </div>
        </div>

        {/* Top recetas */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Recetas Más Vendidas
            </h3>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Receta</th>
                    <th>Cantidad</th>
                    <th>Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {reporteVentas?.topRecetas.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-8 text-base-content/50"
                      >
                        No hay datos de ventas en este periodo
                      </td>
                    </tr>
                  ) : (
                    reporteVentas?.topRecetas.map((receta, index) => (
                      <tr key={index}>
                        <td className="font-bold">{index + 1}</td>
                        <td className="font-semibold">{receta.nombre}</td>
                        <td>
                          <span className="badge badge-primary">
                            {receta.cantidad}
                          </span>
                        </td>
                        <td className="font-bold text-success">
                          ${receta.ingresos.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
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
              <button
                key={p}
                onClick={() => setPeriodoInventario(p)}
                className={`btn btn-sm ${
                  periodoInventario === p ? "btn-secondary" : "btn-ghost"
                }`}
              >
                {getPeriodoLabel(p)}
              </button>
            ))}
          </div>
        </div>

        {/* Estadísticas de inventario */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="text-sm text-base-content/60">
                Productos Totales
              </h3>
              <p className="text-3xl font-bold text-primary">
                {reporteInventario?.resumen.totalProductos || 0}
              </p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="text-sm text-base-content/60">Sin Stock</h3>
              <p className="text-3xl font-bold text-error">
                {reporteInventario?.resumen.sinStock || 0}
              </p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="text-sm text-base-content/60">Stock Bajo</h3>
              <p className="text-3xl font-bold text-warning">
                {reporteInventario?.resumen.stockBajo || 0}
              </p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="text-sm text-base-content/60">Movimientos</h3>
              <p className="text-3xl font-bold text-info">
                {reporteInventario?.resumen.totalMovimientos || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Movimientos por categoría */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title">Movimientos por Categoría</h3>
              <div className="space-y-3">
                {reporteInventario?.movimientosPorCategoria.map((cat) => (
                  <div key={cat.categoria}>
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold capitalize">
                        {cat.categoria}
                      </span>
                      <span className="badge badge-primary">
                        {cat.cantidad}
                      </span>
                    </div>
                    <progress
                      className="progress progress-primary"
                      value={cat.cantidad}
                      max={reporteInventario.resumen.totalMovimientos}
                    ></progress>
                    <p className="text-xs text-base-content/50 mt-1">
                      {cat.productos} producto(s) afectado(s)
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Alertas */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Alertas de Inventario
              </h3>

              {reporteInventario?.alertas.sinStock.length === 0 &&
              reporteInventario?.alertas.stockBajo.length === 0 ? (
                <div className="text-center py-8 text-base-content/50">
                  <p className="text-success font-semibold">✓ Todo en orden</p>
                  <p className="text-sm">No hay alertas de inventario</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {reporteInventario?.alertas.sinStock.map((prod) => (
                    <div key={prod.id} className="alert alert-error">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">
                        <strong>{prod.nombre}</strong> sin stock
                      </span>
                    </div>
                  ))}
                  {reporteInventario?.alertas.stockBajo.map((prod) => (
                    <div key={prod.id} className="alert alert-warning">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">
                        <strong>{prod.nombre}</strong>: {prod.stock}{" "}
                        {prod.unidad}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Productos más movidos */}
        <div className="card bg-base-100 shadow-lg mt-6">
          <div className="card-body">
            <h3 className="card-title">Productos con Más Movimientos</h3>
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Movimientos</th>
                    <th>Entradas</th>
                    <th>Salidas</th>
                  </tr>
                </thead>
                <tbody>
                  {reporteInventario?.productosMasMovidos.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-8 text-base-content/50"
                      >
                        No hay movimientos en este periodo
                      </td>
                    </tr>
                  ) : (
                    reporteInventario?.productosMasMovidos.map(
                      (prod, index) => (
                        <tr key={index}>
                          <td className="font-semibold">{prod.nombre}</td>
                          <td>
                            <span className="badge badge-primary">
                              {prod.movimientos}
                            </span>
                          </td>
                          <td className="text-success">
                            +{prod.entradas.toFixed(2)}
                          </td>
                          <td className="text-error">
                            -{prod.salidas.toFixed(2)}
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
