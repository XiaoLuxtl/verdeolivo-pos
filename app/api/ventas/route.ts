// Ruta: app/api/ventas/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar ventas
export async function GET() {
  try {
    const ventas = await prisma.venta.findMany({
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
    return NextResponse.json(ventas);
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    return NextResponse.json(
      { error: "Error al obtener ventas" },
      { status: 500 }
    );
  }
}

// POST - Crear venta (automáticamente descuenta ingredientes del inventario)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Crear venta en una transacción
    const venta = await prisma.$transaction(async (tx) => {
      // 1. Crear la venta
      const nuevaVenta = await tx.venta.create({
        data: {
          fecha: new Date(),
          total: parseFloat(body.total),
          recibido: parseFloat(body.recibido),
          cambio: parseFloat(body.cambio),
          metodoPago: body.metodoPago || "efectivo",
          notas: body.notas || null,
        },
      });

      // 2. Procesar cada detalle (receta vendida)
      for (const detalle of body.detalles) {
        // 2.1 Crear detalle de venta
        await tx.detalleVenta.create({
          data: {
            ventaId: nuevaVenta.id,
            recetaId: parseInt(detalle.recetaId),
            cantidad: parseInt(detalle.cantidad),
            precioUnitario: parseFloat(detalle.precioUnitario),
            subtotal: parseFloat(detalle.subtotal),
          },
        });

        // 2.2 Obtener ingredientes de la receta
        const ingredientes = await tx.recetaIngrediente.findMany({
          where: { recetaId: parseInt(detalle.recetaId) },
          include: { producto: true },
        });

        // 2.3 Descontar cada ingrediente del inventario
        for (const ingrediente of ingredientes) {
          const cantidadTotal =
            ingrediente.cantidad * parseInt(detalle.cantidad);

          // Verificar si hay suficiente stock
          const inventario = await tx.inventario.findUnique({
            where: { productoId: ingrediente.productoId },
          });

          if (!inventario || inventario.cantidadActual < cantidadTotal) {
            throw new Error(
              `Stock insuficiente de ${ingrediente.producto.nombre}. ` +
                `Disponible: ${inventario?.cantidadActual || 0}, ` +
                `Necesario: ${cantidadTotal}`
            );
          }

          // Actualizar inventario (restar)
          await tx.inventario.update({
            where: { productoId: ingrediente.productoId },
            data: {
              cantidadActual: {
                decrement: cantidadTotal,
              },
            },
          });

          // Registrar movimiento de inventario
          await tx.movimientoInventario.create({
            data: {
              productoId: ingrediente.productoId,
              tipo: "salida",
              categoria: "venta",
              cantidad: cantidadTotal,
              fecha: new Date(),
              referencia: `Venta #${nuevaVenta.id}`,
              notas: `Venta de receta: ${detalle.recetaNombre || "N/A"}`,
            },
          });
        }
      }

      // Retornar venta con detalles
      return tx.venta.findUnique({
        where: { id: nuevaVenta.id },
        include: {
          detalles: {
            include: {
              receta: true,
            },
          },
        },
      });
    });

    return NextResponse.json(venta);
  } catch (error: any) {
    console.error("Error al crear venta:", error);
    return NextResponse.json(
      { error: error.message || "Error al crear venta" },
      { status: 500 }
    );
  }
}
