import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Obtener una receta
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const receta = await prisma.receta.findUnique({
      where: { id: parseInt(id) },
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

    return NextResponse.json(receta);
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
      where: { id: parseInt(id) },
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion || null,
        precioVenta: parseFloat(body.precioVenta),
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
    // Verificar si la receta tiene ventas
    const ventasCount = await prisma.detalleVenta.count({
      where: { recetaId: parseInt(id) },
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
      where: { id: parseInt(id) },
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
