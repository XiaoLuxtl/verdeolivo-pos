/*
  Warnings:

  - Added the required column `updatedAt` to the `Producto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Receta` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

-- Corrección para Producto
CREATE TABLE "new_Producto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sku" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "sabor" TEXT,
    "proveedor" TEXT,
    "precioUnitario" REAL NOT NULL,
    "peso" REAL,
    "precioPorUnidad" REAL,
    "unidad" TEXT NOT NULL DEFAULT 'gr',
    "descripcion" TEXT,
    "stockMinimo" REAL DEFAULT 5,
    "descripcionUmbral" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 💡 CORREGIDO: Valor por defecto para filas existentes
    "categoria" TEXT NOT NULL DEFAULT 'EXTRA'
);
INSERT INTO "new_Producto" ("categoria", "createdAt", "descripcion", "descripcionUmbral", "id", "nombre", "peso", "precioPorUnidad", "precioUnitario", "proveedor", "sabor", "sku", "stockMinimo", "unidad") SELECT "categoria", "createdAt", "descripcion", "descripcionUmbral", "id", "nombre", "peso", "precioPorUnidad", "precioUnitario", "proveedor", "sabor", "sku", "stockMinimo", "unidad" FROM "Producto";
DROP TABLE "Producto";
ALTER TABLE "new_Producto" RENAME TO "Producto";
CREATE UNIQUE INDEX "Producto_sku_key" ON "Producto"("sku");

-- Corrección para Receta
CREATE TABLE "new_Receta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL DEFAULT 'OTRO',
    "descripcion" TEXT,
    "precioVenta" REAL NOT NULL,
    "imagen" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP -- 💡 CORREGIDO: Valor por defecto para filas existentes
);
INSERT INTO "new_Receta" ("categoria", "createdAt", "descripcion", "id", "imagen", "nombre", "precioVenta") SELECT "categoria", "createdAt", "descripcion", "id", "imagen", "nombre", "precioVenta" FROM "Receta";
DROP TABLE "Receta";
ALTER TABLE "new_Receta" RENAME TO "Receta";

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;