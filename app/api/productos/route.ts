import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar todos los productos
export async function GET() {
  try {
    const productos = await prisma.producto.findMany({
      include: {
        inventario: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(productos);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return NextResponse.json(
      { error: "Error al obtener productos" },
      { status: 500 }
    );
  }
}

// POST - Crear producto
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const producto = await prisma.producto.create({
      data: {
        sku: body.sku,
        nombre: body.nombre,
        sabor: body.sabor || null,
        proveedor: body.proveedor || null,
        precioUnitario: parseFloat(body.precioUnitario),
        peso: body.peso ? parseFloat(body.peso) : null,
        unidad: body.unidad,
        descripcion: body.descripcion || null,
        inventario: {
          create: {
            cantidadActual: 0,
            unidad: body.unidad,
          },
        },
      },
      include: {
        inventario: true,
      },
    });

    return NextResponse.json(producto);
  } catch (error: unknown) {
    console.error("Error al crear producto:", error);

    // Verificar si es un error de Prisma con código P2002
    if (error instanceof Error && "code" in error) {
      const prismaError = error as { code?: string };

      if (prismaError.code === "P2002") {
        return NextResponse.json(
          { error: "El SKU ya existe" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Error al crear producto" },
      { status: 500 }
    );
  }
}
