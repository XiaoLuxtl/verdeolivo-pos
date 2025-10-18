import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE - Eliminar ingrediente
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; ingredienteId: string }> }
) {
  try {
    const { ingredienteId } = await params;
    await prisma.recetaIngrediente.delete({
      where: { id: parseInt(ingredienteId) },
    });

    return NextResponse.json({ message: "Ingrediente eliminado" });
  } catch (error) {
    console.error("Error al eliminar ingrediente:", error);
    return NextResponse.json(
      { error: "Error al eliminar ingrediente" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar ingrediente
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; ingredienteId: string }> }
) {
  try {
    const { ingredienteId } = await params;
    const body = await request.json();

    const ingrediente = await prisma.recetaIngrediente.update({
      where: { id: parseInt(ingredienteId) },
      data: {
        cantidad: parseFloat(body.cantidad),
        unidad: body.unidad,
      },
      include: {
        producto: true,
      },
    });

    return NextResponse.json(ingrediente);
  } catch (error) {
    console.error("Error al actualizar ingrediente:", error);
    return NextResponse.json(
      { error: "Error al actualizar ingrediente" },
      { status: 500 }
    );
  }
}
