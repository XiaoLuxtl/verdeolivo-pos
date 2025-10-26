// Ruta: app/admin/reportes/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Loading } from "@/components/ui/loading";
import { ReporteDetallado } from "@/components/reportes/ReporteDetallado";

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
  const [fechaInicioVentas, setFechaInicioVentas] = useState<string>();
  const [fechaFinVentas, setFechaFinVentas] = useState<string>();
  const [fechaInicioInventario, setFechaInicioInventario] = useState<string>();
  const [fechaFinInventario, setFechaFinInventario] = useState<string>();
  const [reporteVentas, setReporteVentas] = useState<ReporteVentas | null>(
    null
  );
  const [reporteInventario, setReporteInventario] =
    useState<ReporteInventario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportes();
  }, [
    periodoVentas,
    periodoInventario,
    fechaInicioVentas,
    fechaFinVentas,
    fechaInicioInventario,
    fechaFinInventario,
  ]);

  const handlePeriodoVentasChange = (
    periodo: string,
    fechaInicio?: string,
    fechaFin?: string
  ) => {
    setPeriodoVentas(periodo);
    setFechaInicioVentas(fechaInicio);
    setFechaFinVentas(fechaFin);
  };

  const handlePeriodoInventarioChange = (
    periodo: string,
    fechaInicio?: string,
    fechaFin?: string
  ) => {
    setPeriodoInventario(periodo);
    setFechaInicioInventario(fechaInicio);
    setFechaFinInventario(fechaFin);
  };

  const fetchReportes = async () => {
    setLoading(true);
    try {
      const ventasParams = new URLSearchParams({ periodo: periodoVentas });
      if (fechaInicioVentas && fechaFinVentas) {
        ventasParams.append("fechaInicio", fechaInicioVentas);
        ventasParams.append("fechaFin", fechaFinVentas);
      }

      const inventarioParams = new URLSearchParams({
        periodo: periodoInventario,
      });
      if (fechaInicioInventario && fechaFinInventario) {
        inventarioParams.append("fechaInicio", fechaInicioInventario);
        inventarioParams.append("fechaFin", fechaFinInventario);
      }

      const [ventasRes, inventarioRes] = await Promise.all([
        fetch(`/api/reportes/ventas?${ventasParams.toString()}`),
        fetch(`/api/reportes/inventario?${inventarioParams.toString()}`),
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-900 min-h-screen p-6 print:bg-white print:text-black print:p-0">
      <ReporteDetallado
        periodoVentas={periodoVentas}
        periodoInventario={periodoInventario}
        reporteVentas={reporteVentas}
        reporteInventario={reporteInventario}
        onPeriodoVentasChange={handlePeriodoVentasChange}
        onPeriodoInventarioChange={handlePeriodoInventarioChange}
      />
    </div>
  );
}
