// Ruta: app/api/compras/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar todas las compras
export async function GET() {
  try {
    const compras = await prisma.compra.findMany({
      include: {
        detalles: {
          include: {
            producto: true,
          },
        },
      },
      orderBy: {
        fecha: "desc",
      },
    });
    return NextResponse.json(compras);
  } catch (error) {
    console.error("Error al obtener compras:", error);
    return NextResponse.json(
      { error: "Error al obtener compras" },
      { status: 500 }
    );
  }
}

// POST - Crear compra (automáticamente actualiza inventario)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Crear compra con detalles en una transacción
    const compra = await prisma.$transaction(async (tx) => {
      // 1. Crear la compra
      const nuevaCompra = await tx.compra.create({
        data: {
          fecha: new Date(body.fecha || Date.now()),
          proveedor: body.proveedor,
          total: parseFloat(body.total),
          notas: body.notas || null,
        },
      });

      // 2. Crear detalles de compra
      for (const detalle of body.detalles) {
        // Obtener el producto para saber su peso/contenido
        const producto = await tx.producto.findUnique({
          where: { id: parseInt(detalle.productoId) },
        });

        if (!producto) {
          throw new Error(`Producto no encontrado: ${detalle.productoId}`);
        }

        // Calcular cantidad TOTAL en unidades base (gr, ml, etc)
        // Si compro 2 botes de 1000gr = 2000gr total
        const cantidadUnidades = parseFloat(detalle.cantidad); // Cantidad de botes/piezas
        const pesoUnitario = producto.peso || 1; // Peso de cada bote
        const cantidadTotal = cantidadUnidades * pesoUnitario; // 2 * 1000 = 2000gr

        await tx.detalleCompra.create({
          data: {
            compraId: nuevaCompra.id,
            productoId: parseInt(detalle.productoId),
            cantidad: cantidadUnidades,
            costoUnitario: parseFloat(detalle.costoUnitario),
            subtotal: parseFloat(detalle.subtotal),
          },
        });

        // 3. Actualizar inventario (sumar peso TOTAL en gramos/ml)
        const inventario = await tx.inventario.findUnique({
          where: { productoId: parseInt(detalle.productoId) },
        });

        if (inventario) {
          await tx.inventario.update({
            where: { productoId: parseInt(detalle.productoId) },
            data: {
              cantidadActual: {
                increment: cantidadTotal, // Suma 2000gr, no 2 unidades
              },
            },
          });
        }

        // 4. Registrar movimiento de inventario
        await tx.movimientoInventario.create({
          data: {
            productoId: parseInt(detalle.productoId),
            tipo: "entrada",
            categoria: "insumo",
            cantidad: cantidadTotal, // Registra 2000gr
            costoUnitario: parseFloat(detalle.costoUnitario),
            fecha: new Date(body.fecha || Date.now()),
            referencia: `Compra #${nuevaCompra.id}`,
            notas: `Compra de ${cantidadUnidades} unidad(es) x ${pesoUnitario}${producto.unidad} = ${cantidadTotal}${producto.unidad}`,
          },
        });
      }

      // Retornar compra con detalles
      return tx.compra.findUnique({
        where: { id: nuevaCompra.id },
        include: {
          detalles: {
            include: {
              producto: true,
            },
          },
        },
      });
    });

    return NextResponse.json(compra);
  } catch (error) {
    console.error("Error al crear compra:", error);
    return NextResponse.json(
      { error: "Error al crear compra" },
      { status: 500 }
    );
  }
}
