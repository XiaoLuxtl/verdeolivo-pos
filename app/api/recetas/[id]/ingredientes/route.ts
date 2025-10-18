import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Agregar ingrediente a receta
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const ingrediente = await prisma.recetaIngrediente.create({
      data: {
        recetaId: parseInt(id),
        productoId: parseInt(body.productoId),
        cantidad: parseFloat(body.cantidad),
        unidad: body.unidad,
      },
      include: {
        producto: true,
      },
    });

    return NextResponse.json(ingrediente);
  } catch (error) {
    console.error("Error al agregar ingrediente:", error);
    return NextResponse.json(
      { error: "Error al agregar ingrediente" },
      { status: 500 }
    );
  }
}

// GET - Obtener ingredientes de una receta
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ingredientes = await prisma.recetaIngrediente.findMany({
      where: { recetaId: parseInt(id) },
      include: {
        producto: true,
      },
    });

    return NextResponse.json(ingredientes);
  } catch (error) {
    console.error("Error al obtener ingredientes:", error);
    return NextResponse.json(
      { error: "Error al obtener ingredientes" },
      { status: 500 }
    );
  }
}
