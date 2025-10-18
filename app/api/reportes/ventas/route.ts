// Ruta: app/api/reportes/ventas/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get("periodo") || "dia";

    // Calcular fechas según el periodo
    const now = new Date();
    let fechaInicio: Date;

    switch (periodo) {
      case "dia":
        fechaInicio = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        break;
      case "semana":
        const diaSemana = now.getDay();
        const diasDesdeInicio = diaSemana === 0 ? 6 : diaSemana - 1; // Lunes = 0
        fechaInicio = new Date(now);
        fechaInicio.setDate(now.getDate() - diasDesdeInicio);
        fechaInicio.setHours(0, 0, 0, 0);
        break;
      case "mes":
        fechaInicio = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "3meses":
        fechaInicio = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        break;
      default:
        fechaInicio = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
    }

    // Obtener ventas del periodo
    const ventas = await prisma.venta.findMany({
      where: {
        fecha: {
          gte: fechaInicio,
        },
      },
      include: {
        detalles: {
          include: {
            receta: true,
          },
        },
      },
      orderBy: {
        fecha: "desc",
      },
    });

    // Calcular estadísticas
    const totalVentas = ventas.length;
    const totalIngresos = ventas.reduce((sum, v) => sum + v.total, 0);
    const promedioVenta = totalVentas > 0 ? totalIngresos / totalVentas : 0;

    // Recetas más vendidas
    const recetasVendidas: {
      [key: string]: { nombre: string; cantidad: number; ingresos: number };
    } = {};

    ventas.forEach((venta) => {
      venta.detalles.forEach((detalle) => {
        const key = detalle.recetaId.toString();
        if (!recetasVendidas[key]) {
          recetasVendidas[key] = {
            nombre: detalle.receta.nombre,
            cantidad: 0,
            ingresos: 0,
          };
        }
        recetasVendidas[key].cantidad += detalle.cantidad;
        recetasVendidas[key].ingresos += detalle.subtotal;
      });
    });

    const topRecetas = Object.values(recetasVendidas)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10);

    // Ventas por día (para gráfica)
    const ventasPorDia: { [key: string]: number } = {};
    ventas.forEach((venta) => {
      const fecha = new Date(venta.fecha).toISOString().split("T")[0];
      ventasPorDia[fecha] = (ventasPorDia[fecha] || 0) + venta.total;
    });

    return NextResponse.json({
      periodo,
      fechaInicio: fechaInicio.toISOString(),
      fechaFin: now.toISOString(),
      resumen: {
        totalVentas,
        totalIngresos,
        promedioVenta,
      },
      topRecetas,
      ventasPorDia,
      ventas,
    });
  } catch (error) {
    console.error("Error al generar reporte:", error);
    return NextResponse.json(
      { error: "Error al generar reporte" },
      { status: 500 }
    );
  }
}
