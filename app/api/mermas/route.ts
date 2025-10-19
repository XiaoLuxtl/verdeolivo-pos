// Ruta: app/api/mermas/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Registrar merma de producto
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productoId, cantidad, notas, motivoMerma } = body;

    if (!productoId || !cantidad) {
      return NextResponse.json(
        { error: "productoId y cantidad son requeridos" },
        { status: 400 }
      );
    }

    // Verificar que el producto existe y tiene inventario
    const producto = await prisma.producto.findUnique({
      where: { id: Number.parseInt(productoId) },
      include: { inventario: true },
    });

    if (!producto) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    if (!producto.inventario) {
      return NextResponse.json(
        { error: "Producto no tiene inventario registrado" },
        { status: 400 }
      );
    }

    const cantidadMerma = Number.parseFloat(cantidad);
    if (cantidadMerma <= 0) {
      return NextResponse.json(
        { error: "La cantidad debe ser mayor a 0" },
        { status: 400 }
      );
    }

    if (producto.inventario.cantidadActual < cantidadMerma) {
      return NextResponse.json(
        { error: "No hay suficiente stock para registrar la merma" },
        { status: 400 }
      );
    }

    // Registrar merma en transacción
    await prisma.$transaction(async (tx) => {
      // Actualizar inventario (restar)
      await tx.inventario.update({
        where: { productoId: Number.parseInt(productoId) },
        data: {
          cantidadActual: {
            decrement: cantidadMerma,
          },
        },
      });

      // Registrar movimiento de inventario
      await tx.movimientoInventario.create({
        data: {
          productoId: Number.parseInt(productoId),
          tipo: "salida",
          categoria: "merma",
          cantidad: -cantidadMerma,
          fecha: new Date(),
          referencia: `merma-${Date.now()}`,
          notas: notas || null,
          motivoMerma: motivoMerma || null,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Merma registrada correctamente",
    });
  } catch (error: unknown) {
    console.error("Error al registrar merma:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Error al registrar merma";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
