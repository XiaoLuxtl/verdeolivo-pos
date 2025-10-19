/*
  Warnings:

  - Added the required column `subtotal` to the `Venta` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DetalleVenta" ADD COLUMN "movimientoRef" TEXT;

-- AlterTable
ALTER TABLE "Producto" ADD COLUMN "descripcionUmbral" TEXT;
ALTER TABLE "Producto" ADD COLUMN "stockMinimo" REAL DEFAULT 5;

-- AlterTable
ALTER TABLE "Receta" ADD COLUMN "categoria" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MovimientoInventario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productoId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "cantidad" REAL NOT NULL,
    "costoUnitario" REAL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referencia" TEXT,
    "notas" TEXT,
    "ventaRef" INTEGER,
    "motivoMerma" TEXT,
    CONSTRAINT "MovimientoInventario_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MovimientoInventario_ventaRef_fkey" FOREIGN KEY ("ventaRef") REFERENCES "Venta" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_MovimientoInventario" ("cantidad", "categoria", "costoUnitario", "fecha", "id", "notas", "productoId", "referencia", "tipo") SELECT "cantidad", "categoria", "costoUnitario", "fecha", "id", "notas", "productoId", "referencia", "tipo" FROM "MovimientoInventario";
DROP TABLE "MovimientoInventario";
ALTER TABLE "new_MovimientoInventario" RENAME TO "MovimientoInventario";
CREATE INDEX "MovimientoInventario_categoria_fecha_idx" ON "MovimientoInventario"("categoria", "fecha");
CREATE TABLE "new_Venta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subtotal" REAL NOT NULL,
    "descuento" REAL NOT NULL DEFAULT 0,
    "tipoDescuento" TEXT,
    "valorDescuentoOriginal" REAL,
    "total" REAL NOT NULL,
    "recibido" REAL NOT NULL,
    "cambio" REAL NOT NULL,
    "metodoPago" TEXT NOT NULL DEFAULT 'efectivo',
    "notas" TEXT
);
INSERT INTO "new_Venta" ("cambio", "fecha", "id", "metodoPago", "notas", "recibido", "total") SELECT "cambio", "fecha", "id", "metodoPago", "notas", "recibido", "total" FROM "Venta";
DROP TABLE "Venta";
ALTER TABLE "new_Venta" RENAME TO "Venta";
CREATE INDEX "Venta_fecha_idx" ON "Venta"("fecha");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
