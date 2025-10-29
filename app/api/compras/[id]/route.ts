// app/api/compras/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE - Borrar una compra por ID y revertir inventario
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const compraId = parseInt(params.id);

  if (isNaN(compraId)) {
    return NextResponse.json(
      { error: "ID de compra inválido" },
      { status: 400 }
    );
  }

  try {
    // Usar una transacción para asegurar que el borrado y la reversión sean atómicos
    await prisma.$transaction(async (tx) => {
      // 1. Obtener detalles de la compra para revertir inventario
      const compraAEliminar = await tx.compra.findUnique({
        where: { id: compraId },
        include: {
          detalles: {
            include: {
              producto: true,
            },
          },
        },
      });

      if (!compraAEliminar) {
        throw new Error("Compra no encontrada para eliminar.");
      }

      // 2. Revertir el inventario por cada detalle
      for (const detalle of compraAEliminar.detalles) {
        const productoId = detalle.productoId;
        const producto = detalle.producto;

        // La cantidad total en inventario que se había sumado (ej: 2000gr)
        const cantidadTotalRevertir = detalle.cantidad * (producto.peso || 1);

        // Revertir inventario (restar la cantidad)
        await tx.inventario.update({
          where: { productoId },
          data: {
            cantidadActual: {
              decrement: cantidadTotalRevertir, // ¡Restar del inventario!
            },
          },
        });

        // 3. Registrar el movimiento de inventario de reversión
        await tx.movimientoInventario.create({
          data: {
            productoId,
            tipo: "salida", // Usamos 'salida' para revertir la 'entrada'
            categoria: "ajuste",
            cantidad: cantidadTotalRevertir,
            costoUnitario: detalle.costoUnitario,
            fecha: new Date(),
            referencia: `Reversión Compra #${compraId}`,
            notas: `Reversión por eliminación de Compra #${compraId}`,
          },
        });
      }

      // 4. Borrar la compra y sus detalles (Prisma borra DetalleCompra en cascada)
      await tx.compra.delete({
        where: { id: compraId },
      });
    });

    return NextResponse.json(
      { message: `Compra ${compraId} eliminada y inventario revertido.` },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error al eliminar compra ${compraId}:`, error);
    return NextResponse.json(
      { error: "Error al eliminar la compra y revertir inventario." },
      { status: 500 }
    );
  }
}
