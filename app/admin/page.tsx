"use client";

import { useState, useEffect } from "react";
import {
  Package,
  Warehouse,
  ChefHat,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface DashboardStats {
  productos: number;
  inventarioTotal: number;
  recetas: number;
  ventasHoy: number;
  clientesHoy: number;
  margenGanancia: number;
  crecimientoMensual: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    productos: 0,
    inventarioTotal: 0,
    recetas: 0,
    ventasHoy: 0,
    clientesHoy: 0,
    margenGanancia: 0,
    crecimientoMensual: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener datos en paralelo
      const [productosRes, recetasRes, ventasRes] = await Promise.all([
        fetch("/api/productos"),
        fetch("/api/recetas"),
        fetch("/api/reportes/ventas?periodo=dia"),
      ]);

      const productos = await productosRes.json();
      const recetas = await recetasRes.json();
      const ventasData = await ventasRes.json();

      // Calcular estadísticas
      const productosCount = productos.length;
      const inventarioTotal = productos.reduce(
        (total: number, producto: any) =>
          total + (producto.inventario?.cantidadActual || 0),
        0
      );
      const recetasCount = recetas.length;
      const ventasHoy = ventasData.totalVentas || 0;
      const clientesHoy = ventasData.totalClientes || 0;

      // Calcular margen de ganancia promedio (simplificado)
      const margenGanancia =
        productos.length > 0
          ? productos.reduce((total: number, producto: any) => {
              const costo = producto.precioUnitario * 0.7; // Asumiendo 70% de costo
              const ganancia = producto.precioUnitario - costo;
              return total + (ganancia / producto.precioUnitario) * 100;
            }, 0) / productos.length
          : 0;

      // Crecimiento mensual (comparación simplificada)
      const crecimientoMensual = 12.5; // Placeholder - en producción calcular de datos históricos

      setStats({
        productos: productosCount,
        inventarioTotal,
        recetas: recetasCount,
        ventasHoy,
        clientesHoy,
        margenGanancia: Math.round(margenGanancia),
        crecimientoMensual,
      });
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Error al cargar estadísticas:", err);
      setError("Error al cargar las estadísticas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Dashboard Administrativo
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestiona tu negocio de manera eficiente
          </p>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={loadStats}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Actualizar
          </Button>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              Última actualización
            </p>
            <p className="text-sm font-medium">
              {lastUpdate.toLocaleDateString("es-MX", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card Productos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <div className="animate-pulse bg-muted h-8 w-12 rounded"></div>
              ) : (
                stats.productos
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              productos registrados
            </p>
          </CardContent>
        </Card>

        {/* Card Inventario */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Items en Stock
            </CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <div className="animate-pulse bg-muted h-8 w-16 rounded"></div>
              ) : (
                stats.inventarioTotal.toLocaleString("es-MX")
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              unidades disponibles
            </p>
          </CardContent>
        </Card>

        {/* Card Recetas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recetas</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <div className="animate-pulse bg-muted h-8 w-12 rounded"></div>
              ) : (
                stats.recetas
              )}
            </div>
            <p className="text-xs text-muted-foreground">recetas activas</p>
          </CardContent>
        </Card>

        {/* Card Ventas Hoy */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <div className="animate-pulse bg-muted h-8 w-20 rounded"></div>
              ) : (
                `$${stats.ventasHoy.toLocaleString("es-MX")}`
              )}
            </div>
            <p className="text-xs text-muted-foreground">ingresos del día</p>
          </CardContent>
        </Card>
      </div>

      {/* Sección de estadísticas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center">
              {stats.crecimientoMensual >= 0 ? (
                <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-2 text-red-600" />
              )}
              Crecimiento Mensual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                stats.crecimientoMensual >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {loading ? (
                <div className="animate-pulse bg-muted h-8 w-16 rounded"></div>
              ) : (
                (() => {
                  const sign = stats.crecimientoMensual >= 0 ? "+" : "";
                  return `${sign}${stats.crecimientoMensual}%`;
                })()
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Comparado con el mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Clientes Atendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <div className="animate-pulse bg-muted h-8 w-12 rounded"></div>
              ) : (
                stats.clientesHoy
              )}
            </div>
            <p className="text-xs text-muted-foreground">Clientes únicos hoy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Margen de Ganancia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <div className="animate-pulse bg-muted h-8 w-12 rounded"></div>
              ) : (
                `${stats.margenGanancia}%`
              )}
            </div>
            <p className="text-xs text-muted-foreground">Promedio por venta</p>
          </CardContent>
        </Card>
      </div>

      {/* Sección de acceso rápido */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Acceso Rápido
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/productos">
            <Button variant="default" size="lg" className="w-full">
              <Package className="w-5 h-5 mr-2" />
              Gestionar Productos
            </Button>
          </Link>
          <Link href="/admin/recetas">
            <Button variant="secondary" size="lg" className="w-full">
              <ChefHat className="w-5 h-5 mr-2" />
              Gestionar Recetas
            </Button>
          </Link>
          <Link href="/admin/compras">
            <Button variant="outline" size="lg" className="w-full">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Registrar Compra
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
