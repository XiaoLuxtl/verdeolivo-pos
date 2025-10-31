-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "updatedAt" DATETIME NOT NULL,
    "categoria" TEXT NOT NULL DEFAULT 'EXTRA'
);
INSERT INTO "new_Producto" ("categoria", "createdAt", "descripcion", "descripcionUmbral", "id", "nombre", "peso", "precioPorUnidad", "precioUnitario", "proveedor", "sabor", "sku", "stockMinimo", "unidad", "updatedAt") SELECT "categoria", "createdAt", "descripcion", "descripcionUmbral", "id", "nombre", "peso", "precioPorUnidad", "precioUnitario", "proveedor", "sabor", "sku", "stockMinimo", "unidad", "updatedAt" FROM "Producto";
DROP TABLE "Producto";
ALTER TABLE "new_Producto" RENAME TO "Producto";
CREATE UNIQUE INDEX "Producto_sku_key" ON "Producto"("sku");
CREATE TABLE "new_Receta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL DEFAULT 'OTRO',
    "descripcion" TEXT,
    "precioVenta" REAL NOT NULL,
    "imagen" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Receta" ("categoria", "createdAt", "descripcion", "id", "imagen", "nombre", "precioVenta", "updatedAt") SELECT "categoria", "createdAt", "descripcion", "id", "imagen", "nombre", "precioVenta", "updatedAt" FROM "Receta";
DROP TABLE "Receta";
ALTER TABLE "new_Receta" RENAME TO "Receta";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
