// app/api/productos/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar todos los productos (MODIFICADO)
export async function GET() {
  try {
    const productos = await prisma.producto.findMany({
      // 💡 Se recomienda usar 'select' explícito para optimizar la respuesta
      // y garantizar que se incluyan todos los campos que el frontend de Recetas necesita.
      select: {
        id: true,
        sku: true,
        nombre: true,
        sabor: true,
        categoria: true,
        proveedor: true,
        precioUnitario: true,
        peso: true,
        precioPorUnidad: true,
        unidad: true,
        descripcion: true,
        stockMinimo: true,
        descripcionUmbral: true,
        createdAt: true,
        updatedAt: true,
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

// POST - Crear producto (SIN CAMBIOS ADICIONALES)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const precioUnitarioNum = Number.parseFloat(body.precioUnitario);
    const pesoNum = body.peso ? Number.parseFloat(body.peso) : null;
    const precioPorUnidadNum = Number.parseFloat(body.precioPorUnidad);

    if (Number.isNaN(precioUnitarioNum) || Number.isNaN(precioPorUnidadNum)) {
      return NextResponse.json(
        {
          error:
            "El costo unitario y/o costo por unidad base deben ser números válidos.",
        },
        { status: 400 }
      );
    }

    const producto = await prisma.producto.create({
      data: {
        sku: body.sku,
        nombre: body.nombre,
        sabor: body.sabor || null,
        categoria: body.categoria,
        proveedor: body.proveedor || null,
        precioUnitario: precioUnitarioNum,
        peso: pesoNum,
        precioPorUnidad: precioPorUnidadNum,
        unidad: body.unidad,
        descripcion: body.descripcion || null,
        stockMinimo: body.stockMinimo ? Number.parseFloat(body.stockMinimo) : 5,
        descripcionUmbral: body.descripcionUmbral || null,
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
