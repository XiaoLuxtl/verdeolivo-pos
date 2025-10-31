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
      orderBy: [
        { fecha: "desc" }, // Ordena por fecha (precisa)
        { id: "desc" }, // Desempata usando el ID (el más nuevo siempre tiene el ID más grande)
      ],
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

// POST - Crear compra (automáticamente actualiza inventario y costo base)
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

      // 2. Procesar detalles de compra
      for (const detalle of body.detalles) {
        const productoId = parseInt(detalle.productoId);
        const cantidadUnidades = parseFloat(detalle.cantidad); // Cantidad de botes/piezas compradas
        const costoUnitarioCompra = parseFloat(detalle.costoUnitario); // Costo de una pieza/bote
        const subtotal = parseFloat(detalle.subtotal);

        // Obtener el producto para saber su peso/contenido y unidad
        const producto = await tx.producto.findUnique({
          where: { id: productoId },
        });

        if (!producto) {
          throw new Error(`Producto no encontrado: ${productoId}`);
        }

        const pesoUnitario = producto.peso || 1;
        // cantidadTotal: Cantidad TOTAL en unidades base (gr, ml, pz). Ejemplo: 2 botes * 1000gr/bote = 2000gr
        const cantidadTotal = cantidadUnidades * pesoUnitario;

        // 2.5 💡 CÁLCULO Y ACTUALIZACIÓN DEL PRECIO POR UNIDAD BASE (COSTO PARA RECETAS)
        let nuevoPrecioPorUnidad = producto.precioPorUnidad; // Mantenemos el anterior por defecto

        if (pesoUnitario > 0) {
          // El costo de la pieza comprada (detalle.costoUnitario) se divide por el peso/contenido
          // para obtener el costo por unidad base (gramo, mililitro).
          // Ejemplo: Bote de $100 / 1000gr = $0.1/gr
          nuevoPrecioPorUnidad = costoUnitarioCompra / pesoUnitario;

          // Actualizar el producto con el nuevo costo base
          await tx.producto.update({
            where: { id: productoId },
            data: {
              precioPorUnidad: nuevoPrecioPorUnidad,
              // Opcionalmente, puedes actualizar precioUnitario con el costo de la pieza comprada
              precioUnitario: costoUnitarioCompra,
            },
          });
        }

        // 3. Crear detalle de compra
        await tx.detalleCompra.create({
          data: {
            compraId: nuevaCompra.id,
            productoId: productoId,
            cantidad: cantidadUnidades,
            costoUnitario: costoUnitarioCompra, // Costo de la PIEZA/BOTE
            subtotal: subtotal,
          },
        });

        // 4. Actualizar inventario (sumar peso TOTAL en unidades base)
        const inventario = await tx.inventario.findUnique({
          where: { productoId: productoId },
        });

        if (inventario) {
          await tx.inventario.update({
            where: { productoId: productoId },
            data: {
              cantidadActual: {
                increment: cantidadTotal, // Suma la cantidad total en gramos/ml/pz
              },
            },
          });
        }

        // 5. Registrar movimiento de inventario
        await tx.movimientoInventario.create({
          data: {
            productoId: productoId,
            tipo: "entrada",
            categoria: "insumo",
            cantidad: cantidadTotal, // Registra el total de gramos/ml/pz que entraron
            costoUnitario: costoUnitarioCompra, // Se registra el costo de la PIEZA/BOTE
            fecha: new Date(body.fecha || Date.now()),
            referencia: `Compra #${nuevaCompra.id}`,
            notas: `Compra de ${cantidadUnidades} unidad(es) a ${costoUnitarioCompra} c/u. Total inventario: ${cantidadTotal}${
              producto.unidad
            } (Costo base: ${nuevoPrecioPorUnidad?.toFixed(4) || "N/A"})`,
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
