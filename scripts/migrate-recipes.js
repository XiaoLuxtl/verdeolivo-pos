// scripts/migrate-recipes.js
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function migrateRecipes() {
  console.log("🚀 Iniciando migración de versiones de recetas...");

  try {
    // Obtener todas las recetas con sus ingredientes
    const recetas = await prisma.receta.findMany({
      include: {
        ingredientes: {
          include: {
            producto: true,
          },
        },
        versiones: true,
      },
    });

    console.log(`📋 Encontradas ${recetas.length} recetas`);

    let migratedCount = 0;

    for (const receta of recetas) {
      // Si ya tiene versiones, saltar
      if (receta.versiones && receta.versiones.length > 0) {
        console.log(
          `⏭️  Receta "${receta.nombre}" ya tiene versiones, saltando...`
        );
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
        console.log(`✅ Migrada receta: "${receta.nombre}" (ID: ${receta.id})`);
      } catch (error) {
        console.error(
          `❌ Error migrando receta "${receta.nombre}":`,
          error.message
        );
      }
    }

    console.log(
      `\n🎉 Migración completada. ${migratedCount} recetas migradas exitosamente.`
    );
  } catch (error) {
    console.error("💥 Error durante la migración:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar migración
migrateRecipes();
