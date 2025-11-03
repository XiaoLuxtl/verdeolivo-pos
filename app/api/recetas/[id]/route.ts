// app/api/recetas/[id]/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRecipeVersion } from "@/lib/recipeVersioning";

// GET - Obtener una receta (MODIFICADO para incluir el Costo Total)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const receta = await prisma.receta.findUnique({
      where: { id: Number.parseInt(id) },
      include: {
        ingredientes: {
          include: {
            producto: true,
          },
        },
      },
    });

    if (!receta) {
      return NextResponse.json(
        { error: "Receta no encontrada" },
        { status: 404 }
      );
    }

    // 💡 1. Calcular el Costo Total de la Receta
    const costoTotalReceta = receta.ingredientes.reduce(
      (sum, ingrediente) => sum + (ingrediente.costoUnitario || 0), // Suma el campo costoUnitario
      0
    );

    // 2. Devolver la receta incluyendo el nuevo campo calculado
    // Usamos el spread operator para añadir 'costoTotalReceta' a la respuesta JSON
    return NextResponse.json({
      ...receta,
      costoTotalReceta: Number.parseFloat(costoTotalReceta.toFixed(4)), // Formatear a 4 decimales
    });
  } catch (error) {
    console.error("Error al obtener receta:", error);
    return NextResponse.json(
      { error: "Error al obtener receta" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar receta
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const receta = await prisma.receta.update({
      where: { id: Number.parseInt(id) },
      data: {
        nombre: body.nombre,
        categoria: body.categoria || null,
        descripcion: body.descripcion || null,
        precioVenta: Number.parseFloat(body.precioVenta),
        imagen: body.imagen || null,
      },
      include: {
        ingredientes: {
          include: {
            producto: true,
          },
        },
      },
    });

    // Crear una nueva versión de la receta para preservar el histórico
    await createRecipeVersion(Number.parseInt(id));

    return NextResponse.json(receta);
  } catch (error) {
    console.error("Error al actualizar receta:", error);
    return NextResponse.json(
      { error: "Error al actualizar receta" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar receta
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Verificar si la receta tiene ventas a través de sus versiones
    const ventasCount = await prisma.detalleVenta.count({
      where: {
        recetaVersion: {
          recetaId: Number.parseInt(id),
        },
      },
    });

    if (ventasCount > 0) {
      return NextResponse.json(
        {
          error: `No se puede eliminar. La receta tiene ${ventasCount} venta(s) registradas`,
        },
        { status: 400 }
      );
    }

    await prisma.receta.delete({
      where: { id: Number.parseInt(id) },
    });

    return NextResponse.json({ message: "Receta eliminada" });
  } catch (error) {
    console.error("Error al eliminar receta:", error);
    return NextResponse.json(
      { error: "Error al eliminar receta" },
      { status: 500 }
    );
  }
}
