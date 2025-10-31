// app/api/recetas/[id]/ingredientes/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Agregar ingrediente a receta (MODIFICADO para incluir el cálculo de costos)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: recetaId } = await params;
    const body = await request.json();
    const cantidadReceta = parseFloat(body.cantidad);
    const productoId = parseInt(body.productoId);

    // 1. Obtener el precio por unidad base del producto (precioPorUnidad)
    const producto = await prisma.producto.findUnique({
      where: { id: productoId },
      select: { precioPorUnidad: true, nombre: true },
    });

    if (!producto || producto.precioPorUnidad === null) {
      return NextResponse.json(
        {
          error: `El producto ${
            producto?.nombre || productoId
          } no tiene un costo base (precioPorUnidad) definido.`,
        },
        { status: 400 }
      );
    }

    // 2. Calcular el costo total del ingrediente para esta receta
    // costo = cantidad a usar * costo base por unidad (GR/ML/PZ)
    const costoUnitarioIngrediente = cantidadReceta * producto.precioPorUnidad;

    // 3. Crear el ingrediente, guardando el costo calculado
    const ingrediente = await prisma.recetaIngrediente.create({
      data: {
        recetaId: parseInt(recetaId),
        productoId: productoId,
        cantidad: cantidadReceta,
        unidad: body.unidad,
        costoUnitario: costoUnitarioIngrediente, // 💡 CAMBIO CLAVE: Guardamos el costo
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

// GET - Obtener ingredientes de una receta (SIN CAMBIOS)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // 💡 NOTA: El GET ya trae el campo costoUnitario porque se agregó al modelo RecetaIngrediente.
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
