// lib/migrateRecipeVersions.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Migra todas las recetas existentes creando su versión inicial
 * Esto es necesario para que las ventas existentes puedan referenciar versiones
 */
export async function migrateExistingRecipesToVersions() {
  console.log("Iniciando migración de versiones de recetas...");

  // Obtener todas las recetas con sus ingredientes
  const recetas = await prisma.receta.findMany({
    include: {
      ingredientes: {
        include: {
          producto: true,
        },
      },
      versiones: true, // Para verificar si ya tienen versiones
    },
  });

  console.log(`Encontradas ${recetas.length} recetas`);

  let migratedCount = 0;

  for (const receta of recetas) {
    // Si ya tiene versiones, saltar
    if (receta.versiones && receta.versiones.length > 0) {
      console.log(`Receta ${receta.nombre} ya tiene versiones, saltando...`);
      continue;
    }

    try {
      // Calcular costo total
      const costoTotal = receta.ingredientes.reduce((total, ing) => {
        return (
          total +
          ing.cantidad * (ing.costoUnitario || ing.producto.precioUnitario)
        );
      }, 0);

      // Crear versión inicial
      await prisma.recetaVersion.create({
        data: {
          recetaId: receta.id,
          version: 1,
          nombre: receta.nombre,
          categoria: receta.categoria,
          descripcion: receta.descripcion,
          precioVenta: receta.precioVenta,
          imagen: receta.imagen,
          costoTotal,
          ingredientes: {
            create: receta.ingredientes.map((ing) => ({
              productoId: ing.productoId,
              cantidad: ing.cantidad,
              unidad: ing.unidad,
              costoUnitario: ing.costoUnitario || ing.producto.precioUnitario,
              costoTotal:
                ing.cantidad *
                (ing.costoUnitario || ing.producto.precioUnitario),
            })),
          },
        },
      });

      migratedCount++;
      console.log(`Migrada receta: ${receta.nombre} (ID: ${receta.id})`);
    } catch (error) {
      console.error(`Error migrando receta ${receta.nombre}:`, error);
    }
  }

  console.log(`Migración completada. ${migratedCount} recetas migradas.`);
  return migratedCount;
}

/**
 * Nota: La migración de ventas existentes no es necesaria porque:
 * 1. Las ventas existentes funcionarán con el sistema actual
 * 2. Las nuevas ventas usarán automáticamente versiones
 * 3. Los cálculos históricos se mantienen intactos
 *
 * Si en el futuro se necesita migrar ventas existentes, se puede hacer
 * consultando directamente las tablas con SQL raw queries.
 */
