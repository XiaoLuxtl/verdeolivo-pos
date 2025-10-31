import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Obtener un producto (SIN CAMBIOS)
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

// PUT - Actualizar producto (MODIFICADO)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 💡 Eliminamos el recálculo del precioPorUnidad.
    // Ahora, solo nos aseguramos de que todos los valores numéricos se parseen correctamente.
    const precioUnitarioNum = Number.parseFloat(body.precioUnitario);
    const pesoNum = body.peso ? Number.parseFloat(body.peso) : null;
    const precioPorUnidadNum = Number.parseFloat(body.precioPorUnidad);

    // Validación básica de los nuevos campos numéricos
    if (Number.isNaN(precioUnitarioNum) || Number.isNaN(precioPorUnidadNum)) {
      return NextResponse.json(
        {
          error:
            "El costo unitario y/o costo por unidad base deben ser números válidos.",
        },
        { status: 400 }
      );
    }

    // Si el producto es un INSUMO_PESO, el frontend nos envía:
    // - precioUnitarioNum: El costo total de la compra (ej: $24.00)
    // - precioPorUnidadNum: El costo por la unidad base (ej: $0.04/gramo)

    const producto = await prisma.producto.update({
      where: { id: Number.parseInt(id) },
      data: {
        sku: body.sku,
        nombre: body.nombre,
        sabor: body.sabor || null,
        categoria: body.categoria,
        proveedor: body.proveedor || null,
        precioUnitario: precioUnitarioNum,
        peso: pesoNum,
        precioPorUnidad: precioPorUnidadNum, // <-- Usamos el valor ya calculado por el frontend
        unidad: body.unidad,
        descripcion: body.descripcion || null,
        stockMinimo: body.stockMinimo
          ? Number.parseFloat(body.stockMinimo)
          : undefined, // Si no se envía, se mantiene el valor actual
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

// DELETE - Eliminar producto (SIN CAMBIOS)
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
