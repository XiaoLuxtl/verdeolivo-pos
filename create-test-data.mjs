// Script para crear datos de prueba
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function createTestData() {
  try {
    // Crear producto
    const polvoUva = await prisma.producto.upsert({
      where: { sku: "POLVO-UVA-001" },
      update: {},
      create: {
        sku: "POLVO-UVA-001",
        nombre: "Polvo de Uva",
        precioUnitario: 50,
        peso: 500,
        unidad: "gr",
        stockMinimo: 200,
        descripcionUmbral:
          "Producto esencial para malteadas, reponer urgentemente",
        inventario: {
          create: {
            cantidadActual: 1000,
            unidad: "gr",
          },
        },
      },
    });

    // Crear receta
    const malteadaUva = await prisma.receta.upsert({
      where: { id: 1 },
      update: {},
      create: {
        nombre: "Malteada de Uva",
        categoria: "MALTEADA",
        descripcion: "Deliciosa malteada de uva fresca",
        precioVenta: 25,
        ingredientes: {
          create: {
            productoId: polvoUva.id,
            cantidad: 50,
            unidad: "gr",
          },
        },
      },
    });

    // Crear compra inicial
    await prisma.compra.upsert({
      where: { id: 1 },
      update: {},
      create: {
        fecha: new Date(),
        proveedor: "Proveedor ABC",
        total: 500,
        detalles: {
          create: {
            productoId: polvoUva.id,
            cantidad: 10,
            costoUnitario: 50,
            subtotal: 500,
          },
        },
      },
    });

    // Actualizar inventario
    await prisma.inventario.update({
      where: { productoId: polvoUva.id },
      data: {
        cantidadActual: 5000,
      },
    });

    // Crear una venta de prueba
    const venta = await prisma.venta.create({
      data: {
        fecha: new Date(),
        subtotal: 25,
        descuento: 5,
        tipoDescuento: "fijo",
        valorDescuentoOriginal: 5,
        total: 20,
        recibido: 20,
        cambio: 0,
        metodoPago: "efectivo",
        detalles: {
          create: {
            recetaId: malteadaUva.id,
            cantidad: 1,
            precioUnitario: 25,
            subtotal: 25,
          },
        },
      },
    });

    // Crear movimiento de venta
    await prisma.movimientoInventario.create({
      data: {
        productoId: polvoUva.id,
        tipo: "salida",
        categoria: "venta",
        cantidad: -50,
        fecha: new Date(),
        referencia: `venta-${venta.id}`,
        ventaRef: venta.id,
      },
    });

    // Actualizar inventario después de venta
    await prisma.inventario.update({
      where: { productoId: polvoUva.id },
      data: {
        cantidadActual: 4950,
      },
    });

    console.log("Datos de prueba creados exitosamente");
    console.log("Producto:", polvoUva.nombre);
    console.log("Receta:", malteadaUva.nombre);
    console.log("Venta ID:", venta.id);
  } catch (error) {
    console.error("Error creando datos de prueba:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar directamente con top-level await
await createTestData();
