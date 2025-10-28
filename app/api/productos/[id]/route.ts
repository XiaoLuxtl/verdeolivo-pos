import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Obtener un producto
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const producto = await prisma.producto.findUnique({
      where: { id: Number.parseInt(id) },
      include: {
        inventario: true,
      },
    });

    if (!producto) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(producto);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    return NextResponse.json(
      { error: "Error al obtener producto" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar producto
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Calcular precio por unidad
    const precioUnitarioNum = Number.parseFloat(body.precioUnitario);
    const pesoNum = body.peso ? Number.parseFloat(body.peso) : null;
    const precioPorUnidad =
      pesoNum && pesoNum > 0 ? precioUnitarioNum / pesoNum : precioUnitarioNum;

    const producto = await prisma.producto.update({
      where: { id: Number.parseInt(id) },
      data: {
        sku: body.sku,
        nombre: body.nombre,
        sabor: body.sabor || null,
        categoria: body.categoria, // ← Agregar esta línea
        proveedor: body.proveedor || null,
        precioUnitario: precioUnitarioNum,
        peso: pesoNum,
        precioPorUnidad: precioPorUnidad,
        unidad: body.unidad,
        descripcion: body.descripcion || null,
        stockMinimo: body.stockMinimo
          ? Number.parseFloat(body.stockMinimo)
          : undefined,
        descripcionUmbral: body.descripcionUmbral || null,
      },
      include: {
        inventario: true,
      },
    });

    return NextResponse.json(producto);
  } catch (error: unknown) {
    console.error("Error al actualizar producto:", error);

    // Verificar si es un error de Prisma
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
      { error: "Error al actualizar producto" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar producto
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Verificar si el producto está en uso en recetas
    const recetasUsando = await prisma.recetaIngrediente.count({
      where: { productoId: Number.parseInt(id) },
    });

    if (recetasUsando > 0) {
      return NextResponse.json(
        {
          error: `No se puede eliminar. El producto está siendo usado en ${recetasUsando} receta(s)`,
        },
        { status: 400 }
      );
    }

    await prisma.producto.delete({
      where: { id: Number.parseInt(id) },
    });

    return NextResponse.json({ message: "Producto eliminado" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return NextResponse.json(
      { error: "Error al eliminar producto" },
      { status: 500 }
    );
  }
}
