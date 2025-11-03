// lib/recipeVersioning.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Crea una nueva versión de una receta cuando se modifica
 */
export async function createRecipeVersion(recetaId: number) {
  // Obtener la receta actual con sus ingredientes
  const receta = await prisma.receta.findUnique({
    where: { id: recetaId },
    include: {
      ingredientes: {
        include: {
          producto: true,
        },
      },
      versiones: {
        orderBy: { version: "desc" },
        take: 1,
      },
    },
  });

  if (!receta) {
    throw new Error("Receta no encontrada");
  }

  // Calcular el número de versión siguiente
  const nextVersion = (receta.versiones[0]?.version || 0) + 1;

  // Calcular costo total de ingredientes
  const costoTotal = receta.ingredientes.reduce((total, ing) => {
    return (
      total + ing.cantidad * (ing.costoUnitario || ing.producto.precioUnitario)
    );
  }, 0);

  // Crear la nueva versión
  const version = await prisma.recetaVersion.create({
    data: {
      recetaId,
      version: nextVersion,
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
            ing.cantidad * (ing.costoUnitario || ing.producto.precioUnitario),
        })),
      },
    },
    include: {
      ingredientes: true,
    },
  });

  return version;
}

/**
 * Obtiene la versión actual de una receta para ventas
 */
export async function getCurrentRecipeVersion(recetaId: number) {
  // Crear versión si no existe ninguna
  const existingVersions = await prisma.recetaVersion.findMany({
    where: { recetaId },
    orderBy: { version: "desc" },
    take: 1,
  });

  if (existingVersions.length === 0) {
    return await createRecipeVersion(recetaId);
  }

  return existingVersions[0];
}

/**
 * Verifica si una receta ha cambiado desde su última versión
 */
export async function hasRecipeChanged(recetaId: number): Promise<boolean> {
  const receta = await prisma.receta.findUnique({
    where: { id: recetaId },
    include: {
      ingredientes: true,
      versiones: {
        orderBy: { version: "desc" },
        take: 1,
        include: {
          ingredientes: true,
        },
      },
    },
  });

  if (!receta || !receta.versiones[0]) {
    return true; // Si no hay versiones, definitivamente cambió
  }

  const latestVersion = receta.versiones[0];

  // Comparar datos básicos
  if (
    receta.nombre !== latestVersion.nombre ||
    receta.categoria !== latestVersion.categoria ||
    receta.descripcion !== latestVersion.descripcion ||
    receta.precioVenta !== latestVersion.precioVenta ||
    receta.imagen !== latestVersion.imagen
  ) {
    return true;
  }

  // Comparar ingredientes
  if (receta.ingredientes.length !== latestVersion.ingredientes.length) {
    return true;
  }

  // Verificar que todos los ingredientes coincidan
  for (const ing of receta.ingredientes) {
    const versionIng = latestVersion.ingredientes.find(
      (vi) => vi.productoId === ing.productoId
    );
    if (
      !versionIng ||
      versionIng.cantidad !== ing.cantidad ||
      versionIng.unidad !== ing.unidad
    ) {
      return true;
    }
  }

  return false;
}
