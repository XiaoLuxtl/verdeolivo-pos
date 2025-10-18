import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar todas las recetas
export async function GET() {
  try {
    const recetas = await prisma.receta.findMany({
      include: {
        ingredientes: {
          include: {
            producto: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(recetas);
  } catch (error) {
    console.error("Error al obtener recetas:", error);
    return NextResponse.json(
      { error: "Error al obtener recetas" },
      { status: 500 }
    );
  }
}

// POST - Crear receta
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const receta = await prisma.receta.create({
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
    console.error("Error al crear receta:", error);
    return NextResponse.json(
      { error: "Error al crear receta" },
      { status: 500 }
    );
  }
}
