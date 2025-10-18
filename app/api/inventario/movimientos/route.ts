// Ruta: app/api/inventario/movimientos/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Registrar movimiento manual (merma o ajuste)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const movimiento = await prisma.$transaction(async (tx) => {
      // 1. Crear el movimiento
      const nuevoMovimiento = await tx.movimientoInventario.create({
        data: {
          productoId: parseInt(body.productoId),
          tipo: body.tipo, // 'entrada' o 'salida'
          categoria: body.categoria, // 'merma' o 'ajuste'
          cantidad: parseFloat(body.cantidad),
          fecha: new Date(),
          notas: body.notas || null,
        },
      });

      // 2. Actualizar inventario
      const inventario = await tx.inventario.findUnique({
        where: { productoId: parseInt(body.productoId) },
      });

      if (!inventario) {
        throw new Error("Inventario no encontrado");
      }

      if (body.tipo === "entrada") {
        await tx.inventario.update({
          where: { productoId: parseInt(body.productoId) },
          data: {
            cantidadActual: {
              increment: parseFloat(body.cantidad),
            },
          },
        });
      } else {
        // Verificar que hay suficiente stock
        if (inventario.cantidadActual < parseFloat(body.cantidad)) {
          throw new Error("Stock insuficiente para realizar esta operación");
        }

        await tx.inventario.update({
          where: { productoId: parseInt(body.productoId) },
          data: {
            cantidadActual: {
              decrement: parseFloat(body.cantidad),
            },
          },
        });
      }

      return nuevoMovimiento;
    });

    return NextResponse.json(movimiento);
  } catch (error: any) {
    console.error("Error al registrar movimiento:", error);
    return NextResponse.json(
      { error: error.message || "Error al registrar movimiento" },
      { status: 500 }
    );
  }
}

// GET - Obtener movimientos
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productoId = searchParams.get("productoId");
    const categoria = searchParams.get("categoria");

    const where: any = {};

    if (productoId) {
      where.productoId = parseInt(productoId);
    }

    if (categoria) {
      where.categoria = categoria;
    }

    const movimientos = await prisma.movimientoInventario.findMany({
      where,
      include: {
        producto: true,
      },
      orderBy: {
        fecha: "desc",
      },
      take: 100, // Últimos 100 movimientos
    });

    return NextResponse.json(movimientos);
  } catch (error) {
    console.error("Error al obtener movimientos:", error);
    return NextResponse.json(
      { error: "Error al obtener movimientos" },
      { status: 500 }
    );
  }
}
