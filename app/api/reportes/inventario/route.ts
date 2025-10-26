// Ruta: app/api/reportes/inventario/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Definir tipo para productos más movidos
interface ProductoMovimiento {
  nombre: string;
  movimientos: number;
  entradas: number;
  salidas: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get("periodo") || "mes";
    const fechaInicioParam = searchParams.get("fechaInicio");
    const fechaFinParam = searchParams.get("fechaFin");

    // Calcular fechas
    const now = new Date();
    let fechaInicio: Date;

    if (periodo === "personalizado" && fechaInicioParam && fechaFinParam) {
      fechaInicio = new Date(fechaInicioParam);
      fechaInicio.setHours(0, 0, 0, 0);
      if (Number.isNaN(fechaInicio.getTime())) {
        throw new TypeError("Fecha inicio inválida. Use formato YYYY-MM-DD");
      }
    } else {
      switch (periodo) {
        case "semana": {
          const diaSemana = now.getDay();
          const diasDesdeInicio = diaSemana === 0 ? 6 : diaSemana - 1;
          fechaInicio = new Date(now);
          fechaInicio.setDate(now.getDate() - diasDesdeInicio);
          fechaInicio.setHours(0, 0, 0, 0);
          break;
        }
        case "mes":
          fechaInicio = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "3meses":
          fechaInicio = new Date(now.getFullYear(), now.getMonth() - 2, 1);
          break;
        default:
          fechaInicio = new Date(now.getFullYear(), now.getMonth(), 1);
      }
    }

    // Obtener productos con inventario
    const productos = await prisma.producto.findMany({
      include: {
        inventario: true,
      },
    });

    // Obtener movimientos del periodo
    const movimientos = await prisma.movimientoInventario.findMany({
      where: {
        fecha: {
          gte: fechaInicio,
        },
      },
      include: {
        producto: true,
      },
    });

    // Agrupar movimientos por categoría
    const movimientosPorCategoria = movimientos.reduce((acc, mov) => {
      if (!acc[mov.categoria]) {
        acc[mov.categoria] = { cantidad: 0, productos: new Set<number>() };
      }
      acc[mov.categoria].cantidad += 1;
      acc[mov.categoria].productos.add(mov.productoId);
      return acc;
    }, {} as { [key: string]: { cantidad: number; productos: Set<number> } });

    // Productos con stock bajo
    const stockBajo = productos.filter((p) => {
      const stock = p.inventario?.cantidadActual || 0;
      return stock > 0 && stock < 100;
    });

    const sinStock = productos.filter(
      (p) => (p.inventario?.cantidadActual || 0) === 0
    );

    // Movimientos más frecuentes - CORREGIDO (sin any)
    const productosMasMovidos = Object.entries(
      movimientos.reduce((acc, mov) => {
        const key = mov.productoId;
        if (!acc[key]) {
          acc[key] = {
            nombre: mov.producto.nombre,
            movimientos: 0,
            entradas: 0,
            salidas: 0,
          };
        }
        acc[key].movimientos += 1;
        if (mov.tipo === "entrada") {
          acc[key].entradas += mov.cantidad;
        } else {
          acc[key].salidas += mov.cantidad;
        }
        return acc;
      }, {} as { [key: number]: ProductoMovimiento })
    )
      .map(([id, data]) => ({ ...data, id: Number(id) })) // CORREGIDO: usar 'id'
      .sort((a, b) => b.movimientos - a.movimientos)
      .slice(0, 10);

    return NextResponse.json({
      periodo,
      fechaInicio: fechaInicio.toISOString(),
      fechaFin: now.toISOString(),
      resumen: {
        totalProductos: productos.length,
        sinStock: sinStock.length,
        stockBajo: stockBajo.length,
        totalMovimientos: movimientos.length,
      },
      movimientosPorCategoria: Object.entries(movimientosPorCategoria).map(
        ([cat, data]) => ({
          categoria: cat,
          cantidad: data.cantidad,
          productos: data.productos.size,
        })
      ),
      productosMasMovidos,
      alertas: {
        sinStock: sinStock.map((p) => ({
          id: p.id,
          nombre: p.nombre,
          sku: p.sku,
        })),
        stockBajo: stockBajo.map((p) => ({
          id: p.id,
          nombre: p.nombre,
          sku: p.sku,
          stock: p.inventario?.cantidadActual || 0,
          unidad: p.unidad,
        })),
      },
    });
  } catch (error: unknown) {
    console.error("Error al generar reporte de inventario:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error al generar reporte";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
