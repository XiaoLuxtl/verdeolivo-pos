// Ruta: app/api/reportes/ventas/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function calcularFechas(
  periodo: string,
  fechaParam?: string | null
): { start: Date; end: Date } {
  if (fechaParam) {
    // Fecha específica
    const fecha = new Date(fechaParam);
    if (Number.isNaN(fecha.getTime())) {
      throw new TypeError("Fecha inválida. Use formato YYYY-MM-DD");
    }
    const start = new Date(fecha);
    start.setHours(0, 0, 0, 0);
    const end = new Date(fecha);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  // Periodo
  const now = new Date();

  switch (periodo) {
    case "dia":
      return {
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        end: new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59,
          999
        ),
      };

    case "semana": {
      const diaSemana = now.getDay();
      const diasDesdeInicio = diaSemana === 0 ? 6 : diaSemana - 1; // Lunes = 0
      const start = new Date(now);
      start.setDate(now.getDate() - diasDesdeInicio);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    case "mes":
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        ),
      };

    case "3meses": {
      const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    default:
      // Default to dia
      return calcularFechas("dia");
  }
}

function calcularEstadisticasVentas(ventas: any[]) {
  const ventasBrutas = ventas.reduce((sum, v) => sum + v.subtotal, 0);
  const descuentosTotal = ventas.reduce((sum, v) => sum + v.descuento, 0);
  const ingresosNetos = ventas.reduce((sum, v) => sum + v.total, 0);

  // Group by categoria de receta
  const porCategoria: {
    [categoria: string]: { bruto: number; descuentos: number; neto: number };
  } = {};

  // Calcular top recetas
  const recetasVendidas: {
    [key: string]: { nombre: string; cantidad: number; ingresos: number };
  } = {};

  for (const venta of ventas) {
    for (const detalle of venta.detalles) {
      const categoria = detalle.receta.categoria || "Sin categoría";
      if (!porCategoria[categoria]) {
        porCategoria[categoria] = { bruto: 0, descuentos: 0, neto: 0 };
      }
      porCategoria[categoria].bruto += detalle.subtotal;
      // Los descuentos se prorratean por categoría basado en el subtotal
      const descuentoProrrateado =
        venta.subtotal > 0
          ? venta.descuento * (detalle.subtotal / venta.subtotal)
          : 0;
      porCategoria[categoria].descuentos += descuentoProrrateado;
      porCategoria[categoria].neto += detalle.subtotal - descuentoProrrateado;

      // Calcular top recetas
      const recetaKey = detalle.receta.nombre;
      if (!recetasVendidas[recetaKey]) {
        recetasVendidas[recetaKey] = {
          nombre: recetaKey,
          cantidad: 0,
          ingresos: 0,
        };
      }
      recetasVendidas[recetaKey].cantidad += detalle.cantidad;
      recetasVendidas[recetaKey].ingresos +=
        detalle.subtotal - descuentoProrrateado;
    }
  }

  // Top 5 recetas más vendidas
  const topRecetas = Object.values(recetasVendidas)
    .sort((a, b) => b.ingresos - a.ingresos)
    .slice(0, 5);

  return {
    ventasBrutas,
    descuentosTotal,
    ingresosNetos,
    porCategoria,
    topRecetas,
  };
}

function procesarMermas(movimientosMerma: any[]) {
  const mermasPorMotivo: { [motivo: string]: number } = {};
  let totalMermas = 0;

  for (const mov of movimientosMerma) {
    const motivo = mov.motivoMerma || "Sin motivo";
    const cantidad = Math.abs(mov.cantidad);
    mermasPorMotivo[motivo] = (mermasPorMotivo[motivo] || 0) + cantidad;
    totalMermas += cantidad;
  }

  return {
    total: totalMermas,
    motivos: Object.entries(mermasPorMotivo).map(([motivo, cantidad]) => ({
      motivo,
      cantidad,
    })),
  };
}

function procesarAlertasStock(productosConStock: any[]) {
  return productosConStock
    .filter(
      (producto) =>
        producto.inventario &&
        producto.stockMinimo &&
        producto.inventario.cantidadActual < producto.stockMinimo
    )
    .map((producto) => ({
      producto: producto.nombre,
      stockActual: producto.inventario!.cantidadActual,
      umbral: producto.stockMinimo!,
      restantes: Math.floor(producto.inventario!.cantidadActual / 50),
      mensaje: producto.descripcionUmbral || "Bajo en stock",
    }));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get("periodo") || "dia";
    const fechaParam = searchParams.get("fecha");

    // Calcular fechas según el periodo o fecha específica
    const { start, end } = calcularFechas(periodo, fechaParam);

    // Query ventas del periodo
    const ventas = await prisma.venta.findMany({
      where: {
        fecha: {
          gte: start,
          lte: end,
        },
      },
      include: {
        detalles: {
          include: {
            receta: true,
          },
        },
      },
    });

    // Calcular estadísticas de ventas
    const {
      ventasBrutas,
      descuentosTotal,
      ingresosNetos,
      porCategoria,
      topRecetas,
    } = calcularEstadisticasVentas(ventas);

    // Calcular ventas por día
    const ventasPorDia: { [key: string]: number } = {};
    for (const venta of ventas) {
      const fechaDia = venta.fecha.toISOString().split("T")[0];
      ventasPorDia[fechaDia] = (ventasPorDia[fechaDia] || 0) + venta.total;
    }

    // Calcular resumen
    const totalVentas = ventas.length;
    const promedioVenta = totalVentas > 0 ? ingresosNetos / totalVentas : 0;

    // Procesar mermas
    const movimientosMerma = await prisma.movimientoInventario.findMany({
      where: {
        categoria: "merma",
        fecha: {
          gte: start,
          lte: end,
        },
      },
    });
    const mermas = procesarMermas(movimientosMerma);

    // Procesar alertas de stock
    const productosConStock = await prisma.producto.findMany({
      where: {
        stockMinimo: { not: null },
      },
      include: {
        inventario: true,
      },
    });
    const alertasStock = procesarAlertasStock(productosConStock);

    return NextResponse.json({
      periodo,
      resumen: {
        totalVentas,
        totalIngresos: ingresosNetos,
        promedioVenta,
      },
      topRecetas,
      ventasPorDia,
      // Mantener campos adicionales para compatibilidad futura
      fecha: fechaParam || new Date().toISOString().split("T")[0],
      ventasBrutas,
      descuentosTotal,
      ingresosNetos,
      porCategoria: Object.entries(porCategoria).map(([categoria, data]) => ({
        categoria,
        ...data,
      })),
      mermas,
      alertasStock,
    });
  } catch (error) {
    console.error("Error al generar reporte:", error);
    return NextResponse.json(
      { error: "Error al generar reporte" },
      { status: 500 }
    );
  }
}
