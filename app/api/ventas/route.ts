// Ruta: app/api/ventas/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar ventas
export async function GET() {
  try {
    const ventas = await prisma.venta.findMany({
      include: {
        detalles: {
          include: {
            receta: true,
          },
        },
      },
      orderBy: {
        fecha: "desc",
      },
    });
    return NextResponse.json(ventas);
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    return NextResponse.json(
      { error: "Error al obtener ventas" },
      { status: 500 }
    );
  }
}

// POST - Crear venta con descuentos y deducción automática de stock
// POST - Crear venta con descuentos y deducción automática de stock (MODIFICADO)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Body recibido:", JSON.stringify(body, null, 2));
    const {
      detalles,
      recibido,
      metodoPago,
      tipoDescuento,
      valorDescuentoOriginal,
    } = body;

    // Calcular subtotal
    let subtotal = 0;
    // Debemos obtener la receta con los ingredientes para poder sumar el costo base y obtener el costo total de la venta
    const detallesVentaConCostos: any[] = [];

    for (const detalle of detalles) {
      const receta = await prisma.receta.findUnique({
        where: { id: Number.parseInt(detalle.recetaId) },
        include: { ingredientes: true }, // Incluimos ingredientes para el costo
      });

      if (!receta) throw new Error(`Receta ${detalle.recetaId} no encontrada`);

      subtotal += receta.precioVenta * Number.parseInt(detalle.cantidad);

      // 💡 PRE-CÁLCULO DEL COSTO DE VENTA (COSTO DE MATERIA PRIMA CONSUMIDA)
      // Calculamos el costo total de la materia prima por cada unidad de receta vendida
      const costoMateriaPrimaUnitario = receta.ingredientes.reduce(
        (sum, ingrediente) => sum + (ingrediente.costoUnitario || 0),
        0
      );

      detallesVentaConCostos.push({
        ...detalle,
        receta,
        costoMateriaPrimaUnitario,
      });
    }

    // Calcular descuento
    let descuento = 0;
    console.log(
      "Descuento - tipo:",
      tipoDescuento,
      "valor:",
      valorDescuentoOriginal
    );
    if (tipoDescuento && valorDescuentoOriginal) {
      if (tipoDescuento === "porcentaje") {
        descuento = subtotal * (valorDescuentoOriginal / 100);
      } else if (tipoDescuento === "fijo") {
        descuento = valorDescuentoOriginal;
      }
      console.log("Descuento calculado:", descuento, "subtotal:", subtotal);
      if (descuento > subtotal)
        throw new Error("Descuento no puede ser mayor al subtotal");
    }

    const total = subtotal - descuento;
    const cambio = recibido - total;

    // Crear venta en una transacción
    console.log("Iniciando transacción de venta...");
    const venta = await prisma.$transaction(async (tx) => {
      // 1. Crear la venta
      const nuevaVenta = await tx.venta.create({
        data: {
          fecha: new Date(),
          subtotal,
          descuento,
          tipoDescuento: tipoDescuento || null,
          valorDescuentoOriginal: valorDescuentoOriginal || null,
          total,
          recibido: Number.parseFloat(recibido),
          cambio,
          metodoPago: metodoPago || "efectivo",
        },
      });

      // 2. Procesar cada detalle (receta vendida)
      for (const detalleConCosto of detallesVentaConCostos) {
        const { receta, cantidad, costoMateriaPrimaUnitario } = detalleConCosto;
        const cantidadVendida = Number.parseInt(cantidad);

        // Crear detalle de venta
        await tx.detalleVenta.create({
          data: {
            ventaId: nuevaVenta.id,
            recetaId: receta.id,
            cantidad: cantidadVendida,
            precioUnitario: receta.precioVenta,
            subtotal: receta.precioVenta * cantidadVendida,
          },
        });

        // Obtener ingredientes de la receta (ahora incluyendo el costo unitario por ingrediente)
        // Ya lo hicimos arriba, pero necesitamos la data de los ingredientes incluyendo su costo
        const ingredientes = await tx.recetaIngrediente.findMany({
          where: { recetaId: receta.id },
          include: { producto: true },
        });

        // Descontar cada ingrediente del inventario
        for (const ingrediente of ingredientes) {
          const cantidadTotalConsumida = ingrediente.cantidad * cantidadVendida;

          // 💡 Costo total de la materia prima consumida en este movimiento
          // Costo total = cantidad de ingrediente consumida * Costo por Unidad Base (gr, ml, pz)
          const costoMovimiento =
            cantidadTotalConsumida * (ingrediente.costoUnitario || 0);

          // Verificar si hay suficiente stock (la verificación original es correcta)
          const inventario = await tx.inventario.findUnique({
            where: { productoId: ingrediente.productoId },
          });

          if (
            !inventario ||
            inventario.cantidadActual < cantidadTotalConsumida
          ) {
            throw new Error(
              `Stock insuficiente de ${ingrediente.producto.nombre}. ` +
                `Disponible: ${inventario?.cantidadActual || 0}, ` +
                `Necesario: ${cantidadTotalConsumida}`
            );
          }

          // Actualizar inventario (restar)
          await tx.inventario.update({
            where: { productoId: ingrediente.productoId },
            data: {
              cantidadActual: {
                decrement: cantidadTotalConsumida,
              },
            },
          });

          // Registrar movimiento de inventario (MODIFICADO para incluir costo)
          await tx.movimientoInventario.create({
            data: {
              productoId: ingrediente.productoId,
              tipo: "salida",
              categoria: "venta",
              cantidad: -cantidadTotalConsumida, // Cantidad en negativo para indicar salida
              costoUnitario: costoMovimiento, // 💡 CAMBIO CLAVE: El costo total de este ingrediente consumido
              fecha: new Date(),
              referencia: `venta-${nuevaVenta.id}`,
              ventaRef: nuevaVenta.id,
            },
          });
        }
      }

      // Retornar venta con detalles y movimientos
      const ventaCompleta = await tx.venta.findUnique({
        where: { id: nuevaVenta.id },
        include: {
          detalles: {
            include: {
              receta: {
                include: {
                  ingredientes: true,
                },
              },
            },
          },
          movimientos: true,
        },
      });

      return ventaCompleta;
    });

    console.log(
      "Transacción completada, venta:",
      typeof venta,
      venta ? "exists" : "null"
    );

    if (!venta) {
      throw new Error("Error al crear la venta");
    }

    // Chequear stock mínimo después de la venta
    const productosConInventario = await prisma.producto.findMany({
      include: {
        inventario: true,
      },
    });

    // Filtrar productos que están por debajo del stock mínimo
    const productosBajoStock = productosConInventario.filter((producto) => {
      const stockActual = producto.inventario?.cantidadActual || 0;
      const stockMinimo = producto.stockMinimo || 5;
      return stockActual < stockMinimo;
    });

    const alertas = productosBajoStock.map((producto) => ({
      producto: producto.nombre,
      stockActual: producto.inventario?.cantidadActual || 0,
      umbral: producto.stockMinimo || 5,
      restantes: Math.floor((producto.inventario?.cantidadActual || 0) / 50),
      mensaje: producto.descripcionUmbral || "Bajo en stock",
    }));

    // Ensure the venta object is properly serializable
    const ventaSerializable = structuredClone(venta);

    return NextResponse.json({
      success: true,
      venta: ventaSerializable,
      alertas: alertas.length > 0 ? alertas : undefined,
    });
  } catch (error: unknown) {
    console.error("Error al crear venta:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Error al crear venta";

    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
