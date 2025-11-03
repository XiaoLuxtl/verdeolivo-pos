/*
  Warnings:

  - You are about to drop the column `recetaId` on the `DetalleVenta` table. All the data in the column will be lost.
  - Added the required column `recetaVersionId` to the `DetalleVenta` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "RecetaVersion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "recetaId" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "descripcion" TEXT,
    "precioVenta" REAL NOT NULL,
    "imagen" TEXT,
    "costoTotal" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RecetaVersion_recetaId_fkey" FOREIGN KEY ("recetaId") REFERENCES "Receta" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RecetaVersionIngrediente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "recetaVersionId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" REAL NOT NULL,
    "unidad" TEXT NOT NULL,
    "costoUnitario" REAL NOT NULL,
    "costoTotal" REAL NOT NULL,
    CONSTRAINT "RecetaVersionIngrediente_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecetaVersionIngrediente_recetaVersionId_fkey" FOREIGN KEY ("recetaVersionId") REFERENCES "RecetaVersion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DetalleVenta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ventaId" INTEGER NOT NULL,
    "recetaVersionId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" REAL NOT NULL,
    "costoUnitario" REAL,
    "subtotal" REAL NOT NULL,
    "movimientoRef" TEXT,
    CONSTRAINT "DetalleVenta_recetaVersionId_fkey" FOREIGN KEY ("recetaVersionId") REFERENCES "RecetaVersion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DetalleVenta_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_DetalleVenta" ("cantidad", "id", "movimientoRef", "precioUnitario", "subtotal", "ventaId") SELECT "cantidad", "id", "movimientoRef", "precioUnitario", "subtotal", "ventaId" FROM "DetalleVenta";
DROP TABLE "DetalleVenta";
ALTER TABLE "new_DetalleVenta" RENAME TO "DetalleVenta";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "RecetaVersion_recetaId_version_key" ON "RecetaVersion"("recetaId", "version");
